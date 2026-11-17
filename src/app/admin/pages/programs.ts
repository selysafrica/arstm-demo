import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../shared/icon';
import { AdminStore } from '../admin-store';
import { AdmDrawer, AdmPageHead } from '../ui';
import { Program, SCHOOLS, schoolBySlug } from '../../data/site';

type AdmProgram = Program & { published: boolean; updated: string };

/** Catalogue des formations et sessions de formation continue (ADM-07). */
@Component({
  selector: 'adm-programs',
  imports: [RouterLink, Icon, AdmPageHead, AdmDrawer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <adm-page-head title="Formations et sessions" desc="Fiches du catalogue (EF-FOR-01) et sessions ouvertes à l’inscription en ligne (EF-PAY-01)." />

    <div class="flex flex-wrap items-center justify-between gap-3">
      <div role="tablist" class="adm-tabs" aria-label="Vue">
        <button type="button" role="tab" class="adm-tab" [attr.aria-selected]="tab() === 'cat'" (click)="tab.set('cat')">Catalogue ({{ store.programs().length }})</button>
        <button type="button" role="tab" class="adm-tab" [attr.aria-selected]="tab() === 'ses'" (click)="tab.set('ses')">Sessions ({{ store.sessions().length }})</button>
      </div>
      @if (tab() === 'cat') {
        <select class="adm-input !w-auto" aria-label="Filtrer par école" [value]="school()" (change)="school.set($any($event.target).value)">
          <option value="">Toutes les écoles</option>
          @for (s of schools; track s.slug) { <option [value]="s.slug">{{ s.code }}</option> }
        </select>
      }
    </div>

    @if (tab() === 'cat') {
      <div class="adm-card overflow-x-auto">
        <table class="adm-table min-w-[820px]">
          <thead><tr><th>Formation</th><th>École</th><th>Niveau</th><th>Type</th><th>Durée</th><th>En ligne</th><th class="text-right">Actions</th></tr></thead>
          <tbody>
            @for (p of programs(); track p.slug) {
              <tr>
                <td><strong class="text-ink">{{ p.title }}</strong><br /><span class="text-[12.5px] text-subtle">Mis à jour le {{ p.updated }}</span></td>
                <td>{{ code(p.school) }}</td>
                <td>{{ p.level }}</td>
                <td class="text-text">{{ p.type }}</td>
                <td class="text-text">{{ p.duration }}</td>
                <td>
                  <label class="relative inline-flex cursor-pointer items-center gap-2">
                    <input type="checkbox" role="switch" class="peer sr-only" [checked]="p.published" [attr.aria-label]="'Publier ' + p.title" (change)="togglePublish(p)" [disabled]="!store.rights().publish" />
                    <span class="h-5 w-9 rounded-full bg-[#cfd8e3] transition-colors peer-checked:bg-green peer-disabled:opacity-50"></span>
                    <span class="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4"></span>
                  </label>
                </td>
                <td class="text-right whitespace-nowrap">
                  <a [routerLink]="['/formations', p.school, p.slug]" target="_blank" class="adm-btn adm-btn-ghost !min-h-8 !px-2.5" aria-label="Voir la fiche publique"><app-icon name="external" [size]="15" /></a>
                  <button type="button" class="adm-btn adm-btn-ghost !min-h-8 !px-2.5" (click)="edit(p)">Modifier</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    } @else {
      <div class="adm-card overflow-x-auto">
        <table class="adm-table min-w-[860px]">
          <thead><tr><th>Session</th><th>Dates</th><th>Lieu</th><th class="text-right">Places</th><th class="text-right">Prix (FCFA)</th><th>Inscriptions</th></tr></thead>
          <tbody>
            @for (s of store.sessions(); track s.id) {
              <tr>
                <td><strong class="text-ink">{{ s.title }}</strong><br /><span class="text-[12.5px] text-subtle">{{ s.code }}</span></td>
                <td class="whitespace-nowrap text-text">{{ s.dates }}</td>
                <td class="text-text">{{ s.place }}</td>
                <td class="text-right">
                  <span class="inline-flex items-center gap-2">
                    <span class="h-1.5 w-16 overflow-hidden rounded-full bg-[#eef2f7]"><span class="block h-full rounded-full" [class]="s.seatsLeft === 0 ? 'bg-[#d92d20]' : s.seatsLeft <= 6 ? 'bg-orange' : 'bg-blue'" [style.width.%]="((s.seats - s.seatsLeft) / s.seats) * 100"></span></span>
                    <span class="tabular-nums">{{ s.seats - s.seatsLeft }}/</span>
                    <input type="number" min="1" class="adm-input !min-h-8 !w-16 text-right" [value]="s.seats" [attr.aria-label]="'Capacité ' + s.title" (change)="setSeats(s.id, +$any($event.target).value)" />
                  </span>
                </td>
                <td class="text-right"><input type="number" step="5000" class="adm-input !min-h-8 !w-28 text-right" [value]="s.price" [attr.aria-label]="'Prix ' + s.title" (change)="setPrice(s.id, +$any($event.target).value)" /></td>
                <td>
                  <button type="button" class="adm-btn !min-h-8 !px-2.5" [class]="s.open ? 'adm-btn-ghost' : 'adm-btn-primary'" (click)="toggleOpen(s.id)">{{ s.open ? 'Clôturer' : 'Rouvrir' }}</button>
                  <span class="ml-2" [class]="s.open ? 'chip chip-ok' : 'chip chip-mute'">{{ s.open ? 'Ouvertes' : 'Closes' }}</span>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }

    @if (draft(); as d) {
      <adm-drawer title="Modifier la fiche formation" [kicker]="code(d.school) + ' · ' + d.level" (close)="draft.set(null)">
        <div class="flex flex-col gap-4">
          <label class="adm-label">Intitulé<input class="adm-input" [value]="d.title" (input)="patch({ title: $any($event.target).value })" /></label>
          <div class="grid gap-3 sm:grid-cols-2">
            <label class="adm-label">Niveau<input class="adm-input" [value]="d.level" (input)="patch({ level: $any($event.target).value })" /></label>
            <label class="adm-label">Durée<input class="adm-input" [value]="d.duration" (input)="patch({ duration: $any($event.target).value })" /></label>
            <label class="adm-label">Rythme<input class="adm-input" [value]="d.rhythm" (input)="patch({ rhythm: $any($event.target).value })" /></label>
            <label class="adm-label">Domaine<input class="adm-input" [value]="d.domain" (input)="patch({ domain: $any($event.target).value })" /></label>
          </div>
          <label class="adm-label">Résumé<textarea rows="2" class="adm-input" [value]="d.summary" (input)="patch({ summary: $any($event.target).value })"></textarea></label>
          <label class="adm-label">Objectifs (un par ligne)<textarea rows="4" class="adm-input" [value]="d.objectives.join('\n')" (input)="patch({ objectives: lines($any($event.target).value) })"></textarea></label>
          <label class="adm-label">Conditions d’admission (une par ligne)<textarea rows="3" class="adm-input" [value]="d.admission.join('\n')" (input)="patch({ admission: lines($any($event.target).value) })"></textarea></label>
          <label class="adm-label">Débouchés (un par ligne)<textarea rows="3" class="adm-input" [value]="d.outcomes.join('\n')" (input)="patch({ outcomes: lines($any($event.target).value) })"></textarea></label>
          <label class="adm-label">Tarifs<input class="adm-input" [value]="d.fees" (input)="patch({ fees: $any($event.target).value })" /></label>
          <div class="flex items-center gap-3 rounded-lg border border-dashed border-[#d8e1ec] p-3">
            <app-icon name="file" class="text-blue" />
            <span class="flex-1 text-[13.5px]"><strong>Brochure PDF</strong><br /><span class="text-subtle">brochure-{{ d.slug }}.pdf · 1,4 Mo</span></span>
            <label class="adm-btn adm-btn-ghost cursor-pointer">Remplacer<input type="file" accept=".pdf" class="sr-only-x" /></label>
          </div>
        </div>
        <ng-container actions>
          <button type="button" class="adm-btn adm-btn-ghost" (click)="draft.set(null)">Annuler</button>
          <button type="button" class="adm-btn adm-btn-primary" (click)="save()">Enregistrer</button>
        </ng-container>
      </adm-drawer>
    }
  `,
})
export default class AdmPrograms {
  protected readonly store = inject(AdminStore);
  protected readonly schools = SCHOOLS;
  protected readonly tab = signal<'cat' | 'ses'>('cat');
  protected readonly school = signal('');
  protected readonly draft = signal<AdmProgram | null>(null);
  protected readonly programs = computed(() => this.store.programs().filter((p) => !this.school() || p.school === this.school()));

  protected code(s: string) {
    return schoolBySlug(s)?.code ?? '';
  }
  protected lines(v: string) {
    return v.split('\n').map((x) => x.trim()).filter(Boolean);
  }
  protected edit(p: AdmProgram) {
    this.draft.set(structuredClone(p));
  }
  protected patch(v: Partial<AdmProgram>) {
    this.draft.update((d) => (d ? { ...d, ...v } : d));
  }
  protected save() {
    const d = { ...this.draft()!, updated: '17 nov. 2026' };
    this.store.programs.update((l) => l.map((p) => (p.slug === d.slug ? d : p)));
    this.store.log('a modifié', `Formation « ${d.title} »`);
    this.draft.set(null);
  }
  protected togglePublish(p: AdmProgram) {
    this.store.programs.update((l) => l.map((x) => (x.slug === p.slug ? { ...x, published: !x.published } : x)));
    this.store.log(p.published ? 'a dépublié' : 'a publié', `Formation « ${p.title} »`);
  }
  protected setSeats(id: string, v: number) {
    this.store.sessions.update((l) => l.map((s) => (s.id === id ? { ...s, seatsLeft: Math.max(0, s.seatsLeft + (v - s.seats)), seats: v } : s)));
  }
  protected setPrice(id: string, v: number) {
    this.store.sessions.update((l) => l.map((s) => (s.id === id ? { ...s, price: v } : s)));
    this.store.log('a modifié le prix de', this.store.sessions().find((s) => s.id === id)!.title);
  }
  protected toggleOpen(id: string) {
    this.store.sessions.update((l) => l.map((s) => (s.id === id ? { ...s, open: !s.open } : s)));
  }
}
