import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../shared/icon';
import { PageHero, SectionHead } from '../../shared/ui';
import { ProgramCard } from '../../shared/program-card';
import { IMG, PROGRAMS, SCHOOLS } from '../../data/site';

/** Catalogue des formations avec recherche et filtres (EF-FOR-03). */
@Component({
  selector: 'app-catalogue',
  imports: [RouterLink, Icon, PageHero, SectionHead, ProgramCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero
      title="Trouvez la formation qui fixe"
      accent="votre cap"
      kicker="Catalogue des formations"
      lead="Formations initiales, continues et à distance : filtrez par école, domaine, type ou niveau."
      [image]="img.salut"
      [crumbs]="[{ label: 'Formations' }]"
    />

    <section class="container-x relative z-[2] -mt-9">
      <div class="panel flex flex-col gap-3 p-[clamp(14px,2vw,22px)]">
        <label class="flex min-h-[54px] items-center gap-2.5 rounded-xl border border-line-soft bg-white px-3.5">
          <app-icon name="search" class="text-subtle" />
          <span class="sr-only-x">Rechercher une formation</span>
          <input
            type="search"
            class="flex-1 border-none bg-transparent font-[inherit] text-[17px] text-ink outline-none"
            placeholder="Rechercher : capitaine, logistique, sûreté…"
            [value]="q()"
            (input)="q.set($any($event.target).value)"
          />
        </label>
        <div class="grid grid-cols-[repeat(auto-fit,minmax(min(200px,100%),1fr))] gap-2.5">
          <label class="field !text-[13.5px]">
            École ou entité
            <select [value]="school()" (change)="schoolSel.set($any($event.target).value)">
              <option value="">Toutes</option>
              @for (s of schools; track s.slug) {
                <option [value]="s.slug">{{ s.code }} — {{ s.name }}</option>
              }
            </select>
          </label>
          <label class="field !text-[13.5px]">
            Domaine
            <select [value]="domain()" (change)="domain.set($any($event.target).value)">
              <option value="">Tous</option>
              @for (d of domains; track d) {
                <option [value]="d">{{ d }}</option>
              }
            </select>
          </label>
          <label class="field !text-[13.5px]">
            Type de formation
            <select [value]="type()" (change)="type.set($any($event.target).value)">
              <option value="">Tous</option>
              @for (t of types; track t) {
                <option [value]="t">{{ t }}</option>
              }
            </select>
          </label>
          <label class="field !text-[13.5px]">
            Niveau
            <select [value]="level()" (change)="level.set($any($event.target).value)">
              <option value="">Tous</option>
              @for (l of levels; track l) {
                <option [value]="l">{{ l }}</option>
              }
            </select>
          </label>
        </div>
      </div>
    </section>

    <section class="container-x section-y relative z-[1] flex flex-col gap-5 pt-10">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="m-0 text-muted" aria-live="polite">
          <strong class="text-ink">{{ results().length }}</strong> formation{{ results().length > 1 ? 's' : '' }}
          {{ results().length > 1 ? 'correspondent' : 'correspond' }} à votre recherche
        </p>
        @if (hasFilters()) {
          <button type="button" class="f-btn btn-ghost !py-2 text-[14.5px]" (click)="reset()"><app-icon name="x" [size]="16" />Réinitialiser</button>
        }
      </div>
      <ul class="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(360px,100%),1fr))] gap-4 p-0">
        @for (p of results(); track p.slug) {
          <li><app-program-card [program]="p" /></li>
        } @empty {
          <li class="col-span-full flex flex-col items-center gap-3 rounded-[22px] bg-white p-10 text-center">
            <app-icon name="search" [size]="32" class="text-sky" />
            <strong class="text-[19px] text-ink">Aucune formation ne correspond</strong>
            <p class="m-0 text-muted">Essayez un autre mot-clé ou retirez un filtre.</p>
            <button type="button" class="f-btn btn-primary" (click)="reset()">Voir toutes les formations</button>
          </li>
        }
      </ul>
    </section>

    <section class="container-x section-y relative z-[1] flex flex-col gap-7">
      <app-section-head pill="Par école" lead="Chaque école a ses parcours, ses débouchés et sa culture.">
        <h2 class="h-display">Explorer par <span class="text-blue">école</span></h2>
      </app-section-head>
      <div class="grid grid-cols-[repeat(auto-fit,minmax(min(360px,100%),1fr))] gap-4">
        @for (s of schools; track s.slug) {
          <a [routerLink]="['/formations', s.slug]" class="f-card group relative flex min-h-[240px] flex-col justify-end overflow-hidden rounded-[22px] p-6 text-white no-underline">
            <img [src]="s.img" [alt]="s.alt" class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" loading="lazy" />
            <span aria-hidden="true" class="absolute inset-0" style="background: linear-gradient(180deg, rgba(10,18,48,.1) 20%, rgba(10,18,48,.88) 100%)"></span>
            <span class="relative flex flex-col gap-1">
              <span class="text-[13px] font-bold tracking-[.04em] text-sky uppercase">{{ s.kind }} · {{ s.code }}</span>
              <strong class="text-[22px] leading-tight">{{ s.name }}</strong>
            </span>
          </a>
        }
      </div>
    </section>
  `,
})
export default class Catalogue {
  /** Pré-filtre possible via ?ecole=esn */
  readonly ecole = input<string>();
  protected readonly img = IMG;
  protected readonly schools = SCHOOLS;
  protected readonly domains = [...new Set(PROGRAMS.map((p) => p.domain))].sort();
  protected readonly types = [...new Set(PROGRAMS.map((p) => p.type))];
  protected readonly levels = [...new Set(PROGRAMS.map((p) => p.level))];

  protected readonly q = signal('');
  protected readonly schoolSel = signal<string | null>(null);
  protected readonly school = computed(() => this.schoolSel() ?? this.ecole() ?? '');
  protected readonly domain = signal('');
  protected readonly type = signal('');
  protected readonly level = signal('');

  protected readonly hasFilters = computed(() => !!(this.q() || this.school() || this.domain() || this.type() || this.level()));

  protected readonly results = computed(() => {
    const q = this.q().trim().toLowerCase();
    return PROGRAMS.filter(
      (p) =>
        (!this.school() || p.school === this.school()) &&
        (!this.domain() || p.domain === this.domain()) &&
        (!this.type() || p.type === this.type()) &&
        (!this.level() || p.level === this.level()) &&
        (!q || `${p.title} ${p.summary} ${p.domain} ${p.outcomes.join(' ')}`.toLowerCase().includes(q)),
    );
  });

  protected reset() {
    this.q.set('');
    this.schoolSel.set('');
    this.domain.set('');
    this.type.set('');
    this.level.set('');
  }

}
