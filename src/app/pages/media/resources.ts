import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../shared/icon';
import { PageHero, SectionHead } from '../../shared/ui';
import { ARTICLES, IMG, LIBRARY, THEMES } from '../../data/site';

/** Portail thématique : veille sectorielle et bibliothèque numérique (EF-POR-01, EF-POR-03). */
@Component({
  selector: 'app-resources',
  imports: [RouterLink, Icon, PageHero, SectionHead],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero title="Veille et" accent="ressources" kicker="Portail thématique" lead="Analyses sectorielles, bibliothèque numérique et publications de l’Académie, classées par domaine." [image]="img.conference" [crumbs]="[{ label: 'Actualités', path: '/actualites' }, { label: 'Veille et ressources' }]" [compact]="true" />

    <section class="container-x relative z-[2] -mt-7">
      <div class="panel flex gap-1.5 overflow-x-auto p-2 [scrollbar-width:none]" role="group" aria-label="Filtrer par domaine">
        @for (t of themes; track t) {
          <button type="button" class="min-h-[44px] flex-none cursor-pointer rounded-full border-none px-4 font-[inherit] text-[14.5px] font-bold whitespace-nowrap transition-colors" [class]="theme() === t ? 'bg-blue text-white' : 'bg-transparent text-ink hover:bg-tint'" [attr.aria-pressed]="theme() === t" (click)="theme.set(t)">{{ t }}</button>
        }
      </div>
    </section>

    <section class="container-x section-y relative z-[1] flex flex-col gap-6 pt-10">
      <h2 class="h-section">Articles d’analyse</h2>
      <div class="grid grid-cols-[repeat(auto-fill,minmax(min(340px,100%),1fr))] gap-5">
        @for (a of articles(); track a.title) {
          <a href="#" (click)="$event.preventDefault()" class="f-card flex flex-col overflow-hidden rounded-[18px] bg-white text-ink no-underline">
            <img [src]="a.img" alt="" class="block aspect-[16/9] w-full object-cover" loading="lazy" />
            <span class="flex flex-1 flex-col gap-2 p-5">
              <span class="text-[13px] font-bold text-blue">{{ a.theme }}</span>
              <strong class="text-[18px] leading-snug">{{ a.title }}</strong>
              <span class="mt-auto flex gap-3 pt-2 text-[14px] text-subtle"><span>{{ a.date }}</span><span>·</span><span>{{ a.read }} de lecture</span></span>
            </span>
          </a>
        } @empty {
          <p class="col-span-full m-0 rounded-[18px] bg-white p-8 text-center text-muted">Pas encore d’article dans ce domaine.</p>
        }
      </div>
    </section>

    <section id="bibliotheque" class="container-x section-y relative z-[1] flex flex-col gap-6">
      <app-section-head pill="Bibliothèque numérique" lead="Manuels, conventions et cours en ligne. Certaines ressources sont réservées aux élèves connectés.">
        <h2 class="h-display">Ressources <span class="text-blue">documentaires</span></h2>
      </app-section-head>
      <label class="mx-auto flex min-h-[52px] w-full max-w-[640px] items-center gap-2.5 rounded-xl border border-line-soft bg-white px-3.5 shadow-card">
        <app-icon name="search" class="text-subtle" />
        <span class="sr-only-x">Rechercher dans la bibliothèque</span>
        <input type="search" class="flex-1 border-none bg-transparent font-[inherit] text-[16px] text-ink outline-none" placeholder="Rechercher un document…" [value]="q()" (input)="q.set($any($event.target).value)" />
      </label>
      <div class="overflow-x-auto rounded-[18px] bg-white shadow-card">
        <table class="w-full min-w-[620px] border-collapse text-left text-[15.5px]">
          <caption class="sr-only-x">Documents de la bibliothèque numérique</caption>
          <thead><tr class="bg-tint-soft text-[14px] text-navy"><th scope="col" class="p-4">Document</th><th scope="col" class="p-4">Domaine</th><th scope="col" class="p-4">Accès</th><th scope="col" class="p-4"><span class="sr-only-x">Action</span></th></tr></thead>
          <tbody>
            @for (d of library(); track d.title) {
              <tr class="border-t border-line-soft">
                <th scope="row" class="p-4 font-semibold text-ink">{{ d.title }}</th>
                <td class="p-4 text-text">{{ d.theme }}</td>
                <td class="p-4">
                  <span class="tag" [class]="d.access === 'Libre' ? 'bg-green-soft text-green-ink' : 'bg-orange-soft text-orange-ink'">
                    @if (d.access !== 'Libre') { <app-icon name="lock" [size]="12" class="mr-1 align-[-1px]" /> }{{ d.access }}
                  </span>
                </td>
                <td class="p-4 text-right">
                  @if (d.access === 'Libre') {
                    <a href="#" (click)="$event.preventDefault()" class="inline-flex items-center gap-1.5 font-bold no-underline"><app-icon name="download" [size]="16" />Télécharger</a>
                  } @else {
                    <a routerLink="/espace" class="inline-flex items-center gap-1.5 font-bold no-underline"><app-icon name="lock" [size]="16" />Se connecter</a>
                  }
                </td>
              </tr>
            } @empty {
              <tr><td colspan="4" class="p-8 text-center text-muted">Aucun document ne correspond.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `,
})
export default class Resources {
  protected readonly img = IMG;
  protected readonly themes = ['Tous les domaines', ...THEMES];
  protected readonly theme = signal('Tous les domaines');
  protected readonly q = signal('');
  private readonly all = computed(() => this.theme() === 'Tous les domaines');
  protected readonly articles = computed(() => (this.all() ? ARTICLES : ARTICLES.filter((a) => a.theme === this.theme())));
  protected readonly library = computed(() => {
    const q = this.q().trim().toLowerCase();
    return LIBRARY.filter((d) => (this.all() || d.theme === this.theme()) && (!q || d.title.toLowerCase().includes(q)));
  });
}
