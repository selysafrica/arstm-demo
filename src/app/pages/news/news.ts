import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ContentStore } from '../../core/content-store';
import { RouterLink } from '@angular/router';
import { Icon } from '../../shared/icon';
import { PageHero, toneOf } from '../../shared/ui';
import { IMG, PRESS } from '../../data/site';

/** Actualités par catégorie, revue de presse, archives (EF-ACT-01, EF-ACT-04). */
@Component({
  selector: 'app-news',
  imports: [RouterLink, Icon, PageHero],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero title="Actualités" accent="& agenda" kicker="La vie de l’Académie" lead="Concours, cérémonies, partenariats, conférences : suivez l’actualité de l’ARSTM." [image]="img.salut" [crumbs]="[{ label: 'Actualités' }]" [compact]="true" />

    <section class="container-x relative z-[2] -mt-7">
      <div class="panel flex gap-1.5 overflow-x-auto p-2 [scrollbar-width:none]" role="group" aria-label="Filtrer par catégorie">
        @for (c of categories; track c) {
          <button
            type="button"
            class="min-h-[44px] flex-none cursor-pointer rounded-full border-none px-4 font-[inherit] text-[14.5px] font-bold whitespace-nowrap transition-colors"
            [class]="cat() === c ? 'bg-blue text-white' : 'bg-transparent text-ink hover:bg-tint'"
            [attr.aria-pressed]="cat() === c"
            (click)="cat.set(c)"
          >
            {{ c }}
          </button>
        }
      </div>
    </section>

    <section class="container-x section-y relative z-[1] pt-10">
      <div class="grid items-start gap-[clamp(24px,4vw,40px)] lg:grid-cols-[1fr_340px]">
        <div class="flex flex-col gap-5">
          @if (featured(); as f) {
            <a [routerLink]="['/actualites', f.slug]" class="f-card group relative flex min-h-[420px] flex-col justify-end overflow-hidden rounded-3xl text-white no-underline shadow-photo">
              <img [src]="f.img" [alt]="f.alt" class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
              <span aria-hidden="true" class="absolute inset-0" style="background: linear-gradient(180deg, rgba(10,18,48,0) 25%, rgba(10,18,48,.9) 100%)"></span>
              <span class="relative flex flex-col gap-2.5 p-[clamp(20px,3vw,36px)]">
                <span class="text-[14px] text-hero-text"><span class="tag mr-2" [style.background]="tone(f.tone).soft" [style.color]="tone(f.tone).ink">{{ f.category }}</span>{{ f.date }}</span>
                <strong class="max-w-[30ch] text-[clamp(24px,2.8vw,34px)] leading-tight font-extrabold">{{ f.title }}</strong>
                <span class="max-w-[60ch] text-hero-text">{{ f.excerpt }}</span>
              </span>
            </a>
          }
          <div class="grid grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))] gap-5">
            @for (n of rest(); track n.slug) {
              <a [routerLink]="['/actualites', n.slug]" class="f-card flex flex-col overflow-hidden rounded-[18px] bg-white text-ink no-underline">
                <img [src]="n.img" [alt]="n.alt" class="block aspect-[16/10] w-full object-cover" loading="lazy" />
                <span class="flex flex-col gap-2 px-5 pt-[18px] pb-[22px]">
                  <span class="text-[13.5px] text-subtle"><span class="tag mr-1.5" [style.background]="tone(n.tone).soft" [style.color]="tone(n.tone).ink">{{ n.category }}</span>{{ n.date }}</span>
                  <strong class="text-[18px] leading-[1.35] text-ink">{{ n.title }}</strong>
                </span>
              </a>
            }
          </div>
          @if (!filtered().length) {
            <p class="m-0 rounded-[18px] bg-white p-8 text-center text-muted">Aucune actualité dans cette catégorie pour le moment.</p>
          }
        </div>

        <aside class="flex flex-col gap-5 lg:sticky lg:top-28">
          <div class="flex flex-col gap-3 rounded-[22px] bg-white p-5 shadow-card">
            <strong class="flex items-center gap-2 text-[18px] text-ink"><app-icon name="calendar" class="text-blue" />À venir</strong>
            @for (e of events(); track e.title) {
              <a routerLink="/agenda" class="flex items-center gap-3 rounded-xl p-1.5 text-ink no-underline hover:bg-tint-soft">
                <span class="flex h-12 w-12 flex-none flex-col items-center justify-center rounded-[10px] leading-none" [style.background]="tone(e.tone).soft" [style.color]="tone(e.tone).ink">
                  <strong class="text-[18px]">{{ e.day }}</strong><span class="text-[11.5px] font-bold">{{ e.month }}</span>
                </span>
                <span class="text-[15px] leading-snug font-semibold">{{ e.title }}</span>
              </a>
            }
            <a routerLink="/agenda" class="text-[15px] font-bold no-underline">Tout l’agenda →</a>
          </div>
          <div id="presse" class="flex flex-col gap-3 rounded-[22px] bg-navy p-5 text-white">
            <strong class="text-[18px]">Revue de presse</strong>
            @for (p of press; track p.title) {
              <a href="#" (click)="$event.preventDefault()" class="flex flex-col gap-0.5 rounded-xl bg-white/6 p-3 text-white no-underline hover:bg-white/12 hover:text-white">
                <span class="text-[13px] font-bold text-sky">{{ p.outlet }} · {{ p.date }}</span>
                <span class="text-[15px] leading-snug">{{ p.title }}</span>
              </a>
            }
          </div>
          <a routerLink="/mediatheque" fragment="communiques" class="f-card flex items-center gap-3 rounded-[18px] bg-white p-4 text-ink no-underline shadow-card">
            <span class="icon-tile bg-orange-soft text-orange-ink"><app-icon name="file" /></span>
            <span><strong>Communiqués de presse</strong><br /><span class="text-[14px] text-subtle">Et archives des actualités</span></span>
          </a>
        </aside>
      </div>
    </section>
  `,
})
export default class News {
  protected readonly img = IMG;
  private readonly content = inject(ContentStore);
  protected readonly categories = ['Toutes', ...new Set(this.content.publishedNews().map((n) => n.category))];
  protected readonly events = computed(() => this.content.events().slice(0, 4));
  protected readonly press = PRESS;
  protected readonly tone = toneOf;
  protected readonly cat = signal('Toutes');
  protected readonly filtered = computed(() => (this.cat() === 'Toutes' ? this.content.publishedNews() : this.content.publishedNews().filter((n) => n.category === this.cat())));
  protected readonly featured = computed(() => this.filtered()[0]);
  protected readonly rest = computed(() => this.filtered().slice(1));
}
