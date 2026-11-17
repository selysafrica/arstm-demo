import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Icon } from './icon';
import { TONES, Tone } from '../data/site';

export interface Crumb {
  label: string;
  path?: string;
}

/** Bandeau d’en-tête des pages intérieures — même traitement que le hero d’accueil. */
@Component({
  selector: 'app-page-hero',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="relative z-[1] flex flex-col text-white" [style.min-height.px]="compact() ? 380 : 460">
      <img [src]="image()" alt="" class="absolute inset-0 block h-full w-full object-cover" fetchpriority="high" />
      <div
        aria-hidden="true"
        class="absolute inset-0"
        style="background: linear-gradient(180deg, rgba(14,24,62,.86) 0%, rgba(20,34,84,.76) 55%, rgba(14,24,62,.92) 100%)"
      ></div>
      <div class="container-x hero-in relative z-[2] flex w-full flex-1 flex-col justify-end gap-4 pt-[150px] pb-12">
        <nav aria-label="Fil d’Ariane">
          <ol class="m-0 flex list-none flex-wrap items-center gap-1.5 p-0 text-[14.5px] text-hero-text">
            <li><a routerLink="/" class="text-hero-text no-underline hover:text-white">Accueil</a></li>
            @for (c of crumbs(); track c.label; let last = $last) {
              <li class="flex items-center gap-1.5">
                <app-icon name="chevron-right" [size]="14" />
                @if (c.path && !last) {
                  <a [routerLink]="c.path" class="text-hero-text no-underline hover:text-white">{{ c.label }}</a>
                } @else {
                  <span [attr.aria-current]="last ? 'page' : null" class="font-semibold text-white">{{ c.label }}</span>
                }
              </li>
            }
          </ol>
        </nav>
        @if (kicker()) {
          <span
            class="inline-flex items-center gap-2 self-start rounded-full border border-white/30 bg-white/14 px-3.5 py-1.5 text-[14.5px] font-semibold"
          >
            <span aria-hidden="true" class="h-2 w-2 rounded-full bg-orange"></span>{{ kicker() }}
          </span>
        }
        <h1 class="m-0 max-w-[22ch] text-[clamp(36px,4.8vw,60px)] leading-[1.05] font-extrabold">
          {{ title() }}
          @if (accent()) {
            <em class="text-sky italic">{{ accent() }}</em>
          }
        </h1>
        @if (lead()) {
          <p class="m-0 max-w-[62ch] text-[19px] text-hero-text">{{ lead() }}</p>
        }
        <ng-content />
      </div>
    </section>
  `,
})
export class PageHero {
  readonly title = input.required<string>();
  readonly accent = input<string>();
  readonly lead = input<string>();
  readonly kicker = input<string>();
  readonly image = input('img/hero-cadets.jpg');
  readonly crumbs = input<Crumb[]>([]);
  readonly compact = input(false);
}

/** Pastille + titre de section, centrés comme dans la maquette. */
@Component({
  selector: 'app-section-head',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col gap-3.5', '[class.items-center]': 'center()', '[class.text-center]': 'center()' },
  template: `
    @if (pill()) {
      <span class="pill" [style.color]="dot() ? '#1E7A50' : null">
        @if (dot()) {
          <span aria-hidden="true" class="h-2 w-2 rounded-full bg-green"></span>
        } @else {
          <span aria-hidden="true">✦</span>
        }
        {{ pill() }}
      </span>
    }
    <ng-content select="h2,h1" />
    @if (lead()) {
      <p class="m-0 max-w-[58ch] text-muted">{{ lead() }}</p>
    }
    <ng-content />
  `,
})
export class SectionHead {
  readonly pill = input<string>();
  readonly lead = input<string>();
  readonly center = input(true);
  readonly dot = input(false);
}

/** Barre d’onglets de sous-rubrique (pills de la maquette). */
@Component({
  selector: 'app-subnav',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav [attr.aria-label]="label()" class="container-x relative z-[2] -mt-7">
      <ul class="panel m-0 flex list-none gap-1.5 overflow-x-auto p-2 [scrollbar-width:none]">
        @for (l of links(); track l.path) {
          <li class="flex-none">
            <a
              [routerLink]="l.path"
              routerLinkActive="!bg-blue !text-white"
              [routerLinkActiveOptions]="{ exact: true }"
              class="inline-flex min-h-[44px] items-center rounded-full px-4 text-[14.5px] font-bold whitespace-nowrap text-ink no-underline transition-colors hover:bg-tint"
              >{{ l.label }}</a
            >
          </li>
        }
      </ul>
    </nav>
  `,
})
export class Subnav {
  readonly links = input.required<{ label: string; path: string }[]>();
  readonly label = input('Sous-rubriques');
}

/** Accordéon de FAQ avec recherche (maquette « Besoin d’aide ? »). */
@Component({
  selector: 'app-faq',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="panel flex flex-col gap-3 p-[clamp(16px,2.5vw,26px)]">
      <label class="flex min-h-[50px] items-center gap-2.5 rounded-xl border border-line-soft bg-white px-3.5">
        <app-icon name="search" [size]="18" class="text-subtle" />
        <span class="sr-only-x">Rechercher une question</span>
        <input
          type="search"
          placeholder="Rechercher une question…"
          class="flex-1 border-none bg-transparent font-[inherit] text-ink outline-none"
          [value]="query()"
          (input)="query.set($any($event.target).value)"
        />
      </label>
      @for (f of filtered(); track f.q; let i = $index) {
        <div class="rounded-[14px] border border-line-soft bg-white">
          <button
            type="button"
            class="flex w-full cursor-pointer items-center gap-3.5 border-none bg-transparent p-4 text-left font-[inherit] text-ink"
            [attr.aria-expanded]="open() === f.q"
            [attr.aria-controls]="'faq-' + i"
            (click)="toggle(f.q)"
          >
            <span
              aria-hidden="true"
              class="inline-flex h-9 w-9 flex-none items-center justify-center rounded-[10px] bg-blue font-extrabold text-white"
              >?</span
            >
            <strong class="flex-1 text-[17px]">{{ f.q }}</strong>
            <app-icon
              name="chevron-down"
              class="text-subtle transition-transform duration-300"
              [style.transform]="open() === f.q ? 'rotate(180deg)' : 'none'"
            />
          </button>
          @if (open() === f.q) {
            <p [id]="'faq-' + i" class="f-pop m-0 pr-[18px] pb-[18px] pl-[66px] text-muted">{{ f.a }}</p>
          }
        </div>
      } @empty {
        <p class="m-0 p-4 text-center text-muted">Aucune question ne correspond à « {{ query() }} ».</p>
      }
    </div>
  `,
})
export class Faq {
  readonly items = input.required<{ q: string; a: string }[]>();
  protected readonly query = signal('');
  /** undefined = état initial : la première question est ouverte */
  private readonly openSel = signal<string | null | undefined>(undefined);
  protected readonly open = computed(() => (this.openSel() === undefined ? (this.items()[0]?.q ?? null) : this.openSel()));
  protected readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const list = this.items();
    return q ? list.filter((f) => (f.q + ' ' + f.a).toLowerCase().includes(q)) : list;
  });
  protected toggle(q: string) {
    this.openSel.set(this.open() === q ? null : q);
  }
}

/** Carte ressource (rubrique Admission) — même langage visuel que la carte formation. */
@Component({
  selector: 'app-resource-card',
  imports: [Icon, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block h-full' },
  template: `
    <a
      [routerLink]="path()"
      [fragment]="fragment()"
      class="tone-card flex h-full flex-col rounded-[20px] border border-line-soft bg-white text-ink no-underline shadow-card"
      [style.--tone]="t().line"
      [style.--tone-soft]="t().soft"
      [style.--tone-ink]="t().ink"
    >
      <span class="flex flex-1 flex-col gap-3 px-6 pt-6 pb-5">
        <span class="flex items-start justify-between gap-3">
          <span class="tone-mono !min-w-[52px] !h-[52px] !rounded-[15px]"><app-icon [name]="icon()" [size]="24" /></span>
          @if (badge()) {
            <span class="rounded-md bg-(--tone-soft) px-2 py-0.5 text-[13px] font-bold text-(--tone-ink)">{{ badge() }}</span>
          }
        </span>
        <strong class="mt-1 text-[20px] leading-[1.25] font-extrabold text-ink">{{ title() }}</strong>
        @if (desc()) {
          <p class="m-0 line-clamp-2 text-[15.5px] leading-relaxed text-muted">{{ desc() }}</p>
        }
      </span>
      <span class="mt-auto flex items-center justify-between gap-3 border-t border-line-soft px-6 py-4">
        <span class="flex min-w-0 items-center gap-2 text-[14.5px] text-text">
          @if (meta()) {
            <app-icon [name]="metaIcon()" [size]="16" class="flex-none text-subtle" />
            <span class="truncate">{{ meta() }}</span>
          }
        </span>
        <span class="flex flex-none items-center gap-2 text-[14.5px] font-bold text-blue">
          <span class="max-sm:sr-only">{{ cta() }}</span>
          <span class="tone-arrow"><app-icon [name]="cta() === 'Télécharger' ? 'download' : 'arrow-right'" [size]="16" [stroke]="2.4" /></span>
        </span>
      </span>
    </a>
  `,
})
export class ResourceCard {
  readonly tone = input<Tone>('blue');
  readonly icon = input('book');
  readonly title = input.required<string>();
  readonly desc = input<string>();
  readonly badge = input<string>();
  readonly cta = input('Voir les détails');
  readonly meta = input<string>();
  readonly metaIcon = input('info');
  readonly path = input.required<string>();
  readonly fragment = input<string>();
  protected readonly t = computed(() => TONES[this.tone()]);
}

export const toneOf = (t: Tone) => TONES[t];
