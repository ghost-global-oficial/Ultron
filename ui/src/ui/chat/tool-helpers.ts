/**
 * Helper functions for tool card rendering.
 */

import { PREVIEW_MAX_CHARS, PREVIEW_MAX_LINES } from "./constants";

/**
 * Remove ANSI escape codes from text.
 */
function stripAnsiCodes(text: string): string {
  // Remove ANSI escape sequences
  return text.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '')
    .replace(/\x1B\][0-9;]*[^\x07]*\x07/g, '')
    .replace(/\x1B\][0-9;]*[^\x1B]*\x1B\\/g, '')
    .replace(/\[\?[0-9]+[hl]/g, '');
}

/**
 * Extract clean error message from PowerShell/command output.
 */
function extractCleanError(text: string): string {
  const cleaned = stripAnsiCodes(text);
  
  // If it's a JSON error object, try to parse it first
  if (cleaned.includes('"status": "error"')) {
    try {
      // Try to find and parse the JSON object
      const jsonMatch = cleaned.match(/\{[\s\S]*"status"\s*:\s*"error"[\s\S]*\}/);
      if (jsonMatch) {
        const errorObj = JSON.parse(jsonMatch[0]);
        if (errorObj.error) {
          // Recursively extract from the nested error
          return extractCleanError(errorObj.error);
        }
      }
    } catch {
      // Not valid JSON, continue with text extraction
    }
  }
  
  // Try to extract the main error message from PowerShell errors
  const notRecognizedMatch = cleaned.match(/([^:]+)\s*:\s*The term '([^']+)' is not recognized/);
  if (notRecognizedMatch) {
    return `Command '${notRecognizedMatch[2]}' not found`;
  }
  
  // Try to extract "not recognized" errors without quotes
  const notRecognizedMatch2 = cleaned.match(/The term ([^\s]+) is not recognized/);
  if (notRecognizedMatch2) {
    return `Command '${notRecognizedMatch2[1]}' not found`;
  }
  
  // Try to extract CategoryInfo
  const categoryMatch = cleaned.match(/CategoryInfo\s*:\s*([^\r\n]+)/);
  if (categoryMatch) {
    const category = categoryMatch[1].trim();
    // If it's ObjectNotFound, make it more user-friendly
    if (category.includes('ObjectNotFound')) {
      return 'Command not found';
    }
    return category;
  }
  
  // Try to extract the first line before "Check the spelling"
  const firstLineMatch = cleaned.match(/^([^\r\n]+)[\r\n]+Check the spelling/);
  if (firstLineMatch) {
    return firstLineMatch[1].trim();
  }
  
  // Return first non-empty line that looks like an error
  const lines = cleaned.split(/[\r\n]+/).map(l => l.trim()).filter(l => l.length > 0);
  for (const line of lines) {
    // Skip lines that are just symbols or formatting
    if (line.match(/^[\+\s\-~]+$/)) {
      continue;
    }
    // Skip "At line:" messages
    if (line.startsWith('At line:')) {
      continue;
    }
    // Return first meaningful error line
    if (line.includes('not recognized') || line.includes('not found') || line.includes('Error') || line.includes('failed')) {
      return line;
    }
  }
  
  // Return first meaningful line
  const firstMeaningful = lines.find(l => l.length > 10 && !l.match(/^[\+\s\-~]+$/));
  return firstMeaningful || cleaned.substring(0, 100);
}

/**
 * Format tool output content for display in the sidebar.
 * Detects JSON and wraps it in a code block with formatting.
 * Cleans ANSI codes and formats errors nicely.
 */
export function formatToolOutputForSidebar(text: string): string {
  const trimmed = text.trim();
  
  // Check if it's a JSON error object - extract the error message
  if (trimmed.includes('"status": "error"')) {
    const cleanError = extractCleanError(trimmed);
    return `**Error:** ${cleanError}`;
  }
  
  // Check if it's an error output (non-JSON)
  if (trimmed.includes('not recognized') || trimmed.includes('Error') || trimmed.includes('failed')) {
    const cleanError = extractCleanError(trimmed);
    return `**Error:** ${cleanError}`;
  }
  
  // Try to detect and format JSON (but not error JSON)
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      // Don't format error JSON as code block
      if (parsed.status === 'error') {
        const cleanError = extractCleanError(trimmed);
        return `**Error:** ${cleanError}`;
      }
      return "```json\n" + JSON.stringify(parsed, null, 2) + "\n```";
    } catch {
      // Not valid JSON, clean ANSI codes and return
      return stripAnsiCodes(trimmed);
    }
  }
  
  // Clean ANSI codes from regular text
  return stripAnsiCodes(trimmed);
}

/**
 * Get a truncated preview of tool output text.
 * Truncates to first N lines or first N characters, whichever is shorter.
 * Cleans ANSI codes before truncating.
 */
export function getTruncatedPreview(text: string): string {
  const cleaned = stripAnsiCodes(text);
  
  // Check if it's a JSON error object - extract and format nicely
  if (cleaned.includes('"status": "error"')) {
    const cleanError = extractCleanError(cleaned);
    return `Error: ${cleanError}`;
  }
  
  // Check if it's an error and format it nicely
  if (cleaned.includes('not recognized') || cleaned.includes('CommandNotFoundException') || cleaned.includes('not found')) {
    const cleanError = extractCleanError(cleaned);
    return `Error: ${cleanError}`;
  }
  
  // Don't show raw JSON objects in preview
  if (cleaned.trim().startsWith('{') && cleaned.includes('"status"')) {
    try {
      const parsed = JSON.parse(cleaned);
      if (parsed.status === 'error' && parsed.error) {
        const cleanError = extractCleanError(parsed.error);
        return `Error: ${cleanError}`;
      }
    } catch {
      // Continue with normal preview
    }
  }
  
  const allLines = cleaned.split("\n");
  const lines = allLines.slice(0, PREVIEW_MAX_LINES);
  const preview = lines.join("\n");
  if (preview.length > PREVIEW_MAX_CHARS) {
    return preview.slice(0, PREVIEW_MAX_CHARS) + "…";
  }
  return lines.length < allLines.length ? preview + "…" : preview;
}
