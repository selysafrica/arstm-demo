import { Injectable, Pipe, PipeTransform, computed, effect, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type Lang = 'fr' | 'en';

/**
 * Libellés de l’interface (EF-ACC-03 / EF-ERG-03).
 * Démo : la navigation, les boutons et le pied de page sont traduits ;
 * les contenus éditoriaux seront traduits depuis le back-office.
 */
const DICT: Record<string, { fr: string; en: string }> = {
  home: { fr: 'Accueil', en: 'Home' },
  lookingFor: { fr: 'Je cherche…', en: 'I’m looking for…' },
  institution: { fr: 'L’institution', en: 'About us' },
  formations: { fr: 'Formations', en: 'Programmes' },
  admissions: { fr: 'Admissions', en: 'Admissions' },
  actualites: { fr: 'Actualités', en: 'News' },
  candidateSpace: { fr: 'Espace candidat', en: 'Applicant area' },
  apply: { fr: 'Candidater', en: 'Apply' },
  allSites: { fr: 'Tous les sites et applications de l’ARSTM', en: 'All ARSTM sites and apps' },
  ourSites: { fr: 'Nos sites', en: 'Our sites' },
  search: { fr: 'Rechercher', en: 'Search' },
  menu: { fr: 'Menu', en: 'Menu' },
  close: { fr: 'Fermer', en: 'Close' },
  heroKicker: { fr: 'ARSTM · Former pour conquérir', en: 'ARSTM · Train to conquer' },
  heroTitleA: { fr: 'Quelle formation pour', en: 'Which programme for' },
  heroTitleEm: { fr: 'votre cap', en: 'your course' },
  heroLead: {
    fr: 'Trouvez rapidement une formation, une démarche ou un contact. Depuis 1987, l’ARSTM forme les cadres maritimes de quinze pays d’Afrique.',
    en: 'Quickly find a programme, a procedure or a contact. Since 1987, ARSTM has trained maritime executives from fifteen African countries.',
  },
  heroPlaceholder: {
    fr: 'Ex : devenir capitaine, certificat STCW, concours 2027…',
    en: 'e.g. become a captain, STCW certificate, 2027 entrance exam…',
  },
  footerTagline: {
    fr: 'Académie Régionale des Sciences et Techniques de la Mer. Former pour conquérir.',
    en: 'Regional Academy of Marine Science and Technology. Train to conquer.',
  },
  services: { fr: 'Services', en: 'Services' },
  continuing: { fr: 'Formation continue', en: 'Continuing education' },
  verifyDiploma: { fr: 'Vérifier un diplôme', en: 'Verify a diploma' },
  careerCenter: { fr: 'Centre de carrière', en: 'Career centre' },
  newsletter: { fr: 'Newsletter', en: 'Newsletter' },
  newsletterLead: { fr: 'Concours, événements et nouvelles formations, une fois par mois.', en: 'Exams, events and new programmes, once a month.' },
  subscribe: { fr: 'S’abonner', en: 'Subscribe' },
  legal: { fr: 'Mentions légales', en: 'Legal notice' },
  privacy: { fr: 'Confidentialité et cookies', en: 'Privacy & cookies' },
  sitemap: { fr: 'Plan du site', en: 'Sitemap' },
  accessibility: { fr: 'Accessibilité', en: 'Accessibility' },
  textSize: { fr: 'Agrandir le texte', en: 'Larger text' },
  contrast: { fr: 'Contraste renforcé', en: 'High contrast' },
  skip: { fr: 'Aller au contenu', en: 'Skip to content' },
  demoNote: { fr: 'Démo — contenus et données indicatifs', en: 'Demo — sample content and data' },
};

@Injectable({ providedIn: 'root' })
export class I18n {
  private readonly doc = inject(DOCUMENT);
  readonly lang = signal<Lang>(this.detect());
  readonly isEn = computed(() => this.lang() === 'en');

  constructor() {
    effect(() => {
      const l = this.lang();
      this.doc.documentElement.lang = l;
      try {
        localStorage.setItem('arstm-lang', l);
      } catch {
        /* stockage indisponible : on ignore */
      }
    });
  }

  t(key: string): string {
    const e = DICT[key];
    return e ? e[this.lang()] : key;
  }

  toggle() {
    this.lang.update((l) => (l === 'fr' ? 'en' : 'fr'));
  }

  private detect(): Lang {
    try {
      const saved = localStorage.getItem('arstm-lang');
      if (saved === 'fr' || saved === 'en') return saved;
    } catch {
      /* ignore */
    }
    const nav = (globalThis.navigator?.language ?? 'fr').toLowerCase();
    return nav.startsWith('en') ? 'en' : 'fr';
  }
}

@Pipe({ name: 't', pure: false })
export class TPipe implements PipeTransform {
  private readonly i18n = inject(I18n);
  transform(key: string): string {
    return this.i18n.t(key);
  }
}
