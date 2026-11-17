import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Icon } from '../../shared/icon';
import { AdminStore } from '../admin-store';
import { AdmPageHead, AdmStat, stateChip } from '../ui';

/** Création et envoi de la newsletter, listes, statistiques (ADM-08, EF-ACT-05). */
@Component({
  selector: 'adm-newsletter',
  imports: [Icon, AdmPageHead, AdmStat, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <adm-page-head title="Newsletter" desc="Abonnés en double opt-in, désinscription en un clic.">
      <button type="button" class="adm-btn adm-btn-primary" (click)="compose()"><app-icon name="sparkle" [size]="16" />Nouvelle campagne</button>
    </adm-page-head>

    <div class="grid grid-cols-2 gap-3 lg:grid-cols-[repeat(auto-fit,minmax(190px,1fr))]">
      <adm-stat label="Abonnés confirmés" [value]="fmt(store.subscribers().confirmed)" icon="users" />
      <adm-stat label="En attente de confirmation" [value]="store.subscribers().pending" icon="clock" tone="bg-orange-soft text-orange-ink" hint="Double opt-in" />
      <adm-stat label="Taux d’ouverture moyen" [value]="(avgOpen() | number: '1.1-1' : 'fr') + ' %'" icon="mail" tone="bg-green-soft text-green-ink" />
      <adm-stat label="Désinscriptions (30 j)" [value]="store.subscribers().unsub30" icon="logout" tone="bg-[#f1f4f8] text-muted" />
    </div>

    @if (draft(); as d) {
      <section class="adm-card grid gap-5 p-5 xl:grid-cols-[1fr_1fr]" aria-label="Éditeur de campagne">
        <div class="flex flex-col gap-3">
          <h2 class="m-0 text-[16px] font-bold text-ink">Nouvelle campagne</h2>
          <label class="adm-label">Objet<input class="adm-input" [value]="d.subject" (input)="draft.set({ ...d, subject: $any($event.target).value })" /></label>
          <div class="grid gap-3 sm:grid-cols-2">
            <label class="adm-label">Destinataires
              <select class="adm-input" [value]="d.list" (change)="draft.set({ ...d, list: $any($event.target).value })">
                <option>Tous les abonnés</option>
                @for (l of store.subscribers().lists; track l.name) { <option>{{ l.name }}</option> }
              </select>
            </label>
            <label class="adm-label">Modèle
              <select class="adm-input" [value]="d.template" (change)="draft.set({ ...d, template: $any($event.target).value })">
                <option>Lettre mensuelle</option><option>Annonce d’événement</option><option>Concours et admissions</option>
              </select>
            </label>
          </div>
          <label class="adm-label">Contenu<textarea rows="7" class="adm-input" [value]="d.body" (input)="draft.set({ ...d, body: $any($event.target).value })"></textarea></label>
          <label class="adm-label max-w-[260px]">Envoi programmé (facultatif)<input type="datetime-local" class="adm-input" [value]="d.when" (input)="draft.set({ ...d, when: $any($event.target).value })" /></label>
          @if (error()) { <p class="m-0 rounded-lg bg-[#fef3f2] px-3 py-2 text-[13.5px] font-semibold text-[#b42318]" role="alert">{{ error() }}</p> }
          <div class="flex flex-wrap gap-2">
            <button type="button" class="adm-btn adm-btn-ghost mr-auto" (click)="draft.set(null)">Annuler</button>
            <button type="button" class="adm-btn adm-btn-ghost" (click)="test()">{{ tested() ? 'Test envoyé ✓' : 'Envoyer un test' }}</button>
            <button type="button" class="adm-btn adm-btn-primary" [disabled]="!store.rights().publish" (click)="send()">{{ d.when ? 'Programmer' : 'Envoyer à ' + fmt(recipients()) + ' abonnés' }}</button>
          </div>
        </div>
        <figure class="m-0 flex flex-col overflow-hidden rounded-xl border border-[#e4eaf2] bg-[#f3f6fa]" aria-label="Aperçu de l’e-mail">
          <figcaption class="border-b border-[#e4eaf2] bg-white px-4 py-2 text-[12.5px] text-subtle">Aperçu · {{ d.list }}</figcaption>
          <div class="m-4 flex flex-col overflow-hidden rounded-lg bg-white shadow-card">
            <div class="flex items-center gap-2 bg-navy px-5 py-4 text-white"><img src="img/logo-arstm.png" alt="" width="28" height="28" /><strong>ARSTM</strong><span class="ml-auto text-[12px] text-hero-text">{{ d.template }}</span></div>
            <img src="img/salut-couleurs.jpg" alt="" class="block aspect-[2/1] w-full object-cover" />
            <div class="flex flex-col gap-2 p-5">
              <strong class="text-[18px] leading-snug text-ink">{{ d.subject || 'Objet de la campagne' }}</strong>
              <p class="m-0 text-[14px] whitespace-pre-line text-text">{{ d.body || 'Votre contenu apparaîtra ici.' }}</p>
              <span class="mt-2 self-start rounded-lg bg-orange px-4 py-2 text-[13.5px] font-bold text-navy">En savoir plus</span>
            </div>
            <p class="m-0 border-t border-[#eef2f7] px-5 py-3 text-[11.5px] text-subtle">Vous recevez cet e-mail car vous êtes abonné(e). <u>Se désinscrire en un clic</u></p>
          </div>
        </figure>
      </section>
    }

    <div class="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
      <section class="adm-card overflow-hidden" aria-labelledby="camp">
        <h2 id="camp" class="m-0 px-5 pt-4 pb-3 text-[16px] font-bold text-ink">Campagnes</h2>
        <div class="overflow-x-auto">
          <table class="adm-table min-w-[680px]">
            <thead><tr><th>Objet</th><th>Liste</th><th>Date</th><th>Statut</th><th class="text-right">Ouverture</th><th class="text-right">Clics</th></tr></thead>
            <tbody>
              @for (c of store.campaigns(); track c.id) {
                <tr>
                  <td class="max-w-[300px]"><strong class="text-ink">{{ c.subject }}</strong>@if (c.recipients) { <br /><span class="text-[12.5px] text-subtle">{{ fmt(c.recipients) }} destinataires</span> }</td>
                  <td class="text-text">{{ c.list }}</td>
                  <td class="whitespace-nowrap text-subtle">{{ c.date }}</td>
                  <td><span [class]="chip(c.status)">{{ c.status }}</span></td>
                  <td class="text-right tabular-nums">
                    @if (c.status === 'Envoyée') {
                      <span class="inline-flex items-center gap-2">{{ c.open | number: '1.1-1' : 'fr' }} %<span class="h-1.5 w-14 overflow-hidden rounded-full bg-[#eef2f7]"><span class="block h-full bg-green" [style.width.%]="c.open"></span></span></span>
                    } @else { — }
                  </td>
                  <td class="text-right tabular-nums">{{ c.status === 'Envoyée' ? (c.click | number: '1.1-1' : 'fr') + ' %' : '—' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
      <section class="adm-card flex flex-col gap-3 p-5" aria-labelledby="lists">
        <h2 id="lists" class="m-0 text-[16px] font-bold text-ink">Listes d’abonnés</h2>
        @for (l of store.subscribers().lists; track l.name) {
          <div class="flex flex-col gap-1.5">
            <span class="flex justify-between text-[14px]"><span class="text-ink">{{ l.name }}</span><strong class="tabular-nums">{{ fmt(l.count) }}</strong></span>
            <span class="h-2 overflow-hidden rounded-full bg-[#eef2f7]"><span class="block h-full rounded-full bg-sky" [style.width.%]="(l.count / store.subscribers().total) * 100 * 2"></span></span>
          </div>
        }
        <button type="button" class="adm-btn adm-btn-ghost mt-2 self-start" (click)="exportSubs()"><app-icon name="download" [size]="15" />Exporter les abonnés</button>
      </section>
    </div>

    @if (flash()) {
      <p role="status" class="f-pop fixed right-6 bottom-6 z-[80] m-0 flex items-center gap-2 rounded-xl bg-navy px-4 py-3 text-[14px] font-semibold text-white shadow-soft"><app-icon name="tick" [size]="16" class="text-orange" />{{ flash() }}</p>
    }
  `,
})
export default class AdmNewsletter {
  protected readonly store = inject(AdminStore);
  protected readonly chip = stateChip;
  protected readonly draft = signal<{ subject: string; list: string; template: string; body: string; when: string } | null>(null);
  protected readonly error = signal('');
  protected readonly tested = signal(false);
  protected readonly flash = signal('');
  protected readonly avgOpen = computed(() => {
    const s = this.store.campaigns().filter((c) => c.status === 'Envoyée');
    return s.reduce((t, c) => t + c.open, 0) / (s.length || 1);
  });
  protected readonly recipients = computed(() => {
    const d = this.draft();
    if (!d) return 0;
    return d.list === 'Tous les abonnés' ? this.store.subscribers().confirmed : this.store.subscribers().lists.find((l) => l.name === d.list)?.count ?? 0;
  });
  protected fmt(n: number) {
    return n.toLocaleString('fr-FR').replace(/ /g, ' ');
  }
  protected compose() {
    this.error.set('');
    this.tested.set(false);
    this.draft.set({ subject: '', list: 'Tous les abonnés', template: 'Lettre mensuelle', body: '', when: '' });
  }
  protected test() {
    this.tested.set(true);
  }
  protected send() {
    const d = this.draft()!;
    if (!d.subject.trim() || !d.body.trim()) return this.error.set('Objet et contenu obligatoires.');
    const scheduled = !!d.when;
    this.store.campaigns.update((l) => [
      { id: Date.now(), subject: d.subject, list: d.list, status: scheduled ? 'Programmée' : 'Envoyée', date: scheduled ? new Date(d.when).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '17 nov. 2026', recipients: this.recipients(), open: 0, click: 0 },
      ...l,
    ]);
    this.store.log(scheduled ? 'a programmé la newsletter' : 'a envoyé la newsletter', `« ${d.subject} »`);
    this.draft.set(null);
    this.flash.set(scheduled ? 'Campagne programmée.' : 'Campagne en cours d’envoi.');
    setTimeout(() => this.flash.set(''), 2800);
  }
  protected exportSubs() {
    this.flash.set('Export des abonnés généré (CSV).');
    this.store.log('a exporté', 'la liste des abonnés');
    setTimeout(() => this.flash.set(''), 2500);
  }
}
