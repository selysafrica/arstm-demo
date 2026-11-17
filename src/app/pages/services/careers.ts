import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../shared/icon';
import { PageHero, SectionHead } from '../../shared/ui';
import { IMG, JOBS, TESTIMONIALS } from '../../data/site';

/** Centre de carrière et offres de stage / emploi (EF-POR-02, EF-COM-03, EF-COM-04). */
@Component({
  selector: 'app-careers',
  imports: [RouterLink, Icon, PageHero, SectionHead],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero title="Centre de" accent="carrière" kicker="Emploi · Stages · Alumni" lead="Offres d’emploi et de stage du secteur maritime et portuaire, conseils et lien avec les entreprises partenaires." [image]="img.douala" [crumbs]="[{ label: 'Centre de carrière' }]" [compact]="true" />

    <section class="container-x section-y relative z-[1] pt-[clamp(40px,5vw,64px)]">
      <div class="grid items-start gap-[clamp(24px,4vw,40px)] lg:grid-cols-[1fr_340px]">
        <div class="flex flex-col gap-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2 class="h-section">Offres <span class="text-blue">récentes</span></h2>
            <div class="flex gap-1.5" role="group" aria-label="Type d’offre">
              @for (k of kinds; track k) {
                <button type="button" class="min-h-[40px] cursor-pointer rounded-full border-[1.5px] px-4 font-[inherit] text-[14px] font-bold" [class]="kind() === k ? 'border-blue bg-blue text-white' : 'border-[#DCE4EF] bg-white text-ink'" [attr.aria-pressed]="kind() === k" (click)="kind.set(k)">{{ k }}</button>
              }
            </div>
          </div>
          <ul class="m-0 flex list-none flex-col gap-3 p-0">
            @for (j of jobs(); track j.title) {
              <li class="grid items-center gap-4 rounded-[18px] bg-white p-5 shadow-card sm:grid-cols-[auto_1fr_auto]">
                <span class="icon-tile" [class]="j.kind === 'Stage' ? 'bg-orange-soft text-orange-ink' : 'bg-tint text-blue'"><app-icon [name]="j.kind === 'Stage' ? 'cap' : 'briefcase'" [size]="22" /></span>
                <span class="flex flex-col gap-1">
                  <strong class="text-[17.5px] text-ink">{{ j.title }}</strong>
                  <span class="flex flex-wrap gap-x-3 gap-y-0.5 text-[14.5px] text-subtle">
                    <span>{{ j.company }}</span><span class="inline-flex items-center gap-1"><app-icon name="pin" [size]="14" />{{ j.place }}</span><span>{{ j.type }}</span><span>{{ j.date }}</span>
                  </span>
                </span>
                <button type="button" class="f-btn btn-primary !py-2.5 text-[15px]" (click)="applied.set(j.title)">{{ applied() === j.title ? 'Candidature envoyée ✓' : 'Postuler' }}</button>
              </li>
            }
          </ul>
        </div>
        <aside class="flex flex-col gap-4 lg:sticky lg:top-28">
          <div id="publier" class="flex flex-col gap-3 rounded-[22px] bg-navy p-6 text-white">
            <strong class="text-[20px]">Vous recrutez ?</strong>
            <p class="m-0 text-[15px] text-hero-text">Publiez gratuitement vos offres d’emploi et de stage auprès de nos élèves et de nos 10 000 anciens.</p>
            <a routerLink="/contact" class="f-btn self-start rounded-xl bg-orange px-4 py-3 font-extrabold text-navy hover:text-navy">Publier une offre</a>
          </div>
          <div class="flex flex-col gap-2 rounded-[22px] bg-white p-6 shadow-card">
            <strong class="text-[18px] text-ink">Conseils carrière</strong>
            @for (t of tips; track t) {
              <a href="#" (click)="$event.preventDefault()" class="flex items-center justify-between gap-2 rounded-lg py-2 text-[15.5px] text-text no-underline hover:text-navy">{{ t }}<app-icon name="chevron-right" [size]="16" class="text-blue" /></a>
            }
          </div>
        </aside>
      </div>
    </section>

    <section class="container-x section-y relative z-[1] flex flex-col gap-7">
      <app-section-head pill="Alumni" lead="Nos anciens élèves témoignent de leur parcours.">
        <h2 class="h-display">Ils ont pris <span class="text-blue">le large</span></h2>
      </app-section-head>
      <div class="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-4">
        @for (t of testimonials; track t.name) {
          <figure class="m-0 flex flex-col gap-4 rounded-[22px] bg-white p-6 shadow-card">
            <app-icon name="quote" [size]="28" class="text-orange" />
            <blockquote class="m-0 text-[17px] text-text">{{ t.quote }}</blockquote>
            <figcaption class="mt-auto"><strong class="text-ink">{{ t.name }}</strong><br /><span class="text-[14.5px] text-subtle">{{ t.role }}</span></figcaption>
          </figure>
        }
      </div>
      <p class="m-0 text-center text-[15px] text-muted">Espace alumni et forum d’échanges : prévus en phase 2.</p>
    </section>
  `,
})
export default class Careers {
  protected readonly img = IMG;
  protected readonly testimonials = TESTIMONIALS;
  protected readonly kinds = ['Toutes', 'Emploi', 'Stage'];
  protected readonly kind = signal('Toutes');
  protected readonly applied = signal<string | null>(null);
  protected readonly jobs = computed(() => (this.kind() === 'Toutes' ? JOBS : JOBS.filter((j) => j.kind === this.kind())));
  protected readonly tips = ['Réussir son premier embarquement', 'Rédiger un CV maritime', 'Préparer un entretien en anglais', 'Valoriser ses certificats STCW'];
}
