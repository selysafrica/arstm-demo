import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Icon } from '../../shared/icon';
import { AdminStore, downloadCsv } from '../admin-store';
import { AdmPageHead } from '../ui';

/** Journal d’activité : qui a modifié quoi et quand (ADM-10, ET-SEC-06). */
@Component({
  selector: 'adm-logs',
  imports: [Icon, AdmPageHead],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <adm-page-head title="Journal d’activité" desc="Toutes les actions des utilisateurs du back-office, horodatées.">
      <button type="button" class="adm-btn adm-btn-ghost" (click)="export()"><app-icon name="download" [size]="16" />Exporter</button>
    </adm-page-head>
    <div class="adm-card flex flex-col">
      <div class="flex flex-wrap gap-2 border-b border-[#e4eaf2] p-3">
        <input class="adm-input min-w-[220px] flex-1" placeholder="Rechercher une action ou un élément…" aria-label="Rechercher" [value]="q()" (input)="q.set($any($event.target).value)" />
        <select class="adm-input !w-auto" aria-label="Utilisateur" [value]="who()" (change)="who.set($any($event.target).value)">
          <option value="">Tous les utilisateurs</option>
          @for (w of people(); track w) { <option [value]="w" [selected]="w === who()">{{ w }}</option> }
        </select>
      </div>
      <ol class="m-0 flex list-none flex-col p-0">
        @for (l of list(); track $index) {
          <li class="flex items-start gap-3 border-b border-[#eef2f7] px-4 py-3 last:border-none">
            <span class="inline-flex h-8 w-8 flex-none items-center justify-center rounded-full bg-tint text-[12px] font-bold text-navy">{{ initials(l.who) }}</span>
            <span class="flex flex-1 flex-col text-[14px]">
              <span><strong class="text-ink">{{ l.who }}</strong> <span class="text-subtle">({{ l.role }})</span> {{ l.action }} <span class="text-ink">{{ l.target }}</span></span>
              <span class="text-[12.5px] text-subtle">{{ l.when }}</span>
            </span>
          </li>
        } @empty {
          <li class="py-10 text-center text-subtle">Aucune entrée.</li>
        }
      </ol>
    </div>
  `,
})
export default class AdmLogs {
  protected readonly store = inject(AdminStore);
  protected readonly q = signal('');
  protected readonly who = signal('');
  protected readonly people = computed(() => [...new Set(this.store.logs().map((l) => l.who))]);
  protected readonly list = computed(() => {
    const q = this.q().trim().toLowerCase();
    return this.store.logs().filter((l) => (!this.who() || l.who === this.who()) && (!q || `${l.action} ${l.target}`.toLowerCase().includes(q)));
  });
  protected initials(n: string) {
    return n.split(/\s+/).map((x) => x[0]).slice(0, 2).join('').toUpperCase();
  }
  protected export() {
    downloadCsv('arstm-journal.csv', this.list().map((l) => ({ quand: l.when, utilisateur: l.who, role: l.role, action: l.action, element: l.target })));
  }
}
