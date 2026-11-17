import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Icon } from '../../shared/icon';
import { StudentStore } from '../../core/student-store';
import { LIBRARY, THEMES } from '../../data/site';

/** Bibliothèque : prêts en cours + ressources réservées aux élèves (EF-POR-03). */
@Component({
  selector: 'app-espace-bibliotheque',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-5">
      <section class="box flex flex-col gap-3 p-5" aria-labelledby="loans">
        <h2 id="loans" class="m-0 text-[18px] font-extrabold text-ink">Mes prêts</h2>
        @for (l of s.loans(); track l.title) {
          <div class="flex flex-wrap items-center gap-3 rounded-xl border border-line-soft px-4 py-3">
            <span class="icon-tile !h-10 !w-10 bg-violet-soft text-violet-ink"><app-icon name="book" [size]="18" /></span>
            <span class="flex min-w-[200px] flex-1 flex-col"><strong class="text-ink">{{ l.title }}</strong><span class="text-[14px] text-subtle">À rendre le {{ l.due }}</span></span>
            @if (l.renewed) {
              <span class="chip chip-mute">Prolongé</span>
            } @else {
              <button type="button" class="f-btn btn-ghost !rounded-xl !py-2 text-[14.5px]" (click)="s.renew(l.title)">Prolonger de 14 jours</button>
            }
          </div>
        }
      </section>

      <section class="box flex flex-col gap-4 p-5" aria-labelledby="res">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h2 id="res" class="m-0 text-[18px] font-extrabold text-ink">Ressources numériques</h2>
          <span class="chip chip-ok"><app-icon name="lock" [size]="12" />Accès élève activé</span>
        </div>
        <div class="flex flex-col gap-2 sm:flex-row">
          <label class="flex min-h-[46px] flex-1 items-center gap-2 rounded-xl border border-line-soft bg-field px-3">
            <app-icon name="search" [size]="18" class="text-subtle" /><span class="sr-only-x">Rechercher</span>
            <input type="search" placeholder="Titre, auteur…" class="flex-1 border-none bg-transparent font-[inherit] text-[15px] outline-none" [value]="q()" (input)="q.set($any($event.target).value)" />
          </label>
          <label class="field sm:w-[260px]"><span class="sr-only-x">Domaine</span>
            <select [value]="theme()" (change)="theme.set($any($event.target).value)">
              <option value="">Tous les domaines</option>
              @for (t of themes; track t) { <option [value]="t">{{ t }}</option> }
            </select>
          </label>
        </div>
        <ul class="m-0 grid list-none gap-2 p-0 sm:grid-cols-2">
          @for (d of list(); track d.title) {
            <li class="flex items-center gap-3 rounded-xl border border-line-soft p-3">
              <span class="icon-tile !h-10 !w-10 bg-tint text-blue"><app-icon name="file" [size]="18" /></span>
              <span class="flex min-w-0 flex-1 flex-col"><strong class="text-[15px] leading-snug text-ink">{{ d.title }}</strong><span class="text-[13px] text-subtle">{{ d.theme }}</span></span>
              <a href="#" (click)="$event.preventDefault()" class="inline-flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-tint text-blue hover:bg-blue hover:text-white" [attr.aria-label]="'Ouvrir ' + d.title"><app-icon name="external" [size]="17" /></a>
            </li>
          } @empty {
            <li class="col-span-full p-6 text-center text-muted">Aucune ressource ne correspond.</li>
          }
        </ul>
      </section>
    </div>
  `,
})
export default class EspaceBibliotheque {
  protected readonly s = inject(StudentStore);
  protected readonly themes = THEMES;
  protected readonly q = signal('');
  protected readonly theme = signal('');
  protected readonly list = computed(() => {
    const q = this.q().trim().toLowerCase();
    return LIBRARY.filter((d) => (!this.theme() || d.theme === this.theme()) && (!q || d.title.toLowerCase().includes(q)));
  });
}
