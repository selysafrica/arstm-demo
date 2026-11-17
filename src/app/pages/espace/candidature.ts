import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../shared/icon';
import { StudentStore } from '../../core/student-store';

/** Suivi de candidature (EF-ADMS-03, EF-PAY-05). */
@Component({
  selector: 'app-espace-candidature',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let a = s.application();
    <div class="flex flex-col gap-5">
      <div class="box flex flex-col gap-1 p-6">
        <span class="text-[14px] text-subtle">{{ a.ref }} · déposée le {{ a.submitted }}</span>
        <h2 class="m-0 text-[22px] leading-snug font-extrabold text-ink">{{ a.title }}</h2>
        <div class="mt-3 flex items-center gap-3">
          <span class="h-2 flex-1 overflow-hidden rounded-full bg-tint-soft"><span class="block h-full rounded-full bg-blue transition-[width] duration-500" [style.width.%]="progress()"></span></span>
          <span class="text-[14px] font-bold text-navy">{{ progress() }} %</span>
        </div>
      </div>

      <div class="grid items-start gap-5 xl:grid-cols-[1fr_1fr]">
        <div class="box p-6">
          <h3 class="m-0 mb-4 text-[18px] font-extrabold text-ink">Avancement</h3>
          <ol class="m-0 flex list-none flex-col p-0">
            @for (st of a.steps; track st.label; let last = $last) {
              <li class="grid grid-cols-[28px_1fr] gap-3">
                <span class="flex flex-col items-center">
                  <span
                    class="inline-flex h-7 w-7 flex-none items-center justify-center rounded-full"
                    [class]="st.state === 'done' ? 'bg-green text-white' : st.state === 'current' ? 'bg-blue text-white ring-4 ring-tint' : 'border-2 border-line bg-white text-subtle'"
                  >
                    @if (st.state === 'done') { <app-icon name="tick" [size]="15" [stroke]="3" /> } @else if (st.state === 'current') { <span class="h-2 w-2 rounded-full bg-white"></span> }
                  </span>
                  @if (!last) { <span class="w-0.5 flex-1" [class]="st.state === 'done' ? 'bg-green' : 'bg-line'"></span> }
                </span>
                <span class="flex flex-col pb-5">
                  <strong class="text-[15.5px]" [class]="st.state === 'todo' ? 'text-subtle' : 'text-ink'">{{ st.label }}</strong>
                  <span class="text-[14px]" [class]="st.state === 'current' ? 'font-semibold text-blue' : 'text-subtle'">{{ st.date }}</span>
                </span>
              </li>
            }
          </ol>
        </div>

        <div class="box flex flex-col gap-3 p-6">
          <h3 class="m-0 text-[18px] font-extrabold text-ink">Pièces du dossier</h3>
          @for (p of a.pieces; track p.label) {
            <div class="flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3" [class]="p.ok ? 'border-line-soft' : 'border-orange bg-orange-soft/40'">
              <span class="icon-tile !h-9 !w-9 !rounded-[10px]" [class]="p.ok ? 'chip-ok' : 'chip-warn'"><app-icon [name]="p.ok ? 'tick' : 'alert'" [size]="16" /></span>
              <span class="flex-1 text-[15px] font-semibold text-ink">{{ p.label }}</span>
              @if (p.ok) {
                <span class="chip chip-ok">Reçue</span>
              } @else {
                <label class="f-btn cursor-pointer rounded-lg bg-blue px-3 py-2 text-[14px] text-white">
                  <app-icon name="upload" [size]="15" />Déposer
                  <input type="file" accept=".pdf,.jpg,.png" class="sr-only-x" (change)="upload(p.label, $event)" />
                </label>
              }
            </div>
          }
          @if (uploaded()) {
            <p role="status" class="f-pop m-0 rounded-xl bg-green-soft p-3 text-[14.5px] text-green-ink">« {{ uploaded() }} » a bien été déposé. La scolarité en est notifiée.</p>
          }
          <p class="m-0 text-[14px] text-subtle">PDF, JPG ou PNG, 5 Mo maximum.</p>
        </div>
      </div>

      <div class="box flex flex-wrap items-center justify-between gap-4 p-6">
        <div class="flex flex-col">
          <strong class="text-ink">Une question sur votre dossier ?</strong>
          <span class="text-[15px] text-muted">La scolarité vous répond sous 48 h ouvrées.</span>
        </div>
        <div class="flex flex-wrap gap-2">
          <a routerLink="/espace/messages" class="f-btn btn-primary !py-3">Écrire à la scolarité</a>
          <a routerLink="/admissions/candidater" class="f-btn btn-ghost !rounded-xl !py-3">Nouvelle candidature</a>
        </div>
      </div>
    </div>
  `,
})
export default class EspaceCandidature {
  protected readonly s = inject(StudentStore);
  protected readonly uploaded = signal('');
  protected readonly progress = computed(() => {
    const st = this.s.application().steps;
    const done = st.filter((x) => x.state === 'done').length + 0.5 * st.filter((x) => x.state === 'current').length;
    return Math.round((done / st.length) * 100);
  });
  protected upload(label: string, e: Event) {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) return;
    this.s.addPiece(label, f.name);
    this.uploaded.set(f.name);
  }
}
