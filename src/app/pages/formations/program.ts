import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Icon } from '../../shared/icon';
import { PageHero, toneOf } from '../../shared/ui';
import { PROGRAMS, programsOf, schoolBySlug } from '../../data/site';
import NotFound from '../misc/not-found';

/** Fiche détaillée d’une formation (EF-FOR-01). */
@Component({
  selector: 'app-program',
  imports: [RouterLink, Icon, PageHero, NotFound],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (p(); as p) {
      <app-page-hero
        [title]="p.title"
        [kicker]="s()!.code + ' · ' + p.type"
        [lead]="p.summary"
        [image]="s()!.img"
        [crumbs]="[{ label: 'Formations', path: '/formations' }, { label: s()!.code, path: '/formations/' + s()!.slug }, { label: p.level }]"
        [compact]="true"
      />

      <section class="container-x section-y relative z-[1] pt-[clamp(40px,5vw,64px)]">
        <div class="grid items-start gap-[clamp(24px,4vw,48px)] lg:grid-cols-[1fr_360px]">
          <div class="flex flex-col gap-6">
            <article class="rounded-[22px] bg-white p-[clamp(22px,3vw,36px)] shadow-card">
              <h2 class="h-section !text-[28px]">Objectifs</h2>
              <ul class="mt-4 mb-0 grid list-none gap-3 p-0 sm:grid-cols-2">
                @for (o of p.objectives; track o) {
                  <li class="flex items-start gap-3 rounded-xl bg-tint-soft p-3.5 text-[15.5px] text-ink">
                    <app-icon name="tick" [size]="18" class="mt-0.5 text-blue" />{{ o }}
                  </li>
                }
              </ul>
            </article>

            <article class="rounded-[22px] bg-white p-[clamp(22px,3vw,36px)] shadow-card">
              <h2 class="h-section !text-[28px]">Programme</h2>
              <div class="mt-4 flex flex-col gap-2.5">
                @for (m of p.modules; track m.title; let i = $index) {
                  <div class="rounded-[14px] border border-line-soft">
                    <button
                      type="button"
                      class="flex w-full cursor-pointer items-center gap-3.5 border-none bg-transparent p-4 text-left font-[inherit] text-ink"
                      [attr.aria-expanded]="openModule() === i"
                      (click)="openModule.set(openModule() === i ? -1 : i)"
                    >
                      <span class="inline-flex h-9 w-9 flex-none items-center justify-center rounded-[10px] font-black" [style.background]="tone().soft" [style.color]="tone().ink">{{ i + 1 }}</span>
                      <strong class="flex-1 text-[17px]">{{ m.title }}</strong>
                      <app-icon name="chevron-down" class="text-subtle transition-transform" [style.transform]="openModule() === i ? 'rotate(180deg)' : null" />
                    </button>
                    @if (openModule() === i) {
                      <ul class="f-pop m-0 flex list-none flex-wrap gap-2 px-4 pb-4 pl-[66px]">
                        @for (it of m.items; track it) {
                          <li class="rounded-full border border-line bg-field px-3 py-1 text-[14.5px] text-text">{{ it }}</li>
                        }
                      </ul>
                    }
                  </div>
                }
              </div>
            </article>

            <div class="grid gap-6 md:grid-cols-2">
              <article class="rounded-[22px] bg-white p-6 shadow-card">
                <h2 class="m-0 flex items-center gap-2.5 text-[20px] font-extrabold text-ink"><app-icon name="check" class="text-orange" />Conditions d’admission</h2>
                <ul class="mt-4 mb-0 flex list-none flex-col gap-2 p-0">
                  @for (a of p.admission; track a) {
                    <li class="flex items-start gap-2.5 text-[15.5px] text-text"><span aria-hidden="true" class="mt-2.5 h-1.5 w-1.5 flex-none rounded-full bg-orange"></span>{{ a }}</li>
                  }
                </ul>
              </article>
              <article class="rounded-[22px] bg-white p-6 shadow-card">
                <h2 class="m-0 flex items-center gap-2.5 text-[20px] font-extrabold text-ink"><app-icon name="briefcase" class="text-green" />Débouchés</h2>
                <ul class="mt-4 mb-0 flex list-none flex-col gap-2 p-0">
                  @for (o of p.outcomes; track o) {
                    <li class="flex items-start gap-2.5 text-[15.5px] text-text"><span aria-hidden="true" class="mt-2.5 h-1.5 w-1.5 flex-none rounded-full bg-green"></span>{{ o }}</li>
                  }
                </ul>
              </article>
            </div>
          </div>

          <!-- Récapitulatif -->
          <aside class="flex flex-col gap-4 lg:sticky lg:top-28">
            <div class="flex flex-col gap-4 rounded-[22px] border-t-4 bg-white p-6 shadow-soft" [style.border-top-color]="tone().line">
              <strong class="text-[18px] text-ink">En bref</strong>
              <dl class="m-0 flex flex-col gap-3 text-[15px]">
                @for (row of facts(); track row.k) {
                  <div class="flex items-start justify-between gap-3 border-b border-line-soft pb-3 last:border-none last:pb-0">
                    <dt class="flex items-center gap-2 text-subtle"><app-icon [name]="row.icon" [size]="16" />{{ row.k }}</dt>
                    <dd class="m-0 text-right font-semibold text-ink">{{ row.v }}</dd>
                  </div>
                }
              </dl>
              <p class="m-0 rounded-xl bg-orange-soft p-3 text-[14px] text-orange-ink"><strong>Tarifs :</strong> {{ p.fees }}</p>
              @if (p.type === 'Formation initiale') {
                <a routerLink="/admissions/candidater" [queryParams]="{ formation: p.slug }" class="f-btn btn-accent w-full">Candidater à cette formation</a>
              } @else {
                <a routerLink="/formation-continue" fragment="sessions" class="f-btn btn-accent w-full">S’inscrire et payer en ligne</a>
              }
              <a href="#" (click)="$event.preventDefault()" class="f-btn btn-ghost w-full !rounded-xl"><app-icon name="download" [size]="18" />Brochure PDF · 1,4 Mo</a>
            </div>
            <div class="flex items-center justify-between gap-3 rounded-[18px] bg-white/80 px-5 py-4">
              <span class="text-[14.5px] font-semibold text-muted">Partager</span>
              <span class="flex gap-2">
                @for (n of share; track n.icon) {
                  <button type="button" class="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-[10px] border border-line bg-white text-navy hover:bg-tint" [attr.aria-label]="'Partager sur ' + n.label" (click)="doShare()">
                    <app-icon [name]="n.icon" [size]="18" />
                  </button>
                }
              </span>
            </div>
            @if (copied()) {
              <p role="status" class="f-pop m-0 text-center text-[14px] font-semibold text-green-ink">Lien copié dans le presse-papiers</p>
            }
          </aside>
        </div>
      </section>

      @if (related().length) {
        <section class="container-x section-y relative z-[1] flex flex-col gap-5">
          <h2 class="h-section">Dans la même école</h2>
          <div class="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-4">
            @for (r of related(); track r.slug) {
              <a [routerLink]="['/formations', r.school, r.slug]" class="f-card flex flex-col gap-2 rounded-[18px] bg-white p-5 text-ink no-underline shadow-card">
                <span class="badge self-start">{{ r.level }}</span>
                <strong class="leading-snug">{{ r.title }}</strong>
                <span class="mt-auto text-[15px] font-bold text-blue">Voir la fiche →</span>
              </a>
            }
          </div>
        </section>
      }
    } @else {
      <app-not-found />
    }
  `,
})
export default class ProgramPage {
  private readonly titleSvc = inject(Title);
  constructor() {
    effect(() => {
      const t = this.p()?.title;
      if (t) this.titleSvc.setTitle(t + ' — ARSTM');
    });
  }
  readonly school = input.required<string>();
  readonly program = input.required<string>();
  protected readonly s = computed(() => schoolBySlug(this.school()));
  protected readonly p = computed(() => PROGRAMS.find((x) => x.slug === this.program() && x.school === this.school()));
  protected readonly tone = computed(() => toneOf(this.s()?.tone ?? 'blue'));
  protected readonly related = computed(() => programsOf(this.school()).filter((x) => x.slug !== this.program()).slice(0, 3));
  protected readonly openModule = signal(0);
  protected readonly copied = signal(false);
  protected readonly share = [
    { icon: 'facebook', label: 'Facebook' },
    { icon: 'linkedin', label: 'LinkedIn' },
    { icon: 'share', label: 'copier le lien' },
  ];
  protected readonly facts = computed(() => {
    const p = this.p();
    if (!p) return [];
    return [
      { k: 'École', v: this.s()!.code, icon: 'building' },
      { k: 'Type', v: p.type, icon: 'cap' },
      { k: 'Niveau', v: p.level, icon: 'badge' },
      { k: 'Durée', v: p.duration, icon: 'clock' },
      { k: 'Rythme', v: p.rhythm, icon: 'calendar' },
      { k: 'Domaine', v: p.domain, icon: 'compass' },
    ];
  });

  protected async doShare() {
    try {
      await navigator.clipboard.writeText(location.href);
    } catch {
      /* ignore */
    }
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2200);
  }
}
