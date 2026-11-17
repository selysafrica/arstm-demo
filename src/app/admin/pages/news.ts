import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../shared/icon';
import { AdminStore } from '../admin-store';
import { ContentStore, ManagedArticle, PublishState } from '../../core/content-store';
import { AdmDrawer, AdmPageHead, stateChip } from '../ui';
import { GALLERY, NEWS_CATEGORIES, TONES, Tone } from '../../data/site';

const CAT_TONE: Record<string, Tone> = {
  'Vie de l’Académie': 'blue',
  Annonce: 'orange',
  Partenariats: 'green',
  Conférences: 'violet',
  Recherche: 'teal',
  'Portes ouvertes': 'navy',
  Concours: 'orange',
  Soutenances: 'blue',
  'Cérémonies officielles': 'teal',
};

/** Actualités (EF-ACT-01) et agenda (EF-ACT-02) — reliés au site public. */
@Component({
  selector: 'adm-news',
  imports: [RouterLink, Icon, AdmPageHead, AdmDrawer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <adm-page-head title="Actualités et agenda" desc="Ce qui est publié ici apparaît immédiatement sur le site public.">
      @if (tab() === 'news') {
        <button type="button" class="adm-btn adm-btn-primary" (click)="create()"><app-icon name="sparkle" [size]="16" />Nouvelle actualité</button>
      } @else {
        <button type="button" class="adm-btn adm-btn-primary" (click)="newEvent()"><app-icon name="calendar" [size]="16" />Nouvel événement</button>
      }
    </adm-page-head>

    <div class="flex flex-wrap items-center justify-between gap-3">
      <div role="tablist" class="adm-tabs" aria-label="Type de contenu">
        <button type="button" role="tab" class="adm-tab" [attr.aria-selected]="tab() === 'news'" (click)="tab.set('news')">Actualités ({{ content.articles().length }})</button>
        <button type="button" role="tab" class="adm-tab" [attr.aria-selected]="tab() === 'agenda'" (click)="tab.set('agenda')">Agenda ({{ content.events().length }})</button>
      </div>
      @if (tab() === 'news') {
        <div class="flex flex-wrap gap-2">
          <input class="adm-input !w-[220px]" placeholder="Rechercher un titre…" aria-label="Rechercher" [value]="q()" (input)="q.set($any($event.target).value)" />
          <select class="adm-input !w-auto" aria-label="Filtrer par état" [value]="state()" (change)="state.set($any($event.target).value)">
            <option value="">Tous les états</option>
            @for (s of states; track s) { <option [value]="s" [selected]="s === state()">{{ s }}</option> }
          </select>
        </div>
      }
    </div>

    @if (tab() === 'news') {
      <div class="adm-card overflow-x-auto">
        <table class="adm-table min-w-[820px]">
          <thead><tr><th>Titre</th><th>Catégorie</th><th>État</th><th>Auteur</th><th>Mis à jour</th><th>EN</th><th class="text-right">Actions</th></tr></thead>
          <tbody>
            @for (a of list(); track a.id) {
              <tr>
                <td>
                  <button type="button" class="flex cursor-pointer items-center gap-3 border-none bg-transparent p-0 text-left font-[inherit]" (click)="edit(a)">
                    <img [src]="a.img" alt="" class="h-10 w-14 flex-none rounded-md object-cover" />
                    <strong class="max-w-[360px] text-[14px] leading-snug text-ink hover:text-blue">{{ a.title }}</strong>
                  </button>
                </td>
                <td><span class="chip" [style.background]="tone(a.category).soft" [style.color]="tone(a.category).ink">{{ a.category }}</span></td>
                <td><span [class]="chip(a.state)">{{ a.state }}</span></td>
                <td class="text-text">{{ a.author }}</td>
                <td class="text-subtle">{{ a.updated }}</td>
                <td>@if (a.en) { <app-icon name="tick" [size]="16" class="text-green" /> } @else { <span class="text-[12.5px] font-semibold text-violet-ink">À traduire</span> }</td>
                <td class="text-right whitespace-nowrap">
                  @if (a.state === 'Publié') { <a [routerLink]="['/actualites', a.slug]" target="_blank" class="adm-btn adm-btn-ghost !min-h-8 !px-2.5" [attr.aria-label]="'Voir en ligne : ' + a.title"><app-icon name="external" [size]="15" /></a> }
                  <button type="button" class="adm-btn adm-btn-ghost !min-h-8 !px-2.5" (click)="edit(a)">Modifier</button>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="7" class="py-10 text-center text-subtle">Aucune actualité ne correspond. <button type="button" class="cursor-pointer border-none bg-transparent font-[inherit] font-semibold text-blue" (click)="create()">Créer une actualité</button></td></tr>
            }
          </tbody>
        </table>
      </div>
    } @else {
      <div class="adm-card overflow-x-auto">
        <table class="adm-table min-w-[760px]">
          <thead><tr><th>Date</th><th>Événement</th><th>Lieu</th><th>Type</th><th>Alerte site</th><th class="text-right">Actions</th></tr></thead>
          <tbody>
            @for (e of content.events(); track e.id) {
              <tr>
                <td class="whitespace-nowrap"><strong class="text-ink">{{ e.day }} {{ e.month }}</strong> <span class="text-subtle">{{ e.year }}</span></td>
                <td><strong class="text-ink">{{ e.title }}</strong><br /><span class="text-[12.5px] text-subtle">{{ e.time }}</span></td>
                <td class="text-text">{{ e.place }}</td>
                <td><span class="chip" [style.background]="tones[e.tone].soft" [style.color]="tones[e.tone].ink">{{ e.category }}</span></td>
                <td>
                  <label class="inline-flex cursor-pointer items-center gap-2 text-[13px]">
                    <input type="checkbox" class="h-4 w-4 accent-blue" [checked]="!!e.important" (change)="toggleImportant(e.id)" />{{ e.important ? 'Important' : '—' }}
                  </label>
                </td>
                <td class="text-right"><button type="button" class="adm-btn adm-btn-danger !min-h-8 !px-2.5" (click)="removeEvent(e.id, e.title)">Supprimer</button></td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }

    <!-- Éditeur d’actualité -->
    @if (draft(); as d) {
      <adm-drawer [title]="d.id ? 'Modifier l’actualité' : 'Nouvelle actualité'" [kicker]="d.id ? 'Actualité n° ' + d.id + ' · ' + d.state : 'Brouillon'" (close)="draft.set(null)">
        <div class="flex flex-col gap-4">
          <label class="adm-label">Titre<input class="adm-input" [value]="d.title" (input)="set({ title: $any($event.target).value })" /></label>
          <div class="grid gap-3 sm:grid-cols-2">
            <label class="adm-label">Catégorie
              <select class="adm-input" [value]="d.category" (change)="set({ category: $any($event.target).value })">
                @for (c of categories; track c) { <option [value]="c" [selected]="c === d.category">{{ c }}</option> }
              </select>
            </label>
            <label class="adm-label">Date affichée<input class="adm-input" [value]="d.date" (input)="set({ date: $any($event.target).value })" /></label>
          </div>
          <label class="adm-label">Chapô (affiché dans les listes)<textarea rows="2" class="adm-input" [value]="d.excerpt" (input)="set({ excerpt: $any($event.target).value })"></textarea></label>
          <label class="adm-label">Texte<textarea rows="7" class="adm-input" [value]="d.body.join('\n\n')" (input)="set({ body: splitBody($any($event.target).value) })"></textarea></label>
          <fieldset class="m-0 flex flex-col gap-2 border-none p-0">
            <legend class="mb-1 text-[13px] font-semibold text-text">Image (médiathèque)</legend>
            <div class="grid grid-cols-4 gap-2">
              @for (g of gallery; track g.img) {
                <button type="button" class="relative cursor-pointer overflow-hidden rounded-lg border-2 p-0" [class]="d.img === g.img ? 'border-blue' : 'border-transparent'" [attr.aria-pressed]="d.img === g.img" [attr.aria-label]="g.alt" (click)="set({ img: g.img, alt: g.alt })">
                  <img [src]="g.img" alt="" class="block aspect-[4/3] w-full object-cover" />
                </button>
              }
            </div>
            <label class="adm-label">Texte alternatif<input class="adm-input" [value]="d.alt" (input)="set({ alt: $any($event.target).value })" /></label>
          </fieldset>
          <label class="inline-flex items-center gap-2 text-[13.5px]"><input type="checkbox" class="h-4 w-4 accent-blue" [checked]="d.en" (change)="set({ en: !d.en })" />Version anglaise renseignée</label>
          @if (error()) { <p class="m-0 rounded-lg bg-[#fef3f2] px-3 py-2 text-[13.5px] font-semibold text-[#b42318]" role="alert">{{ error() }}</p> }
        </div>
        <ng-container actions>
          @if (d.id) { <button type="button" class="adm-btn adm-btn-danger mr-auto" [disabled]="!store.rights().publish" (click)="remove(d)">Supprimer</button> }
          <button type="button" class="adm-btn adm-btn-ghost" (click)="commit('Brouillon')">Enregistrer le brouillon</button>
          @if (store.rights().publish) {
            <button type="button" class="adm-btn adm-btn-success" (click)="commit('Publié')"><app-icon name="tick" [size]="15" />Publier</button>
          } @else {
            <button type="button" class="adm-btn adm-btn-primary" (click)="commit('En relecture')">Soumettre à relecture</button>
          }
        </ng-container>
      </adm-drawer>
    }

    <!-- Nouvel événement -->
    @if (eventDraft(); as e) {
      <adm-drawer title="Nouvel événement" kicker="Agenda" (close)="eventDraft.set(null)">
        <div class="flex flex-col gap-4">
          <label class="adm-label">Intitulé<input class="adm-input" [value]="e.title" (input)="eventDraft.set({ ...e, title: $any($event.target).value })" /></label>
          <div class="grid gap-3 sm:grid-cols-2">
            <label class="adm-label">Date<input type="date" class="adm-input" [value]="e.date" (input)="eventDraft.set({ ...e, date: $any($event.target).value })" /></label>
            <label class="adm-label">Horaire<input class="adm-input" [value]="e.time" placeholder="9 h – 17 h" (input)="eventDraft.set({ ...e, time: $any($event.target).value })" /></label>
          </div>
          <label class="adm-label">Lieu<input class="adm-input" [value]="e.place" (input)="eventDraft.set({ ...e, place: $any($event.target).value })" /></label>
          <label class="adm-label">Type
            <select class="adm-input" [value]="e.category" (change)="eventDraft.set({ ...e, category: $any($event.target).value })">
              @for (c of eventTypes; track c) { <option [value]="c" [selected]="c === e.category">{{ c }}</option> }
            </select>
          </label>
          <label class="adm-label">Description<textarea rows="3" class="adm-input" [value]="e.text" (input)="eventDraft.set({ ...e, text: $any($event.target).value })"></textarea></label>
          @if (error()) { <p class="m-0 rounded-lg bg-[#fef3f2] px-3 py-2 text-[13.5px] font-semibold text-[#b42318]" role="alert">{{ error() }}</p> }
        </div>
        <ng-container actions>
          <button type="button" class="adm-btn adm-btn-ghost" (click)="eventDraft.set(null)">Annuler</button>
          <button type="button" class="adm-btn adm-btn-primary" (click)="saveEvent()">Ajouter à l’agenda</button>
        </ng-container>
      </adm-drawer>
    }

    @if (flash()) {
      <p role="status" class="f-pop fixed right-6 bottom-6 z-[80] m-0 flex items-center gap-2 rounded-xl bg-navy px-4 py-3 text-[14px] font-semibold text-white shadow-soft"><app-icon name="tick" [size]="16" class="text-orange" />{{ flash() }}</p>
    }
  `,
})
export default class AdmNews {
  /** ?nouveau=1 ouvre directement l’éditeur */
  readonly nouveau = input<string>();
  protected readonly store = inject(AdminStore);
  protected readonly content = inject(ContentStore);
  protected readonly chip = stateChip;
  protected readonly tones = TONES;
  protected readonly gallery = GALLERY;
  protected readonly categories = NEWS_CATEGORIES.filter((c) => c !== 'Toutes').concat(['Concours']);
  protected readonly eventTypes = ['Portes ouvertes', 'Concours', 'Soutenances', 'Séminaires', 'Webinaires', 'Cérémonies officielles', 'Conférences'];
  protected readonly states: PublishState[] = ['Publié', 'En relecture', 'Brouillon', 'Programmé', 'Archivé'];
  protected readonly tab = signal<'news' | 'agenda'>('news');
  protected readonly q = signal('');
  protected readonly state = signal('');
  protected readonly draft = signal<ManagedArticle | null>(null);
  protected readonly eventDraft = signal<{ title: string; date: string; time: string; place: string; category: string; text: string } | null>(null);
  protected readonly error = signal('');
  protected readonly flash = signal('');

  protected readonly list = computed(() => {
    const q = this.q().trim().toLowerCase();
    return this.content.articles().filter((a) => (!this.state() || a.state === this.state()) && (!q || a.title.toLowerCase().includes(q)));
  });

  constructor() {
    queueMicrotask(() => {
      if (this.nouveau()) this.create();
    });
  }

  protected tone(cat: string) {
    return TONES[CAT_TONE[cat] ?? 'blue'];
  }
  protected splitBody(v: string) {
    return v.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  }
  protected create() {
    this.error.set('');
    this.draft.set({ id: 0, slug: '', title: '', category: 'Vie de l’Académie', tone: 'blue', date: '17 novembre 2026', img: GALLERY[2].img, alt: GALLERY[2].alt, excerpt: '', body: [], state: 'Brouillon', author: this.store.user().name, updated: '17 nov. 2026', en: false });
  }
  protected edit(a: ManagedArticle) {
    this.error.set('');
    this.draft.set({ ...a, body: [...a.body] });
  }
  protected set(v: Partial<ManagedArticle>) {
    this.draft.update((d) => (d ? { ...d, ...v } : d));
  }
  protected commit(state: PublishState) {
    const d = this.draft()!;
    if (!d.title.trim()) return this.error.set('Le titre est obligatoire.');
    if (state === 'Publié' && !d.excerpt.trim()) return this.error.set('Ajoutez un chapô avant de publier.');
    if (state === 'Publié' && !d.alt.trim()) return this.error.set('Le texte alternatif de l’image est obligatoire (SEO-01).');
    const saved = this.content.upsertArticle({ ...d, id: d.id || undefined, state, tone: CAT_TONE[d.category] ?? 'blue', updated: '17 nov. 2026', author: this.store.user().name, body: d.body.length ? d.body : [d.excerpt] });
    this.store.log(state === 'Publié' ? 'a publié' : state === 'En relecture' ? 'a soumis à relecture' : 'a enregistré', `Actualité « ${saved.title} »`);
    this.draft.set(null);
    this.toast(state === 'Publié' ? 'Actualité publiée : elle est visible sur le site.' : state === 'En relecture' ? 'Actualité soumise aux validateurs.' : 'Brouillon enregistré.');
  }
  protected remove(d: ManagedArticle) {
    this.content.removeArticle(d.id);
    this.store.log('a supprimé', `Actualité « ${d.title} »`);
    this.draft.set(null);
    this.toast('Actualité supprimée.');
  }
  protected newEvent() {
    this.error.set('');
    this.eventDraft.set({ title: '', date: '2027-01-20', time: '9 h – 12 h', place: 'Campus de Yopougon', category: 'Séminaires', text: '' });
  }
  protected saveEvent() {
    const e = this.eventDraft()!;
    if (!e.title.trim() || !e.date) return this.error.set('Intitulé et date obligatoires.');
    const d = new Date(e.date + 'T09:00');
    const iso = e.date.replace(/-/g, '') + 'T090000';
    this.content.events.update((l) =>
      [...l, { id: Date.now(), day: String(d.getDate()).padStart(2, '0'), month: d.toLocaleDateString('fr-FR', { month: 'short' }), year: String(d.getFullYear()), isoStart: iso, isoEnd: iso.replace('T09', 'T17'), title: e.title, place: e.place, time: e.time, category: e.category, tone: 'blue' as Tone, text: e.text || e.title }].sort((a, b) => a.isoStart.localeCompare(b.isoStart)),
    );
    this.store.log('a ajouté à l’agenda', e.title);
    this.eventDraft.set(null);
    this.toast('Événement ajouté à l’agenda public.');
  }
  protected toggleImportant(id: number) {
    this.content.events.update((l) => l.map((e) => (e.id === id ? { ...e, important: !e.important } : e)));
  }
  protected removeEvent(id: number, title: string) {
    this.content.events.update((l) => l.filter((e) => e.id !== id));
    this.store.log('a supprimé de l’agenda', title);
    this.toast('Événement supprimé.');
  }
  private toast(m: string) {
    this.flash.set(m);
    setTimeout(() => this.flash.set(''), 2800);
  }
}
