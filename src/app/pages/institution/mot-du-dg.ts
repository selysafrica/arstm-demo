import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../shared/icon';
import { PageHero, Subnav } from '../../shared/ui';
import { IMG } from '../../data/site';
import { INSTITUTION_LINKS } from './nav';

@Component({
  selector: 'app-mot-du-dg',
  imports: [RouterLink, Icon, PageHero, Subnav],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero title="Mot du" accent="Directeur Général" kicker="L’institution" [image]="img.salut" [crumbs]="[{ label: 'L’institution', path: '/institution' }, { label: 'Mot du DG' }]" [compact]="true" />
    <app-subnav [links]="links" label="Rubrique L’institution" />

    <section class="container-x section-y relative z-[1] pt-[clamp(48px,6vw,80px)]">
      <div class="flex flex-wrap items-start gap-[clamp(28px,5vw,64px)]">
        <figure class="relative m-0 flex-[1_1_320px] overflow-hidden rounded-[22px] shadow-photo md:sticky md:top-28">
          <img [src]="img.dg" alt="Le Directeur Général de l’ARSTM à son bureau" width="900" height="1125" class="block aspect-[4/5] w-full object-cover object-top" />
          <figcaption class="absolute inset-x-0 bottom-0 flex flex-col bg-gradient-to-t from-[rgba(10,18,48,.9)] to-transparent p-5 pt-16 text-white">
            <strong class="text-[18px]">Le Directeur Général</strong>
            <span class="text-[14.5px] text-hero-text">Académie Régionale des Sciences et Techniques de la Mer</span>
          </figcaption>
        </figure>
        <article class="prose-arstm flex-[2_1_520px] rounded-[22px] bg-white p-[clamp(24px,4vw,48px)] shadow-card">
          <app-icon name="quote" [size]="40" class="mb-2 text-orange" />
          <p class="!text-[clamp(21px,2.2vw,26px)] !leading-snug font-bold !text-navy">
            « Former pour conquérir : notre devise résume une ambition partagée par quinze pays, celle de confier la mer africaine à des
            femmes et des hommes compétents, disciplinés et fiers de leur métier. »
          </p>
          <p>Chers visiteurs,</p>
          <p>
            Depuis 1987, l’Académie Régionale des Sciences et Techniques de la Mer forme les officiers, les techniciens et les cadres qui font
            vivre les navires, les ports et les corridors de notre sous-région. Plus de <strong>10 000 diplômés</strong> exercent aujourd’hui
            dans les administrations maritimes, les ports, les armements et les entreprises logistiques.
          </p>
          <p>
            Le transport maritime change vite : navires plus automatisés, exigences environnementales, nouvelles menaces dans le golfe de
            Guinée. Notre responsabilité est d’anticiper ces mutations. C’est le sens de nos investissements dans les simulateurs, de notre
            certification <strong>ISO 9001:2015</strong>, de la plateforme de formation à distance et des travaux du CREMPOL.
          </p>
          <p>
            À vous, futurs élèves, je promets une formation exigeante et reconnue. À vous, professionnels et entreprises, une offre de
            formation continue au plus près de vos besoins. À vous, partenaires et États membres, une institution transparente et tournée vers
            les résultats.
          </p>
          <p>Bienvenue à l’ARSTM.</p>
          <p class="!mb-0 text-[14px] !text-subtle italic">Texte de démonstration — le message officiel sera fourni par la Direction Générale.</p>
          <div class="mt-6 flex flex-wrap gap-3">
            <a routerLink="/institution/film" class="f-btn btn-primary">Voir le film institutionnel</a>
            <a routerLink="/institution/politique-qualite" class="f-btn btn-ghost">Notre politique qualité →</a>
          </div>
        </article>
      </div>
    </section>
  `,
})
export default class MotDuDg {
  protected readonly img = IMG;
  protected readonly links = INSTITUTION_LINKS;
}
