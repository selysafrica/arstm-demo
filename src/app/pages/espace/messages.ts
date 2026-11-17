import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Icon } from '../../shared/icon';
import { StudentStore } from '../../core/student-store';

/** Messagerie interne (notifications des services). */
@Component({
  selector: 'app-espace-messages',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="box grid min-h-[520px] overflow-hidden md:grid-cols-[320px_1fr]">
      <ul class="m-0 flex list-none flex-col border-b border-line-soft p-2 md:border-r md:border-b-0" aria-label="Messages">
        @for (m of s.messages(); track m.id) {
          <li>
            <button type="button" class="flex w-full cursor-pointer flex-col gap-0.5 rounded-xl border-none p-3 text-left font-[inherit] transition-colors" [class]="sel() === m.id ? 'bg-tint' : 'bg-transparent hover:bg-tint-soft'" [attr.aria-current]="sel() === m.id ? 'true' : null" (click)="open(m.id)">
              <span class="flex items-center gap-2">
                @if (!m.read) { <span class="h-2 w-2 flex-none rounded-full bg-orange" aria-label="Non lu"></span> }
                <span class="flex-1 truncate text-[14px]" [class]="m.read ? 'text-muted' : 'font-bold text-ink'">{{ m.from }}</span>
                <span class="text-[12.5px] text-subtle">{{ m.date }}</span>
              </span>
              <span class="truncate text-[14.5px]" [class]="m.read ? 'text-text' : 'font-semibold text-ink'">{{ m.subject }}</span>
            </button>
          </li>
        }
      </ul>
      <div class="flex flex-col p-6">
        @if (current(); as m) {
          <span class="chip chip-info self-start">{{ m.tag }}</span>
          <h2 class="mt-3 mb-1 text-[20px] leading-snug font-extrabold text-ink">{{ m.subject }}</h2>
          <span class="text-[14px] text-subtle">De : {{ m.from }} · {{ m.date }}</span>
          <p class="mt-5 mb-0 max-w-[65ch] text-[15.5px] whitespace-pre-line text-text">{{ m.body }}</p>
          @if (!sent()) {
            <form class="mt-auto flex flex-col gap-2 border-t border-line-soft pt-4" (submit)="reply($event)">
              <label class="field">Répondre<textarea rows="3" placeholder="Votre message…" required></textarea></label>
              <button type="submit" class="f-btn btn-primary self-end !py-2.5">Envoyer</button>
            </form>
          } @else {
            <p role="status" class="f-pop mt-auto mb-0 flex items-center gap-2 rounded-xl bg-green-soft p-3 text-[14.5px] text-green-ink"><app-icon name="tick" [size]="16" />Réponse envoyée à {{ m.from }}.</p>
          }
        }
      </div>
    </div>
  `,
})
export default class EspaceMessages {
  protected readonly s = inject(StudentStore);
  protected readonly sel = signal(this.s.messages()[0]?.id ?? 0);
  protected readonly sent = signal(false);
  protected readonly current = computed(() => this.s.messages().find((m) => m.id === this.sel()));
  constructor() {
    this.s.markRead(this.sel());
  }
  protected open(id: number) {
    this.sel.set(id);
    this.sent.set(false);
    this.s.markRead(id);
  }
  protected reply(e: Event) {
    e.preventDefault();
    if ((e.target as HTMLFormElement).checkValidity()) this.sent.set(true);
  }
}
