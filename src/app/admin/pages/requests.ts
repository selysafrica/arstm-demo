import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Icon } from '../../shared/icon';
import { AdminStore, FormRequest, RequestStatus, downloadCsv } from '../admin-store';
import { AdmDrawer, AdmPageHead, AdmStat, stateChip } from '../ui';

const PAGE = 12;

/** Base des demandes reçues par les formulaires : recherche, filtres, traitement, export (EF-ADMS-04, ADM-06). */
@Component({
  selector: 'adm-requests',
  imports: [Icon, AdmPageHead, AdmStat, AdmDrawer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <adm-page-head title="Demandes" desc="Renseignements, pré-inscriptions, candidatures spontanées, stages et contacts.">
      <button type="button" class="adm-btn adm-btn-ghost" (click)="export()"><app-icon name="download" [size]="16" />Exporter ({{ filtered().length }})</button>
    </adm-page-head>

    <div class="grid grid-cols-2 gap-3 lg:grid-cols-[repeat(auto-fit,minmax(170px,1fr))]">
      @for (s of statuses; track s) {
        <button type="button" class="cursor-pointer border-none bg-transparent p-0 text-left font-[inherit]" (click)="status.set(status() === s ? '' : s)" [attr.aria-pressed]="status() === s">
          <adm-stat [label]="s" [value]="countBy(s)" [icon]="statIcon[s]" [tone]="status() === s ? 'bg-blue text-white' : 'bg-tint text-blue'" />
        </button>
      }
    </div>

    <div class="adm-card flex flex-col">
      <div class="flex flex-wrap items-center gap-2 border-b border-[#e4eaf2] p-3">
        <label class="relative min-w-[220px] flex-1">
          <span class="sr-only-x">Rechercher</span>
          <app-icon name="search" [size]="15" class="absolute top-1/2 left-2.5 -translate-y-1/2 text-subtle" />
          <input class="adm-input !pl-8" placeholder="Nom, e-mail, n° de demande, objet…" [value]="q()" (input)="q.set($any($event.target).value); page.set(0)" />
        </label>
        <select class="adm-input !w-auto" aria-label="Type" [value]="type()" (change)="type.set($any($event.target).value); page.set(0)">
          <option value="">Tous les types</option>
          @for (t of types; track t) { <option [value]="t" [selected]="t === type()">{{ t }}</option> }
        </select>
        <select class="adm-input !w-auto" aria-label="Service" [value]="service()" (change)="service.set($any($event.target).value); page.set(0)">
          <option value="">Tous les services</option>
          @for (s of services; track s) { <option [value]="s" [selected]="s === service()">{{ s }}</option> }
        </select>
        <select class="adm-input !w-auto" aria-label="Statut" [value]="status()" (change)="status.set($any($event.target).value); page.set(0)">
          <option value="">Tous les statuts</option>
          @for (s of statuses; track s) { <option [value]="s" [selected]="s === status()">{{ s }}</option> }
        </select>
        @if (hasFilters()) { <button type="button" class="adm-btn adm-btn-ghost" (click)="reset()">Effacer</button> }
      </div>

      @if (selected().length) {
        <div class="f-pop flex flex-wrap items-center gap-2 border-b border-[#e4eaf2] bg-tint-soft px-3 py-2 text-[13.5px]">
          <strong class="text-navy">{{ selected().length }} sélectionnée(s)</strong>
          <span class="text-subtle">Passer en :</span>
          @for (s of statuses; track s) { <button type="button" class="adm-btn adm-btn-ghost !min-h-8 !px-2.5" (click)="bulk(s)">{{ s }}</button> }
          <button type="button" class="adm-btn !min-h-8 !px-2.5 ml-auto border-none bg-transparent text-subtle" (click)="selected.set([])">Annuler</button>
        </div>
      }

      <div class="overflow-x-auto">
        <table class="adm-table min-w-[900px]">
          <thead>
            <tr>
              <th class="w-10"><input type="checkbox" class="h-4 w-4 accent-blue" aria-label="Tout sélectionner" [checked]="allOnPage()" (change)="toggleAll()" /></th>
              <th>N°</th><th>Demandeur</th><th>Type</th><th>Objet</th><th>Service</th>
              <th><button type="button" class="inline-flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 font-[inherit] font-semibold text-subtle" (click)="asc.set(!asc())">Reçue <app-icon [name]="asc() ? 'chevron-down' : 'chevron-down'" [size]="13" [style.transform]="asc() ? 'rotate(180deg)' : null" /></button></th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            @for (r of pageRows(); track r.id) {
              <tr [class.is-selected]="selected().includes(r.id)" class="cursor-pointer" (click)="open(r)">
                <td (click)="$event.stopPropagation()"><input type="checkbox" class="h-4 w-4 accent-blue" [attr.aria-label]="'Sélectionner ' + r.id" [checked]="selected().includes(r.id)" (change)="toggle(r.id)" /></td>
                <td class="font-mono text-[12.5px] text-subtle">{{ r.id }}</td>
                <td><strong class="text-ink">{{ r.name }}</strong><br /><span class="text-[12.5px] text-subtle">{{ r.country }}</span></td>
                <td>{{ r.type }}</td>
                <td class="max-w-[260px] truncate text-text" [title]="r.subject">{{ r.subject }}</td>
                <td class="text-text">{{ r.service }}</td>
                <td class="whitespace-nowrap text-subtle">{{ r.date }}</td>
                <td><span [class]="chip(r.status)">{{ r.status }}</span></td>
              </tr>
            } @empty {
              <tr><td colspan="8" class="py-12 text-center text-subtle">Aucune demande ne correspond à ces filtres.</td></tr>
            }
          </tbody>
        </table>
      </div>
      <div class="flex flex-wrap items-center justify-between gap-2 border-t border-[#e4eaf2] px-3 py-2.5 text-[13px] text-subtle">
        <span>{{ filtered().length ? page() * size + 1 : 0 }}–{{ min((page() + 1) * size, filtered().length) }} sur {{ filtered().length }}</span>
        <span class="flex gap-1">
          <button type="button" class="adm-btn adm-btn-ghost !min-h-8 !px-2.5" [disabled]="page() === 0" (click)="page.set(page() - 1)" aria-label="Page précédente"><app-icon name="chevron-left" [size]="15" /></button>
          <button type="button" class="adm-btn adm-btn-ghost !min-h-8 !px-2.5" [disabled]="(page() + 1) * size >= filtered().length" (click)="page.set(page() + 1)" aria-label="Page suivante"><app-icon name="chevron-right" [size]="15" /></button>
        </span>
      </div>
    </div>

    @if (current(); as r) {
      <adm-drawer [title]="r.name" [kicker]="r.id + ' · ' + r.type + ' · reçue le ' + r.date" (close)="currentId.set(null)">
        <div class="flex flex-col gap-4">
          <div class="flex flex-wrap items-center gap-2">
            <span [class]="chip(r.status)">{{ r.status }}</span>
            <span class="chip chip-mute">{{ r.service }}</span>
            @if (r.assignee) { <span class="text-[13px] text-subtle">Suivi par {{ r.assignee }}</span> }
          </div>
          <dl class="m-0 grid grid-cols-2 gap-3 rounded-xl bg-[#f7f9fc] p-3 text-[13.5px]">
            <div><dt class="text-subtle">E-mail</dt><dd class="m-0 font-semibold break-all"><a [href]="'mailto:' + r.email">{{ r.email }}</a></dd></div>
            <div><dt class="text-subtle">Téléphone</dt><dd class="m-0 font-semibold">{{ r.phone }}</dd></div>
            <div><dt class="text-subtle">Pays</dt><dd class="m-0 font-semibold">{{ r.country }}</dd></div>
            <div><dt class="text-subtle">Consentement</dt><dd class="m-0 font-semibold text-green-ink">Recueilli</dd></div>
            <div class="col-span-2"><dt class="text-subtle">Objet</dt><dd class="m-0 font-semibold">{{ r.subject }}</dd></div>
          </dl>
          <div>
            <h3 class="m-0 mb-1.5 text-[13px] font-semibold text-text">Message</h3>
            <p class="m-0 rounded-xl border border-[#e4eaf2] p-3 text-[14px]">{{ r.message }}</p>
          </div>
          @if (r.files) {
            <div class="flex flex-col gap-1.5">
              <h3 class="m-0 text-[13px] font-semibold text-text">Pièces jointes ({{ r.files }})</h3>
              @for (f of fileNames(r); track f) {
                <a href="#" (click)="$event.preventDefault()" class="flex items-center gap-2 rounded-lg border border-[#e4eaf2] px-3 py-2 text-[13.5px] text-ink no-underline hover:border-blue"><app-icon name="file" [size]="15" class="text-blue" />{{ f }}<app-icon name="download" [size]="15" class="ml-auto text-subtle" /></a>
              }
            </div>
          }
          <label class="adm-label">Réponse
            <select class="adm-input" (change)="reply.set($any($event.target).value)">
              <option value="">Modèle de réponse…</option>
              @for (t of templates; track t.label) { <option [value]="t.text">{{ t.label }}</option> }
            </select>
            <textarea rows="4" class="adm-input" [value]="reply()" (input)="reply.set($any($event.target).value)" placeholder="Rédigez votre réponse…"></textarea>
          </label>
          <label class="adm-label">Note interne<input class="adm-input" placeholder="Visible uniquement par l’équipe" #note (keydown.enter)="addNote(r, note.value); note.value = ''" /></label>
          @for (n of r.notes; track $index) { <p class="m-0 rounded-lg bg-orange-soft/60 px-3 py-2 text-[13px] text-orange-ink">{{ n }}</p> }
          @if (sent()) { <p role="status" class="f-pop m-0 rounded-lg bg-green-soft px-3 py-2 text-[13.5px] font-semibold text-green-ink">Réponse envoyée à {{ r.email }} · demande passée en « Traité ».</p> }
        </div>
        <ng-container actions>
          <select class="adm-input mr-auto !w-auto" aria-label="Changer le statut" [value]="r.status" (change)="setStatus(r, $any($event.target).value)">
            @for (s of statuses; track s) { <option [value]="s" [selected]="s === r.status">{{ s }}</option> }
          </select>
          <button type="button" class="adm-btn adm-btn-primary" [disabled]="!reply().trim()" (click)="send(r)"><app-icon name="mail" [size]="15" />Envoyer la réponse</button>
        </ng-container>
      </adm-drawer>
    }
  `,
})
export default class AdmRequests {
  protected readonly store = inject(AdminStore);
  protected readonly chip = stateChip;
  protected readonly min = Math.min;
  protected readonly size = PAGE;
  protected readonly statuses: RequestStatus[] = ['Nouveau', 'En cours', 'Traité', 'Archivé'];
  protected readonly statIcon: Record<RequestStatus, string> = { Nouveau: 'bell', 'En cours': 'clock', Traité: 'tick', Archivé: 'file' };
  protected readonly types = [...new Set(this.store.requests().map((r) => r.type))];
  protected readonly services = [...new Set(this.store.requests().map((r) => r.service))];
  protected readonly templates = [
    { label: 'Accusé de réception', text: 'Bonjour,\n\nNous avons bien reçu votre demande et la traitons dans les meilleurs délais.\n\nCordialement,\nL’équipe de l’ARSTM' },
    { label: 'Dossier complet', text: 'Bonjour,\n\nVotre dossier est complet. Il sera examiné par la commission pédagogique ; vous serez informé(e) par e-mail de la décision.\n\nCordialement,\nLa scolarité' },
    { label: 'Pièce manquante', text: 'Bonjour,\n\nIl manque une pièce à votre dossier. Merci de la déposer depuis votre espace candidat.\n\nCordialement,\nLa scolarité' },
  ];

  protected readonly q = signal('');
  protected readonly type = signal('');
  protected readonly service = signal('');
  protected readonly status = signal('');
  protected readonly asc = signal(false);
  protected readonly page = signal(0);
  protected readonly selected = signal<string[]>([]);
  protected readonly currentId = signal<string | null>(null);
  protected readonly reply = signal('');
  protected readonly sent = signal(false);

  protected readonly current = computed(() => this.store.requests().find((r) => r.id === this.currentId()) ?? null);
  protected readonly hasFilters = computed(() => !!(this.q() || this.type() || this.service() || this.status()));
  protected readonly filtered = computed(() => {
    const q = this.q().trim().toLowerCase();
    const list = this.store.requests().filter(
      (r) =>
        (!this.type() || r.type === this.type()) &&
        (!this.service() || r.service === this.service()) &&
        (!this.status() || r.status === this.status()) &&
        (!q || `${r.id} ${r.name} ${r.email} ${r.subject}`.toLowerCase().includes(q)),
    );
    return this.asc() ? [...list].reverse() : list;
  });
  protected readonly pageRows = computed(() => this.filtered().slice(this.page() * PAGE, (this.page() + 1) * PAGE));
  protected readonly allOnPage = computed(() => this.pageRows().length > 0 && this.pageRows().every((r) => this.selected().includes(r.id)));

  protected countBy(s: RequestStatus) {
    return this.store.requests().filter((r) => r.status === s).length;
  }
  protected reset() {
    this.q.set('');
    this.type.set('');
    this.service.set('');
    this.status.set('');
    this.page.set(0);
  }
  protected toggle(id: string) {
    this.selected.update((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }
  protected toggleAll() {
    const ids = this.pageRows().map((r) => r.id);
    this.selected.update((s) => (this.allOnPage() ? s.filter((x) => !ids.includes(x)) : [...new Set([...s, ...ids])]));
  }
  protected bulk(s: RequestStatus) {
    this.store.setRequestStatus(this.selected(), s);
    this.selected.set([]);
  }
  protected open(r: FormRequest) {
    this.currentId.set(r.id);
    this.reply.set('');
    this.sent.set(false);
    if (r.status === 'Nouveau') this.store.setRequestStatus([r.id], 'En cours');
  }
  protected setStatus(r: FormRequest, s: RequestStatus) {
    this.store.setRequestStatus([r.id], s);
  }
  protected send(r: FormRequest) {
    this.store.setRequestStatus([r.id], 'Traité');
    this.store.log('a répondu à', `${r.id} (${r.name})`);
    this.sent.set(true);
    this.reply.set('');
  }
  protected addNote(r: FormRequest, text: string) {
    if (!text.trim()) return;
    this.store.requests.update((l) => l.map((x) => (x.id === r.id ? { ...x, notes: [...x.notes, `${this.store.user().name} : ${text.trim()}`] } : x)));
  }
  protected fileNames(r: FormRequest) {
    return ['piece-identite.pdf', 'releves-de-notes.pdf', 'cv.pdf', 'certificat-medical.pdf', 'lettre-motivation.pdf'].slice(0, r.files);
  }
  protected export() {
    downloadCsv(
      'arstm-demandes.csv',
      this.filtered().map((r) => ({ numero: r.id, date: r.date, type: r.type, nom: r.name, email: r.email, telephone: r.phone, pays: r.country, objet: r.subject, service: r.service, statut: r.status })),
    );
    this.store.log('a exporté', `${this.filtered().length} demandes (CSV)`);
  }
}
