import { Injectable, computed, signal } from '@angular/core';
import { DOCUMENTS, GALLERY, MAIN_NAV, PROGRAMS, SCHOOLS, STCW_SESSIONS } from '../data/site';
import { PublishState } from '../core/content-store';

export type Role = 'Administrateur' | 'Éditeur' | 'Contributeur' | 'Validateur';
export const ROLES: Role[] = ['Administrateur', 'Validateur', 'Éditeur', 'Contributeur'];

export const ROLE_RIGHTS: Record<Role, { publish: boolean; manageUsers: boolean; data: boolean; edit: boolean; desc: string }> = {
  Administrateur: { publish: true, manageUsers: true, data: true, edit: true, desc: 'Tous les droits, y compris utilisateurs et paramètres.' },
  Validateur: { publish: true, manageUsers: false, data: true, edit: true, desc: 'Relit et publie les contenus soumis.' },
  Éditeur: { publish: false, manageUsers: false, data: true, edit: true, desc: 'Rédige et soumet à relecture ; consulte les demandes.' },
  Contributeur: { publish: false, manageUsers: false, data: false, edit: true, desc: 'Rédige des brouillons sur ses rubriques.' },
};

export type RequestStatus = 'Nouveau' | 'En cours' | 'Traité' | 'Archivé';
export interface FormRequest {
  id: string;
  type: 'Renseignements' | 'Pré-inscription' | 'Candidature spontanée' | 'Demande de stage' | 'Contact';
  name: string;
  email: string;
  phone: string;
  country: string;
  subject: string;
  service: string;
  date: string;
  dayIndex: number;
  status: RequestStatus;
  files: number;
  message: string;
  assignee?: string;
  notes: string[];
}

export interface PageNode {
  id: string;
  title: string;
  path: string;
  parent: string | null;
  state: PublishState;
  updated: string;
  author: string;
  en: boolean;
  seoTitle: string;
  seoDesc: string;
  body: string;
  scheduledAt?: string;
}

export interface MediaAsset {
  id: string;
  name: string;
  kind: 'Image' | 'Document' | 'Vidéo';
  src: string;
  alt: string;
  size: string;
  dims: string;
  used: number;
  folder: string;
  optimized: boolean;
}

export interface LogEntry {
  who: string;
  role: Role;
  action: string;
  target: string;
  when: string;
}

const FIRST = ['Awa', 'Kouassi', 'Fatou', 'Jean-Marc', 'Aminata', 'Serge', 'Mariam', 'Ibrahim', 'Grâce', 'Olivier', 'Ruth', 'Moussa', 'Esther', 'Didier', 'Nadia', 'Cédric', 'Adjoua', 'Patrick', 'Salimata', 'Hervé'];
const LAST = ['Koné', 'N’Guessan', 'Diallo', 'Mensah', 'Ouédraogo', 'Mba', 'Traoré', 'Sylla', 'Agbo', 'Nzé', 'Bamba', 'Tchibota', 'Kaboré', 'Houngbo', 'Camara'];
const COUNTRIES = ['Côte d’Ivoire', 'Bénin', 'Togo', 'Gabon', 'Congo', 'Guinée', 'Burkina Faso', 'RD Congo', 'Cameroun', 'Sénégal'];
const TYPES: FormRequest['type'][] = ['Renseignements', 'Pré-inscription', 'Pré-inscription', 'Candidature spontanée', 'Demande de stage', 'Contact', 'Renseignements'];
const SERVICE: Record<FormRequest['type'], string> = {
  Renseignements: 'Scolarité',
  'Pré-inscription': 'Scolarité',
  'Candidature spontanée': 'Ressources humaines',
  'Demande de stage': 'Ressources humaines',
  Contact: 'Accueil',
};
const MESSAGES: Record<FormRequest['type'], string> = {
  Renseignements: 'Bonjour, je souhaite connaître les conditions d’admission et la date du prochain concours.',
  'Pré-inscription': 'Je joins mon dossier de pré-inscription. Merci de me confirmer la bonne réception.',
  'Candidature spontanée': 'Titulaire d’un BTS en logistique, je souhaite rejoindre vos équipes.',
  'Demande de stage': 'Étudiant en Master transport, je recherche un stage de 3 mois au CREMPOL.',
  Contact: 'Notre entreprise souhaite former 12 agents au code ISPS. Pouvez-vous nous adresser un devis ?',
};

function rnd(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function buildRequests(): FormRequest[] {
  const out: FormRequest[] = [];
  for (let i = 0; i < 42; i++) {
    const type = TYPES[Math.floor(rnd(i) * TYPES.length)];
    const f = FIRST[Math.floor(rnd(i + 50) * FIRST.length)];
    const l = LAST[Math.floor(rnd(i + 90) * LAST.length)];
    const day = Math.floor(i / 2.4);
    const d = new Date(2026, 10, 17 - day);
    const statusR = rnd(i + 7);
    const status: RequestStatus = day < 2 ? 'Nouveau' : statusR < 0.25 ? 'Nouveau' : statusR < 0.55 ? 'En cours' : statusR < 0.92 ? 'Traité' : 'Archivé';
    const prog = PROGRAMS[Math.floor(rnd(i + 3) * PROGRAMS.length)];
    out.push({
      id: 'DEM-' + (2611 - i),
      type,
      name: `${f} ${l}`,
      email: `${f}.${l}`.toLowerCase().normalize('NFD').replace(/[̀-ͯ’]/g, '').replace(/[^a-z.]/g, '') + '@example.com',
      phone: '+225 07 ' + String(10 + Math.floor(rnd(i + 4) * 89)) + ' 00 00 00',
      country: COUNTRIES[Math.floor(rnd(i + 11) * COUNTRIES.length)],
      subject: type === 'Pré-inscription' || type === 'Renseignements' ? prog.title : type === 'Contact' ? 'Demande de devis formation' : type,
      service: SERVICE[type],
      date: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      dayIndex: day,
      status,
      files: type === 'Pré-inscription' ? 2 + Math.floor(rnd(i + 5) * 3) : type === 'Contact' ? 0 : 1,
      message: MESSAGES[type],
      assignee: status === 'Nouveau' ? undefined : ['A. Koné', 'V. Dea', 'C. Koffi'][i % 3],
      notes: [],
    });
  }
  return out;
}

function buildPages(): PageNode[] {
  const pages: PageNode[] = [
    { id: 'home', title: 'Accueil', path: '/', parent: null, state: 'Publié', updated: '12 nov. 2026', author: 'C. Koffi', en: true, seoTitle: 'ARSTM — Académie Régionale des Sciences et Techniques de la Mer', seoDesc: 'L’ARSTM forme depuis 1987 les officiers, techniciens et cadres maritimes, portuaires et logistiques de quinze pays d’Afrique.', body: 'Page d’accueil composée de blocs : bandeau, à propos, contacts utiles, écoles, admission, actualités, FAQ, contact.' },
  ];
  for (const n of MAIN_NAV) {
    pages.push({ id: n.key, title: n.label, path: n.path, parent: null, state: 'Publié', updated: '10 nov. 2026', author: 'V. Dea', en: true, seoTitle: `${n.label} — ARSTM`, seoDesc: '', body: '' });
    const seen = new Set<string>();
    for (const g of n.groups)
      for (const l of g.links) {
        const key = l.path + (l.fragment ?? '');
        if (seen.has(key) || l.path === n.path) continue;
        seen.add(key);
        const id = n.key + '-' + seen.size;
        const i = pages.length;
        pages.push({
          id,
          title: l.label,
          path: l.path + (l.fragment ? '#' + l.fragment : ''),
          parent: n.key,
          state: i % 9 === 4 ? 'En relecture' : i % 11 === 6 ? 'Brouillon' : 'Publié',
          updated: `${1 + (i % 16)} nov. 2026`,
          author: ['V. Dea', 'C. Koffi', 'A. Koné'][i % 3],
          en: i % 4 !== 1,
          seoTitle: i % 5 === 2 ? '' : `${l.label} — ARSTM`,
          seoDesc: i % 3 === 0 ? '' : `${l.label} : informations, démarches et contacts de l’ARSTM.`,
          body: `Contenu de la page « ${l.label} ».`,
        });
      }
  }
  return pages;
}

const NOW = '17 nov. 2026';

@Injectable({ providedIn: 'root' })
export class AdminStore {
  readonly logged = signal(this.restore());
  readonly user = signal({ name: 'Chantal KOFFI', initials: 'CK', title: 'Chef du Département Communication et Marketing' });
  readonly role = signal<Role>('Administrateur');
  readonly rights = computed(() => ROLE_RIGHTS[this.role()]);

  readonly requests = signal<FormRequest[]>(buildRequests());
  readonly pages = signal<PageNode[]>(buildPages());

  readonly registrations = signal(
    STCW_SESSIONS.flatMap((s, si) =>
      Array.from({ length: Math.min(4, s.seats - s.seatsLeft) }, (_, k) => {
        const n = si * 5 + k;
        const f = FIRST[(n * 7) % FIRST.length];
        const l = LAST[(n * 5) % LAST.length];
        const r = rnd(n + 200);
        return {
          id: 'INS-' + (5400 + n),
          session: s.title,
          code: s.code,
          dates: s.dates,
          trainee: `${f} ${l}`,
          company: r < 0.5 ? 'Particulier' : ['Port Autonome d’Abidjan', 'SIVOM', 'Armement régional', 'Bolloré'][n % 4],
          amount: s.price,
          payment: (r < 0.72 ? 'Payé' : r < 0.92 ? 'En attente' : 'Remboursé') as 'Payé' | 'En attente' | 'Remboursé',
          method: r < 0.45 ? 'Mobile money' : 'Carte bancaire',
          date: `${3 + ((n * 3) % 14)} nov. 2026`,
        };
      }),
    ),
  );

  readonly orders = signal(
    Array.from({ length: 14 }, (_, i) => {
      const items = [
        ['Recueil des conventions OMI', 25000],
        ['Étude CREMPOL — corridors logistiques', 10000],
        ['Manuel de navigation côtière', 18000],
        ['Atlas des corridors d’Afrique de l’Ouest', 22000],
        ['Rapport annuel 2025 (imprimé)', 8000],
      ] as const;
      const it = items[i % items.length];
      const r = rnd(i + 400);
      return {
        id: 'CMD-2026-' + String(951 - i * 7).padStart(4, '0'),
        item: it[0],
        customer: `${FIRST[(i * 3) % FIRST.length]} ${LAST[(i * 7) % LAST.length]}`,
        qty: 1 + (i % 3 === 0 ? 1 : 0),
        amount: it[1] * (1 + (i % 3 === 0 ? 1 : 0)),
        payment: r < 0.85 ? 'Payé' : 'En attente',
        status: (i < 3 ? 'En préparation' : i < 7 ? 'Expédié' : 'Livré') as 'En préparation' | 'Expédié' | 'Livré',
        date: `${17 - i} nov. 2026`,
      };
    }),
  );

  readonly programs = signal(PROGRAMS.map((p, i) => ({ ...p, published: i !== 6, updated: `${2 + i} nov. 2026` })));
  readonly sessions = signal(STCW_SESSIONS.map((s) => ({ ...s, open: s.seatsLeft > 0 })));

  readonly media = signal<MediaAsset[]>([
    ...GALLERY.map((g, i) => ({ id: 'img' + i, name: g.img.split('/').pop()!, kind: 'Image' as const, src: g.img, alt: g.alt, size: `${60 + i * 12} Ko`, dims: g.img.includes('aerien') ? '480 × 270' : '800 × 500', used: i % 3 === 0 ? 3 : 1, folder: g.cat, optimized: i !== 6 })),
    ...DOCUMENTS.map((d, i) => ({ id: 'doc' + i, name: d.title, kind: 'Document' as const, src: '', alt: '', size: d.size.replace('PDF · ', ''), dims: 'PDF', used: 1, folder: d.type, optimized: true })),
    { id: 'vid0', name: 'Film institutionnel ARSTM', kind: 'Vidéo' as const, src: '', alt: '', size: 'YouTube', dims: '6:42', used: 2, folder: 'Institution', optimized: true },
  ]);

  readonly subscribers = signal({ total: 4826, confirmed: 4512, pending: 214, unsub30: 37, lists: [
    { name: 'Candidats et familles', count: 2140 },
    { name: 'Professionnels — formation continue', count: 1386 },
    { name: 'Entreprises et partenaires', count: 642 },
    { name: 'Alumni', count: 658 },
  ] });

  readonly campaigns = signal([
    { id: 1, subject: 'Concours 2027 : les inscriptions ouvrent le 15 janvier', list: 'Candidats et familles', status: 'Programmée', date: '10 janv. 2027', recipients: 2140, open: 0, click: 0 },
    { id: 2, subject: 'Novembre à l’ARSTM : sessions STCW, portes ouvertes', list: 'Tous les abonnés', status: 'Envoyée', date: '3 nov. 2026', recipients: 4480, open: 41.2, click: 9.8 },
    { id: 3, subject: 'Catalogue de la formation continue 2027', list: 'Professionnels — formation continue', status: 'Envoyée', date: '15 oct. 2026', recipients: 1352, open: 47.5, click: 15.1 },
    { id: 4, subject: 'Rentrée académique : bienvenue aux nouvelles promotions', list: 'Tous les abonnés', status: 'Envoyée', date: '1 oct. 2026', recipients: 4391, open: 38.9, click: 6.4 },
    { id: 5, subject: 'Webinaire : devenir officier de la marine marchande', list: 'Candidats et familles', status: 'Brouillon', date: '—', recipients: 0, open: 0, click: 0 },
  ]);

  readonly users = signal([
    { id: 1, name: 'Chantal KOFFI', email: 'cocha@arstm.net', role: 'Administrateur' as Role, scope: 'Tout le site', last: 'Aujourd’hui, 09:12', active: true },
    { id: 2, name: 'Vadabla DEA', email: 'dea@arstm.net', role: 'Validateur' as Role, scope: 'Tout le site', last: 'Aujourd’hui, 08:40', active: true },
    { id: 3, name: 'Awa Koné', email: 'a.kone@arstm.net', role: 'Éditeur' as Role, scope: 'Actualités, Médiathèque', last: 'Hier, 17:05', active: true },
    { id: 4, name: 'Scolarité ESN', email: 'scolarite.esn@arstm.net', role: 'Contributeur' as Role, scope: 'ESN', last: '14 nov., 11:20', active: true },
    { id: 5, name: 'Scolarité ESTM', email: 'scolarite.estm@arstm.net', role: 'Contributeur' as Role, scope: 'ESTM', last: '12 nov., 15:47', active: true },
    { id: 6, name: 'Direction ISMI', email: 'ismi@arstm.net', role: 'Éditeur' as Role, scope: 'ISMI', last: '9 nov., 10:02', active: true },
    { id: 7, name: 'CREMPOL', email: 'crempol@arstm.net', role: 'Contributeur' as Role, scope: 'CREMPOL, Publications', last: '28 oct., 16:30', active: false },
  ]);

  readonly scopes = ['Tout le site', ...SCHOOLS.map((s) => s.code), 'Actualités', 'Médiathèque', 'Admissions', 'Publications'];

  readonly logs = signal<LogEntry[]>([
    { who: 'Vadabla DEA', role: 'Validateur', action: 'a publié', target: 'Actualité « Cérémonie de fin du salut aux couleurs »', when: '26 mai, 10:14' },
    { who: 'Awa Koné', role: 'Éditeur', action: 'a soumis à relecture', target: 'Page « Calendrier pédagogique »', when: 'Hier, 16:58' },
    { who: 'Scolarité ESN', role: 'Contributeur', action: 'a modifié', target: 'Formation « Licence — Officier mécanicien »', when: 'Hier, 11:02' },
    { who: 'Chantal KOFFI', role: 'Administrateur', action: 'a programmé', target: 'Newsletter « Concours 2027 »', when: '15 nov., 18:20' },
    { who: 'Chantal KOFFI', role: 'Administrateur', action: 'a créé l’utilisateur', target: 'Direction ISMI (Éditeur)', when: '9 nov., 09:45' },
    { who: 'Système', role: 'Administrateur', action: 'a optimisé', target: '12 images de la médiathèque', when: '8 nov., 03:00' },
  ]);

  readonly visits = signal([
    { label: 'S41', visits: 6120, leads: 21 },
    { label: 'S42', visits: 6480, leads: 24 },
    { label: 'S43', visits: 7010, leads: 26 },
    { label: 'S44', visits: 6890, leads: 22 },
    { label: 'S45', visits: 7420, leads: 31 },
    { label: 'S46', visits: 8130, leads: 35 },
  ]);

  readonly vizData = signal({
    enrolment: [
      { year: '2021', value: 980 },
      { year: '2022', value: 1040 },
      { year: '2023', value: 1125 },
      { year: '2024', value: 1210 },
      { year: '2025', value: 1290 },
      { year: '2026', value: 1365 },
    ],
    employment: 87,
  });

  readonly banners = signal([
    { id: 1, title: 'Quelle formation pour votre cap ?', place: 'Accueil — bandeau principal', active: true, until: 'Permanent', img: 'img/hero-cadets.jpg' },
    { id: 2, title: 'Concours d’entrée 2027', place: 'Accueil — carrousel', active: true, until: '15 mars 2027', img: 'img/salut-couleurs.jpg' },
    { id: 3, title: 'Journée portes ouvertes', place: 'Encart promotionnel', active: false, until: '5 déc. 2026', img: 'img/campus-arcades.jpg' },
  ]);

  // ---- Indicateurs
  readonly newRequests = computed(() => this.requests().filter((r) => r.status === 'Nouveau').length);
  readonly pendingReview = computed(() => this.pages().filter((p) => p.state === 'En relecture').length);
  readonly missingEn = computed(() => this.pages().filter((p) => !p.en).length);
  readonly revenue = computed(
    () =>
      this.registrations().filter((r) => r.payment === 'Payé').reduce((s, r) => s + r.amount, 0) +
      this.orders().filter((o) => o.payment === 'Payé').reduce((s, o) => s + o.amount, 0),
  );

  log(action: string, target: string) {
    const u = this.user();
    this.logs.update((l) => [{ who: u.name, role: this.role(), action, target, when: 'À l’instant' }, ...l]);
  }

  setRequestStatus(ids: string[], status: RequestStatus) {
    this.requests.update((l) => l.map((r) => (ids.includes(r.id) ? { ...r, status, assignee: r.assignee ?? 'C. Koffi' } : r)));
    this.log(`a passé ${ids.length > 1 ? ids.length + ' demandes' : 'la demande'} en « ${status} »`, ids.join(', '));
  }

  savePage(p: PageNode, msg: string) {
    this.pages.update((l) => l.map((x) => (x.id === p.id ? { ...p, updated: NOW, author: this.user().name } : x)));
    this.log(msg, `Page « ${p.title} »`);
  }

  login() {
    this.logged.set(true);
    this.persist(true);
  }
  logout() {
    this.logged.set(false);
    this.persist(false);
  }
  private restore() {
    try {
      return sessionStorage.getItem('arstm-admin') === '1';
    } catch {
      return false;
    }
  }
  private persist(v: boolean) {
    try {
      sessionStorage.setItem('arstm-admin', v ? '1' : '0');
    } catch {
      /* ignore */
    }
  }
}

/** Export CSV (ADM-06) */
export function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const cols = Object.keys(rows[0]);
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = '﻿' + [cols.join(';'), ...rows.map((r) => cols.map((c) => esc(r[c])).join(';'))].join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
}
