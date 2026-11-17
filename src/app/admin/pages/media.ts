import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Icon } from '../../shared/icon';
import { AdminStore, MediaAsset } from '../admin-store';
import { AdmDrawer, AdmPageHead } from '../ui';

type Asset = MediaAsset;

/** Bibliothèque de ressources avec optimisation automatique des images (ADM-05). */
@Component({
  selector: 'adm-media',
  imports: [Icon, AdmPageHead, AdmDrawer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <adm-page-head title="Médiathèque" desc="Images, documents et vidéos. Les images sont redimensionnées et converties en WebP à l’import.">
      <label class="adm-btn adm-btn-primary cursor-pointer"><app-icon name="upload" [size]="16" />Importer<input type="file" multiple accept="image/*,.pdf" class="sr-only-x" (change)="upload($event)" /></label>
    </adm-page-head>

    <div class="flex flex-wrap items-center justify-between gap-3">
      <div role="tablist" class="adm-tabs" aria-label="Type de fichier">
        @for (k of kinds; track k) {
          <button type="button" role="tab" class="adm-tab" [attr.aria-selected]="kind() === k" (click)="kind.set(k)">{{ k }} ({{ count(k) }})</button>
        }
      </div>
      <input class="adm-input !w-[240px]" placeholder="Rechercher un fichier…" aria-label="Rechercher un fichier" [value]="q()" (input)="q.set($any($event.target).value)" />
    </div>

    @if (importing()) {
      <div class="adm-card flex items-center gap-3 p-4 text-[14px]" role="status">
        <span class="h-5 w-5 animate-spin rounded-full border-[3px] border-tint border-t-blue"></span>Optimisation de {{ importing() }} fichier(s) : redimensionnement, conversion WebP, miniatures…
      </div>
    }

    <ul class="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3 p-0">
      @for (a of list(); track a.id) {
        <li>
          <button type="button" class="adm-card group flex w-full cursor-pointer flex-col overflow-hidden p-0 text-left font-[inherit] transition-colors hover:border-blue" (click)="sel.set(a)">
            <span class="relative flex aspect-[4/3] w-full items-center justify-center bg-[#f3f6fa]">
              @if (a.kind === 'Image' && a.src) {
                <img [src]="a.src" [alt]="a.alt" class="h-full w-full object-cover" loading="lazy" />
              } @else {
                <app-icon [name]="a.kind === 'Vidéo' ? 'youtube' : 'file'" [size]="36" class="text-blue" />
              }
              @if (a.kind === 'Image' && !a.alt) { <span class="absolute top-2 left-2 chip chip-bad">Alt manquant</span> }
            </span>
            <span class="flex flex-col gap-0.5 p-2.5">
              <strong class="truncate text-[13px] text-ink">{{ a.name }}</strong>
              <span class="text-[12px] text-subtle">{{ a.kind }} · {{ a.size }} · {{ a.dims }}</span>
            </span>
          </button>
        </li>
      }
    </ul>

    @if (sel(); as a) {
      <adm-drawer [title]="a.name" [kicker]="a.kind + ' · ' + a.folder" (close)="sel.set(null)">
        <div class="flex flex-col gap-4">
          @if (a.kind === 'Image' && a.src) {
            <img [src]="a.src" [alt]="a.alt" class="block w-full rounded-lg" />
          }
          <dl class="m-0 grid grid-cols-2 gap-3 text-[13.5px]">
            <div><dt class="text-subtle">Poids</dt><dd class="m-0 font-semibold">{{ a.size }}</dd></div>
            <div><dt class="text-subtle">Dimensions</dt><dd class="m-0 font-semibold">{{ a.dims }}</dd></div>
            <div><dt class="text-subtle">Utilisé dans</dt><dd class="m-0 font-semibold">{{ a.used }} page(s)</dd></div>
            <div><dt class="text-subtle">Optimisation</dt><dd class="m-0"><span [class]="a.optimized ? 'chip chip-ok' : 'chip chip-warn'">{{ a.optimized ? 'WebP + miniatures' : 'À optimiser' }}</span></dd></div>
          </dl>
          @if (a.kind === 'Image') {
            <label class="adm-label">Texte alternatif (SEO-01, accessibilité)<textarea rows="2" class="adm-input" [value]="a.alt" (input)="altDraft.set($any($event.target).value)"></textarea></label>
          }
          <label class="adm-label">URL publique<input class="adm-input font-mono text-[12.5px]" readonly [value]="'https://www.arstm.net/medias/' + a.name" /></label>
        </div>
        <ng-container actions>
          <button type="button" class="adm-btn adm-btn-danger mr-auto" [disabled]="a.used > 0" [title]="a.used > 0 ? 'Fichier utilisé : retirez-le des pages avant suppression' : ''" (click)="remove(a)">Supprimer</button>
          @if (!a.optimized) { <button type="button" class="adm-btn adm-btn-ghost" (click)="optimize(a)">Optimiser</button> }
          <button type="button" class="adm-btn adm-btn-primary" (click)="saveAlt(a)">Enregistrer</button>
        </ng-container>
      </adm-drawer>
    }
  `,
})
export default class AdmMedia {
  protected readonly store = inject(AdminStore);
  protected readonly kinds = ['Tous', 'Image', 'Document', 'Vidéo'];
  protected readonly kind = signal('Tous');
  protected readonly q = signal('');
  protected readonly sel = signal<Asset | null>(null);
  protected readonly altDraft = signal<string | null>(null);
  protected readonly importing = signal(0);
  protected readonly list = computed(() => {
    const q = this.q().trim().toLowerCase();
    return this.store.media().filter((a) => (this.kind() === 'Tous' || a.kind === this.kind()) && (!q || a.name.toLowerCase().includes(q)));
  });
  protected count(k: string) {
    return k === 'Tous' ? this.store.media().length : this.store.media().filter((a) => a.kind === k).length;
  }
  protected upload(e: Event) {
    const files = Array.from((e.target as HTMLInputElement).files ?? []);
    if (!files.length) return;
    this.importing.set(files.length);
    setTimeout(() => {
      const added = files.map((f, i) => {
        const isImg = f.type.startsWith('image/');
        return {
          id: 'up' + Date.now() + i,
          name: isImg ? f.name.replace(/\.[^.]+$/, '') + '.webp' : f.name,
          kind: (isImg ? 'Image' : 'Document') as 'Image' | 'Document',
          src: isImg ? URL.createObjectURL(f) : '',
          alt: '',
          size: `${Math.max(12, Math.round((f.size / 1024) * (isImg ? 0.35 : 1)))} Ko`,
          dims: isImg ? '1600 × 1000 (redimensionnée)' : 'PDF',
          used: 0,
          folder: 'Imports',
          optimized: true,
        };
      });
      this.store.media.update((l) => [...added, ...l]);
      this.store.log('a importé', `${files.length} fichier(s) dans la médiathèque`);
      this.importing.set(0);
    }, 900);
  }
  protected saveAlt(a: Asset) {
    const alt = this.altDraft();
    if (alt !== null) {
      this.store.media.update((l) => l.map((x) => (x.id === a.id ? { ...x, alt } : x)));
      this.store.log('a renseigné le texte alternatif de', a.name);
    }
    this.altDraft.set(null);
    this.sel.set(null);
  }
  protected optimize(a: Asset) {
    this.store.media.update((l) => l.map((x) => (x.id === a.id ? { ...x, optimized: true, size: '38 Ko' } : x)));
    this.sel.set({ ...a, optimized: true, size: '38 Ko' });
  }
  protected remove(a: Asset) {
    this.store.media.update((l) => l.filter((x) => x.id !== a.id));
    this.store.log('a supprimé', a.name);
    this.sel.set(null);
  }
}
