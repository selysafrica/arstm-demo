import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Icon } from '../../shared/icon';
import { PageHero, Subnav } from '../../shared/ui';
import { IMG, MEMBER_STATES } from '../../data/site';
import { INSTITUTION_LINKS } from './nav';

const SITES = [
  {
    key: 'abidjan',
    name: 'Siège — Campus de Yopougon',
    city: 'Abidjan, Côte d’Ivoire',
    address: 'Yopougon Niangon Lokoa, B.P. V 158 Abidjan',
    phone: '(225) 27 23 46 08 08',
    lat: 5.3285,
    lon: -4.1085,
    access: ['À 25 min du Plateau par l’autoroute du Nord', 'Lignes de bus SOTRA vers Niangon', 'Parking visiteurs à l’entrée principale'],
  },
  {
    key: 'sanpedro',
    name: 'Antenne de San-Pedro',
    city: 'San-Pedro, Côte d’Ivoire',
    address: 'Zone portuaire de San-Pedro',
    phone: '[numéro]',
    lat: 4.7485,
    lon: -6.6363,
    access: ['À proximité du Port Autonome de San-Pedro', 'Formations continues et sessions STCW'],
  },
];

@Component({
  selector: 'app-situation',
  imports: [Icon, PageHero, Subnav],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero title="Situation" accent="géographique" kicker="L’institution" lead="Un campus de 33 hectares à Abidjan et une antenne au cœur du port de San-Pedro." [image]="img.aerien" [crumbs]="[{ label: 'L’institution', path: '/institution' }, { label: 'Situation géographique' }]" [compact]="true" />
    <app-subnav [links]="links" label="Rubrique L’institution" />

    <section class="container-x section-y relative z-[1] pt-[clamp(48px,6vw,80px)]">
      <div class="grid gap-5 lg:grid-cols-[380px_1fr]">
        <div class="flex flex-col gap-3">
          <div role="tablist" aria-label="Implantations" class="panel flex gap-1.5 p-1.5">
            @for (s of sites; track s.key) {
              <button
                type="button"
                role="tab"
                [attr.aria-selected]="s.key === current().key"
                (click)="key.set(s.key)"
                class="min-h-[44px] flex-1 cursor-pointer rounded-xl border-none font-[inherit] text-[15px] font-bold transition-colors"
                [class]="s.key === current().key ? 'bg-blue text-white' : 'bg-transparent text-ink hover:bg-tint'"
              >
                {{ s.key === 'abidjan' ? 'Abidjan' : 'San-Pedro' }}
              </button>
            }
          </div>
          <div class="f-pop flex flex-col gap-4 rounded-[22px] bg-white p-6 shadow-card" [attr.aria-live]="'polite'">
            <div>
              <strong class="text-[20px] text-ink">{{ current().name }}</strong><br />
              <span class="text-muted">{{ current().city }}</span>
            </div>
            <p class="m-0 flex items-start gap-2.5 text-text"><app-icon name="pin" class="mt-0.5 text-blue" />{{ current().address }}</p>
            <p class="m-0 flex items-start gap-2.5 text-text"><app-icon name="phone" class="mt-0.5 text-blue" />{{ current().phone }}</p>
            <ul class="m-0 flex list-none flex-col gap-2 border-t border-line-soft p-0 pt-4">
              @for (a of current().access; track a) {
                <li class="flex items-start gap-2.5 text-[15.5px] text-text"><app-icon name="tick" [size]="18" class="mt-0.5 text-green" />{{ a }}</li>
              }
            </ul>
            <a [href]="directions()" target="_blank" rel="noopener" class="f-btn btn-primary self-start">Itinéraire <app-icon name="external" [size]="16" /></a>
          </div>
        </div>
        <div class="min-h-[460px] overflow-hidden rounded-[22px] border border-white bg-tint shadow-soft">
          <iframe [src]="mapUrl()" class="block h-full min-h-[460px] w-full border-0" loading="lazy" [title]="'Carte : ' + current().name"></iframe>
        </div>
      </div>
    </section>

    <section class="container-x section-y relative z-[1]">
      <div class="flex flex-col gap-5 rounded-3xl bg-navy p-[clamp(24px,4vw,44px)] text-white">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <h2 class="m-0 text-[clamp(26px,3vw,36px)] font-black">Couverture régionale</h2>
          <span class="text-hero-text">15 pays francophones · 8 États au Conseil d’Administration</span>
        </div>
        <img [src]="img.flags" alt="Drapeaux des quinze pays membres" class="block h-auto w-full max-w-[860px]" />
        <ul class="m-0 flex list-none flex-wrap gap-2 p-0">
          @for (s of states; track s) {
            <li class="rounded-full border border-white/25 bg-white/8 px-3.5 py-1.5 text-[15px] font-semibold">{{ s }}</li>
          }
        </ul>
      </div>
    </section>
  `,
})
export default class Situation {
  private readonly sanitizer = inject(DomSanitizer);
  protected readonly img = IMG;
  protected readonly links = INSTITUTION_LINKS;
  protected readonly states = MEMBER_STATES;
  protected readonly sites = SITES;
  protected readonly key = signal('abidjan');
  protected readonly current = computed(() => SITES.find((s) => s.key === this.key())!);
  protected readonly mapUrl = computed(() => {
    const { lat, lon } = this.current();
    const d = 0.018;
    const url = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - d}%2C${lat - d}%2C${lon + d}%2C${lat + d}&layer=mapnik&marker=${lat}%2C${lon}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });
  protected readonly directions = computed(() => {
    const { lat, lon } = this.current();
    return `https://www.openstreetmap.org/directions?to=${lat}%2C${lon}`;
  });
}
