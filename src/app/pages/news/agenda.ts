import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../shared/icon';
import { PageHero, toneOf } from '../../shared/ui';
import { EVENTS, EventItem, IMG } from '../../data/site';

/** Agenda dynamique avec ajout au calendrier (EF-ACT-02). */
@Component({
  selector: 'app-agenda',
  imports: [RouterLink, Icon, PageHero],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero title="Événements" accent="à venir" kicker="Agenda" lead="Portes ouvertes, concours, soutenances, séminaires et webinaires." [image]="img.conference" [crumbs]="[{ label: 'Actualités', path: '/actualites' }, { label: 'Agenda' }]" [compact]="true" />

    <section class="container-x relative z-[2] -mt-7">
      <div class="panel flex gap-1.5 overflow-x-auto p-2 [scrollbar-width:none]" role="group" aria-label="Filtrer par type d’événement">
        @for (c of categories; track c) {
          <button type="button" class="min-h-[44px] flex-none cursor-pointer rounded-full border-none px-4 font-[inherit] text-[14.5px] font-bold whitespace-nowrap transition-colors" [class]="cat() === c ? 'bg-blue text-white' : 'bg-transparent text-ink hover:bg-tint'" [attr.aria-pressed]="cat() === c" (click)="cat.set(c)">{{ c }}</button>
        }
      </div>
    </section>

    <section class="container-x section-y relative z-[1] pt-10">
      <ol class="m-0 flex list-none flex-col gap-4 p-0">
        @for (e of list(); track e.title) {
          <li class="grid gap-5 rounded-[22px] bg-white p-5 shadow-card md:grid-cols-[110px_1fr_auto] md:items-center">
            <div class="flex h-[100px] w-[110px] flex-col items-center justify-center rounded-2xl leading-none" [style.background]="tone(e.tone).soft" [style.color]="tone(e.tone).ink">
              <strong class="text-[38px] font-black">{{ e.day }}</strong>
              <span class="text-[15px] font-bold">{{ e.month }} {{ e.year }}</span>
            </div>
            <div class="flex flex-col gap-1.5">
              <span class="flex flex-wrap items-center gap-2">
                <span class="tag" [style.background]="tone(e.tone).soft" [style.color]="tone(e.tone).ink">{{ e.category }}</span>
                @if (e.important) {
                  <span class="tag bg-orange text-navy">Important</span>
                }
              </span>
              <strong class="text-[20px] leading-snug text-ink">{{ e.title }}</strong>
              <p class="m-0 text-[15.5px] text-muted">{{ e.text }}</p>
              <span class="flex flex-wrap gap-x-4 gap-y-1 text-[14.5px] text-subtle">
                <span class="inline-flex items-center gap-1.5"><app-icon name="pin" [size]="15" />{{ e.place }}</span>
                <span class="inline-flex items-center gap-1.5"><app-icon name="clock" [size]="15" />{{ e.time }}</span>
              </span>
            </div>
            <div class="flex flex-wrap gap-2 md:flex-col">
              <button type="button" class="f-btn btn-primary !py-3 text-[15px]" (click)="ics(e)"><app-icon name="calendar" [size]="16" />Ajouter au calendrier</button>
              @if (e.category === 'Concours') {
                <a routerLink="/admissions/candidater" class="f-btn btn-ghost !rounded-xl !py-3 text-[15px]">S’inscrire</a>
              } @else if (e.category === 'Webinaires' || e.category === 'Portes ouvertes') {
                <a routerLink="/contact" class="f-btn btn-ghost !rounded-xl !py-3 text-[15px]">Réserver ma place</a>
              }
            </div>
          </li>
        } @empty {
          <li class="rounded-[18px] bg-white p-8 text-center text-muted">Aucun événement de ce type programmé pour le moment.</li>
        }
      </ol>
    </section>
  `,
})
export default class Agenda {
  protected readonly img = IMG;
  protected readonly tone = toneOf;
  protected readonly categories = ['Tous', ...new Set(EVENTS.map((e) => e.category))];
  protected readonly cat = signal('Tous');
  protected readonly list = computed(() => (this.cat() === 'Tous' ? EVENTS : EVENTS.filter((e) => e.category === this.cat())));

  /** Génère un fichier .ics téléchargeable (ajout au calendrier). */
  protected ics(e: EventItem) {
    const body = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ARSTM//Agenda//FR',
      'BEGIN:VEVENT',
      `UID:${e.isoStart}-${e.title.length}@arstm.net`,
      `DTSTART:${e.isoStart}`,
      `DTEND:${e.isoEnd}`,
      `SUMMARY:${e.title}`,
      `LOCATION:${e.place}`,
      `DESCRIPTION:${e.text}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    const url = URL.createObjectURL(new Blob([body], { type: 'text/calendar;charset=utf-8' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: 'arstm-evenement.ics' });
    a.click();
    URL.revokeObjectURL(url);
  }
}
