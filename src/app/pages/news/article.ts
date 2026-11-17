import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Icon } from '../../shared/icon';
import { PageHero, toneOf } from '../../shared/ui';
import { ContentStore } from '../../core/content-store';
import NotFound from '../misc/not-found';

@Component({
  selector: 'app-article',
  imports: [RouterLink, Icon, PageHero, NotFound],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (a(); as a) {
      <app-page-hero [title]="a.title" [kicker]="a.category + ' · ' + a.date" [image]="a.img" [crumbs]="[{ label: 'Actualités', path: '/actualites' }, { label: a.category }]" [compact]="true" />
      <section class="container-x section-y relative z-[1] pt-[clamp(40px,5vw,64px)]">
        <div class="grid items-start gap-[clamp(24px,4vw,48px)] lg:grid-cols-[1fr_300px]">
          <article class="rounded-[22px] bg-white p-[clamp(22px,4vw,48px)] shadow-card">
            <p class="mt-0 mb-6 text-[20px] leading-snug font-semibold text-navy">{{ a.excerpt }}</p>
            <figure class="m-0 mb-6 overflow-hidden rounded-[18px]">
              <img [src]="a.img" [alt]="a.alt" class="block aspect-[16/9] w-full object-cover" />
              <figcaption class="bg-tint-soft px-4 py-2 text-[14px] text-subtle">{{ a.alt }} — © ARSTM</figcaption>
            </figure>
            <div class="prose-arstm max-w-[68ch]">
              @for (p of a.body; track $index) {
                <p>{{ p }}</p>
              }
            </div>
            <div class="mt-8 flex flex-wrap items-center gap-2 border-t border-line-soft pt-5">
              <span class="mr-1 text-[14.5px] font-semibold text-muted">Partager :</span>
              @for (n of share; track n.icon) {
                <button type="button" class="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-[10px] border border-line bg-white text-navy hover:bg-tint" [attr.aria-label]="'Partager sur ' + n.label" (click)="copy()">
                  <app-icon [name]="n.icon" [size]="18" />
                </button>
              }
              @if (copied()) {
                <span role="status" class="f-pop text-[14px] font-semibold text-green-ink">Lien copié</span>
              }
            </div>
          </article>
          <aside class="flex flex-col gap-3 lg:sticky lg:top-28">
            <strong class="text-[18px] text-ink">À lire aussi</strong>
            @for (n of others(); track n.slug) {
              <a [routerLink]="['/actualites', n.slug]" class="f-card flex gap-3 rounded-[16px] bg-white p-3 text-ink no-underline shadow-card">
                <img [src]="n.img" alt="" class="h-[72px] w-[92px] flex-none rounded-[10px] object-cover" loading="lazy" />
                <span class="flex flex-col gap-1">
                  <span class="text-[12.5px] font-bold" [style.color]="tone(n.tone).ink">{{ n.category }}</span>
                  <span class="text-[15px] leading-snug font-semibold">{{ n.title }}</span>
                </span>
              </a>
            }
            <a routerLink="/actualites" class="f-btn btn-ghost mt-2"><app-icon name="arrow-left" [size]="16" />Toutes les actualités</a>
          </aside>
        </div>
      </section>
    } @else {
      <app-not-found />
    }
  `,
})
export default class ArticlePage {
  private readonly titleSvc = inject(Title);
  constructor() {
    effect(() => {
      const t = this.a()?.title;
      if (t) this.titleSvc.setTitle(t + ' — ARSTM');
    });
  }
  readonly slug = input.required<string>();
  private readonly content = inject(ContentStore);
  protected readonly a = computed(() => this.content.publishedNews().find((n) => n.slug === this.slug()));
  protected readonly others = computed(() => this.content.publishedNews().filter((n) => n.slug !== this.slug()).slice(0, 3));
  protected readonly tone = toneOf;
  protected readonly copied = signal(false);
  protected readonly share = [
    { icon: 'facebook', label: 'Facebook' },
    { icon: 'linkedin', label: 'LinkedIn' },
    { icon: 'share', label: 'copier le lien' },
  ];
  protected async copy() {
    try {
      await navigator.clipboard.writeText(location.href);
    } catch {
      /* ignore */
    }
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }
}
