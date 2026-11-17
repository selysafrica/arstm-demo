import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AdminStore } from '../../admin/admin-store';
import { RouterLink } from '@angular/router';
import { Icon } from '../../shared/icon';
import { PageHero, SectionHead, Subnav, toneOf } from '../../shared/ui';
import { IMG, KEY_FIGURES, MEMBER_STATES, SCHOOLS, STUDENTS_BY_COUNTRY } from '../../data/site';
import { INSTITUTION_LINKS } from './nav';

@Component({
  selector: 'app-presentation',
  imports: [RouterLink, Icon, PageHero, SectionHead, Subnav],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero
      title="Une institution de référence au cœur des"
      accent="enjeux maritimes"
      lead="L’ARSTM est l’institution régionale chargée de la formation maritime, portuaire et industrielle, ainsi que des questions de sûreté et de sécurité en mer, pour quinze pays francophones d’Afrique de l’Ouest et du Centre."
      kicker="L’institution"
      [image]="img.campus"
      [crumbs]="[{ label: 'L’institution' }]"
    />
    <app-subnav [links]="links" label="Rubrique L’institution" />

    <!-- Chiffres clés -->
    <section class="container-x relative z-[1] pt-[clamp(48px,6vw,80px)] section-y">
      <dl class="m-0 grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-4">
        @for (k of figures; track k.label) {
          <div class="flex flex-col-reverse gap-1 rounded-[18px] bg-white p-6 shadow-card">
            <dt class="text-[15px] text-muted">{{ k.label }}</dt>
            <dd class="m-0 text-[clamp(34px,3.6vw,46px)] leading-none font-black text-blue">{{ k.value }}</dd>
          </div>
        }
      </dl>
    </section>

    <!-- Missions -->
    <section class="container-x section-y relative z-[1]">
      <div class="flex flex-wrap items-start gap-[clamp(28px,5vw,72px)]">
        <div class="prose-arstm flex-[1_1_480px]">
          <h2 class="h-section !mt-0">Former pour <span class="text-blue">conquérir</span></h2>
          <p>
            Créée en 1987 à Abidjan, l’Académie Régionale des Sciences et Techniques de la Mer compte aujourd’hui plus de
            <strong>100 employés</strong> répartis entre ses écoles, ses directions et ses centres de recherche. Elle a formé plus de
            <strong>10 000 cadres africains</strong>, aujourd’hui experts reconnus au service de leurs pays, au sein de sociétés nationales et
            multinationales.
          </p>
          <p>
            Huit de ses quinze pays membres siègent au Conseil d’Administration via l’OMAOC. Ensemble, ils font de l’ARSTM un outil commun
            pour former les femmes et les hommes qui font vivre les navires, les ports et les corridors logistiques de la région.
          </p>
          <h3>Nos missions</h3>
          <ul>
            <li>Former les personnels navigants et sédentaires de la marine marchande</li>
            <li>Renforcer la sûreté et la sécurité maritimes dans le golfe de Guinée</li>
            <li>Accompagner les professionnels tout au long de leur carrière</li>
            <li>Produire des études utiles aux États, aux ports et aux entreprises</li>
          </ul>
        </div>
        <aside class="flex flex-[1_1_360px] flex-col gap-4 rounded-[22px] bg-navy p-[clamp(22px,3vw,32px)] text-white">
          <strong class="text-[20px] font-extrabold">États membres du Conseil d’Administration</strong>
          <ul class="m-0 grid list-none grid-cols-2 gap-2 p-0">
            @for (s of states; track s) {
              <li class="flex items-center gap-2 rounded-[10px] bg-white/8 px-3 py-2 text-[15px]">
                <span aria-hidden="true" class="h-1.5 w-1.5 rounded-full bg-orange"></span>{{ s }}
              </li>
            }
          </ul>
          <p class="m-0 text-[15px] text-hero-text">
            Gouvernance : Conseil d’Administration, Commissariat aux Comptes, Direction Générale, Plan Stratégique et certification ISO 9001
            version 2015.
          </p>
          <a routerLink="/institution/organigramme" class="f-btn self-start rounded-[10px] bg-white px-4 py-2.5 text-[15px] text-navy hover:text-navy"
            >Voir l’organigramme →</a
          >
        </aside>
      </div>
    </section>

    <!-- Composantes -->
    <section class="container-x section-y relative z-[1] flex flex-col gap-7">
      <app-section-head pill="Nos composantes" lead="Trois écoles, un institut, un centre de recherche, une plateforme à distance et un programme de formation continue.">
        <h2 class="h-display">Une académie, <span class="text-blue">sept entités</span></h2>
      </app-section-head>
      <div class="grid grid-cols-[repeat(auto-fit,minmax(min(340px,100%),1fr))] gap-4">
        @for (s of schools; track s.slug) {
          <a
            [routerLink]="['/formations', s.slug]"
            class="f-card group flex items-start gap-4 rounded-[18px] border border-line-soft bg-white p-5 text-ink no-underline"
          >
            <span class="icon-tile !h-14 !w-14 !rounded-[14px] text-[15px] font-black" [style.background]="tone(s).soft" [style.color]="tone(s).ink">{{
              s.code.slice(0, 4)
            }}</span>
            <span class="flex flex-col gap-1">
              <strong class="leading-snug">{{ s.name }}</strong>
              <span class="text-[15px] text-muted">{{ s.text }}</span>
            </span>
            <app-icon name="arrow-up-right" [size]="18" class="ml-auto text-blue opacity-40 transition-opacity group-hover:opacity-100" />
          </a>
        }
        <a routerLink="/formation-continue" class="f-card group flex items-start gap-4 rounded-[18px] border border-line-soft bg-white p-5 text-ink no-underline">
          <span class="icon-tile !h-14 !w-14 !rounded-[14px] bg-orange-soft text-orange-ink"><app-icon name="anchor" [size]="24" /></span>
          <span class="flex flex-col gap-1">
            <strong class="leading-snug">Programme de Formation Continue et Professionnelle</strong>
            <span class="text-[15px] text-muted">Montée en compétences des professionnels du secteur.</span>
          </span>
          <app-icon name="arrow-up-right" [size]="18" class="ml-auto text-blue opacity-40 transition-opacity group-hover:opacity-100" />
        </a>
      </div>
    </section>

    <!-- Données (EF-DAT-01) -->
    <section class="container-x section-y relative z-[1] flex flex-col gap-7">
      <app-section-head pill="L’ARSTM en données" lead="Données mises à jour depuis le back-office (valeurs indicatives pour la démo).">
        <h2 class="h-display">Effectifs et <span class="text-blue">rayonnement</span></h2>
      </app-section-head>
      <div class="grid grid-cols-[repeat(auto-fit,minmax(min(420px,100%),1fr))] gap-5">
        <figure class="m-0 flex flex-col gap-4 rounded-[22px] bg-white p-6 shadow-card">
          <figcaption>
            <strong class="text-[18px] text-ink">Évolution des effectifs</strong><br />
            <span class="text-[14.5px] text-subtle">Élèves et stagiaires inscrits, formation initiale</span>
          </figcaption>
          <div class="flex h-[220px] items-end gap-3 border-b border-line pb-0" role="img" [attr.aria-label]="enrolLabel()">
            @for (e of enrolment(); track e.year; let last = $last) {
              <div class="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                <span class="text-[13px] font-bold" [class.text-blue]="last" [class.text-muted]="!last">{{ e.value }}</span>
                <span
                  class="w-full max-w-[52px] rounded-t-lg transition-[height] duration-700"
                  [style.height.%]="(e.value / maxEnrol()) * 80"
                  [class.bg-blue]="last"
                  [class.bg-sky]="!last"
                ></span>
              </div>
            }
          </div>
          <div class="-mt-2 flex gap-3">
            @for (e of enrolment(); track e.year) {
              <span class="flex-1 text-center text-[13px] text-subtle">{{ e.year }}</span>
            }
          </div>
        </figure>
        <figure class="m-0 flex flex-col gap-4 rounded-[22px] bg-white p-6 shadow-card">
          <figcaption>
            <strong class="text-[18px] text-ink">Répartition géographique des élèves</strong><br />
            <span class="text-[14.5px] text-subtle">Part des effectifs par pays d’origine</span>
          </figcaption>
          <ul class="m-0 flex list-none flex-col gap-2.5 p-0">
            @for (c of countries; track c.country; let first = $first) {
              <li class="grid grid-cols-[130px_1fr_44px] items-center gap-3 text-[15px]">
                <span class="text-text">{{ c.country }}</span>
                <span class="h-3 overflow-hidden rounded-full bg-tint-soft">
                  <span class="block h-full rounded-full" [class.bg-blue]="first" [class.bg-sky]="!first" [style.width.%]="(c.share / 34) * 100"></span>
                </span>
                <strong class="text-right text-navy">{{ c.share }} %</strong>
              </li>
            }
          </ul>
        </figure>
      </div>
    </section>
  `,
})
export default class Presentation {
  protected readonly img = IMG;
  protected readonly links = INSTITUTION_LINKS;
  protected readonly figures = KEY_FIGURES;
  protected readonly states = MEMBER_STATES;
  protected readonly schools = SCHOOLS;
  private readonly data = inject(AdminStore);
  protected readonly enrolment = computed(() => this.data.vizData().enrolment);
  protected readonly countries = STUDENTS_BY_COUNTRY;
  protected readonly maxEnrol = computed(() => Math.max(...this.enrolment().map((e) => e.value)));
  protected readonly enrolLabel = computed(() => 'Effectifs : ' + this.enrolment().map((e) => `${e.year} ${e.value}`).join(', '));
  protected tone(s: { tone: Parameters<typeof toneOf>[0] }) {
    return toneOf(s.tone);
  }
}
