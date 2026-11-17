import { ChangeDetectionStrategy, Component, afterNextRender, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../shared/icon';

/** Bandeau d’alerte pour les événements importants (EF-ACT-03) — non bloquant. */
@Component({
  selector: 'app-alert-banner',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <aside
        role="status"
        aria-label="Annonce importante"
        class="f-rise fixed bottom-4 left-4 z-[80] flex max-w-[min(440px,calc(100vw-32px))] items-start gap-3 rounded-2xl border border-white bg-white p-4 pr-3 shadow-[0_24px_60px_-24px_rgba(14,24,62,.55)]"
      >
        <span class="icon-tile !h-10 !w-10 bg-orange-soft text-orange-ink"><app-icon name="bell" [size]="18" /></span>
        <div class="flex flex-1 flex-col gap-1">
          <strong class="text-[15.5px] leading-snug text-ink">Concours d’entrée 2027 : inscriptions du 15 janvier au 15 mars</strong>
          <a routerLink="/admissions" fragment="concours" class="text-[14.5px] font-bold text-blue no-underline" (click)="dismiss()"
            >Voir le calendrier →</a
          >
        </div>
        <button
          type="button"
          class="inline-flex h-9 w-9 flex-none cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-subtle hover:bg-tint"
          aria-label="Fermer l’annonce"
          (click)="dismiss()"
        >
          <app-icon name="x" [size]="18" />
        </button>
      </aside>
    }
  `,
})
export class AlertBanner {
  protected readonly visible = signal(false);

  constructor() {
    afterNextRender(() => {
      let seen = false;
      try {
        seen = sessionStorage.getItem('arstm-alert') === '1';
      } catch {
        /* ignore */
      }
      if (!seen) setTimeout(() => this.visible.set(true), 1600);
    });
  }

  protected dismiss() {
    this.visible.set(false);
    try {
      sessionStorage.setItem('arstm-alert', '1');
    } catch {
      /* ignore */
    }
  }
}
