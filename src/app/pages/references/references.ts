import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../shared/icon';
import { PageHero, SectionHead, Subnav, toneOf } from '../../shared/ui';
import { CERTIFICATIONS, IMG, PARTNERS, Tone } from '../../data/site';
import { INSTITUTION_LINKS } from '../institution/nav';

/** Nos références (EF-INS-05). */
@Component({
  selector: 'app-references',
  imports: [RouterLink, Icon, PageHero, SectionHead, Subnav],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero title="Nos" accent="références" kicker="Partenaires · Distinctions · Certifications" lead="Institutions, ports, entreprises et organisations internationales : ils font confiance à l’ARSTM." [image]="img.douala" [crumbs]="[{ label: 'L’institution', path: '/institution' }, { label: 'Nos références' }]" [compact]="true" />
    <app-subnav [links]="links" label="Rubrique L’institution" />

    <section class="container-x section-y relative z-[1] flex flex-col gap-7 pt-[clamp(48px,6vw,80px)]">
      <app-section-head pill="Institutions, partenaires et clients" lead="Un ancrage régional et des partenariats internationaux.">
        <h2 class="h-display">Ils travaillent <span class="text-blue">avec nous</span></h2>
      </app-section-head>
      <ul class="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(240px,100%),1fr))] gap-3 p-0">
        @for (p of partners; track p.name) {
          <li>
            <a href="#" (click)="$event.preventDefault()" class="f-card flex h-full flex-col gap-1 rounded-[18px] border border-line-soft bg-white p-5 text-ink no-underline">
              <span class="mb-2 inline-flex h-14 items-center text-[26px] font-black tracking-[.02em] text-navy">{{ p.name }}</span>
              <span class="text-[14.5px] text-muted">{{ p.desc }}</span>
              <span class="mt-auto inline-flex items-center gap-1 pt-2 text-[14px] font-bold text-blue">Site officiel <app-icon name="external" [size]="14" /></span>
            </a>
          </li>
        }
      </ul>
    </section>

    <section class="container-x section-y relative z-[1]">
      <div class="grid gap-4 md:grid-cols-2">
        <div class="flex flex-col gap-3 rounded-[22px] bg-navy p-[clamp(22px,3vw,36px)] text-white">
          <span class="icon-tile bg-white/12 text-orange"><app-icon name="globe" [size]="22" /></span>
          <h2 class="m-0 text-[26px] font-black">RIDAMER</h2>
          <p class="m-0 text-hero-text">Réseau des instituts et des acteurs de la formation maritime auquel l’ARSTM contribue pour harmoniser les cursus et partager les bonnes pratiques.</p>
        </div>
        <div class="flex flex-col gap-3 rounded-[22px] bg-blue p-[clamp(22px,3vw,36px)] text-white">
          <span class="icon-tile bg-white/15"><app-icon name="anchor" [size]="22" /></span>
          <h2 class="m-0 text-[26px] font-black">Club Marine Marchande</h2>
          <p class="m-0 text-hero-text">Le club réunit élèves, anciens et professionnels autour de conférences, visites de navires et rencontres métiers.</p>
        </div>
      </div>
    </section>

    <section class="container-x section-y relative z-[1] flex flex-col gap-7">
      <app-section-head pill="Prix et distinctions">
        <h2 class="h-display">Une excellence <span class="text-blue">reconnue</span></h2>
      </app-section-head>
      <ul class="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-4 p-0">
        @for (a of awards; track a.title) {
          <li class="flex items-start gap-4 rounded-[18px] bg-white p-5 shadow-card">
            <span class="icon-tile bg-orange-soft text-orange-ink"><app-icon name="trophy" [size]="22" /></span>
            <span><strong class="text-ink">{{ a.title }}</strong><br /><span class="text-[14.5px] text-muted">{{ a.text }}</span></span>
          </li>
        }
      </ul>
    </section>

    <section class="container-x section-y relative z-[1] flex flex-col gap-7">
      <app-section-head pill="Certifications" lead="ISO, STCW et homologation ministérielle.">
        <h2 class="h-display">Nos <span class="text-blue">certifications</span></h2>
      </app-section-head>
      <div class="grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-4">
        @for (c of certs; track c.title) {
          <div class="flex flex-col gap-3 rounded-[18px] border-t-4 bg-white p-6 shadow-card" [style.border-top-color]="tone(c.tone).line">
            <span class="icon-tile" [style.background]="tone(c.tone).soft" [style.color]="tone(c.tone).ink"><app-icon [name]="c.icon" [size]="22" /></span>
            <strong class="text-[19px] text-ink">{{ c.title }}</strong>
            <p class="m-0 text-[15.5px] text-muted">{{ c.text }}</p>
          </div>
        }
      </div>
      <a routerLink="/institution/politique-qualite" class="f-btn btn-pill self-center">Notre politique qualité →</a>
    </section>
  `,
})
export default class References {
  protected readonly img = IMG;
  protected readonly links = INSTITUTION_LINKS;
  protected readonly partners = PARTNERS;
  protected readonly certs = CERTIFICATIONS;
  protected readonly tone = (t: Tone) => toneOf(t);
  protected readonly awards = [
    { title: '[Distinction à préciser]', text: 'Liste des prix et distinctions fournie par l’ARSTM.' },
    { title: 'Centre d’excellence régional', text: 'Reconnaissance de la qualité des formations maritimes.' },
    { title: 'Partenaire de l’architecture de Yaoundé', text: 'Contribution de l’ISMI à la sûreté du golfe de Guinée.' },
  ];
}
