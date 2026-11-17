import { inject } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { StudentStore } from './core/student-store';
import { AdminStore } from './admin/admin-store';

const studentGuard = () => inject(StudentStore).logged() || inject(Router).createUrlTree(['/espace/connexion']);
const adminGuard = () => inject(AdminStore).logged() || inject(Router).createUrlTree(['/admin/connexion']);

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
  { path: 'espace/connexion', title: t('Connexion à l’espace élèves'), loadComponent: () => import('./pages/espace/login') },
  {
    path: 'espace',
    canActivate: [studentGuard],
    loadComponent: () => import('./pages/espace/layout'),
    children: [
      { path: '', title: t('Espace élèves'), loadComponent: () => import('./pages/espace/dashboard') },
      { path: 'candidature', title: t('Ma candidature'), loadComponent: () => import('./pages/espace/candidature') },
      { path: 'scolarite', title: t('Scolarité'), loadComponent: () => import('./pages/espace/scolarite') },
      { path: 'paiements', title: t('Paiements'), loadComponent: () => import('./pages/espace/paiements') },
      { path: 'commandes', title: t('Commandes'), loadComponent: () => import('./pages/espace/commandes') },
      { path: 'documents', title: t('Documents'), loadComponent: () => import('./pages/espace/documents') },
      { path: 'bibliotheque', title: t('Bibliothèque'), loadComponent: () => import('./pages/espace/bibliotheque') },
      { path: 'messages', title: t('Messages'), loadComponent: () => import('./pages/espace/messages') },
      { path: 'profil', title: t('Mon profil'), loadComponent: () => import('./pages/espace/profil') },
    ],
  },
  { path: 'contact', title: t('Contact'), loadComponent: () => import('./pages/services/contact') },

  { path: 'admin/connexion', title: 'Connexion — Back-office ARSTM', loadComponent: () => import('./admin/login') },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./admin/layout'),
    children: [
      { path: '', title: 'Tableau de bord — Back-office ARSTM', loadComponent: () => import('./admin/pages/dashboard') },
      { path: 'pages', title: 'Pages — Back-office ARSTM', loadComponent: () => import('./admin/pages/pages') },
      { path: 'actualites', title: 'Actualités et agenda — Back-office ARSTM', loadComponent: () => import('./admin/pages/news') },
      { path: 'formations', title: 'Formations et sessions — Back-office ARSTM', loadComponent: () => import('./admin/pages/programs') },
      { path: 'emplois', title: 'Offres d’emploi — Back-office ARSTM', loadComponent: () => import('./admin/pages/jobs') },
      { path: 'medias', title: 'Médiathèque — Back-office ARSTM', loadComponent: () => import('./admin/pages/media') },
      { path: 'bannieres', title: 'Bannières et données — Back-office ARSTM', loadComponent: () => import('./admin/pages/banners') },
      { path: 'demandes', title: 'Demandes — Back-office ARSTM', loadComponent: () => import('./admin/pages/requests') },
      { path: 'inscriptions', title: 'Inscriptions et commandes — Back-office ARSTM', loadComponent: () => import('./admin/pages/sales') },
      { path: 'newsletter', title: 'Newsletter — Back-office ARSTM', loadComponent: () => import('./admin/pages/newsletter') },
      { path: 'utilisateurs', title: 'Utilisateurs et rôles — Back-office ARSTM', loadComponent: () => import('./admin/pages/users') },
      { path: 'seo', title: 'Référencement — Back-office ARSTM', loadComponent: () => import('./admin/pages/seo') },
      { path: 'journal', title: 'Journal d’activité — Back-office ARSTM', loadComponent: () => import('./admin/pages/logs') },
    ],
  },

  { path: 'recherche', title: t('Recherche'), loadComponent: () => import('./pages/misc/search') },
  { path: 'plan-du-site', title: t('Plan du site'), loadComponent: () => import('./pages/misc/sitemap') },
  { path: 'mentions-legales', title: t('Mentions légales'), loadComponent: () => import('./pages/misc/legal') },
  { path: '**', title: t('Page introuvable'), loadComponent: () => import('./pages/misc/not-found') },
];
