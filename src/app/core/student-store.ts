import { Injectable, computed, signal } from '@angular/core';

export type PayStatus = 'Payé' | 'À régler' | 'En retard';

export interface Invoice {
  id: string;
  label: string;
  detail: string;
  amount: number;
  due: string;
  status: PayStatus;
  paidOn?: string;
  method?: string;
}

export interface StudentDoc {
  id: string;
  title: string;
  kind: 'Administratif' | 'Scolarité' | 'Paiement' | 'Pièce déposée';
  date: string;
  size: string;
  isNew?: boolean;
}

export interface Message {
  id: number;
  from: string;
  subject: string;
  body: string;
  date: string;
  read: boolean;
  tag: 'Scolarité' | 'Formation continue' | 'Bibliothèque' | 'Carrière' | 'Paiement';
}

export interface Grade {
  module: string;
  ue: string;
  coef: number;
  credits: number;
  cc: number;
  exam: number;
}

export interface Slot {
  day: number; // 0 = lundi
  start: number; // heure décimale
  end: number;
  title: string;
  room: string;
  teacher: string;
  kind: 'Cours' | 'Simulateur' | 'TP' | 'Sport';
}

/** Session de démonstration de l’espace élèves (EF-COM-01, EF-PAY-05). */
@Injectable({ providedIn: 'root' })
export class StudentStore {
  readonly logged = signal(this.restore());

  readonly profile = signal({
    firstName: 'Mariam',
    lastName: 'Traoré',
    initials: 'MT',
    matricule: 'ESN-2025-0418',
    school: 'ESN',
    program: 'Licence — Officier chef de quart pont',
    year: '2e année · 2026–2027',
    promo: 'Promotion 2028',
    email: 'm.traore@etu.arstm.net',
    phone: '+225 07 00 00 00 00',
    country: 'Côte d’Ivoire',
    housing: 'Internat · Bâtiment B, chambre 214',
    tutor: 'Cdt. Kouamé (directeur des études ESN)',
  });

  readonly prefs = signal({ email: true, sms: false, newsletter: true, lang: 'fr' as 'fr' | 'en' });

  readonly application = signal({
    ref: 'CAND-2027-48213',
    title: 'Master — Capitaine de 1re classe de la navigation maritime',
    submitted: '16 nov. 2026',
    steps: [
      { label: 'Dossier déposé', date: '16 nov. 2026', state: 'done' as const },
      { label: 'Pièces vérifiées par la scolarité', date: '17 nov. 2026', state: 'done' as const },
      { label: 'Examen par la commission pédagogique', date: 'En cours', state: 'current' as const },
      { label: 'Entretien de motivation', date: 'Janv. 2027', state: 'todo' as const },
      { label: 'Décision d’admission', date: 'Févr. 2027', state: 'todo' as const },
    ],
    pieces: [
      { label: 'Pièce d’identité', ok: true },
      { label: 'Relevés de notes L1 et L2', ok: true },
      { label: 'Lettre de motivation', ok: true },
      { label: 'Attestation de temps de navigation', ok: false },
    ],
  });

  readonly invoices = signal<Invoice[]>([
    { id: 'FAC-2026-1182', label: 'Frais de scolarité 2026–2027', detail: 'Tranche 1 sur 2', amount: 350000, due: '15 sept. 2026', status: 'Payé', paidOn: '9 sept. 2026', method: 'Mobile money' },
    { id: 'FAC-2026-1183', label: 'Frais de scolarité 2026–2027', detail: 'Tranche 2 sur 2', amount: 350000, due: '15 janv. 2027', status: 'À régler' },
    { id: 'FAC-2026-1240', label: 'Hébergement — 1er semestre', detail: 'Internat, bâtiment B', amount: 120000, due: '30 sept. 2026', status: 'Payé', paidOn: '28 sept. 2026', method: 'Carte bancaire' },
    { id: 'ARSTM-FC-552104', label: 'STCW — Formation de base à la sécurité', detail: 'Session du 7 déc. 2026', amount: 180000, due: '1 déc. 2026', status: 'Payé', paidOn: '12 nov. 2026', method: 'Mobile money' },
    { id: 'FAC-2026-1301', label: 'Frais d’examen — rattrapage', detail: 'Stabilité du navire', amount: 15000, due: '10 nov. 2026', status: 'En retard' },
  ]);

  readonly orders = signal([
    { id: 'CMD-2026-0912', item: 'Recueil des conventions OMI (SOLAS, MARPOL)', type: 'Ouvrage imprimé', amount: 25000, date: '2 nov. 2026', status: 'Expédié', steps: 3 },
    { id: 'CMD-2026-0874', item: 'Étude CREMPOL — performance des corridors logistiques', type: 'Publication numérique', amount: 10000, date: '21 oct. 2026', status: 'Livré', steps: 4 },
    { id: 'CMD-2026-0951', item: 'Manuel de navigation côtière', type: 'Ouvrage imprimé', amount: 18000, date: '15 nov. 2026', status: 'En préparation', steps: 2 },
  ]);

  readonly documents = signal<StudentDoc[]>([
    { id: 'd1', title: 'Certificat de scolarité 2026–2027', kind: 'Administratif', date: '9 sept. 2026', size: 'PDF · 140 Ko' },
    { id: 'd2', title: 'Carte d’élève (version numérique)', kind: 'Administratif', date: '9 sept. 2026', size: 'PDF · 220 Ko' },
    { id: 'd3', title: 'Relevé de notes — semestre 3', kind: 'Scolarité', date: '14 nov. 2026', size: 'PDF · 180 Ko', isNew: true },
    { id: 'd4', title: 'Convocation — session STCW FBS', kind: 'Scolarité', date: '13 nov. 2026', size: 'PDF · 95 Ko', isNew: true },
    { id: 'd5', title: 'Reçu de paiement — FBS', kind: 'Paiement', date: '12 nov. 2026', size: 'PDF · 80 Ko' },
    { id: 'd6', title: 'Reçu de paiement — scolarité tranche 1', kind: 'Paiement', date: '9 sept. 2026', size: 'PDF · 80 Ko' },
    { id: 'd7', title: 'Accusé de réception de candidature (Master)', kind: 'Administratif', date: '16 nov. 2026', size: 'PDF · 70 Ko' },
  ]);

  readonly messages = signal<Message[]>([
    { id: 1, from: 'Scolarité ESN', tag: 'Scolarité', subject: 'Relevé de notes du semestre 3 disponible', date: '14 nov.', read: false, body: 'Bonjour Mariam,\n\nVotre relevé de notes du semestre 3 est disponible dans la rubrique Documents. Les demandes de révision doivent être déposées avant le 28 novembre.\n\nLa scolarité de l’ESN' },
    { id: 2, from: 'DDFCP', tag: 'Formation continue', subject: 'Convocation — Formation de base à la sécurité', date: '13 nov.', read: false, body: 'Votre inscription à la session FBS du 7 au 18 décembre 2026 est confirmée. Présentez-vous à 7 h 30 au bassin de la piscine olympique, en tenue de sport, avec votre convocation.' },
    { id: 3, from: 'Service financier', tag: 'Paiement', subject: 'Rappel : frais d’examen de rattrapage', date: '11 nov.', read: true, body: 'Les frais d’examen de rattrapage (15 000 FCFA) étaient à régler avant le 10 novembre. Vous pouvez les payer en ligne depuis la rubrique Paiements.' },
    { id: 4, from: 'Bibliothèque', tag: 'Bibliothèque', subject: 'Retour d’ouvrage attendu', date: '8 nov.', read: true, body: '« Stabilité du navire — exercices corrigés » est à rendre avant le 22 novembre. Vous pouvez prolonger le prêt une fois depuis la rubrique Bibliothèque.' },
    { id: 5, from: 'Centre de carrière', tag: 'Carrière', subject: '3 nouvelles offres de stage embarqué', date: '4 nov.', read: true, body: 'Trois armements recherchent des élèves officiers pour des stages embarqués de 6 mois à partir de mars 2027. Consultez-les dans le Centre de carrière.' },
  ]);

  readonly grades = signal<Grade[]>([
    { ue: 'UE1 — Navigation', module: 'Navigation astronomique', coef: 3, credits: 6, cc: 14, exam: 15 },
    { ue: 'UE1 — Navigation', module: 'Simulateur de passerelle', coef: 3, credits: 6, cc: 16.5, exam: 15.5 },
    { ue: 'UE2 — Sciences du navire', module: 'Stabilité du navire', coef: 2, credits: 4, cc: 10, exam: 9 },
    { ue: 'UE2 — Sciences du navire', module: 'Météorologie marine', coef: 2, credits: 4, cc: 13, exam: 12.5 },
    { ue: 'UE3 — Langues et droit', module: 'Anglais maritime', coef: 2, credits: 4, cc: 15.5, exam: 14.5 },
    { ue: 'UE3 — Langues et droit', module: 'Droit maritime', coef: 1, credits: 3, cc: 12, exam: 13 },
    { ue: 'UE4 — Sécurité', module: 'Sécurité et survie en mer', coef: 1, credits: 3, cc: 17, exam: 16 },
  ]);

  readonly timetable = signal<Slot[]>([
    { day: 0, start: 8, end: 10, title: 'Navigation astronomique', room: 'Salle N2', teacher: 'Cdt. Kouamé', kind: 'Cours' },
    { day: 0, start: 10.25, end: 12.25, title: 'Anglais maritime', room: 'Labo de langues', teacher: 'Mme Mensah', kind: 'Cours' },
    { day: 0, start: 14, end: 17, title: 'Simulateur de passerelle', room: 'Simulateur full-mission', teacher: 'Lt. Diallo', kind: 'Simulateur' },
    { day: 1, start: 8, end: 10, title: 'Stabilité du navire', room: 'Amphi B', teacher: 'M. Ondo', kind: 'Cours' },
    { day: 1, start: 10.25, end: 12.25, title: 'Météorologie marine', room: 'Salle N4', teacher: 'M. Agbo', kind: 'Cours' },
    { day: 1, start: 16, end: 18, title: 'Natation', room: 'Piscine olympique', teacher: 'M. Yapi', kind: 'Sport' },
    { day: 2, start: 8, end: 12, title: 'Matelotage et manœuvre', room: 'Atelier pont', teacher: 'Maître Kra', kind: 'TP' },
    { day: 2, start: 14, end: 16, title: 'Droit maritime', room: 'Amphi A', teacher: 'Me Bamba', kind: 'Cours' },
    { day: 3, start: 8, end: 10, title: 'Navigation astronomique', room: 'Salle N2', teacher: 'Cdt. Kouamé', kind: 'Cours' },
    { day: 3, start: 10.25, end: 12.25, title: 'Stabilité du navire (TD)', room: 'Salle N3', teacher: 'M. Ondo', kind: 'TP' },
    { day: 3, start: 14, end: 17, title: 'Simulateur radar / ARPA', room: 'Simulateur radar', teacher: 'Lt. Diallo', kind: 'Simulateur' },
    { day: 4, start: 8, end: 10, title: 'Sécurité et survie en mer', room: 'Piscine olympique', teacher: 'M. Yapi', kind: 'TP' },
    { day: 4, start: 10.25, end: 12.25, title: 'Anglais maritime', room: 'Labo de langues', teacher: 'Mme Mensah', kind: 'Cours' },
  ]);

  readonly loans = signal([
    { title: 'Stabilité du navire — exercices corrigés', due: '22 nov. 2026', renewed: false, late: false },
    { title: 'Manuel de navigation côtière', due: '3 déc. 2026', renewed: true, late: false },
  ]);

  readonly unread = computed(() => this.messages().filter((m) => !m.read).length);
  readonly toPay = computed(() => this.invoices().filter((i) => i.status !== 'Payé'));
  readonly toPayTotal = computed(() => this.toPay().reduce((s, i) => s + i.amount, 0));
  readonly paidTotal = computed(() => this.invoices().filter((i) => i.status === 'Payé').reduce((s, i) => s + i.amount, 0));
  readonly average = computed(() => {
    const g = this.grades();
    const tot = g.reduce((s, x) => s + x.coef * this.moduleAvg(x), 0);
    return tot / g.reduce((s, x) => s + x.coef, 0);
  });

  moduleAvg(g: Grade) {
    return Math.round((g.cc * 0.4 + g.exam * 0.6) * 100) / 100;
  }

  login() {
    this.logged.set(true);
    this.persist(true);
  }
  logout() {
    this.logged.set(false);
    this.persist(false);
  }

  pay(id: string, method: string) {
    this.invoices.update((l) => l.map((i) => (i.id === id ? { ...i, status: 'Payé', paidOn: '17 nov. 2026', method } : i)));
    const inv = this.invoices().find((i) => i.id === id)!;
    this.documents.update((d) => [
      { id: 'r-' + id, title: `Reçu de paiement — ${inv.label} (${inv.detail})`, kind: 'Paiement', date: '17 nov. 2026', size: 'PDF · 80 Ko', isNew: true },
      ...d,
    ]);
  }

  addPiece(label: string, fileName: string) {
    this.application.update((a) => ({ ...a, pieces: a.pieces.map((p) => (p.label === label ? { ...p, ok: true } : p)) }));
    this.documents.update((d) => [{ id: 'u-' + Date.now(), title: `${label} — ${fileName}`, kind: 'Pièce déposée', date: '17 nov. 2026', size: 'Déposé', isNew: true }, ...d]);
  }

  markRead(id: number) {
    this.messages.update((l) => l.map((m) => (m.id === id ? { ...m, read: true } : m)));
  }

  renew(title: string) {
    this.loans.update((l) => l.map((x) => (x.title === title ? { ...x, renewed: true, due: '6 déc. 2026' } : x)));
  }

  private restore() {
    try {
      return sessionStorage.getItem('arstm-student') === '1';
    } catch {
      return false;
    }
  }
  private persist(v: boolean) {
    try {
      sessionStorage.setItem('arstm-student', v ? '1' : '0');
    } catch {
      /* ignore */
    }
  }
}
