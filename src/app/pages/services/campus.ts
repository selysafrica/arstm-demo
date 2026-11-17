import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../shared/icon';
import { PageHero, SectionHead, toneOf } from '../../shared/ui';
import { FACILITIES, IMG, Tone } from '../../data/site';

/** Installations, équipements et vie estudiantine (portail § 6.3). */
@Component({
  selector: 'app-campus',
  imports: [RouterLink, Icon, PageHero, SectionHead],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero title="Un campus de" accent="33 hectares" kicker="Installations · Vie estudiantine" lead="Simulateurs, laboratoires, piscine olympique, internat : un cadre de formation unique dans la sous-région." [image]="img.aerien" [crumbs]="[{ label: 'Campus et vie étudiante' }]" />

    <section class="container-x section-y relative z-[1] flex flex-col gap-7 pt-[clamp(48px,6vw,80px)]">
      <app-section-head pill="Installations et équipements" lead="Des équipements pédagogiques pour apprendre comme à bord.">
        <h2 class="h-display">Apprendre <span class="text-blue">en situation</span></h2>
      </app-section-head>
      <div class="grid gap-4 md:grid-cols-[1.3fr_1fr]">
        <figure class="relative m-0 min-h-[380px] overflow-hidden rounded-3xl shadow-photo">
          <img [src]="img.campus" alt="Bâtiment à arcades du campus de l’ARSTM" class="absolute inset-0 h-full w-full object-cover" loading="lazy" />
          <figcaption class="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-6 text-white" style="background: linear-gradient(180deg, transparent, rgba(10,18,48,.88))">
            <strong class="text-[22px]">Visite virtuelle</strong>
            <span class="text-hero-text">Simulateurs, laboratoires, piscine : explorez le campus en 360° (option).</span>
          </figcaption>
        </figure>
        <ul class="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
          @for (f of facilities; track f.title) {
            <li class="flex flex-col gap-2 rounded-[18px] bg-white p-5 shadow-card">
              <span class="icon-tile !h-11 !w-11" [style.background]="tone(f.tone).soft" [style.color]="tone(f.tone).ink"><app-icon [name]="f.icon" [size]="20" /></span>
              <strong class="text-ink">{{ f.title }}</strong>
              <span class="text-[14.5px] text-muted">{{ f.text }}</span>
            </li>
          }
        </ul>
      </div>
    </section>

    <section id="hebergement" class="container-x section-y relative z-[1]">
      <div class="grid items-center gap-[clamp(24px,4vw,56px)] rounded-3xl bg-white p-[clamp(22px,4vw,48px)] shadow-soft md:grid-cols-2">
        <div class="flex flex-col gap-4">
          <h2 class="h-section">Campus et <span class="text-blue">hébergement</span></h2>
          <p class="m-0 text-text">Les élèves officiers sont accueillis en internat sur le campus. Restauration, infirmerie, installations sportives et espaces de travail sont accessibles 7 jours sur 7.</p>
          <ul class="m-0 flex list-none flex-col gap-2 p-0">
            @for (h of housing; track h) {
              <li class="flex items-start gap-2.5 text-[15.5px] text-text"><app-icon name="tick" [size]="18" class="mt-0.5 text-green" />{{ h }}</li>
            }
          </ul>
          <p class="m-0 rounded-xl bg-orange-soft p-3 text-[14.5px] text-orange-ink">[Capacité et conditions d’hébergement à préciser par l’ARSTM.]</p>
        </div>
        <img [src]="img.salut" alt="Élèves officiers sur la place d’armes" class="block aspect-[4/3] w-full rounded-[22px] object-cover" loading="lazy" />
      </div>
    </section>

    <section class="container-x section-y relative z-[1] flex flex-col gap-7">
      <app-section-head pill="Vie estudiantine" lead="Associations, clubs, sport et traditions maritimes rythment la vie de l’Académie.">
        <h2 class="h-display">Plus qu’une <span class="text-blue">école</span></h2>
      </app-section-head>
      <div class="grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-4">
        @for (l of life; track l.title) {
          <div class="flex flex-col gap-2 rounded-[18px] border-t-4 bg-white p-[22px] shadow-card" [style.border-top-color]="tone(l.tone).line">
            <strong class="text-[18px] text-ink">{{ l.title }}</strong>
            <span class="text-[15px] text-muted">{{ l.text }}</span>
          </div>
        }
      </div>
      <div class="flex flex-wrap justify-center gap-3">
        <a routerLink="/mediatheque" class="f-btn btn-pill">Voir la galerie photos →</a>
        <a routerLink="/agenda" class="f-btn btn-ghost">Journée portes ouvertes</a>
      </div>
    </section>
  `,
})
export default class Campus {
  protected readonly img = IMG;
  protected readonly facilities = FACILITIES;
  protected readonly tone = (t: Tone) => toneOf(t);
  protected readonly housing = ['Internat pour les élèves officiers', 'Restaurant universitaire', 'Infirmerie et suivi médical', 'Wi-Fi sur l’ensemble du campus'];
  protected readonly life: { title: string; text: string; tone: Tone }[] = [
    { title: 'Bibliothèques', text: 'Salles de lecture et accès à la bibliothèque numérique.', tone: 'blue' },
    { title: 'Activités extrascolaires', text: 'Voile, natation, football, basket et sports de combat.', tone: 'orange' },
    { title: 'Associations et clubs', text: 'Bureau des élèves, club anglais, club robotique, Club Marine Marchande.', tone: 'green' },
    { title: 'Traditions', text: 'Salut aux couleurs, baptême de promotion, cérémonies officielles.', tone: 'navy' },
  ];
}
