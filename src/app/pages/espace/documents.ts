import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Icon } from '../../shared/icon';
import { StudentStore } from '../../core/student-store';

/** Documents de l’élève + demande de document administratif. */
@Component({
  selector: 'app-espace-documents',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-5">
      <div class="box flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <label class="flex min-h-[46px] flex-1 items-center gap-2 rounded-xl border border-line-soft bg-field px-3">
          <app-icon name="search" [size]="18" class="text-subtle" />
          <span class="sr-only-x">Rechercher un document</span>
          <input type="search" placeholder="Rechercher un document…" class="flex-1 border-none bg-transparent font-[inherit] text-[15px] outline-none" [value]="q()" (input)="q.set($any($event.target).value)" />
        </label>
        <div class="flex gap-1 overflow-x-auto [scrollbar-width:none]" role="group" aria-label="Filtrer par type">
          @for (k of kinds; track k) {
            <button type="button" class="min-h-[40px] flex-none cursor-pointer rounded-full border-none px-3.5 font-[inherit] text-[14px] font-bold" [class]="kind() === k ? 'bg-blue text-white' : 'bg-transparent text-ink hover:bg-tint'" [attr.aria-pressed]="kind() === k" (click)="kind.set(k)">{{ k }}</button>
          }
        </div>
      </div>

      <ul class="box m-0 flex list-none flex-col p-2">
        @for (d of list(); track d.id) {
          <li class="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-tint-soft">
            <span class="icon-tile !h-10 !w-10" [class]="d.kind === 'Pièce déposée' ? 'chip-ok' : d.kind === 'Paiement' ? 'chip-warn' : 'bg-tint text-blue'"><app-icon [name]="d.kind === 'Pièce déposée' ? 'upload' : 'file'" [size]="18" /></span>
            <span class="flex min-w-0 flex-1 flex-col">
              <span class="truncate text-[15px] font-semibold text-ink">{{ d.title }}</span>
              <span class="text-[13.5px] text-subtle">{{ d.kind }} · {{ d.date }} · {{ d.size }}</span>
            </span>
            @if (d.isNew) { <span class="chip chip-info">Nouveau</span> }
            <a href="#" (click)="$event.preventDefault()" class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-tint text-blue hover:bg-blue hover:text-white" [attr.aria-label]="'Télécharger ' + d.title"><app-icon name="download" [size]="18" /></a>
          </li>
        } @empty {
          <li class="p-8 text-center text-muted">Aucun document ne correspond.</li>
        }
      </ul>

      <form class="box flex flex-col gap-4 p-6" (submit)="request($event)">
        <h2 class="m-0 text-[18px] font-extrabold text-ink">Demander un document</h2>
        <div class="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label class="field">Document
            <select [value]="reqType()" (change)="reqType.set($any($event.target).value)">
              @for (t of reqTypes; track t) { <option [value]="t">{{ t }}</option> }
            </select>
          </label>
          <label class="field">Exemplaires<select><option>1</option><option>2</option><option>3</option></select></label>
          <button type="submit" class="f-btn btn-primary !py-3">Envoyer la demande</button>
        </div>
        @if (requested()) {
          <p role="status" class="f-pop m-0 rounded-xl bg-green-soft p-3 text-[14.5px] text-green-ink">Demande « {{ requested() }} » transmise à la scolarité. Délai habituel : 48 h ouvrées.</p>
        }
      </form>
    </div>
  `,
})
export default class EspaceDocuments {
  protected readonly s = inject(StudentStore);
  protected readonly kinds = ['Tous', 'Administratif', 'Scolarité', 'Paiement', 'Pièce déposée'];
  protected readonly kind = signal('Tous');
  protected readonly q = signal('');
  protected readonly reqTypes = ['Certificat de scolarité', 'Attestation de réussite', 'Relevé de notes certifié', 'Attestation d’hébergement', 'Duplicata de carte d’élève'];
  protected readonly reqType = signal(this.reqTypes[0]);
  protected readonly requested = signal('');
  protected readonly list = computed(() => {
    const q = this.q().trim().toLowerCase();
    return this.s.documents().filter((d) => (this.kind() === 'Tous' || d.kind === this.kind()) && (!q || d.title.toLowerCase().includes(q)));
  });
  protected request(e: Event) {
    e.preventDefault();
    this.requested.set(this.reqType());
  }
}
