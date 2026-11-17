import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Icon } from '../../shared/icon';
import { AdminStore, downloadCsv } from '../admin-store';
import { AdmPageHead, AdmStat, stateChip } from '../ui';

const fmt = (n: number) => n.toLocaleString('fr-FR').replace(/ /g, ' ');

/** Inscriptions, paiements et commandes (EF-PAY-05, ADM-06). */
@Component({
  selector: 'adm-sales',
  imports: [Icon, AdmPageHead, AdmStat],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <adm-page-head title="Inscriptions et commandes" desc="Statut, paiement et export. Les paiements passent par le prestataire agréé.">
      <button type="button" class="adm-btn adm-btn-ghost" (click)="export()"><app-icon name="download" [size]="16" />Exporter</button>
    </adm-page-head>

    <div class="grid grid-cols-2 gap-3 lg:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
      <adm-stat label="Inscriptions" [value]="store.registrations().length" icon="users" />
      <adm-stat label="Paiements en attente" [value]="pending()" icon="clock" tone="bg-orange-soft text-orange-ink" />
      <adm-stat label="Commandes à préparer" [value]="toPrepare()" icon="briefcase" tone="bg-teal-soft text-teal-ink" />
      <adm-stat label="Total encaissé" [value]="fmt(store.revenue()) + ' F'" icon="coin" tone="bg-green-soft text-green-ink" />
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3">
      <div role="tablist" class="adm-tabs" aria-label="Vue">
        <button type="button" role="tab" class="adm-tab" [attr.aria-selected]="tab() === 'reg'" (click)="tab.set('reg')">Inscriptions</button>
        <button type="button" role="tab" class="adm-tab" [attr.aria-selected]="tab() === 'ord'" (click)="tab.set('ord')">Commandes</button>
      </div>
      @if (tab() === 'reg') {
        <div class="flex flex-wrap gap-2">
          <select class="adm-input !w-auto" aria-label="Session" [value]="session()" (change)="session.set($any($event.target).value)">
            <option value="">Toutes les sessions</option>
            @for (s of sessions; track s) { <option [value]="s" [selected]="s === session()">{{ s }}</option> }
          </select>
          <select class="adm-input !w-auto" aria-label="Paiement" [value]="pay()" (change)="pay.set($any($event.target).value)">
            <option value="">Tous les paiements</option><option>Payé</option><option>En attente</option><option>Remboursé</option>
          </select>
        </div>
      }
    </div>

    @if (tab() === 'reg') {
      <div class="adm-card overflow-x-auto">
        <table class="adm-table min-w-[900px]">
          <thead><tr><th>N°</th><th>Stagiaire</th><th>Session</th><th>Inscrit le</th><th>Moyen</th><th class="text-right">Montant</th><th>Paiement</th><th class="text-right"></th></tr></thead>
          <tbody>
            @for (r of regs(); track r.id) {
              <tr>
                <td class="font-mono text-[12.5px] text-subtle">{{ r.id }}</td>
                <td><strong class="text-ink">{{ r.trainee }}</strong><br /><span class="text-[12.5px] text-subtle">{{ r.company }}</span></td>
                <td><span class="text-ink">{{ r.session }}</span><br /><span class="text-[12.5px] text-subtle">{{ r.code }} · {{ r.dates }}</span></td>
                <td class="text-subtle">{{ r.date }}</td>
                <td class="text-text">{{ r.method }}</td>
                <td class="text-right font-semibold tabular-nums">{{ fmt(r.amount) }}</td>
                <td><span [class]="chip(r.payment)">{{ r.payment }}</span></td>
                <td class="text-right whitespace-nowrap">
                  @if (r.payment === 'En attente') {
                    <button type="button" class="adm-btn adm-btn-ghost !min-h-8 !px-2.5" (click)="remind(r.id, r.trainee)">{{ reminded().includes(r.id) ? 'Relancé ✓' : 'Relancer' }}</button>
                  } @else if (r.payment === 'Payé') {
                    <button type="button" class="adm-btn adm-btn-ghost !min-h-8 !px-2.5" aria-label="Télécharger la facture"><app-icon name="file" [size]="15" />Facture</button>
                  }
                </td>
              </tr>
            } @empty {
              <tr><td colspan="8" class="py-10 text-center text-subtle">Aucune inscription pour ces filtres.</td></tr>
            }
          </tbody>
        </table>
      </div>
    } @else {
      <div class="adm-card overflow-x-auto">
        <table class="adm-table min-w-[860px]">
          <thead><tr><th>N°</th><th>Article</th><th>Client</th><th>Date</th><th class="text-right">Montant</th><th>Paiement</th><th>Statut</th><th class="text-right">Action</th></tr></thead>
          <tbody>
            @for (o of store.orders(); track o.id) {
              <tr>
                <td class="font-mono text-[12.5px] text-subtle">{{ o.id }}</td>
                <td><strong class="text-ink">{{ o.item }}</strong>@if (o.qty > 1) { <span class="text-subtle"> × {{ o.qty }}</span> }</td>
                <td class="text-text">{{ o.customer }}</td>
                <td class="text-subtle">{{ o.date }}</td>
                <td class="text-right font-semibold tabular-nums">{{ fmt(o.amount) }}</td>
                <td><span [class]="chip(o.payment)">{{ o.payment }}</span></td>
                <td><span [class]="chip(o.status)">{{ o.status }}</span></td>
                <td class="text-right">
                  @if (o.status !== 'Livré') {
                    <button type="button" class="adm-btn adm-btn-primary !min-h-8 !px-2.5" [disabled]="o.payment !== 'Payé'" [title]="o.payment !== 'Payé' ? 'En attente de paiement' : ''" (click)="advance(o.id)">{{ o.status === 'En préparation' ? 'Marquer expédiée' : 'Marquer livrée' }}</button>
                  } @else {
                    <span class="text-[12.5px] text-subtle">Terminée</span>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
})
export default class AdmSales {
  protected readonly store = inject(AdminStore);
  protected readonly chip = stateChip;
  protected readonly fmt = fmt;
  protected readonly tab = signal<'reg' | 'ord'>('reg');
  protected readonly session = signal('');
  protected readonly pay = signal('');
  protected readonly reminded = signal<string[]>([]);
  protected readonly sessions = [...new Set(this.store.registrations().map((r) => r.session))];
  protected readonly regs = computed(() => this.store.registrations().filter((r) => (!this.session() || r.session === this.session()) && (!this.pay() || r.payment === this.pay())));
  protected readonly pending = computed(() => this.store.registrations().filter((r) => r.payment === 'En attente').length);
  protected readonly toPrepare = computed(() => this.store.orders().filter((o) => o.status === 'En préparation').length);

  protected advance(id: string) {
    this.store.orders.update((l) => l.map((o) => (o.id === id ? { ...o, status: o.status === 'En préparation' ? 'Expédié' : 'Livré' } : o)));
    const o = this.store.orders().find((x) => x.id === id)!;
    this.store.log(`a passé la commande en « ${o.status} »`, id);
  }
  protected remind(id: string, who: string) {
    if (this.reminded().includes(id)) return;
    this.reminded.update((l) => [...l, id]);
    this.store.log('a relancé le paiement de', `${who} (${id})`);
  }
  protected export() {
    if (this.tab() === 'reg') {
      downloadCsv('arstm-inscriptions.csv', this.regs().map((r) => ({ numero: r.id, stagiaire: r.trainee, employeur: r.company, session: r.session, dates: r.dates, montant: r.amount, moyen: r.method, paiement: r.payment, date: r.date })));
    } else {
      downloadCsv('arstm-commandes.csv', this.store.orders().map((o) => ({ numero: o.id, article: o.item, quantite: o.qty, client: o.customer, montant: o.amount, paiement: o.payment, statut: o.status, date: o.date })));
    }
    this.store.log('a exporté', this.tab() === 'reg' ? 'les inscriptions (CSV)' : 'les commandes (CSV)');
  }
}
