import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../shared/icon';
import { AdminStore } from '../admin-store';
import { ContentStore } from '../../core/content-store';
import { AdmPageHead, AdmStat, stateChip } from '../ui';

/** Tableau de bord de synthèse (ADM-10). */
@Component({
  selector: 'adm-dashboard',
  imports: [RouterLink, Icon, AdmPageHead, AdmStat],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <adm-page-head [title]="'Bonjour ' + firstName()" desc="Mardi 17 novembre 2026 · synthèse des 7 derniers jours">
      <a routerLink="/admin/actualites" [queryParams]="{ nouveau: 1 }" class="adm-btn adm-btn-primary"><app-icon name="sparkle" [size]="16" />Nouvelle actualité</a>
      <a routerLink="/admin/newsletter" class="adm-btn adm-btn-ghost"><app-icon name="share" [size]="16" />Newsletter</a>
    </adm-page-head>

    <div class="grid grid-cols-2 gap-3 lg:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
      <adm-stat label="Visites (7 jours)" [value]="fmt(lastWeek().visits)" icon="chart" [hint]="'+' + growth() + ' % vs semaine précédente'" hintTone="text-green-ink" />
      <adm-stat label="Nouvelles demandes" [value]="store.newRequests()" icon="mail" tone="bg-orange-soft text-orange-ink" hint="Formulaires du site" />
      <adm-stat label="Inscriptions payées" [value]="paidRegs()" icon="anchor" tone="bg-green-soft text-green-ink" hint="Sessions STCW et FOAD" />
      <adm-stat label="Encaissé (novembre)" [value]="fmt(store.revenue()) + ' F'" icon="coin" tone="bg-violet-soft text-violet-ink" hint="Inscriptions + commandes" />
      <adm-stat label="À relire" [value]="store.pendingReview()" icon="check" tone="bg-teal-soft text-teal-ink" [hint]="store.missingEn() + ' traductions manquantes'" hintTone="text-orange-ink" />
    </div>

    <div class="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
      <section class="adm-card flex flex-col gap-4 p-5" aria-labelledby="traffic">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h2 id="traffic" class="m-0 text-[16px] font-bold text-ink">Trafic et leads</h2>
          <span class="flex gap-3 text-[12.5px] text-subtle">
            <span class="inline-flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-sm bg-sky"></span>Visites</span>
            <span class="inline-flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-full bg-orange"></span>Leads qualifiés</span>
          </span>
        </div>
        <div class="relative grid h-[220px] grid-cols-6 items-end gap-4 border-b border-[#e4eaf2] px-2" role="img" [attr.aria-label]="chartLabel()">
          @for (w of store.visits(); track w.label; let last = $last) {
            <div class="relative flex h-full flex-col items-center justify-end gap-1">
              <span class="text-[12px] font-semibold text-muted tabular-nums">{{ fmt(w.visits) }}</span>
              <span class="w-full max-w-[44px] rounded-t-md" [class]="last ? 'bg-blue' : 'bg-sky'" [style.height.%]="(w.visits / maxVisits()) * 78"></span>
              <span class="absolute left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full border-2 border-white bg-orange" [style.bottom.%]="(w.leads / maxLeads()) * 78" [title]="w.leads + ' leads'"></span>
            </div>
          }
        </div>
        <div class="grid grid-cols-6 gap-4 px-2 text-center text-[12.5px] text-subtle">
          @for (w of store.visits(); track w.label) { <span>{{ w.label }} · {{ w.leads }} leads</span> }
        </div>
      </section>

      <section class="adm-card flex flex-col p-5" aria-labelledby="todo">
        <h2 id="todo" class="m-0 mb-3 text-[16px] font-bold text-ink">À traiter</h2>
        <ul class="m-0 flex list-none flex-col gap-1 p-0">
          @for (t of todo(); track t.label) {
            <li>
              <a [routerLink]="t.path" class="flex items-center gap-3 rounded-lg px-2 py-2.5 text-ink no-underline hover:bg-[#f3f6fa]">
                <span class="inline-flex h-8 w-8 items-center justify-center rounded-lg" [class]="t.cls"><app-icon [name]="t.icon" [size]="16" /></span>
                <span class="flex-1 text-[14px]">{{ t.label }}</span>
                <strong class="tabular-nums">{{ t.count }}</strong>
                <app-icon name="chevron-right" [size]="16" class="text-subtle" />
              </a>
            </li>
          }
        </ul>
      </section>
    </div>

    <div class="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
      <section class="adm-card overflow-hidden" aria-labelledby="lastreq">
        <div class="flex items-center justify-between px-5 pt-4 pb-3">
          <h2 id="lastreq" class="m-0 text-[16px] font-bold text-ink">Dernières demandes</h2>
          <a routerLink="/admin/demandes" class="text-[13.5px] font-semibold no-underline">Tout voir →</a>
        </div>
        <div class="overflow-x-auto">
          <table class="adm-table min-w-[560px]">
            <thead><tr><th>Demandeur</th><th>Type</th><th>Service</th><th>Reçue</th><th>Statut</th></tr></thead>
            <tbody>
              @for (r of lastRequests(); track r.id) {
                <tr>
                  <td><strong class="text-ink">{{ r.name }}</strong><br /><span class="text-[12.5px] text-subtle">{{ r.country }}</span></td>
                  <td>{{ r.type }}</td>
                  <td>{{ r.service }}</td>
                  <td class="text-subtle">{{ r.date }}</td>
                  <td><span [class]="chip(r.status)">{{ r.status }}</span></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <section class="adm-card flex flex-col p-5" aria-labelledby="activity">
        <div class="mb-3 flex items-center justify-between">
          <h2 id="activity" class="m-0 text-[16px] font-bold text-ink">Activité récente</h2>
          <a routerLink="/admin/journal" class="text-[13.5px] font-semibold no-underline">Journal →</a>
        </div>
        <ol class="m-0 flex list-none flex-col gap-3 p-0">
          @for (l of store.logs().slice(0, 6); track $index) {
            <li class="flex gap-3 text-[13.5px]">
              <span class="mt-1.5 h-2 w-2 flex-none rounded-full bg-sky"></span>
              <span class="flex flex-col"><span><strong class="text-ink">{{ l.who }}</strong> {{ l.action }} <span class="text-text">{{ l.target }}</span></span><span class="text-[12.5px] text-subtle">{{ l.when }}</span></span>
            </li>
          }
        </ol>
      </section>
    </div>

    <section class="adm-card flex flex-col gap-3 p-5" aria-labelledby="published">
      <div class="flex items-center justify-between">
        <h2 id="published" class="m-0 text-[16px] font-bold text-ink">Actualités en ligne</h2>
        <a routerLink="/admin/actualites" class="text-[13.5px] font-semibold no-underline">Gérer →</a>
      </div>
      <div class="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
        @for (a of content.publishedNews().slice(0, 4); track a.id) {
          <a [routerLink]="['/actualites', a.slug]" target="_blank" class="flex flex-col overflow-hidden rounded-xl border border-[#e4eaf2] text-ink no-underline hover:border-blue">
            <img [src]="a.img" alt="" class="block aspect-[16/9] w-full object-cover" />
            <span class="flex flex-col gap-0.5 p-3"><span class="text-[12px] text-subtle">{{ a.category }} · {{ a.date }}</span><strong class="text-[13.5px] leading-snug">{{ a.title }}</strong></span>
          </a>
        }
      </div>
    </section>
  `,
})
export default class AdmDashboard {
  protected readonly store = inject(AdminStore);
  protected readonly content = inject(ContentStore);
  protected readonly chip = stateChip;
  protected readonly firstName = computed(() => this.store.user().name.split(' ')[0]);
  protected readonly lastWeek = computed(() => this.store.visits().at(-1)!);
  protected readonly growth = computed(() => {
    const v = this.store.visits();
    return Math.round(((v.at(-1)!.visits - v.at(-2)!.visits) / v.at(-2)!.visits) * 100);
  });
  protected readonly maxVisits = computed(() => Math.max(...this.store.visits().map((v) => v.visits)));
  protected readonly maxLeads = computed(() => Math.max(...this.store.visits().map((v) => v.leads)));
  protected readonly chartLabel = computed(() => 'Visites et leads par semaine : ' + this.store.visits().map((v) => `${v.label} ${v.visits} visites, ${v.leads} leads`).join(' ; '));
  protected readonly paidRegs = computed(() => this.store.registrations().filter((r) => r.payment === 'Payé').length);
  protected readonly lastRequests = computed(() => this.store.requests().slice(0, 6));
  protected readonly todo = computed(() => [
    { label: 'Demandes non traitées', count: this.store.newRequests(), path: '/admin/demandes', icon: 'mail', cls: 'bg-orange-soft text-orange-ink' },
    { label: 'Pages en attente de relecture', count: this.store.pendingReview(), path: '/admin/pages', icon: 'check', cls: 'bg-tint text-blue' },
    { label: 'Traductions anglaises manquantes', count: this.store.missingEn(), path: '/admin/pages', icon: 'globe', cls: 'bg-violet-soft text-violet-ink' },
    { label: 'Commandes à préparer', count: this.store.orders().filter((o) => o.status === 'En préparation').length, path: '/admin/inscriptions', icon: 'briefcase', cls: 'bg-teal-soft text-teal-ink' },
    { label: 'Paiements en attente', count: this.store.registrations().filter((r) => r.payment === 'En attente').length, path: '/admin/inscriptions', icon: 'coin', cls: 'bg-green-soft text-green-ink' },
  ]);
  protected fmt(n: number) {
    return n.toLocaleString('fr-FR').replace(/ /g, ' ');
  }
}
