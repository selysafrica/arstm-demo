import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from './icon';
import { toneOf } from './ui';
import { Program, schoolBySlug } from '../data/site';

/** Carte formation — catalogue et pages école. */
@Component({
  selector: 'app-program-card',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block h-full' },
  template: `
    @let p = program();
    <a
      [routerLink]="['/formations', p.school, p.slug]"
      class="tone-card flex h-full flex-col rounded-[20px] border border-line-soft bg-white text-ink no-underline shadow-card"
      [style.--tone]="tone().line"
      [style.--tone-soft]="tone().soft"
      [style.--tone-ink]="tone().ink"
    >
      <!-- École -->
      <span class="flex items-center gap-3 px-6 pt-6">
        <span class="tone-mono">{{ school()?.code }}</span>
        <span class="min-w-0 flex-1 text-[14px] leading-snug font-semibold text-muted">{{ school()?.name }}</span>
      </span>

      <!-- Intitulé -->
      <span class="flex flex-1 flex-col gap-2.5 px-6 pt-5 pb-5">
        <span class="flex flex-wrap items-center gap-1.5 text-[13px]">
          <span class="rounded-md bg-(--tone-soft) px-2 py-0.5 font-bold text-(--tone-ink)">{{ p.level }}</span>
          <span class="inline-flex items-center gap-1 rounded-md bg-field px-2 py-0.5 font-semibold text-muted">
            <app-icon [name]="typeIcon()" [size]="13" />{{ typeShort() }}
          </span>
          <span class="px-1 text-subtle">· {{ p.domain }}</span>
        </span>
        <strong class="text-[20px] leading-[1.25] font-extrabold text-ink">{{ shortTitle() }}</strong>
        <p class="m-0 line-clamp-3 text-[15.5px] leading-relaxed text-muted">{{ p.summary }}</p>
      </span>

      <!-- Pied -->
      <span class="mt-auto flex items-center justify-between gap-3 border-t border-line-soft px-6 py-4">
        <span class="flex min-w-0 items-center gap-2 text-[14.5px] text-text">
          <app-icon name="clock" [size]="16" class="flex-none text-subtle" />
          <span class="truncate">{{ p.duration }}</span>
        </span>
        <span class="flex flex-none items-center gap-2 text-[14.5px] font-bold text-blue">
          <span class="max-sm:sr-only">Voir la fiche</span>
          <span class="tone-arrow"><app-icon name="arrow-right" [size]="16" [stroke]="2.4" /></span>
        </span>
      </span>
    </a>
  `,
})
export class ProgramCard {
  readonly program = input.required<Program>();
  protected readonly school = computed(() => schoolBySlug(this.program().school));
  protected readonly tone = computed(() => toneOf(this.school()?.tone ?? 'blue'));
  /** Le niveau est affiché à part : « Licence — Officier mécanicien » → « Officier mécanicien » */
  protected readonly shortTitle = computed(() => {
    const t = this.program().title;
    const i = t.indexOf(' — ');
    return i > 0 ? t.slice(i + 3) : t;
  });
  protected readonly typeIcon = computed(() => {
    const t = this.program().type;
    return t === 'Formation initiale' ? 'cap' : t === 'Formation continue' ? 'anchor' : 'monitor';
  });
  protected readonly typeShort = computed(() => {
    const t = this.program().type;
    return t === 'Formation initiale' ? 'Initiale' : t === 'Formation continue' ? 'Continue' : 'À distance';
  });
}
