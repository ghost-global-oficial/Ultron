import type { IconName } from "./icons";
import rawConfig from "./tool-display.json";

type ToolDisplayActionSpec = {
  label?: string;
  detailKeys?: string[];
};

type ToolDisplaySpec = {
  icon?: string;
  title?: string;
  label?: string;
  detailKeys?: string[];
  actions?: Record<string, ToolDisplayActionSpec>;
};

type ToolDisplayConfig = {
  version?: number;
  fallback?: ToolDisplaySpec;
  tools?: Record<string, ToolDisplaySpec>;
};

export type ToolDisplay = {
  name: string;
  icon: IconName;
  title: string;
  label: string;
  verb?: string;
  detail?: string;
};

const TOOL_DISPLAY_CONFIG = rawConfig as ToolDisplayConfig;
const FALLBACK = TOOL_DISPLAY_CONFIG.fallback ?? { icon: "puzzle" };
const TOOL_MAP = TOOL_DISPLAY_CONFIG.tools ?? {};

function normalizeToolName(name?: string): string {
  return (name ?? "tool").trim();
}

function defaultTitle(name: string): string {
  const cleaned = name.replace(/_/g, " ").trim();
  if (!cleaned) {
    return "Tool";
  }
  return cleaned
    .split(/\s+/)
    .map((part) =>
      part.length <= 2 && part.toUpperCase() === part
        ? part
        : `${part.at(0)?.toUpperCase() ?? ""}${part.slice(1)}`,
    )
    .join(" ");
}

function normalizeVerb(value?: string): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }
  return trimmed.replace(/_/g, " ");
}

function coerceDisplayValue(value: unknown): string | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }
    const firstLine = trimmed.split(/\r?\n/)[0]?.trim() ?? "";
    if (!firstLine) {
      return undefined;
    }
    return firstLine.length > 160 ? `${firstLine.slice(0, 157)}…` : firstLine;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    const values = value
      .map((item) => coerceDisplayValue(item))
      .filter((item): item is string => Boolean(item));
    if (values.length === 0) {
      return undefined;
    }
    const preview = values.slice(0, 3).join(", ");
    return values.length > 3 ? `${preview}…` : preview;
  }
  return undefined;
}

function lookupValueByPath(args: unknown, path: string): unknown {
  if (!args || typeof args !== "object") {
    return undefined;
  }
  let current: unknown = args;
  for (const segment of path.split(".")) {
    if (!segment) {
      return undefined;
    }
    if (!current || typeof current !== "object") {
      return undefined;
    }
    const record = current as Record<string, unknown>;
    current = record[segment];
  }
  return current;
}

function resolveDetailFromKeys(args: unknown, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = lookupValueByPath(args, key);
    const display = coerceDisplayValue(value);
    if (display) {
      return display;
    }
  }
  return undefined;
}

function resolveReadDetail(args: unknown): string | undefined {
  if (!args || typeof args !== "object") {
    return undefined;
  }
  const record = args as Record<string, unknown>;
  const path = typeof record.path === "string" ? record.path : undefined;
  if (!path) {
    return undefined;
  }
  const offset = typeof record.offset === "number" ? record.offset : undefined;
  const limit = typeof record.limit === "number" ? record.limit : undefined;
  if (offset !== undefined && limit !== undefined) {
    return `${path}:${offset}-${offset + limit}`;
  }
  return path;
}

function resolveWriteDetail(args: unknown): string | undefined {
  if (!args || typeof args !== "object") {
    return undefined;
  }
  const record = args as Record<string, unknown>;
  const path = typeof record.path === "string" ? record.path : undefined;
  return path;
}

function resolveActionSpec(
  spec: ToolDisplaySpec | undefined,
  action: string | undefined,
): ToolDisplayActionSpec | undefined {
  if (!spec || !action) {
    return undefined;
  }
  return spec.actions?.[action] ?? undefined;
}

export function resolveToolDisplay(params: {
  name?: string;
  args?: unknown;
  meta?: string;
}): ToolDisplay {
  const name = normalizeToolName(params.name);
  const key = name.toLowerCase();
  console.log("[TOOL-DISPLAY] Tool called:", key, "Args:", params.args);
  const spec = TOOL_MAP[key];
  const icon = (spec?.icon ?? FALLBACK.icon ?? "puzzle") as IconName;
  const title = spec?.title ?? defaultTitle(name);
  let label = spec?.label ?? name;
  const actionRaw =
    params.args && typeof params.args === "object"
      ? ((params.args as Record<string, unknown>).action as string | undefined)
      : undefined;
  const action = typeof actionRaw === "string" ? actionRaw.trim() : undefined;
  const actionSpec = resolveActionSpec(spec, action);
  const verb = normalizeVerb(actionSpec?.label ?? action);

  let detail: string | undefined;
  if (key === "read") {
    detail = resolveReadDetail(params.args);
  }
  if (!detail && (key === "write" || key === "edit" || key === "attach")) {
    detail = resolveWriteDetail(params.args);
  }

  // Special handling for "web_search" - show query in label
  if (key === "web_search" && params.args && typeof params.args === "object") {
    const argsRecord = params.args as Record<string, unknown>;
    const query = typeof argsRecord.query === "string" ? argsRecord.query : undefined;
    if (query) {
      label = `Searching: ${query}`;
      detail = undefined; // Don't show detail, query is in label
    }
  }

  // Special handling for "web_fetch" - show URL in label
  if (key === "web_fetch" && params.args && typeof params.args === "object") {
    const argsRecord = params.args as Record<string, unknown>;
    const url = typeof argsRecord.url === "string" ? argsRecord.url : undefined;
    if (url) {
      // Shorten URL if too long
      const shortUrl = url.length > 50 ? url.substring(0, 47) + "..." : url;
      label = `Fetching: ${shortUrl}`;
      detail = undefined; // Don't show detail, URL is in label
    }
  }

  // Special handling for "bash", "exe", and "exec" tools - generate descriptive label from command
  if ((key === "bash" || key === "exe" || key === "exec") && params.args && typeof params.args === "object") {
    const argsRecord = params.args as Record<string, unknown>;
    console.log("[DEBUG] bash/exe tool args:", JSON.stringify(params.args, null, 2));
    const command = typeof argsRecord.command === "string" ? argsRecord.command : undefined;
    console.log("[DEBUG] extracted command:", command);
    if (command) {
      // Extract app name from various command patterns
      let appName: string | undefined;
      
      // Pattern 1: "start appname" or "open appname" or "Start-Process appname"
      const startMatch = command.match(/(?:start|open|Start-Process)\s+([^\s&|;]+)/i);
      if (startMatch && startMatch[1]) {
        appName = startMatch[1];
      }
      
      // Pattern 2: Direct executable like "blender.exe" or "code.exe"
      if (!appName) {
        const exeMatch = command.match(/([^\s\\\/]+)\.exe/i);
        if (exeMatch && exeMatch[1]) {
          appName = exeMatch[1];
        }
      }
      
      // Pattern 3: Path to executable like "C:\Program Files\App\app.exe"
      if (!appName) {
        const pathMatch = command.match(/[\\\/]([^\\\/]+)\.exe/i);
        if (pathMatch && pathMatch[1]) {
          appName = pathMatch[1];
        }
      }
      
      // Pattern 4: Just the command name (first word) - but skip PowerShell cmdlets
      if (!appName) {
        const firstWord = command.split(/\s+/)[0];
        // Skip if it's a PowerShell cmdlet (contains hyphen)
        if (firstWord && firstWord.length > 0 && !firstWord.includes('-')) {
          appName = firstWord;
        }
      }
      
      if (appName) {
        // Clean up the app name
        appName = appName.replace(/['"]/g, '').trim();
        
        // Capitalize first letter
        const cleanName = appName.charAt(0).toUpperCase() + appName.slice(1);
        
        // Generate friendly message
        label = `Opening ${cleanName}`;
        detail = undefined; // Don't show command details
      } else {
        label = "Running command";
        detail = undefined; // Don't show command details
      }
    }
  }

  const detailKeys = actionSpec?.detailKeys ?? spec?.detailKeys ?? FALLBACK.detailKeys ?? [];
  if (!detail && detailKeys.length > 0) {
    detail = resolveDetailFromKeys(params.args, detailKeys);
  }

  if (!detail && params.meta) {
    detail = params.meta;
  }

  if (detail) {
    detail = shortenHomeInString(detail);
  }

  return {
    name,
    icon,
    title,
    label,
    verb,
    detail,
  };
}

export function formatToolDetail(display: ToolDisplay): string | undefined {
  const parts: string[] = [];
  if (display.verb) {
    parts.push(display.verb);
  }
  if (display.detail) {
    parts.push(display.detail);
  }
  if (parts.length === 0) {
    return undefined;
  }
  return parts.join(" · ");
}

export function formatToolSummary(display: ToolDisplay): string {
  const detail = formatToolDetail(display);
  return detail ? `${display.label}: ${detail}` : display.label;
}

function shortenHomeInString(input: string): string {
  if (!input) {
    return input;
  }
  return input.replace(/\/Users\/[^/]+/g, "~").replace(/\/home\/[^/]+/g, "~");
}
