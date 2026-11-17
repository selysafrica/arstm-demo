import { Routes } from '@angular/router';

const t = (title: string) => `${title} — ARSTM`;

export const routes: Routes = [
  { path: '', title: 'ARSTM — Académie Régionale des Sciences et Techniques de la Mer', loadComponent: () => import('./pages/home/home') },

  { path: 'institution', title: t('Présentation'), loadComponent: () => import('./pages/institution/presentation') },
  { path: 'institution/mot-du-dg', title: t('Mot du Directeur Général'), loadComponent: () => import('./pages/institution/mot-du-dg') },
  { path: 'institution/politique-qualite', title: t('Politique qualité'), loadComponent: () => import('./pages/institution/qualite') },
  { path: 'institution/film', title: t('Film institutionnel'), loadComponent: () => import('./pages/institution/film') },
  { path: 'institution/situation', title: t('Situation géographique'), loadComponent: () => import('./pages/institution/situation') },
  { path: 'institution/organigramme', title: t('Organigramme'), loadComponent: () => import('./pages/institution/organigramme') },
  { path: 'references', title: t('Nos références'), loadComponent: () => import('./pages/references/references') },

  { path: 'formations', title: t('Catalogue des formations'), loadComponent: () => import('./pages/formations/catalogue') },
  { path: 'formation-continue', title: t('Formation continue et certificats STCW'), loadComponent: () => import('./pages/formations/continue') },
  { path: 'formations/:school', title: t('École'), loadComponent: () => import('./pages/formations/school') },
  { path: 'formations/:school/:program', title: t('Fiche formation'), loadComponent: () => import('./pages/formations/program') },

  { path: 'admissions', title: t('Admissions'), loadComponent: () => import('./pages/admissions/admissions') },
  { path: 'admissions/candidater', title: t('Candidater en ligne'), loadComponent: () => import('./pages/admissions/candidater') },

  { path: 'actualites', title: t('Actualités'), loadComponent: () => import('./pages/news/news') },
  { path: 'actualites/:slug', title: t('Actualité'), loadComponent: () => import('./pages/news/article') },
  { path: 'agenda', title: t('Agenda'), loadComponent: () => import('./pages/news/agenda') },
  { path: 'mediatheque', title: t('Médiathèque'), loadComponent: () => import('./pages/media/media') },
  { path: 'ressources', title: t('Veille et bibliothèque numérique'), loadComponent: () => import('./pages/media/resources') },

  { path: 'carrieres', title: t('Centre de carrière'), loadComponent: () => import('./pages/services/careers') },
  { path: 'campus', title: t('Campus et vie étudiante'), loadComponent: () => import('./pages/services/campus') },
  { path: 'verifier-diplome', title: t('Vérifier un diplôme'), loadComponent: () => import('./pages/services/verify') },
  { path: 'espace', title: t('Espace candidat'), loadComponent: () => import('./pages/services/espace') },
  { path: 'contact', title: t('Contact'), loadComponent: () => import('./pages/services/contact') },

  { path: 'recherche', title: t('Recherche'), loadComponent: () => import('./pages/misc/search') },
  { path: 'plan-du-site', title: t('Plan du site'), loadComponent: () => import('./pages/misc/sitemap') },
  { path: 'mentions-legales', title: t('Mentions légales'), loadComponent: () => import('./pages/misc/legal') },
  { path: '**', title: t('Page introuvable'), loadComponent: () => import('./pages/misc/not-found') },
];
