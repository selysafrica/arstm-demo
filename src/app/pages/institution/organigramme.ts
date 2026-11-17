import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHero, Subnav } from '../../shared/ui';
import { IMG, ORG_CHART } from '../../data/site';
import { INSTITUTION_LINKS } from './nav';

@Component({
  selector: 'app-organigramme',
  imports: [RouterLink, PageHero, Subnav],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero title="Organigramme" kicker="Gouvernance" lead="Des organes de gouvernance régionaux et une Direction Générale qui pilote l’ensemble des composantes." [image]="img.reunion" [crumbs]="[{ label: 'L’institution', path: '/institution' }, { label: 'Organigramme' }]" [compact]="true" />
    <app-subnav [links]="links" label="Rubrique L’institution" />

    <section class="container-x section-y relative z-[1] pt-[clamp(48px,6vw,80px)]">
      <div class="panel flex flex-col items-center gap-0 p-[clamp(20px,4vw,48px)]">
        <div class="flex w-full flex-wrap items-stretch justify-center gap-4">
          <div class="org-node max-w-[460px] bg-navy text-white">
            <strong class="text-[19px]">{{ org.top.title }}</strong>
            <span class="text-[14.5px] text-hero-text">{{ org.top.sub }}</span>
          </div>
          <div class="org-node max-w-[260px] border border-dashed border-line bg-white">
            <strong class="text-ink">{{ org.control.title }}</strong>
            <span class="text-[14px] text-subtle">{{ org.control.sub }}</span>
          </div>
        </div>
        <span class="org-line h-8"></span>
        <div class="org-node max-w-[380px] bg-blue text-white">
          <strong class="text-[19px]">{{ org.dg.title }}</strong>
          <span class="text-[14.5px] text-hero-text">{{ org.dg.sub }}</span>
        </div>
        <span class="org-line h-6"></span>
        <ul class="m-0 flex w-full list-none flex-wrap justify-center gap-2.5 p-0">
          @for (s of org.staff; track s) {
            <li class="rounded-full border border-line bg-tint-soft px-4 py-2 text-[14.5px] font-semibold text-navy">{{ s }}</li>
          }
        </ul>
        <span class="org-line h-8"></span>
        <div class="relative w-full border-t-2 border-line pt-8">
          <ul class="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(180px,100%),1fr))] gap-3 p-0">
            @for (d of org.directions; track d.title) {
              <li>
                <a [routerLink]="link(d.title)" class="f-card org-node h-full !max-w-none border border-line-soft bg-white no-underline">
                  <strong class="text-[18px] font-black text-blue">{{ d.title }}</strong>
                  <span class="text-[14.5px] text-muted">{{ d.sub }}</span>
                </a>
              </li>
            }
          </ul>
        </div>
      </div>
    </section>
  `,
  styles: `
    .org-node {
      display: flex;
      flex-direction: column;
      gap: 4px;
      align-items: center;
      text-align: center;
      padding: 18px 22px;
      border-radius: 16px;
      width: 100%;
      box-shadow: var(--shadow-card);
    }
    .org-line {
      display: block;
      width: 2px;
      background: var(--color-line);
    }
  `,
})
export default class Organigramme {
  protected readonly img = IMG;
  protected readonly links = INSTITUTION_LINKS;
  protected readonly org = ORG_CHART;
  protected link(code: string) {
    return code === 'DDFCP' ? '/formation-continue' : '/formations/' + code.toLowerCase();
  }
}
