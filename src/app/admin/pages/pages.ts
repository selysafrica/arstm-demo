import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { Icon } from '../../shared/icon';
import { AdminStore, PageNode } from '../admin-store';
import { AdmPageHead, stateChip } from '../ui';

type Lang = 'fr' | 'en';

/** Arborescence, éditeur, circuit de validation, traductions et SEO par page (ADM-02, 03, 04, 09). */
@Component({
  selector: 'adm-pages',
  imports: [Icon, AdmPageHead],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <adm-page-head title="Pages" desc="Arborescence du site (3 niveaux max.), contenus bilingues et circuit de validation.">
      <button type="button" class="adm-btn adm-btn-primary" (click)="addPage()"><app-icon name="sparkle" [size]="16" />Nouvelle page</button>
    </adm-page-head>

    <div class="grid items-start gap-4 lg:grid-cols-[320px_1fr]">
      <!-- Arborescence -->
      <section class="adm-card flex flex-col gap-2 p-3 lg:sticky lg:top-0" aria-label="Arborescence">
        <label class="relative">
          <span class="sr-only-x">Filtrer les pages</span>
          <app-icon name="search" [size]="15" class="absolute top-1/2 left-2.5 -translate-y-1/2 text-subtle" />
          <input class="adm-input !pl-8" placeholder="Filtrer…" [value]="q()" (input)="q.set($any($event.target).value)" />
        </label>
        <div class="flex flex-wrap gap-1 text-[12px]">
          @for (f of filters; track f) {
            <button type="button" class="cursor-pointer rounded-md border-none px-2 py-1 font-[inherit] font-semibold" [class]="filter() === f ? 'bg-blue text-white' : 'bg-[#eef2f7] text-muted hover:bg-[#e4eaf2]'" (click)="filter.set(f)">{{ f }}</button>
          }
        </div>
        <ul class="m-0 flex max-h-[62vh] list-none flex-col overflow-y-auto p-0" role="tree">
          @for (n of tree(); track n.id) {
            <li role="treeitem" [attr.aria-selected]="selId() === n.id">
              <button type="button" class="flex w-full cursor-pointer items-center gap-2 rounded-lg border-none py-1.5 pr-2 text-left font-[inherit] text-[13.5px] transition-colors" [style.padding-left.px]="n.parent ? 26 : 8" [class]="selId() === n.id ? 'bg-tint text-navy' : 'bg-transparent text-ink hover:bg-[#f3f6fa]'" (click)="select(n.id)">
                <app-icon [name]="n.parent ? 'file' : 'sitemap'" [size]="14" class="flex-none text-subtle" />
                <span class="min-w-0 flex-1 truncate" [class.font-semibold]="!n.parent">{{ n.title }}</span>
                @if (!n.en) { <span class="rounded bg-violet-soft px-1 text-[10.5px] font-bold text-violet-ink" title="Traduction anglaise manquante">EN</span> }
                <span class="h-2 w-2 flex-none rounded-full" [class]="dot(n.state)" [title]="n.state"></span>
              </button>
            </li>
          }
        </ul>
        <p class="m-0 flex flex-wrap gap-x-3 gap-y-1 border-t border-[#eef2f7] px-1 pt-2 text-[12px] text-subtle">
          <span class="inline-flex items-center gap-1"><span class="h-2 w-2 rounded-full bg-green"></span>Publié</span>
          <span class="inline-flex items-center gap-1"><span class="h-2 w-2 rounded-full bg-orange"></span>En relecture</span>
          <span class="inline-flex items-center gap-1"><span class="h-2 w-2 rounded-full bg-[#9aa6b8]"></span>Brouillon</span>
          <span class="inline-flex items-center gap-1"><span class="h-2 w-2 rounded-full bg-violet"></span>Programmé</span>
        </p>
      </section>

      <!-- Éditeur -->
      @if (draft(); as d) {
        <section class="flex min-w-0 flex-col gap-4" aria-label="Éditeur de page">
          <div class="adm-card flex flex-wrap items-center gap-3 p-4">
            <div class="flex min-w-0 flex-1 flex-col">
              <span class="text-[12.5px] text-subtle">{{ d.path }} · modifiée le {{ d.updated }} par {{ d.author }}</span>
              <strong class="truncate text-[17px] text-ink">{{ d.title || 'Sans titre' }}</strong>
            </div>
            <span [class]="chip(d.state)">{{ d.state }}{{ d.state === 'Programmé' && d.scheduledAt ? ' · ' + d.scheduledAt : '' }}</span>
            @if (dirty()) { <span class="chip chip-warn">Modifications non enregistrées</span> }
          </div>

          <div class="adm-card flex flex-col gap-4 p-4">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div role="tablist" class="adm-tabs" aria-label="Langue">
                <button type="button" role="tab" class="adm-tab" [attr.aria-selected]="lang() === 'fr'" (click)="lang.set('fr')">Français</button>
                <button type="button" role="tab" class="adm-tab" [attr.aria-selected]="lang() === 'en'" (click)="lang.set('en')">
                  English
                  @if (!d.en) { <span class="ml-1 rounded bg-violet-soft px-1 text-[10.5px] font-bold text-violet-ink">à traduire</span> }
                </button>
              </div>
              <label class="flex items-center gap-2 text-[13px] text-subtle">Gabarit
                <select class="adm-input !w-auto" [value]="template()" (change)="template.set($any($event.target).value); touch()">
                  @for (t of templates; track t) { <option [value]="t" [selected]="t === template()">{{ t }}</option> }
                </select>
              </label>
            </div>

            @if (lang() === 'fr') {
              <label class="adm-label">Titre de la page<input class="adm-input" [value]="d.title" (input)="patch({ title: $any($event.target).value })" /></label>
            } @else {
              <label class="adm-label">Page title<input class="adm-input" [value]="titleEn()" placeholder="English title" (input)="titleEn.set($any($event.target).value); touch()" /></label>
            }

            <div class="flex flex-col gap-1.5">
              <span class="text-[13px] font-semibold text-text">Contenu</span>
              <div class="overflow-hidden rounded-[9px] border border-[#d8e1ec] focus-within:border-blue focus-within:shadow-[0_0_0_3px_rgba(31,95,168,.15)]">
                <div class="flex flex-wrap gap-0.5 border-b border-[#e4eaf2] bg-[#f7f9fc] p-1" role="toolbar" aria-label="Mise en forme">
                  @for (b of toolbar; track b.label) {
                    <button type="button" class="inline-flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-md border-none bg-transparent px-2 font-[inherit] text-[13px] font-bold text-text hover:bg-[#e4eaf2]" [title]="b.label" [attr.aria-label]="b.label" (click)="wrap(b.before, b.after)">{{ b.text }}</button>
                  }
                  <span class="mx-1 w-px bg-[#e4eaf2]"></span>
                  <button type="button" class="inline-flex h-8 cursor-pointer items-center gap-1 rounded-md border-none bg-transparent px-2 font-[inherit] text-[13px] font-semibold text-text hover:bg-[#e4eaf2]" (click)="wrap('![Texte alternatif obligatoire](', 'img/campus-arcades.jpg)')"><app-icon name="sparkle" [size]="14" />Image</button>
                </div>
                <textarea #editor class="block min-h-[220px] w-full resize-y border-none p-3 font-[inherit] text-[14.5px] leading-relaxed text-ink outline-none" [value]="lang() === 'fr' ? d.body : bodyEn()" (input)="onBody($any($event.target).value)" [attr.aria-label]="lang() === 'fr' ? 'Contenu en français' : 'Content in English'"></textarea>
              </div>
              <span class="text-[12.5px] text-subtle">{{ words() }} mots · les images sans texte alternatif sont signalées avant publication (SEO-01).</span>
            </div>
          </div>

          <!-- SEO -->
          <div class="adm-card flex flex-col gap-3 p-4">
            <div class="flex items-center justify-between">
              <h2 class="m-0 text-[15px] font-bold text-ink">Référencement</h2>
              <span class="chip" [class]="seoScore() === 3 ? 'chip-ok' : 'chip-warn'">{{ seoScore() }}/3 critères</span>
            </div>
            <label class="adm-label">
              <span class="flex justify-between">Balise title<span [class]="d.seoTitle.length > 60 || !d.seoTitle ? 'text-orange-ink' : 'text-subtle'">{{ d.seoTitle.length }}/60</span></span>
              <input class="adm-input" [value]="d.seoTitle" (input)="patch({ seoTitle: $any($event.target).value })" />
            </label>
            <label class="adm-label">
              <span class="flex justify-between">Méta-description<span [class]="d.seoDesc.length > 160 || d.seoDesc.length < 50 ? 'text-orange-ink' : 'text-subtle'">{{ d.seoDesc.length }}/160</span></span>
              <textarea rows="2" class="adm-input" [value]="d.seoDesc" (input)="patch({ seoDesc: $any($event.target).value })"></textarea>
            </label>
            <label class="adm-label">URL<input class="adm-input font-mono text-[13px]" [value]="d.path" (input)="patch({ path: $any($event.target).value })" /></label>
            <div class="rounded-lg border border-[#e4eaf2] bg-[#f7f9fc] p-3" aria-label="Aperçu Google">
              <span class="text-[12.5px] text-green-ink">www.arstm.net/fr{{ d.path === '/' ? '' : d.path }}</span>
              <p class="m-0 truncate text-[17px] text-[#1a0dab]">{{ d.seoTitle || d.title }}</p>
              <p class="m-0 line-clamp-2 text-[13px] text-text">{{ d.seoDesc || 'Aucune méta-description : Google choisira un extrait de la page.' }}</p>
            </div>
          </div>

          <!-- Barre d’actions (circuit de validation) -->
          <div class="adm-card sticky bottom-0 z-10 flex flex-wrap items-center gap-2 p-3 shadow-[0_-8px_24px_-16px_rgba(14,24,62,.35)]">
            <span class="mr-auto text-[13px] text-subtle">Rôle : <strong class="text-ink">{{ store.role() }}</strong>{{ store.rights().publish ? '' : ' · publication réservée aux validateurs' }}</span>
            <button type="button" class="adm-btn adm-btn-ghost" [disabled]="!dirty()" (click)="save()">Enregistrer</button>
            @if (!store.rights().publish) {
              <button type="button" class="adm-btn adm-btn-primary" [disabled]="d.state === 'En relecture'" (click)="transition('En relecture', 'a soumis à relecture')">Soumettre à relecture</button>
            } @else {
              @if (d.state === 'En relecture') {
                <button type="button" class="adm-btn adm-btn-danger" (click)="transition('Brouillon', 'a renvoyé en brouillon')">Renvoyer en brouillon</button>
              }
              <span class="flex items-center gap-1">
                <input type="datetime-local" class="adm-input !w-auto" aria-label="Date de publication programmée" [value]="when()" (input)="when.set($any($event.target).value)" />
                <button type="button" class="adm-btn adm-btn-ghost" [disabled]="!when()" (click)="schedule()">Programmer</button>
              </span>
              <button type="button" class="adm-btn adm-btn-success" (click)="transition('Publié', 'a publié')"><app-icon name="tick" [size]="15" />Publier</button>
            }
          </div>
          @if (flash()) {
            <p role="status" class="f-pop m-0 rounded-lg bg-green-soft px-3 py-2 text-[13.5px] font-semibold text-green-ink">{{ flash() }}</p>
          }
        </section>
      }
    </div>
  `,
})
export default class AdmPages {
  protected readonly store = inject(AdminStore);
  protected readonly chip = stateChip;
  private readonly editor = viewChild<ElementRef<HTMLTextAreaElement>>('editor');
  protected readonly filters = ['Toutes', 'En relecture', 'Brouillon', 'Sans EN'];
  protected readonly filter = signal('Toutes');
  protected readonly q = signal('');
  protected readonly templates = ['Rubrique', 'Article', 'Fiche formation', 'Formulaire', 'Médiathèque', 'Accueil'];
  protected readonly toolbar = [
    { label: 'Gras', text: 'G', before: '**', after: '**' },
    { label: 'Italique', text: 'I', before: '_', after: '_' },
    { label: 'Titre', text: 'H2', before: '\n## ', after: '' },
    { label: 'Liste', text: '•', before: '\n- ', after: '' },
    { label: 'Lien', text: 'Lien', before: '[', after: '](https://)' },
  ];

  protected readonly selId = signal('home');
  protected readonly draft = signal<PageNode | null>(null);
  protected readonly dirty = signal(false);
  protected readonly lang = signal<Lang>('fr');
  protected readonly titleEn = signal('');
  protected readonly bodyEn = signal('');
  protected readonly template = signal('Rubrique');
  protected readonly when = signal('');
  protected readonly flash = signal('');

  protected readonly tree = computed(() => {
    const q = this.q().trim().toLowerCase();
    const f = this.filter();
    const all = this.store.pages();
    const match = (p: PageNode) =>
      (!q || p.title.toLowerCase().includes(q)) &&
      (f === 'Toutes' || (f === 'Sans EN' ? !p.en : p.state === f));
    const out: PageNode[] = [];
    for (const root of all.filter((p) => !p.parent)) {
      const kids = all.filter((p) => p.parent === root.id).filter(match);
      if (match(root) || kids.length) out.push(root, ...kids);
    }
    return out;
  });

  protected readonly words = computed(() => {
    const t = this.lang() === 'fr' ? this.draft()?.body : this.bodyEn();
    return (t ?? '').trim().split(/\s+/).filter(Boolean).length;
  });
  protected readonly seoScore = computed(() => {
    const d = this.draft();
    if (!d) return 0;
    return [d.seoTitle && d.seoTitle.length <= 60, d.seoDesc.length >= 50 && d.seoDesc.length <= 160, /^\/[a-z0-9\-/#]*$/.test(d.path)].filter(Boolean).length;
  });

  constructor() {
    this.select('home');
  }

  protected select(id: string) {
    const p = this.store.pages().find((x) => x.id === id);
    if (!p) return;
    this.selId.set(id);
    this.draft.set({ ...p });
    this.titleEn.set(p.en ? (p.id === 'home' ? 'Home' : p.title + ' (EN)') : '');
    this.bodyEn.set(p.en ? 'English version of: ' + p.body : '');
    this.template.set(p.id === 'home' ? 'Accueil' : p.parent ? 'Article' : 'Rubrique');
    this.dirty.set(false);
    this.lang.set('fr');
    this.flash.set('');
  }

  protected patch(v: Partial<PageNode>) {
    this.draft.update((d) => (d ? { ...d, ...v } : d));
    this.touch();
  }
  protected touch() {
    this.dirty.set(true);
    this.flash.set('');
  }
  protected onBody(v: string) {
    if (this.lang() === 'fr') this.patch({ body: v });
    else {
      this.bodyEn.set(v);
      this.touch();
    }
  }
  protected wrap(before: string, after: string) {
    const ta = this.editor()?.nativeElement;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, value } = ta;
    const next = value.slice(0, s) + before + value.slice(s, e) + after + value.slice(e);
    this.onBody(next);
    ta.value = next;
    ta.focus();
    ta.setSelectionRange(s + before.length, e + before.length);
  }

  private commit(state = this.draft()!.state, msg = 'a modifié', extra: Partial<PageNode> = {}) {
    const d = { ...this.draft()!, ...extra, state, en: this.draft()!.en || !!(this.titleEn().trim() && this.bodyEn().trim()) };
    this.store.savePage(d, msg);
    this.draft.set({ ...d, updated: '17 nov. 2026', author: this.store.user().name });
    this.dirty.set(false);
  }
  protected save() {
    const keep = this.store.rights().publish ? this.draft()!.state : this.draft()!.state === 'Publié' ? 'Brouillon' : this.draft()!.state;
    this.commit(keep, 'a enregistré');
    this.flash.set(keep !== this.draft()!.state ? 'Enregistré en brouillon.' : 'Modifications enregistrées.');
  }
  protected transition(state: PageNode['state'], msg: string) {
    this.commit(state, msg, { scheduledAt: undefined });
    this.flash.set(state === 'Publié' ? 'Page publiée sur le site.' : state === 'En relecture' ? 'Page soumise aux validateurs.' : 'Page renvoyée en brouillon.');
  }
  protected schedule() {
    const at = new Date(this.when()).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    this.commit('Programmé', 'a programmé', { scheduledAt: at });
    this.flash.set(`Publication programmée le ${at}.`);
  }
  protected addPage() {
    const cur = this.store.pages().find((p) => p.id === this.selId());
    const parent = cur?.parent ?? cur?.id ?? null;
    const id = 'new-' + Date.now();
    const node: PageNode = { id, title: 'Nouvelle page', path: '/nouvelle-page', parent: parent === 'home' ? null : parent, state: 'Brouillon', updated: '17 nov. 2026', author: this.store.user().name, en: false, seoTitle: '', seoDesc: '', body: '' };
    this.store.pages.update((l) => {
      let idx = l.length - 1;
      for (let k = l.length - 1; k >= 0; k--) if (l[k].parent === node.parent || l[k].id === node.parent) { idx = k; break; }
      return [...l.slice(0, idx + 1), node, ...l.slice(idx + 1)];
    });
    this.store.log('a créé', 'Page « Nouvelle page »');
    this.select(id);
  }
  protected dot(s: string) {
    return s === 'Publié' ? 'bg-green' : s === 'En relecture' ? 'bg-orange' : s === 'Programmé' ? 'bg-violet' : 'bg-[#9aa6b8]';
  }
}
