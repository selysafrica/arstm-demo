import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Icon } from '../../shared/icon';
import { PageHero, SectionHead, toneOf } from '../../shared/ui';
import { NEWS, SCHOOLS, TESTIMONIALS, schoolBySlug } from '../../data/site';
import NotFound from '../misc/not-found';
import { ProgramCard } from '../../shared/program-card';
import { AdminStore } from '../../admin/admin-store';

/** Page école / entité : parcours et débouchés (EF-FOR-02, EF-FOR-05). */
@Component({
  selector: 'app-school',
  imports: [RouterLink, Icon, PageHero, SectionHead, NotFound, ProgramCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (data(); as s) {
      <app-page-hero
        [title]="s.name"
        [kicker]="s.kind + ' · ' + s.code"
        [lead]="s.text"
        [image]="s.img"
        [crumbs]="[{ label: 'Formations', path: '/formations' }, { label: s.code }]"
      >
        <div class="mt-2 flex flex-wrap gap-3">
          @if (s.slug === 'foad') {
            <a href="#" (click)="$event.preventDefault()" class="f-btn btn-accent">Accéder à la plateforme FOAD <app-icon name="external" [size]="16" /></a>
          } @else if (s.slug === 'crempol') {
            <a routerLink="/mediatheque" fragment="publications" class="f-btn btn-accent">Lire les publications</a>
          } @else {
            <a routerLink="/admissions/candidater" class="f-btn btn-accent">Candidater</a>
          }
          <a href="#" (click)="$event.preventDefault()" class="f-chip inline-flex items-center gap-2 !py-3"><app-icon name="download" [size]="16" />Brochure {{ s.code }} (PDF)</a>
        </div>
      </app-page-hero>

      <!-- Points forts -->
      <section class="container-x relative z-[2] -mt-9">
        <dl class="panel m-0 grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-2 p-3">
          @for (h of s.highlights; track h.label) {
            <div class="flex flex-col-reverse rounded-2xl bg-white px-5 py-4">
              <dt class="text-[14.5px] text-muted">{{ h.label }}</dt>
              <dd class="m-0 text-[22px] font-black" [style.color]="tone().ink">{{ h.value }}</dd>
            </div>
          }
        </dl>
      </section>

      <section class="container-x section-y relative z-[1] pt-[clamp(48px,6vw,80px)]">
        <div class="flex flex-wrap items-start gap-[clamp(28px,5vw,64px)]">
          <div class="prose-arstm flex-[2_1_520px]">
            <h2 class="h-section !mt-0">Présentation</h2>
            <p class="text-[18px]">{{ s.intro }}</p>
          </div>
          <aside class="flex flex-[1_1_320px] flex-col gap-3 rounded-[22px] p-6" [style.background]="tone().soft">
            <strong class="flex items-center gap-2 text-[18px]" [style.color]="tone().ink"><app-icon name="briefcase" />Débouchés</strong>
            <ul class="m-0 flex list-none flex-col gap-2 p-0">
              @for (o of s.outcomes; track o) {
                <li class="flex items-start gap-2.5 text-[15.5px] text-ink"><app-icon name="tick" [size]="18" class="mt-0.5" [style.color]="tone().line" />{{ o }}</li>
              }
            </ul>
          </aside>
        </div>
      </section>

      @if (programs().length) {
        <section class="container-x section-y relative z-[1] flex flex-col gap-6">
          <div class="flex flex-wrap items-end justify-between gap-4">
            <h2 class="h-section">{{ s.slug === 'ismi' || s.slug === 'foad' ? 'Modules et sessions' : 'Parcours proposés' }}</h2>
            <a routerLink="/formations" class="f-btn btn-ghost">Tout le catalogue →</a>
          </div>
          <ul class="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(360px,100%),1fr))] gap-4 p-0">
            @for (p of programs(); track p.slug) {
              <li><app-program-card [program]="p" /></li>
            }
          </ul>
        </section>
      }

      <section class="container-x section-y relative z-[1] flex flex-col gap-7">
        <app-section-head pill="Témoignages" lead="Ils racontent leur parcours à l’ARSTM.">
          <h2 class="h-display">La parole aux <span class="text-blue">anciens</span></h2>
        </app-section-head>
        <div class="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-4">
          @for (t of testimonials; track t.name) {
            <figure class="m-0 flex flex-col gap-4 rounded-[22px] bg-white p-6 shadow-card">
              <app-icon name="quote" [size]="28" class="text-orange" />
              <blockquote class="m-0 text-[17px] text-text">{{ t.quote }}</blockquote>
              <figcaption class="mt-auto"><strong class="text-ink">{{ t.name }}</strong><br /><span class="text-[14.5px] text-subtle">{{ t.role }}</span></figcaption>
            </figure>
          }
        </div>
      </section>

      <section class="container-x section-y relative z-[1]">
        <div class="flex flex-wrap items-center justify-between gap-5 rounded-3xl bg-navy p-[clamp(24px,4vw,44px)] text-white">
          <div class="flex flex-col gap-1.5">
            <strong class="text-[clamp(24px,2.6vw,32px)] leading-tight font-black">Une question sur l’{{ s.code }} ?</strong>
            <span class="text-hero-text">Notre équipe vous répond sous 48 h ouvrées.</span>
          </div>
          <div class="flex flex-wrap gap-3">
            <a routerLink="/contact" class="f-btn rounded-xl bg-white px-[22px] py-3.5 text-navy hover:text-navy">Nous contacter</a>
            <a [routerLink]="['/actualites', news.slug]" class="f-chip inline-flex items-center !py-3.5">Dernière actualité</a>
          </div>
        </div>
      </section>
    } @else {
      <app-not-found />
    }
  `,
})
export default class SchoolPage {
  private readonly titleSvc = inject(Title);
  constructor() {
    effect(() => {
      const t = this.data()?.name;
      if (t) this.titleSvc.setTitle(t + ' — ARSTM');
    });
  }
  readonly school = input.required<string>();
  protected readonly data = computed(() => schoolBySlug(this.school()));
  private readonly admin = inject(AdminStore);
  protected readonly programs = computed(() => this.admin.programs().filter((p) => p.published && p.school === this.school()));
  protected readonly tone = computed(() => toneOf(this.data()?.tone ?? 'blue'));
  protected readonly testimonials = TESTIMONIALS;
  protected readonly news = NEWS[0];
  protected readonly all = SCHOOLS;
}
