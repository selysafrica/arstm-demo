import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, computed, inject, signal, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Icon } from '../../shared/icon';
import { Faq, ResourceCard, SectionHead, toneOf } from '../../shared/ui';
import { ContactForm } from '../../shared/contact-form';
import { TPipe } from '../../core/i18n';
import { ContentStore } from '../../core/content-store';
import {
  ADMISSION_RESOURCES,
  FAQ,
  IMG,
  QUICK_CHIPS,
  SCHOOLS,
  TONES,
  USEFUL_CONTACTS,
} from '../../data/site';

@Component({
  selector: 'app-home',
  imports: [RouterLink, Icon, SectionHead, ResourceCard, Faq, ContactForm, TPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.html',
})
export default class Home {
  private readonly router = inject(Router);
  protected readonly img = IMG;
  protected readonly chips = QUICK_CHIPS;
  protected readonly contacts = USEFUL_CONTACTS;
  protected readonly schools = SCHOOLS;
  protected readonly resources = ADMISSION_RESOURCES;
  private readonly content = inject(ContentStore);
  protected readonly news = computed(() => this.content.publishedNews().slice(0, 3));
  protected readonly events = computed(() => this.content.events().slice(0, 3));
  protected readonly faq = FAQ.slice(0, 4);
  protected readonly tones = TONES;
  protected readonly toneOf = toneOf;

  protected readonly photos = [
    { img: IMG.campus, alt: 'Participants devant le bâtiment à arcades de l’ARSTM', cap: 'Campus de Yopougon' },
    { img: IMG.salut, alt: 'Élèves officiers et drapeaux sur la place d’armes', cap: 'Salut aux couleurs' },
    { img: IMG.douala, alt: 'Délégation portuaire reçue à l’ARSTM', cap: 'Partenariats portuaires' },
  ];
  protected readonly photoIdx = signal(0);
  protected readonly photo = computed(() => this.photos[this.photoIdx()]);

  protected readonly schoolIdx = signal(1);
  protected readonly school = computed(() => this.schools[this.schoolIdx()]);

  protected readonly query = signal('');

  /** Vidéo du bandeau : chargée après le premier rendu, affichée seulement une fois en lecture. */
  private readonly heroVideo = viewChild<ElementRef<HTMLVideoElement>>('heroVideo');
  protected readonly videoReady = signal(false);

  constructor() {
    afterNextRender(() => {
      const video = this.heroVideo()?.nativeElement;
      if (!video) return;
      const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
      // Mouvement réduit ou économie de données : on garde la photo et on ne télécharge pas la vidéo.
      if (reducedMotion || saveData) return;
      video.muted = true; // la propriété (et pas seulement l’attribut) est exigée pour l’autoplay
      video.src = IMG.heroVideo;
      video.play().catch(() => {
        /* lecture automatique refusée : la photo reste affichée */
      });
    });
  }

  protected prev() {
    this.photoIdx.update((i) => (i + this.photos.length - 1) % this.photos.length);
  }
  protected next() {
    this.photoIdx.update((i) => (i + 1) % this.photos.length);
  }

  protected onTabKey(e: KeyboardEvent) {
    const n = this.schools.length;
    let i = this.schoolIdx();
    if (e.key === 'ArrowRight') i = (i + 1) % n;
    else if (e.key === 'ArrowLeft') i = (i + n - 1) % n;
    else if (e.key === 'Home') i = 0;
    else if (e.key === 'End') i = n - 1;
    else return;
    e.preventDefault();
    this.schoolIdx.set(i);
    (e.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>('[role=tab]')[i]?.focus();
  }

  protected search(e: Event) {
    e.preventDefault();
    const q = this.query().trim();
    this.router.navigate(['/recherche'], { queryParams: q ? { q } : {} });
  }
}
