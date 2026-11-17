import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../shared/icon';
import { PageHero, SectionHead, Subnav, toneOf } from '../../shared/ui';
import { CERTIFICATIONS, IMG, Tone } from '../../data/site';
import { INSTITUTION_LINKS } from './nav';

@Component({
  selector: 'app-qualite',
  imports: [Icon, PageHero, SectionHead, Subnav],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero
      title="Politique"
      accent="qualité"
      kicker="ISO 9001:2015"
      lead="Un système de management de la qualité certifié, au service des élèves, des stagiaires, des entreprises et des États membres."
      [image]="img.reunion"
      [crumbs]="[{ label: 'L’institution', path: '/institution' }, { label: 'Politique qualité' }]"
      [compact]="true"
    />
    <app-subnav [links]="links" label="Rubrique L’institution" />

    <section class="container-x section-y relative z-[1] flex flex-col gap-7 pt-[clamp(48px,6vw,80px)]">
      <app-section-head pill="Nos engagements" lead="Quatre engagements pris par la Direction Générale et revus chaque année en revue de direction.">
        <h2 class="h-display">La qualité, une <span class="text-blue">discipline</span></h2>
      </app-section-head>
      <ol class="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-4 p-0">
        @for (c of commitments; track c.title; let i = $index) {
          <li class="flex flex-col gap-3 rounded-[18px] border-t-4 bg-white p-6 shadow-card" [style.border-top-color]="tone(c.tone).line">
            <span class="text-[40px] leading-none font-black" [style.color]="tone(c.tone).ink">{{ i + 1 }}</span>
            <strong class="text-[18px] text-ink">{{ c.title }}</strong>
            <p class="m-0 text-[15.5px] text-muted">{{ c.text }}</p>
          </li>
        }
      </ol>
    </section>

    <section class="container-x section-y relative z-[1]">
      <div class="grid gap-5 rounded-3xl bg-navy p-[clamp(24px,4vw,48px)] text-white md:grid-cols-[1fr_1.3fr]">
        <div class="flex flex-col gap-3">
          <h2 class="m-0 text-[clamp(28px,3vw,38px)] leading-tight font-black">Certifications et reconnaissances</h2>
          <p class="m-0 text-hero-text">Des référentiels exigeants, audités par des organismes indépendants et par l’OMI.</p>
        </div>
        <ul class="m-0 flex list-none flex-col gap-3 p-0">
          @for (c of certs; track c.title) {
            <li class="flex items-start gap-3.5 rounded-2xl bg-white/8 p-4">
              <span class="icon-tile bg-white/12 text-orange"><app-icon [name]="c.icon" [size]="22" /></span>
              <span><strong class="text-[17px]">{{ c.title }}</strong><br /><span class="text-[15px] text-hero-text">{{ c.text }}</span></span>
            </li>
          }
        </ul>
      </div>
    </section>
  `,
})
export default class Qualite {
  protected readonly img = IMG;
  protected readonly links = INSTITUTION_LINKS;
  protected readonly certs = CERTIFICATIONS;
  protected readonly tone = (t: Tone) => toneOf(t);
  protected readonly commitments: { title: string; text: string; tone: Tone }[] = [
    { title: 'Satisfaire nos apprenants', text: 'Mesurer chaque année la satisfaction des élèves et stagiaires, et agir sur les écarts.', tone: 'blue' },
    { title: 'Garantir la conformité', text: 'Respecter les exigences STCW, ministérielles et contractuelles pour chaque formation.', tone: 'orange' },
    { title: 'Développer les compétences', text: 'Former nos formateurs et moderniser nos équipements pédagogiques.', tone: 'green' },
    { title: 'Améliorer en continu', text: 'Audits internes, revues de direction et plans d’action suivis.', tone: 'violet' },
  ];
}
