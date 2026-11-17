import { ChangeDetectionStrategy, Component, ElementRef, computed, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../shared/icon';
import { PageHero } from '../../shared/ui';
import { DOCUMENTS, GALLERY, IMG, VIDEOS } from '../../data/site';

/** Médiathèque : photos, vidéos, publications, brochures, communiqués (EF-MED-01→05). */
@Component({
  selector: 'app-media',
  imports: [RouterLink, Icon, PageHero],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown)': 'onKey($event)' },
  template: `
    <app-page-hero title="Médiathèque" kicker="Photos · Vidéos · Documents" lead="Images du campus et des promotions, vidéos, webinaires, publications et documents à télécharger." [image]="img.campus" [crumbs]="[{ label: 'Actualités', path: '/actualites' }, { label: 'Médiathèque' }]" [compact]="true" />

    <nav aria-label="Sections de la médiathèque" class="container-x sticky top-[96px] z-[30] -mt-7">
      <ul class="panel m-0 flex list-none gap-1.5 overflow-x-auto p-2 [scrollbar-width:none]">
        @for (s of sections; track s.id) {
          <li class="flex-none">
            <a [routerLink]="[]" [fragment]="s.id" class="inline-flex min-h-[44px] items-center gap-2 rounded-full px-4 text-[14.5px] font-bold whitespace-nowrap text-ink no-underline hover:bg-tint"><app-icon [name]="s.icon" [size]="16" />{{ s.label }}</a>
          </li>
        }
      </ul>
    </nav>

    <section id="photos" class="container-x section-y relative z-[1] flex flex-col gap-6 pt-12">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <h2 class="h-section">Photos</h2>
        <div class="flex flex-wrap gap-1.5" role="group" aria-label="Filtrer les photos">
          @for (c of photoCats; track c) {
            <button type="button" class="min-h-[40px] cursor-pointer rounded-full border-[1.5px] px-3.5 font-[inherit] text-[14px] font-bold" [class]="photoCat() === c ? 'border-blue bg-blue text-white' : 'border-[#DCE4EF] bg-white text-ink'" [attr.aria-pressed]="photoCat() === c" (click)="photoCat.set(c)">{{ c }}</button>
          }
        </div>
      </div>
      <ul class="m-0 grid list-none auto-rows-[200px] grid-cols-[repeat(auto-fill,minmax(min(260px,100%),1fr))] gap-3 p-0">
        @for (g of photos(); track g.img; let i = $index) {
          <li [class]="i === 0 ? 'md:col-span-2 md:row-span-2' : ''">
            <button type="button" class="group relative block h-full w-full cursor-zoom-in overflow-hidden rounded-[18px] border-none p-0" (click)="openLightbox(i)" [attr.aria-label]="'Agrandir : ' + g.cap">
              <img [src]="g.img" [alt]="g.alt" class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" loading="lazy" />
              <span class="absolute bottom-3 left-3 rounded-lg bg-[rgba(15,23,42,.65)] px-2.5 py-1 text-[13.5px] text-white">{{ g.cap }}</span>
            </button>
          </li>
        }
      </ul>
    </section>

    <section id="videos" class="container-x section-y relative z-[1] flex flex-col gap-6">
      <h2 class="h-section">Vidéos et webinaires</h2>
      <div class="grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-4">
        @for (v of videos; track v.title) {
          <a routerLink="/institution/film" class="f-card group flex flex-col overflow-hidden rounded-[18px] bg-white text-ink no-underline">
            <span class="relative block">
              <img [src]="v.img" alt="" class="block aspect-video w-full object-cover" loading="lazy" />
              <span class="absolute inset-0 flex items-center justify-center bg-[rgba(14,24,62,.25)] transition-colors group-hover:bg-[rgba(14,24,62,.4)]">
                <span class="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-navy"><app-icon name="play" [size]="22" [stroke]="0" class="[&_path]:fill-current" /></span>
              </span>
              <span class="absolute right-3 bottom-3 rounded-md bg-[rgba(15,23,42,.75)] px-2 py-0.5 text-[13px] font-bold text-white">{{ v.duration }}</span>
            </span>
            <span class="flex flex-col gap-1 p-4"><span class="text-[13px] font-bold text-blue">{{ v.tag }}</span><strong>{{ v.title }}</strong></span>
          </a>
        }
      </div>
    </section>

    @for (block of docBlocks; track block.id) {
      <section [id]="block.id" class="container-x section-y relative z-[1] flex flex-col gap-5">
        <h2 class="h-section">{{ block.title }}</h2>
        <ul class="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(360px,100%),1fr))] gap-3 p-0">
          @for (d of docsOf(block.id); track d.title) {
            <li class="flex items-center gap-3.5 rounded-[16px] bg-white p-4 shadow-card">
              <span class="icon-tile bg-tint text-blue"><app-icon name="file" [size]="22" /></span>
              <span class="flex min-w-0 flex-1 flex-col">
                <strong class="leading-snug text-ink">{{ d.title }}</strong>
                <span class="text-[14px] text-subtle">{{ d.type }} · {{ d.size }}</span>
              </span>
              <a href="#" (click)="$event.preventDefault()" class="inline-flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-blue text-white hover:text-white" [attr.aria-label]="'Télécharger ' + d.title"><app-icon name="download" [size]="18" /></a>
            </li>
          }
        </ul>
      </section>
    }

    <!-- Lightbox -->
    <dialog #lb class="m-auto max-h-none w-[min(1100px,calc(100vw-24px))] max-w-none border-none bg-transparent p-0 backdrop:bg-[rgba(10,16,40,.88)]" aria-label="Visionneuse de photos" (click)="onLbClick($event)">
      @if (current(); as c) {
        <figure class="f-fade m-0 flex flex-col gap-3">
          <img [src]="c.img" [alt]="c.alt" class="block max-h-[78vh] w-full rounded-2xl object-contain" />
          <figcaption class="flex items-center justify-between gap-3 text-white">
            <span><strong>{{ c.cap }}</strong> <span class="text-hero-text">· {{ c.cat }} · {{ lbIdx() + 1 }}/{{ photos().length }}</span></span>
            <span class="flex gap-2">
              <button type="button" class="lb-btn" aria-label="Photo précédente" (click)="step(-1)"><app-icon name="chevron-left" /></button>
              <button type="button" class="lb-btn" aria-label="Photo suivante" (click)="step(1)"><app-icon name="chevron-right" /></button>
              <button type="button" class="lb-btn" aria-label="Fermer" (click)="lb.close()"><app-icon name="x" /></button>
            </span>
          </figcaption>
        </figure>
      }
    </dialog>
  `,
  styles: `
    .lb-btn {
      display: inline-flex;
      width: 44px;
      height: 44px;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      border: none;
      background: rgba(255, 255, 255, 0.16);
      color: #fff;
      cursor: pointer;
    }
    .lb-btn:hover {
      background: rgba(255, 255, 255, 0.28);
    }
  `,
})
export default class Media {
  protected readonly lb = viewChild.required<ElementRef<HTMLDialogElement>>('lb');
  protected readonly img = IMG;
  protected readonly videos = VIDEOS;
  protected readonly sections = [
    { id: 'photos', label: 'Photos', icon: 'sparkle' },
    { id: 'videos', label: 'Vidéos', icon: 'play' },
    { id: 'publications', label: 'Publications', icon: 'book' },
    { id: 'documents', label: 'Brochures et documents', icon: 'file' },
    { id: 'communiques', label: 'Communiqués', icon: 'bell' },
  ];
  protected readonly docBlocks = [
    { id: 'publications', title: 'Publications scientifiques et professionnelles' },
    { id: 'documents', title: 'Brochures et documents' },
    { id: 'communiques', title: 'Communiqués de presse' },
  ];
  protected readonly photoCats = ['Toutes', ...new Set(GALLERY.map((g) => g.cat))];
  protected readonly photoCat = signal('Toutes');
  protected readonly photos = computed(() => (this.photoCat() === 'Toutes' ? GALLERY : GALLERY.filter((g) => g.cat === this.photoCat())));
  protected readonly lbIdx = signal(0);
  protected readonly current = computed(() => this.photos()[this.lbIdx()]);

  protected docsOf(cat: string) {
    return DOCUMENTS.filter((d) => d.cat === cat);
  }
  protected openLightbox(i: number) {
    this.lbIdx.set(i);
    this.lb().nativeElement.showModal();
  }
  protected step(d: number) {
    const n = this.photos().length;
    this.lbIdx.update((i) => (i + d + n) % n);
  }
  protected onLbClick(e: MouseEvent) {
    if (e.target === this.lb().nativeElement) this.lb().nativeElement.close();
  }
  protected onKey(e: KeyboardEvent) {
    if (!this.lb().nativeElement.open) return;
    if (e.key === 'ArrowRight') this.step(1);
    if (e.key === 'ArrowLeft') this.step(-1);
  }
}
