import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Icon } from '../../shared/icon';
import { Slot, StudentStore } from '../../core/student-store';
import { hhmm } from './dashboard';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
const KIND_CLS: Record<Slot['kind'], string> = {
  Cours: 'bg-tint text-navy border-blue',
  Simulateur: 'bg-teal-soft text-teal-ink border-teal',
  TP: 'bg-orange-soft text-orange-ink border-orange',
  Sport: 'bg-green-soft text-green-ink border-green',
};

/** Scolarité : emploi du temps, notes, examens. */
@Component({
  selector: 'app-espace-scolarite',
  imports: [Icon, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-5">
      <div role="tablist" aria-label="Scolarité" class="box flex gap-1 self-start p-1.5">
        @for (t of tabs; track t.key) {
          <button type="button" role="tab" [attr.aria-selected]="tab() === t.key" (click)="tab.set(t.key)" class="min-h-[40px] cursor-pointer rounded-xl border-none px-4 font-[inherit] text-[15px] font-bold transition-colors" [class]="tab() === t.key ? 'bg-blue text-white' : 'bg-transparent text-ink hover:bg-tint'">{{ t.label }}</button>
        }
      </div>

      @switch (tab()) {
        @case ('edt') {
          <div class="box overflow-x-auto p-5">
            <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
              <strong class="text-[17px] text-ink">Semaine du 17 au 21 novembre 2026</strong>
              <div class="flex flex-wrap gap-2 text-[13px]">
                @for (k of kinds; track k) { <span class="chip border-l-0" [class]="kindCls(k)">{{ k }}</span> }
              </div>
            </div>
            <div class="grid min-w-[760px] grid-cols-[52px_repeat(5,1fr)] gap-x-2">
              <span></span>
              @for (d of days; track d; let i = $index) {
                <span class="pb-2 text-center text-[14px] font-bold" [class]="i === 0 ? 'text-blue' : 'text-ink'">{{ d }}</span>
              }
              <div class="relative" [style.height.px]="hours.length * 56">
                @for (h of hours; track h; let i = $index) {
                  <span class="absolute right-1 text-[12.5px] text-subtle" [style.top.px]="i * 56 - 8">{{ h }} h</span>
                }
              </div>
              @for (d of days; track d; let di = $index) {
                <div class="relative rounded-xl bg-field" [style.height.px]="hours.length * 56">
                  @for (h of hours; track h; let i = $index) {
                    <span class="absolute inset-x-0 border-t border-line-soft" [style.top.px]="i * 56"></span>
                  }
                  @for (c of byDay(di); track c.title + c.start) {
                    <div class="absolute inset-x-1 flex flex-col overflow-hidden rounded-lg border-l-[3px] px-2 py-1.5 text-[12.5px] leading-tight" [class]="kindCls(c.kind)" [style.top.px]="(c.start - 8) * 56 + 2" [style.height.px]="(c.end - c.start) * 56 - 4" [title]="c.title + ' — ' + c.room">
                      <strong class="text-[13px]">{{ c.title }}</strong>
                      <span>{{ hhmm(c.start) }}–{{ hhmm(c.end) }}</span>
                      <span class="opacity-80">{{ c.room }}</span>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        }
        @case ('notes') {
          <div class="grid grid-cols-[repeat(auto-fit,minmax(min(200px,100%),1fr))] gap-3">
            <div class="box p-5"><span class="text-[14px] text-muted">Moyenne générale</span><br /><strong class="text-[28px] font-black text-ink">{{ s.average() | number: '1.2-2' : 'fr' }}</strong><span class="text-subtle"> /20</span></div>
            <div class="box p-5"><span class="text-[14px] text-muted">Crédits acquis</span><br /><strong class="text-[28px] font-black text-ink">{{ credits().ok }}</strong><span class="text-subtle"> / {{ credits().total }} ECTS</span></div>
            <div class="box p-5"><span class="text-[14px] text-muted">Rattrapage</span><br /><strong class="text-[28px] font-black text-orange-ink">{{ failed().length }}</strong><span class="text-subtle"> module(s)</span></div>
          </div>
          <div class="box overflow-x-auto">
            <table class="w-full min-w-[640px] border-collapse text-left text-[15px]">
              <caption class="px-5 pt-5 pb-3 text-left text-[17px] font-extrabold text-ink">Semestre 3 — relevé provisoire</caption>
              <thead>
                <tr class="border-y border-line-soft bg-field text-[13px] text-muted">
                  <th scope="col" class="px-5 py-3 font-semibold">Module</th>
                  <th scope="col" class="px-3 py-3 text-right font-semibold">Coef.</th>
                  <th scope="col" class="px-3 py-3 text-right font-semibold">Contrôle continu</th>
                  <th scope="col" class="px-3 py-3 text-right font-semibold">Examen</th>
                  <th scope="col" class="px-3 py-3 text-right font-semibold">Moyenne</th>
                  <th scope="col" class="px-5 py-3 font-semibold">Résultat</th>
                </tr>
              </thead>
              <tbody>
                @for (g of s.grades(); track g.module; let i = $index) {
                  @if (i === 0 || s.grades()[i - 1].ue !== g.ue) {
                    <tr><th colspan="6" scope="rowgroup" class="bg-tint-soft/60 px-5 py-2 text-[13px] font-bold text-navy">{{ g.ue }}</th></tr>
                  }
                  <tr class="border-b border-line-soft">
                    <th scope="row" class="px-5 py-3 font-semibold text-ink">{{ g.module }}</th>
                    <td class="px-3 py-3 text-right text-muted">{{ g.coef }}</td>
                    <td class="px-3 py-3 text-right tabular-nums">{{ g.cc | number: '1.1-2' : 'fr' }}</td>
                    <td class="px-3 py-3 text-right tabular-nums">{{ g.exam | number: '1.1-2' : 'fr' }}</td>
                    <td class="px-3 py-3 text-right font-bold tabular-nums" [class]="s.moduleAvg(g) < 10 ? 'text-[#B42318]' : 'text-ink'">{{ s.moduleAvg(g) | number: '1.2-2' : 'fr' }}</td>
                    <td class="px-5 py-3"><span class="chip" [class]="s.moduleAvg(g) >= 10 ? 'chip-ok' : 'chip-bad'">{{ s.moduleAvg(g) >= 10 ? 'Validé · ' + g.credits + ' ECTS' : 'Rattrapage' }}</span></td>
                  </tr>
                }
              </tbody>
            </table>
            <p class="m-0 flex items-center gap-2 px-5 py-4 text-[14px] text-subtle"><app-icon name="info" [size]="16" />Moyenne de module = 40 % contrôle continu + 60 % examen. Relevé définitif après délibération du jury.</p>
          </div>
        }
        @case ('examens') {
          <div class="box flex flex-col gap-2 p-5">
            <strong class="mb-2 text-[17px] text-ink">Calendrier des examens</strong>
            @for (e of exams; track e.title) {
              <div class="flex flex-wrap items-center gap-4 rounded-xl border border-line-soft px-4 py-3">
                <span class="flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-tint text-navy leading-none"><strong class="text-[20px]">{{ e.day }}</strong><span class="text-[12px] font-bold">{{ e.month }}</span></span>
                <span class="flex flex-1 flex-col"><strong class="text-ink">{{ e.title }}</strong><span class="text-[14px] text-subtle">{{ e.time }} · {{ e.room }}</span></span>
                <span class="chip" [class]="e.kind === 'Rattrapage' ? 'chip-bad' : 'chip-info'">{{ e.kind }}</span>
              </div>
            }
          </div>
        }
      }
    </div>
  `,
})
export default class EspaceScolarite {
  protected readonly s = inject(StudentStore);
  protected readonly hhmm = hhmm;
  protected readonly days = DAYS;
  protected readonly hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
  protected readonly kinds = Object.keys(KIND_CLS) as Slot['kind'][];
  protected readonly tabs = [
    { key: 'edt', label: 'Emploi du temps' },
    { key: 'notes', label: 'Notes' },
    { key: 'examens', label: 'Examens' },
  ];
  protected readonly tab = signal('edt');
  protected readonly failed = computed(() => this.s.grades().filter((g) => this.s.moduleAvg(g) < 10));
  protected readonly credits = computed(() => ({
    total: this.s.grades().reduce((t, g) => t + g.credits, 0),
    ok: this.s.grades().filter((g) => this.s.moduleAvg(g) >= 10).reduce((t, g) => t + g.credits, 0),
  }));
  protected readonly exams = [
    { day: '24', month: 'nov.', title: 'Stabilité du navire', time: '8 h – 11 h', room: 'Amphi B', kind: 'Rattrapage' },
    { day: '19', month: 'janv.', title: 'Navigation astronomique', time: '8 h – 11 h', room: 'Salle N2', kind: 'Semestre 4' },
    { day: '21', month: 'janv.', title: 'Simulateur — épreuve pratique', time: 'Créneau individuel', room: 'Simulateur full-mission', kind: 'Semestre 4' },
    { day: '23', month: 'janv.', title: 'Anglais maritime (oral SMCP)', time: '14 h – 17 h', room: 'Labo de langues', kind: 'Semestre 4' },
  ];
  protected byDay(d: number) {
    return this.s.timetable().filter((t) => t.day === d);
  }
  protected kindCls(k: Slot['kind']) {
    return KIND_CLS[k];
  }
}
