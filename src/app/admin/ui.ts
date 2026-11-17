import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Icon } from '../shared/icon';

/** En-tête de page du back-office. */
@Component({
  selector: 'adm-page-head',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-wrap items-end justify-between gap-3' },
  template: `
    <div class="flex min-w-0 flex-col gap-0.5">
      <h1 class="m-0 text-[22px] leading-tight font-extrabold text-ink">{{ title() }}</h1>
      @if (desc()) {
        <p class="m-0 text-[14px] text-subtle">{{ desc() }}</p>
      }
    </div>
    <div class="flex flex-wrap items-center gap-2"><ng-content /></div>
  `,
})
export class AdmPageHead {
  readonly title = input.required<string>();
  readonly desc = input<string>();
}

/** Carte indicateur. */
@Component({
  selector: 'adm-stat',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'adm-card flex items-start gap-3 p-4' },
  template: `
    <span class="hidden h-9 w-9 flex-none items-center justify-center rounded-[10px] sm:inline-flex" [class]="tone()"><app-icon [name]="icon()" [size]="18" /></span>
    <span class="flex min-w-0 flex-col">
      <span class="text-[13px] text-subtle">{{ label() }}</span>
      <strong class="text-[22px] leading-tight font-extrabold text-ink tabular-nums">{{ value() }}</strong>
      @if (hint()) {
        <span class="text-[12.5px]" [class]="hintTone()">{{ hint() }}</span>
      }
    </span>
  `,
})
export class AdmStat {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly icon = input('chart');
  readonly tone = input('bg-tint text-blue');
  readonly hint = input<string>();
  readonly hintTone = input('text-subtle');
}

/** Panneau latéral d’édition (drawer). */
@Component({
  selector: 'adm-drawer',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'close.emit()' },
  template: `
    <div class="adm-scrim" (click)="close.emit()" aria-hidden="true"></div>
    <aside class="adm-drawer adm" role="dialog" aria-modal="true" [attr.aria-label]="title()">
      <header class="flex items-start justify-between gap-3 border-b border-[#e4eaf2] px-5 py-4">
        <div class="flex min-w-0 flex-col">
          <span class="text-[12.5px] text-subtle">{{ kicker() }}</span>
          <h2 class="m-0 text-[17px] leading-snug font-extrabold text-ink">{{ title() }}</h2>
        </div>
        <button type="button" class="adm-btn adm-btn-ghost !h-9 !w-9 !p-0" aria-label="Fermer" (click)="close.emit()"><app-icon name="x" [size]="18" /></button>
      </header>
      <div class="flex-1 overflow-y-auto px-5 py-4"><ng-content /></div>
      <footer class="flex flex-wrap items-center justify-end gap-2 border-t border-[#e4eaf2] bg-[#f7f9fc] px-5 py-3"><ng-content select="[actions]" /></footer>
    </aside>
  `,
})
export class AdmDrawer {
  readonly title = input.required<string>();
  readonly kicker = input('');
  readonly close = output<void>();
}

/** Pastille d’état normalisée. */
export function stateChip(s: string): string {
  switch (s) {
    case 'Publié':
    case 'Traité':
    case 'Payé':
    case 'Livré':
    case 'Envoyée':
    case 'Actif':
      return 'chip chip-ok';
    case 'En relecture':
    case 'En cours':
    case 'En attente':
    case 'En préparation':
    case 'Programmée':
    case 'Programmé':
      return 'chip chip-warn';
    case 'Nouveau':
    case 'Expédié':
      return 'chip chip-info';
    case 'Remboursé':
    case 'Archivé':
    case 'Brouillon':
    case 'Inactif':
      return 'chip chip-mute';
    default:
      return 'chip chip-mute';
  }
}
