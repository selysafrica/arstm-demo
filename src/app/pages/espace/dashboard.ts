import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Icon } from '../../shared/icon';
import { StudentStore } from '../../core/student-store';
import { fcfa } from './layout';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

export const hhmm = (h: number) => `${Math.floor(h)} h ${String(Math.round((h % 1) * 60)).padStart(2, '0')}`;

@Component({
  selector: 'app-espace-dashboard',
  imports: [RouterLink, Icon, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-5">
      <!-- À faire -->
      @if (todo().length) {
        <div class="box flex flex-col gap-2 p-5">
          <strong class="text-[17px] text-ink">À faire</strong>
          <ul class="m-0 flex list-none flex-col gap-2 p-0">
            @for (t of todo(); track t.text) {
              <li>
                <a [routerLink]="t.path" class="flex items-center gap-3 rounded-xl border border-line-soft px-4 py-3 text-ink no-underline transition-colors hover:border-line hover:bg-tint-soft">
                  <span class="icon-tile !h-9 !w-9 !rounded-[10px]" [class]="t.cls"><app-icon [name]="t.icon" [size]="17" /></span>
                  <span class="flex-1 text-[15px] font-semibold">{{ t.text }}</span>
                  <app-icon name="chevron-right" [size]="18" class="text-subtle" />
                </a>
              </li>
            }
          </ul>
        </div>
      }

      <!-- Indicateurs -->
      <div class="grid grid-cols-[repeat(auto-fit,minmax(min(190px,100%),1fr))] gap-3">
        <a routerLink="/espace/scolarite" class="box f-card flex flex-col gap-1 p-5 no-underline">
          <span class="text-[14px] text-muted">Moyenne semestre 3</span>
          <strong class="text-[28px] leading-none font-black text-ink">{{ s.average() | number: '1.2-2' : 'fr' }}<span class="text-[16px] text-subtle"> /20</span></strong>
          <span class="chip mt-1 self-start" [class]="failed() ? 'chip-warn' : 'chip-ok'">{{ failed() ? failed() + ' module en rattrapage' : 'Semestre validé' }}</span>
        </a>
        <a routerLink="/espace/paiements" class="box f-card flex flex-col gap-1 p-5 no-underline">
          <span class="text-[14px] text-muted">Reste à payer</span>
          <strong class="text-[24px] leading-tight font-black text-ink">{{ money(s.toPayTotal()) }}</strong>
          <span class="chip mt-1 self-start" [class]="s.toPay().length ? 'chip-warn' : 'chip-ok'">{{ s.toPay().length ? s.toPay().length + ' facture(s)' : 'À jour' }}</span>
        </a>
        <a routerLink="/espace/candidature" class="box f-card flex flex-col gap-1 p-5 no-underline">
          <span class="text-[14px] text-muted">Candidature Master</span>
          <strong class="text-[24px] leading-tight font-black text-ink">Étape {{ appStep() }}/5</strong>
          <span class="chip chip-info mt-1 self-start">En cours d’examen</span>
        </a>
        <a routerLink="/espace/messages" class="box f-card flex flex-col gap-1 p-5 no-underline">
          <span class="text-[14px] text-muted">Messages</span>
          <strong class="text-[28px] leading-none font-black text-ink">{{ s.unread() }}</strong>
          <span class="chip mt-1 self-start" [class]="s.unread() ? 'chip-warn' : 'chip-mute'">non lu{{ s.unread() > 1 ? 's' : '' }}</span>
        </a>
      </div>

      <div class="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <!-- Aujourd’hui -->
        <div class="box flex flex-col gap-3 p-5">
          <div class="flex items-center justify-between gap-2">
            <strong class="text-[17px] text-ink">Cours de {{ dayName }}</strong>
            <a routerLink="/espace/scolarite" class="text-[14.5px] font-bold no-underline">Emploi du temps →</a>
          </div>
          <ol class="m-0 flex list-none flex-col gap-2 p-0">
            @for (c of today(); track c.title + c.start) {
              <li class="grid grid-cols-[86px_1fr] items-center gap-3 rounded-xl bg-field px-3 py-2.5">
                <span class="text-[14px] font-bold text-navy">{{ hhmm(c.start) }}<br /><span class="font-normal text-subtle">{{ hhmm(c.end) }}</span></span>
                <span class="flex flex-col">
                  <strong class="text-[15px] text-ink">{{ c.title }}</strong>
                  <span class="text-[13.5px] text-subtle">{{ c.room }} · {{ c.teacher }}</span>
                </span>
              </li>
            }
          </ol>
        </div>

        <!-- Documents récents -->
        <div class="box flex flex-col gap-3 p-5">
          <div class="flex items-center justify-between gap-2">
            <strong class="text-[17px] text-ink">Documents récents</strong>
            <a routerLink="/espace/documents" class="text-[14.5px] font-bold no-underline">Tout voir →</a>
          </div>
          @for (d of recentDocs(); track d.id) {
            <a href="#" (click)="$event.preventDefault()" class="flex items-center gap-3 rounded-xl p-2 text-ink no-underline hover:bg-tint-soft">
              <span class="icon-tile !h-10 !w-10 bg-tint text-blue"><app-icon name="file" [size]="18" /></span>
              <span class="flex min-w-0 flex-1 flex-col">
                <span class="truncate text-[15px] font-semibold">{{ d.title }}</span>
                <span class="text-[13px] text-subtle">{{ d.date }}</span>
              </span>
              @if (d.isNew) {
                <span class="chip chip-info">Nouveau</span>
              }
              <app-icon name="download" [size]="18" class="text-blue" />
            </a>
          }
        </div>
      </div>

      <!-- Raccourcis -->
      <div class="grid grid-cols-[repeat(auto-fit,minmax(min(200px,100%),1fr))] gap-3">
        @for (q of quick; track q.label) {
          <a [routerLink]="q.path" [fragment]="q.fragment" class="box f-card flex items-center gap-3 p-4 text-ink no-underline">
            <span class="icon-tile !h-10 !w-10 bg-tint-soft text-blue"><app-icon [name]="q.icon" [size]="18" /></span>
            <span class="text-[15px] font-semibold">{{ q.label }}</span>
          </a>
        }
      </div>
    </div>
  `,
})
export default class EspaceDashboard {
  protected readonly s = inject(StudentStore);
  protected readonly hhmm = hhmm;
  protected readonly money = fcfa;
  // Démo : on affiche le lundi
  protected readonly dayName = 'lundi';
  protected readonly today = computed(() => this.s.timetable().filter((t) => t.day === 0));
  protected readonly failed = computed(() => this.s.grades().filter((g) => this.s.moduleAvg(g) < 10).length);
  protected readonly recentDocs = computed(() => this.s.documents().slice(0, 4));
  protected readonly appStep = computed(() => this.s.application().steps.findIndex((x) => x.state === 'current') + 1);
  protected readonly todo = computed(() => {
    const out: { text: string; path: string; icon: string; cls: string }[] = [];
    for (const i of this.s.toPay())
      out.push({ text: `${i.status === 'En retard' ? 'En retard : ' : ''}${i.label} — ${fcfa(i.amount)}`, path: '/espace/paiements', icon: 'coin', cls: i.status === 'En retard' ? 'chip-bad' : 'chip-warn' });
    for (const p of this.s.application().pieces.filter((x) => !x.ok))
      out.push({ text: `Pièce manquante pour votre candidature : ${p.label}`, path: '/espace/candidature', icon: 'upload', cls: 'chip-warn' });
    const late = this.s.loans().find((l) => !l.renewed);
    if (late) out.push({ text: `Ouvrage à rendre avant le ${late.due}`, path: '/espace/bibliotheque', icon: 'book', cls: 'chip-info' });
    return out;
  });
  protected readonly quick = [
    { label: 'Sessions STCW', path: '/formation-continue', fragment: 'sessions', icon: 'anchor' },
    { label: 'Offres de stage', path: '/carrieres', fragment: undefined, icon: 'briefcase' },
    { label: 'Calendrier pédagogique', path: '/admissions', fragment: 'calendrier', icon: 'calendar' },
    { label: 'Plateforme FOAD', path: '/formations/foad', fragment: undefined, icon: 'monitor' },
  ];
  protected readonly days = DAYS;
}
