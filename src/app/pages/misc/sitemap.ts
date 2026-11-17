import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHero } from '../../shared/ui';
import { IMG, MAIN_NAV, PORTAL } from '../../data/site';

/** Plan du site (EF-ERG-01). */
@Component({
  selector: 'app-sitemap',
  imports: [RouterLink, PageHero],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero title="Plan" accent="du site" [image]="img.campus" [crumbs]="[{ label: 'Plan du site' }]" [compact]="true" />
    <section class="container-x section-y relative z-[1] pt-10">
      <div class="grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-5">
        <div class="flex flex-col gap-2 rounded-[22px] bg-white p-6 shadow-card">
          <a routerLink="/" class="text-[19px] font-black text-navy no-underline">Accueil</a>
        </div>
        @for (n of nav; track n.key) {
          <div class="flex flex-col gap-3 rounded-[22px] bg-white p-6 shadow-card">
            <a [routerLink]="n.path" class="text-[19px] font-black text-navy no-underline">{{ n.label }}</a>
            @for (g of n.groups; track g.title) {
              <div class="flex flex-col gap-1.5">
                <span class="text-[13px] font-bold tracking-[.04em] text-blue uppercase">{{ g.title }}</span>
                @for (l of g.links; track l.label) {
                  <a [routerLink]="l.path" [fragment]="l.fragment" class="text-[15.5px] text-text no-underline hover:text-navy hover:underline">{{ l.label }}</a>
                }
              </div>
            }
          </div>
        }
        <div class="flex flex-col gap-1.5 rounded-[22px] bg-white p-6 shadow-card">
          <span class="text-[19px] font-black text-navy">Sites et applications</span>
          @for (p of portal; track p.title) {
            <a [routerLink]="p.path" class="text-[15.5px] text-text no-underline hover:text-navy hover:underline">{{ p.title }}</a>
          }
        </div>
        <div class="flex flex-col gap-1.5 rounded-[22px] bg-white p-6 shadow-card">
          <span class="text-[19px] font-black text-navy">Informations</span>
          <a routerLink="/recherche" class="text-[15.5px] text-text no-underline hover:underline">Recherche</a>
          <a routerLink="/mentions-legales" class="text-[15.5px] text-text no-underline hover:underline">Mentions légales</a>
          <a routerLink="/mentions-legales" fragment="confidentialite" class="text-[15.5px] text-text no-underline hover:underline">Confidentialité et cookies</a>
        </div>
      </div>
    </section>
  `,
})
export default class Sitemap {
  protected readonly img = IMG;
  protected readonly nav = MAIN_NAV;
  protected readonly portal = PORTAL;
}
