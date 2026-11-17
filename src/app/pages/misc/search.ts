import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Icon } from '../../shared/icon';
import { PageHero } from '../../shared/ui';
import { IMG, buildSearchIndex } from '../../data/site';

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’']/g, ' ');

/** Moteur de recherche interne : pages, formations, actualités, documents (EF-ERG-02). */
@Component({
  selector: 'app-search',
  imports: [RouterLink, Icon, PageHero],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero title="Rechercher" accent="sur le site" kicker="Recherche" [image]="img.hero" [crumbs]="[{ label: 'Recherche' }]" [compact]="true">
      <form role="search" class="mt-2 flex w-full max-w-[760px] gap-2 rounded-[14px] bg-white p-2 shadow-[0_20px_50px_-20px_rgba(0,0,0,.6)]" (submit)="submit($event)">
        <label for="sq" class="sr-only-x">Rechercher</label>
        <span aria-hidden="true" class="inline-flex items-center pl-2.5 text-subtle"><app-icon name="search" /></span>
        <input id="sq" type="search" class="min-w-0 flex-1 border-none bg-transparent px-2 font-[inherit] text-[17px] text-ink outline-none" placeholder="Formation, démarche, document…" [value]="term()" (input)="term.set($any($event.target).value)" />
        <button type="submit" class="f-btn min-h-[50px] rounded-[10px] bg-blue px-[22px] text-white">Rechercher</button>
      </form>
    </app-page-hero>

    <section class="container-x section-y relative z-[1] pt-10">
      @if (term().trim()) {
        <div class="mb-5 flex flex-wrap items-center gap-2">
          <p class="m-0 mr-2 text-muted" aria-live="polite"><strong class="text-ink">{{ results().length }}</strong> résultat(s) pour « {{ term() }} »</p>
          @for (k of kinds; track k) {
            <button type="button" class="min-h-[38px] cursor-pointer rounded-full border-[1.5px] px-3.5 font-[inherit] text-[14px] font-bold" [class]="kind() === k ? 'border-blue bg-blue text-white' : 'border-[#DCE4EF] bg-white text-ink'" (click)="kind.set(k)">{{ k }}</button>
          }
        </div>
        <ul class="m-0 flex list-none flex-col gap-3 p-0">
          @for (r of shown(); track r.title + r.kind) {
            <li>
              <a [routerLink]="r.path" [fragment]="r.fragment" class="f-card flex items-center gap-4 rounded-[18px] bg-white p-5 text-ink no-underline shadow-card">
                <span class="icon-tile bg-tint text-blue"><app-icon [name]="icon(r.kind)" [size]="20" /></span>
                <span class="flex min-w-0 flex-1 flex-col">
                  <span class="text-[13px] font-bold text-blue">{{ r.kind }}</span>
                  <strong class="leading-snug">{{ r.title }}</strong>
                  <span class="truncate text-[14px] text-subtle">{{ r.path }}</span>
                </span>
                <app-icon name="arrow-right" [size]="18" class="text-blue" />
              </a>
            </li>
          } @empty {
            <li class="flex flex-col items-center gap-3 rounded-[22px] bg-white p-10 text-center">
              <strong class="text-[19px] text-ink">Aucun résultat</strong>
              <p class="m-0 text-muted">Essayez un terme plus général, ou parcourez le plan du site.</p>
              <a routerLink="/plan-du-site" class="f-btn btn-primary">Plan du site</a>
            </li>
          }
        </ul>
      } @else {
        <div class="flex flex-col gap-4">
          <strong class="text-[18px] text-ink">Recherches fréquentes</strong>
          <div class="flex flex-wrap gap-2">
            @for (s of suggestions; track s) {
              <button type="button" class="min-h-[42px] cursor-pointer rounded-full border border-line bg-white px-4 font-[inherit] text-[15px] font-semibold text-navy hover:bg-tint" (click)="go(s)">{{ s }}</button>
            }
          </div>
        </div>
      }
    </section>
  `,
})
export default class Search {
  readonly q = input<string>();
  private readonly router = inject(Router);
  protected readonly img = IMG;
  private readonly index = buildSearchIndex();
  protected readonly term = signal('');
  protected readonly kind = signal('Tout');
  protected readonly kinds = ['Tout', 'Page', 'Formation', 'Actualité', 'Événement', 'Document'];
  protected readonly suggestions = ['Capitaine', 'STCW', 'Concours', 'Logistique', 'Bourses', 'Sûreté', 'Hébergement'];

  protected readonly results = computed(() => {
    const words = norm(this.term()).split(/\s+/).filter((w) => w.length > 1);
    if (!words.length) return [];
    return this.index
      .map((e) => {
        const t = norm(e.title);
        const b = norm(e.text);
        let score = 0;
        for (const w of words) {
          if (t.includes(w)) score += 3;
          else if (b.includes(w)) score += 1;
          else return null;
        }
        return { ...e, score };
      })
      .filter((x): x is NonNullable<typeof x> => !!x)
      .sort((a, b) => b.score - a.score);
  });
  protected readonly shown = computed(() => (this.kind() === 'Tout' ? this.results() : this.results().filter((r) => r.kind === this.kind())));

  constructor() {
    effect(() => this.term.set(this.q() ?? ''));
  }

  protected icon(kind: string) {
    return { Page: 'file', Formation: 'cap', Actualité: 'bell', Événement: 'calendar', Document: 'download' }[kind] ?? 'file';
  }
  protected submit(e: Event) {
    e.preventDefault();
    this.go(this.term());
  }
  protected go(q: string) {
    this.term.set(q);
    this.kind.set('Tout');
    this.router.navigate([], { queryParams: { q: q.trim() || null }, replaceUrl: true });
  }
}
