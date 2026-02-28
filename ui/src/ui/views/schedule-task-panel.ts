import { html } from "lit";
import { icons } from "../icons";

export type ScheduleTaskPanelProps = {
  isOpen: boolean;
  selectedDate: Date | null;
  selectedTime: string;
  repeatType: "once" | "daily" | "weekly" | "monthly";
  repeatCount: number;
  onClose: () => void;
  onDateSelect: (date: Date) => void;
  onTimeChange: (time: string) => void;
  onRepeatTypeChange: (type: "once" | "daily" | "weekly" | "monthly") => void;
  onRepeatCountChange: (count: number) => void;
  onSchedule: () => void;
};

function generateCalendar(year: number, month: number, selectedDate: Date | null) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  
  const weeks: (number | null)[][] = [];
  let currentWeek: (number | null)[] = [];
  
  // Preencher dias vazios antes do primeiro dia
  for (let i = 0; i < startingDayOfWeek; i++) {
    currentWeek.push(null);
  }
  
  // Preencher os dias do mês
  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  
  // Preencher dias vazios após o último dia
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }
  
  return weeks;
}

export function renderScheduleTaskPanel(props: ScheduleTaskPanelProps) {
  if (!props.isOpen) {
    return html``;
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
                      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  
  const weeks = generateCalendar(currentYear, currentMonth, props.selectedDate);
  
  const isDateSelected = (day: number) => {
    if (!props.selectedDate) return false;
    return props.selectedDate.getDate() === day &&
           props.selectedDate.getMonth() === currentMonth &&
           props.selectedDate.getFullYear() === currentYear;
  };
  
  const isToday = (day: number) => {
    return day === now.getDate() &&
           currentMonth === now.getMonth() &&
           currentYear === now.getFullYear();
  };

  return html`
    <div class="schedule-task-panel" @click=${(e: Event) => e.stopPropagation()}>
      <div class="schedule-task-panel__header">
        <h3 class="schedule-task-panel__title">Agendar tarefa</h3>
        <button class="schedule-task-panel__close" @click=${props.onClose}>
          ${icons.x}
        </button>
      </div>

      <div class="schedule-task-panel__content">
        <div class="schedule-task-panel__section">
          <label class="schedule-task-panel__label">Data</label>
          <div class="schedule-task-panel__calendar">
            <div class="schedule-task-panel__calendar-header">
              <span class="schedule-task-panel__month">${monthNames[currentMonth]} ${currentYear}</span>
            </div>
            <div class="schedule-task-panel__calendar-grid">
              ${dayNames.map(day => html`
                <div class="schedule-task-panel__day-name">${day}</div>
              `)}
              ${weeks.map(week => week.map(day => {
                if (day === null) {
                  return html`<div class="schedule-task-panel__day schedule-task-panel__day--empty"></div>`;
                }
                return html`
                  <button
                    class="schedule-task-panel__day ${isDateSelected(day) ? 'schedule-task-panel__day--selected' : ''} ${isToday(day) ? 'schedule-task-panel__day--today' : ''}"
                    @click=${() => props.onDateSelect(new Date(currentYear, currentMonth, day))}
                  >
                    ${day}
                  </button>
                `;
              }))}
            </div>
          </div>
        </div>

        <div class="schedule-task-panel__section">
          <label class="schedule-task-panel__label">Hora</label>
          <input
            type="time"
            class="schedule-task-panel__time-input"
            .value=${props.selectedTime}
            @input=${(e: Event) => {
              const target = e.target as HTMLInputElement;
              props.onTimeChange(target.value);
            }}
          />
        </div>

        <div class="schedule-task-panel__section">
          <label class="schedule-task-panel__label">Repetir</label>
          <select
            class="schedule-task-panel__select"
            .value=${props.repeatType}
            @change=${(e: Event) => {
              const target = e.target as HTMLSelectElement;
              props.onRepeatTypeChange(target.value as "once" | "daily" | "weekly" | "monthly");
            }}
          >
            <option value="once">Uma vez</option>
            <option value="daily">Diariamente</option>
            <option value="weekly">Semanalmente</option>
            <option value="monthly">Mensalmente</option>
          </select>
        </div>

        ${props.repeatType !== "once" ? html`
          <div class="schedule-task-panel__section">
            <label class="schedule-task-panel__label">Número de repetições</label>
            <input
              type="number"
              class="schedule-task-panel__number-input"
              min="1"
              max="365"
              .value=${props.repeatCount.toString()}
              @input=${(e: Event) => {
                const target = e.target as HTMLInputElement;
                const value = parseInt(target.value, 10);
                if (!isNaN(value) && value > 0) {
                  props.onRepeatCountChange(value);
                }
              }}
            />
          </div>
        ` : ''}
      </div>

      <div class="schedule-task-panel__footer">
        <button class="schedule-task-panel__btn schedule-task-panel__btn--secondary" @click=${props.onClose}>
          Cancelar
        </button>
        <button 
          class="schedule-task-panel__btn schedule-task-panel__btn--primary" 
          @click=${props.onSchedule}
          ?disabled=${!props.selectedDate}
        >
          Agendar
        </button>
      </div>
    </div>
  `;
}
