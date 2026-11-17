import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../shared/icon';
import { IMG, QUICK_CHIPS } from '../../data/site';

/** Page 404 personnalisée (EF-ERG-05). */
@Component({
  selector: 'app-not-found',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="relative z-[1] flex min-h-[86vh] flex-col text-white">
      <img [src]="img.aerien" alt="" class="absolute inset-0 h-full w-full object-cover" />
      <div aria-hidden="true" class="absolute inset-0" style="background: linear-gradient(180deg, rgba(14,24,62,.86), rgba(14,24,62,.94))"></div>
      <div class="container-x hero-in relative z-[2] flex flex-1 flex-col items-center justify-center gap-5 pt-[140px] pb-16 text-center">
        <span class="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/14 px-3.5 py-1.5 text-[14.5px] font-semibold"><app-icon name="compass" [size]="16" />Erreur 404</span>
        <h1 class="m-0 text-[clamp(40px,5.4vw,68px)] leading-[1.05] font-extrabold">Vous avez <em class="text-sky italic">perdu le cap</em></h1>
        <p class="m-0 max-w-[52ch] text-[19px] text-hero-text">La page demandée n’existe pas ou a été déplacée. Reprenez la route depuis l’une de ces destinations.</p>
        <div class="flex flex-wrap justify-center gap-3">
          <a routerLink="/" class="f-btn btn-accent">Retour à l’accueil</a>
          <a routerLink="/recherche" class="f-chip inline-flex items-center gap-2 !py-3.5"><app-icon name="search" [size]="16" />Rechercher</a>
        </div>
        <div class="mt-2 flex max-w-[760px] flex-wrap justify-center gap-2">
          @for (c of chips; track c.label) {
            <a class="f-chip" [routerLink]="c.path" [fragment]="c.fragment">{{ c.label }}</a>
          }
        </div>
      </div>
    </section>
  `,
})
export default class NotFound {
  protected readonly img = IMG;
  protected readonly chips = QUICK_CHIPS;
}
