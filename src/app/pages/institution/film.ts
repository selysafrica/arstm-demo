import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../shared/icon';
import { PageHero, Subnav } from '../../shared/ui';
import { IMG, VIDEOS } from '../../data/site';
import { INSTITUTION_LINKS } from './nav';

@Component({
  selector: 'app-film',
  imports: [RouterLink, Icon, PageHero, Subnav],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero title="Film" accent="institutionnel" kicker="L’institution" lead="Six minutes pour découvrir l’Académie, ses écoles, ses simulateurs et ses élèves." [image]="img.hero" [crumbs]="[{ label: 'L’institution', path: '/institution' }, { label: 'Film institutionnel' }]" [compact]="true" />
    <app-subnav [links]="links" label="Rubrique L’institution" />

    <section class="container-x section-y relative z-[1] flex flex-col gap-8 pt-[clamp(48px,6vw,80px)]">
      <div class="relative aspect-video w-full overflow-hidden rounded-3xl bg-navy-deep shadow-photo">
        @if (!playing()) {
          <img [src]="img.hero" alt="" class="absolute inset-0 h-full w-full object-cover opacity-70" />
          <button type="button" class="group absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-4 border-none bg-transparent font-[inherit] text-white" (click)="playing.set(true)" aria-label="Lire le film institutionnel (6 min 42)">
            <span class="inline-flex h-24 w-24 items-center justify-center rounded-full bg-orange text-navy shadow-[0_20px_50px_-10px_rgba(0,0,0,.6)] transition-transform duration-300 group-hover:scale-105">
              <app-icon name="play" [size]="40" [stroke]="0" class="[&_path]:fill-current" />
            </span>
            <strong class="text-[20px]">Lire le film · 6:42</strong>
          </button>
        } @else {
          <div class="f-pop absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-white">
            <app-icon name="youtube" [size]="48" class="text-orange" />
            <strong class="text-[22px]">Lecteur vidéo adaptatif</strong>
            <p class="m-0 max-w-[50ch] text-hero-text">Dans la version finale, le film institutionnel fourni par l’ARSTM est intégré ici (lecteur natif ou YouTube, sous-titres FR/EN).</p>
            <button type="button" class="f-btn btn-ghost mt-2" (click)="playing.set(false)">Revenir à l’affiche</button>
          </div>
        }
      </div>
      <div class="flex flex-wrap items-end justify-between gap-4">
        <h2 class="h-section">Autres <span class="text-blue">vidéos</span></h2>
        <a routerLink="/mediatheque" class="f-btn btn-ghost">Vidéothèque →</a>
      </div>
      <div class="grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-4">
        @for (v of videos; track v.title) {
          <a routerLink="/mediatheque" class="f-card flex flex-col overflow-hidden rounded-[18px] bg-white text-ink no-underline">
            <span class="relative block">
              <img [src]="v.img" [alt]="''" class="block aspect-video w-full object-cover" loading="lazy" />
              <span class="absolute right-3 bottom-3 rounded-md bg-[rgba(15,23,42,.75)] px-2 py-0.5 text-[13px] font-bold text-white">{{ v.duration }}</span>
            </span>
            <span class="flex flex-col gap-1 p-4"><span class="text-[13px] font-bold text-blue">{{ v.tag }}</span><strong>{{ v.title }}</strong></span>
          </a>
        }
      </div>
    </section>
  `,
})
export default class Film {
  protected readonly img = IMG;
  protected readonly links = INSTITUTION_LINKS;
  protected readonly videos = VIDEOS.slice(1);
  protected readonly playing = signal(false);
}
