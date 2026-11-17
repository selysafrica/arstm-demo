import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Icon } from '../../shared/icon';
import { AdminStore } from '../admin-store';
import { ContentStore } from '../../core/content-store';
import { AdmDrawer, AdmPageHead } from '../ui';

/** Offres de stage et d’emploi (EF-POR-02, ADM-07) — publiées dans le Centre de carrière. */
@Component({
  selector: 'adm-jobs',
  imports: [Icon, AdmPageHead, AdmDrawer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <adm-page-head title="Offres de stage et d’emploi" desc="Les offres en ligne apparaissent dans le Centre de carrière du site.">
      <button type="button" class="adm-btn adm-btn-primary" (click)="open()"><app-icon name="sparkle" [size]="16" />Nouvelle offre</button>
    </adm-page-head>
    <div class="adm-card overflow-x-auto">
      <table class="adm-table min-w-[760px]">
        <thead><tr><th>Offre</th><th>Structure</th><th>Lieu</th><th>Type</th><th>Publiée</th><th>En ligne</th><th class="text-right"></th></tr></thead>
        <tbody>
          @for (j of content.jobs(); track j.id) {
            <tr>
              <td><strong class="text-ink">{{ j.title }}</strong></td>
              <td class="text-text">{{ j.company }}</td>
              <td class="text-text">{{ j.place }}</td>
              <td><span class="chip" [class]="j.kind === 'Stage' ? 'chip-warn' : 'chip-info'">{{ j.kind }} · {{ j.type }}</span></td>
              <td class="text-subtle">{{ j.date }}</td>
              <td>
                <label class="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" role="switch" class="peer sr-only" [checked]="j.published" [attr.aria-label]="'Mettre en ligne ' + j.title" (change)="toggle(j.id)" />
                  <span class="h-5 w-9 rounded-full bg-[#cfd8e3] transition-colors peer-checked:bg-green"></span>
                  <span class="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4"></span>
                </label>
              </td>
              <td class="text-right"><button type="button" class="adm-btn adm-btn-danger !min-h-8 !px-2.5" (click)="remove(j.id, j.title)">Supprimer</button></td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    @if (draft(); as d) {
      <adm-drawer title="Nouvelle offre" kicker="Centre de carrière" (close)="draft.set(null)">
        <div class="flex flex-col gap-4">
          <label class="adm-label">Intitulé du poste<input class="adm-input" [value]="d.title" (input)="draft.set({ ...d, title: $any($event.target).value })" /></label>
          <label class="adm-label">Structure<input class="adm-input" [value]="d.company" (input)="draft.set({ ...d, company: $any($event.target).value })" /></label>
          <div class="grid gap-3 sm:grid-cols-3">
            <label class="adm-label">Lieu<input class="adm-input" [value]="d.place" (input)="draft.set({ ...d, place: $any($event.target).value })" /></label>
            <label class="adm-label">Nature<select class="adm-input" [value]="d.kind" (change)="draft.set({ ...d, kind: $any($event.target).value })"><option>Emploi</option><option>Stage</option></select></label>
            <label class="adm-label">Contrat / durée<input class="adm-input" [value]="d.type" (input)="draft.set({ ...d, type: $any($event.target).value })" /></label>
          </div>
          @if (error()) { <p class="m-0 rounded-lg bg-[#fef3f2] px-3 py-2 text-[13.5px] font-semibold text-[#b42318]" role="alert">{{ error() }}</p> }
        </div>
        <ng-container actions>
          <button type="button" class="adm-btn adm-btn-ghost" (click)="draft.set(null)">Annuler</button>
          <button type="button" class="adm-btn adm-btn-primary" (click)="save()">Publier l’offre</button>
        </ng-container>
      </adm-drawer>
    }
  `,
})
export default class AdmJobs {
  protected readonly store = inject(AdminStore);
  protected readonly content = inject(ContentStore);
  protected readonly draft = signal<{ title: string; company: string; place: string; kind: string; type: string } | null>(null);
  protected readonly error = signal('');
  protected open() {
    this.error.set('');
    this.draft.set({ title: '', company: '', place: 'Abidjan', kind: 'Stage', type: '6 mois' });
  }
  protected save() {
    const d = this.draft()!;
    if (!d.title.trim() || !d.company.trim()) return this.error.set('Intitulé et structure obligatoires.');
    this.content.jobs.update((l) => [{ ...d, id: Date.now(), date: 'Aujourd’hui', published: true }, ...l]);
    this.store.log('a publié l’offre', d.title);
    this.draft.set(null);
  }
  protected toggle(id: number) {
    this.content.jobs.update((l) => l.map((j) => (j.id === id ? { ...j, published: !j.published } : j)));
  }
  protected remove(id: number, title: string) {
    this.content.jobs.update((l) => l.filter((j) => j.id !== id));
    this.store.log('a supprimé l’offre', title);
  }
}
