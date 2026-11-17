import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../shared/icon';
import { StudentStore } from '../../core/student-store';
import { fcfa } from './layout';

/** Suivi des commandes de documents et publications (EF-PAY-02, EF-PAY-05). */
@Component({
  selector: 'app-espace-commandes',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h2 class="m-0 text-[22px] font-extrabold text-ink">Mes commandes</h2>
        <a routerLink="/mediatheque" fragment="publications" class="f-btn btn-ghost !rounded-xl !py-2.5">Commander une publication</a>
      </div>
      @for (o of s.orders(); track o.id) {
        <article class="box flex flex-col gap-4 p-5">
          <div class="flex flex-wrap items-start gap-3">
            <span class="icon-tile bg-tint text-blue"><app-icon [name]="o.type.includes('numérique') ? 'download' : 'book'" [size]="20" /></span>
            <span class="flex min-w-[220px] flex-1 flex-col">
              <strong class="text-ink">{{ o.item }}</strong>
              <span class="text-[14px] text-subtle">{{ o.id }} · {{ o.type }} · commandé le {{ o.date }}</span>
            </span>
            <strong class="text-[17px] whitespace-nowrap text-navy">{{ money(o.amount) }}</strong>
          </div>
          <ol class="m-0 grid list-none grid-cols-4 gap-2 p-0" [attr.aria-label]="'Statut : ' + o.status">
            @for (st of steps; track st; let i = $index) {
              <li class="flex flex-col gap-1.5 text-[13px] font-semibold" [class]="i < o.steps ? 'text-blue' : 'text-subtle'">
                <span class="h-1.5 rounded-full" [class]="i < o.steps ? 'bg-blue' : 'bg-tint-soft'"></span>
                {{ st }}
              </li>
            }
          </ol>
          @if (o.status === 'Livré' && o.type.includes('numérique')) {
            <a href="#" (click)="$event.preventDefault()" class="inline-flex items-center gap-1.5 self-start text-[14.5px] font-bold no-underline"><app-icon name="download" [size]="16" />Télécharger la publication</a>
          }
        </article>
      }
    </div>
  `,
})
export default class EspaceCommandes {
  protected readonly s = inject(StudentStore);
  protected readonly money = fcfa;
  protected readonly steps = ['Payée', 'En préparation', 'Expédiée', 'Livrée'];
}
