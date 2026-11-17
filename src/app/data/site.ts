/* =====================================================================
   Données de démonstration du site ARSTM.
   Dans la version finale, ces contenus proviennent du back-office.
   ===================================================================== */

export const IMG = {
  hero: 'img/hero-cadets.jpg',
  logo: 'img/logo-arstm.png',
  flags: 'img/drapeaux.png',
  campus: 'img/campus-arcades.jpg',
  salut: 'img/salut-couleurs.jpg',
  douala: 'img/delegation-douala.jpg',
  reunion: 'img/reunion.jpg',
  conference: 'img/conference.jpg',
  appel: 'img/appel-offres.jpg',
  aerien: 'img/campus-aerien.jpg',
} as const;

export type Tone = 'blue' | 'orange' | 'navy' | 'green' | 'violet' | 'teal';

/** Palette d’accents par ton — reprise des cartes « Admission » de la maquette */
export const TONES: Record<Tone, { line: string; soft: string; ink: string }> = {
  blue: { line: '#1F5FA8', soft: '#E3EEFB', ink: '#1F5FA8' },
  orange: { line: '#E39B4B', soft: '#FDEBD8', ink: '#9A4E0E' },
  navy: { line: '#1F2D6E', soft: '#E6E9F5', ink: '#1F2D6E' },
  green: { line: '#2E9E6B', soft: '#E3F4EC', ink: '#1E7A50' },
  violet: { line: '#6C5DD3', soft: '#ECEAFB', ink: '#4B3FB0' },
  teal: { line: '#0E8FA8', soft: '#E0F3F7', ink: '#0B6E82' },
};

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

export interface NavLink {
  label: string;
  path: string;
  fragment?: string;
  desc?: string;
}
export interface NavGroup {
  title: string;
  links: NavLink[];
}
export interface NavItem {
  key: string;
  label: string;
  path: string;
  groups: NavGroup[];
}

export const MAIN_NAV: NavItem[] = [
  {
    key: 'institution',
    label: 'L’institution',
    path: '/institution',
    groups: [
      {
        title: 'Découvrir l’ARSTM',
        links: [
          { label: 'Présentation', path: '/institution', desc: 'Missions, histoire, chiffres clés' },
          { label: 'Mot du Directeur Général', path: '/institution/mot-du-dg' },
          { label: 'Politique qualité', path: '/institution/politique-qualite', desc: 'ISO 9001:2015' },
          { label: 'Film institutionnel', path: '/institution/film' },
        ],
      },
      {
        title: 'Organisation',
        links: [
          { label: 'Organigramme', path: '/institution/organigramme' },
          { label: 'Situation géographique', path: '/institution/situation', desc: 'Abidjan et San-Pedro' },
          { label: 'Nos références', path: '/references', desc: 'Partenaires, distinctions, certifications' },
          { label: 'Contacts', path: '/contact' },
        ],
      },
    ],
  },
  {
    key: 'formations',
    label: 'Formations',
    path: '/formations',
    groups: [
      {
        title: 'Formations initiales',
        links: [
          { label: 'École Supérieure de Navigation (ESN)', path: '/formations/esn' },
          { label: 'École Supérieure des Transports Maritimes (ESTM)', path: '/formations/estm' },
          { label: 'Collège d’Enseignement et d’Apprentissage Maritime (CEAM)', path: '/formations/ceam' },
          { label: 'Formation à distance (FOAD)', path: '/formations/foad' },
        ],
      },
      {
        title: 'Formations continues',
        links: [
          { label: 'Navigation et industries', path: '/formation-continue' },
          { label: 'Certificats STCW', path: '/formation-continue', fragment: 'stcw' },
          { label: 'Institut de Sécurité Maritime (ISMI)', path: '/formations/ismi' },
          { label: 'Centre de recherche (CREMPOL)', path: '/formations/crempol' },
        ],
      },
    ],
  },
  {
    key: 'admissions',
    label: 'Admissions',
    path: '/admissions',
    groups: [
      {
        title: 'Intégrer l’ARSTM',
        links: [
          { label: 'Pourquoi intégrer l’ARSTM', path: '/admissions', fragment: 'pourquoi' },
          { label: 'Concours d’entrée', path: '/admissions', fragment: 'concours' },
          { label: 'Inscription sur analyse de dossier', path: '/admissions', fragment: 'dossier' },
          { label: 'Candidater en ligne', path: '/admissions/candidater' },
        ],
      },
      {
        title: 'Préparer sa rentrée',
        links: [
          { label: 'Calendrier pédagogique', path: '/admissions', fragment: 'calendrier' },
          { label: 'Tarifs, bourses et aides', path: '/admissions', fragment: 'tarifs' },
          { label: 'Guide complet de l’ARSTM', path: '/admissions', fragment: 'guide' },
          { label: 'FAQ', path: '/admissions', fragment: 'faq' },
        ],
      },
    ],
  },
  {
    key: 'actualites',
    label: 'Actualités',
    path: '/actualites',
    groups: [
      {
        title: 'Actualités et agenda',
        links: [
          { label: 'Actualités de l’ARSTM', path: '/actualites' },
          { label: 'Événements à venir', path: '/agenda' },
          { label: 'Revue de presse', path: '/actualites', fragment: 'presse' },
          { label: 'Newsletter', path: '/contact', fragment: 'newsletter' },
        ],
      },
      {
        title: 'Médiathèque',
        links: [
          { label: 'Photos et vidéos', path: '/mediatheque' },
          { label: 'Publications', path: '/mediatheque', fragment: 'publications' },
          { label: 'Brochures et documents', path: '/mediatheque', fragment: 'documents' },
          { label: 'Veille et analyses', path: '/ressources' },
        ],
      },
    ],
  },
];

/** Menu « Je cherche… » — entrée par profil de visiteur (§ 4.2) */
export const PROFILE_NAV: { profile: string; icon: string; links: NavLink[] }[] = [
  {
    profile: 'Je suis étudiant',
    icon: 'cap',
    links: [
      { label: 'Choisir ma formation', path: '/formations' },
      { label: 'Préparer le concours', path: '/admissions', fragment: 'concours' },
      { label: 'Bourses et frais', path: '/admissions', fragment: 'tarifs' },
      { label: 'Vie sur le campus', path: '/campus' },
    ],
  },
  {
    profile: 'Je suis professionnel',
    icon: 'anchor',
    links: [
      { label: 'Certificats STCW', path: '/formation-continue', fragment: 'stcw' },
      { label: 'S’inscrire à une session', path: '/formation-continue', fragment: 'sessions' },
      { label: 'Se former à distance', path: '/formations/foad' },
      { label: 'Offres d’emploi', path: '/carrieres' },
    ],
  },
  {
    profile: 'Je représente une entreprise',
    icon: 'building',
    links: [
      { label: 'Former mes équipes', path: '/formation-continue' },
      { label: 'Recruter un diplômé', path: '/carrieres' },
      { label: 'Proposer un stage', path: '/carrieres', fragment: 'publier' },
      { label: 'Devenir partenaire', path: '/references' },
    ],
  },
  {
    profile: 'Je représente une institution',
    icon: 'shield',
    links: [
      { label: 'Gouvernance', path: '/institution/organigramme' },
      { label: 'Sûreté maritime (ISMI)', path: '/formations/ismi' },
      { label: 'Recherche (CREMPOL)', path: '/formations/crempol' },
      { label: 'Vérifier un diplôme', path: '/verifier-diplome' },
    ],
  },
];

/** Portail « Tous les sites et applications de l’ARSTM » (§ 6.3) */
export const PORTAL: { title: string; icon: string; path: string; external?: boolean }[] = [
  { title: 'Espace élèves', icon: 'user', path: '/espace' },
  { title: 'Centre de carrière', icon: 'briefcase', path: '/carrieres' },
  { title: 'Installations et équipements', icon: 'building', path: '/campus' },
  { title: 'Vie estudiantine', icon: 'users', path: '/campus', },
  { title: 'Vérifier un diplôme', icon: 'badge', path: '/verifier-diplome' },
  { title: 'Mail institutionnel', icon: 'mail', path: '/contact' },
  { title: 'CREMPOL', icon: 'chart', path: '/formations/crempol' },
  { title: 'ISMI', icon: 'shield', path: '/formations/ismi' },
  { title: 'DDFCP', icon: 'anchor', path: '/formation-continue' },
  { title: 'Plateforme FOAD', icon: 'monitor', path: '/formations/foad' },
  { title: 'Antenne de San-Pedro', icon: 'pin', path: '/institution/situation' },
  { title: 'Bibliothèque numérique', icon: 'book', path: '/ressources', },
];

export const QUICK_CHIPS: NavLink[] = [
  { label: 'Concours d’entrée', path: '/admissions', fragment: 'concours' },
  { label: 'Certificats STCW', path: '/formation-continue', fragment: 'stcw' },
  { label: 'Formation continue', path: '/formation-continue' },
  { label: 'Formation à distance', path: '/formations/foad' },
  { label: 'Bourses et frais', path: '/admissions', fragment: 'tarifs' },
  { label: 'Vérifier un diplôme', path: '/verifier-diplome' },
  { label: 'Visiter le campus', path: '/campus' },
];

/* ------------------------------------------------------------------ */
/* Écoles, entités et formations                                       */
/* ------------------------------------------------------------------ */

export type ProgramType = 'Formation initiale' | 'Formation continue' | 'Formation à distance';

export interface Program {
  slug: string;
  school: string;
  title: string;
  type: ProgramType;
  level: string;
  domain: string;
  duration: string;
  rhythm: string;
  summary: string;
  objectives: string[];
  admission: string[];
  modules: { title: string; items: string[] }[];
  outcomes: string[];
  fees: string;
}

export interface School {
  slug: string;
  code: string;
  tab: string;
  name: string;
  kind: string;
  text: string;
  intro: string;
  img: string;
  alt: string;
  tone: Tone;
  highlights: { value: string; label: string }[];
  outcomes: string[];
}

export const SCHOOLS: School[] = [
  {
    slug: 'esn',
    code: 'ESN',
    tab: 'ESN — Navigation',
    name: 'École Supérieure de Navigation',
    kind: 'École',
    text: 'Officiers supérieurs de la marine marchande, au pont et à la machine, et techniciens supérieurs en maintenance industrielle.',
    intro:
      'L’ESN forme les personnels navigants de la marine marchande : officiers pont et machine appelés à commander ou à diriger la conduite technique des navires, ainsi que les techniciens supérieurs en maintenance industrielle. Les cursus sont conformes à la convention STCW de l’OMI et alternent cours, simulateurs et embarquements.',
    img: IMG.salut,
    alt: 'Élèves officiers au garde-à-vous',
    tone: 'blue',
    highlights: [
      { value: 'STCW', label: 'Cursus conformes OMI' },
      { value: 'Pont · Machine', label: 'Deux filières navigantes' },
      { value: 'Simulateurs', label: 'Passerelle et salle des machines' },
    ],
    outcomes: [
      'Officier chef de quart pont ou machine',
      'Second capitaine, capitaine au long cours',
      'Chef mécanicien, second mécanicien',
      'Pilote portuaire, inspecteur de la navigation',
      'Technicien supérieur en maintenance industrielle',
    ],
  },
  {
    slug: 'estm',
    code: 'ESTM',
    tab: 'ESTM — Transports maritimes',
    name: 'École Supérieure des Transports Maritimes',
    kind: 'École',
    text: 'Cadres moyens et supérieurs des ports, du transit, de la consignation et de la logistique.',
    intro:
      'L’ESTM forme les cadres sédentaires des entreprises auxiliaires des transports maritimes : ports, transit, consignation, manutention, assurance et logistique. Ses diplômés pilotent les chaînes d’approvisionnement qui relient les ports africains au reste du monde.',
    img: IMG.douala,
    alt: 'Délégation portuaire en visite',
    tone: 'orange',
    highlights: [
      { value: 'Licence · Master', label: 'Système LMD' },
      { value: 'Ports & logistique', label: 'Spécialités sédentaires' },
      { value: 'Stages', label: 'En entreprise portuaire' },
    ],
    outcomes: [
      'Cadre d’autorité portuaire',
      'Transitaire, commissionnaire en douane',
      'Agent consignataire de navires',
      'Responsable logistique et supply chain',
      'Juriste en droit maritime et assurances',
    ],
  },
  {
    slug: 'ceam',
    code: 'CEAM',
    tab: 'CEAM — Apprentissage maritime',
    name: 'Collège d’Enseignement et d’Apprentissage Maritime',
    kind: 'Collège',
    text: 'Officiers subalternes et équipages des services pont, machine et pêche : C 500 et CAM Polyvalent.',
    intro:
      'Le CEAM forme les officiers subalternes et les équipages des services pont, machine et pêche. Ses formations courtes et très pratiques ouvrent rapidement l’accès aux métiers embarqués de la marine marchande et de la pêche.',
    img: IMG.hero,
    alt: 'Élèves en uniforme blanc présentant les drapeaux',
    tone: 'navy',
    highlights: [
      { value: 'C 500', label: 'Capitaine 500' },
      { value: 'CAM', label: 'Certificat polyvalent' },
      { value: 'Pratique', label: 'Ateliers et embarquements' },
    ],
    outcomes: [
      'Capitaine de navire de moins de 500 UMS',
      'Matelot et maître d’équipage',
      'Mécanicien de bord',
      'Patron de pêche',
    ],
  },
  {
    slug: 'ismi',
    code: 'ISMI',
    tab: 'ISMI — Sûreté maritime',
    name: 'Institut de Sécurité Maritime Interrégional',
    kind: 'Institut',
    text: 'Sûreté des navires et des ports, lutte contre les actes illicites en mer.',
    intro:
      'L’ISMI forme et renforce les capacités des cadres civils et militaires d’Afrique de l’Ouest et du Centre pour lutter contre les actes illicites en mer : piraterie, trafics, pêche illégale, pollution. Il est un acteur de l’architecture de Yaoundé pour la sûreté du golfe de Guinée.',
    img: IMG.reunion,
    alt: 'Réunion de travail à l’ARSTM',
    tone: 'violet',
    highlights: [
      { value: 'Civils · Militaires', label: 'Publics mixtes' },
      { value: 'Golfe de Guinée', label: 'Ancrage régional' },
      { value: 'ISPS', label: 'Sûreté portuaire' },
    ],
    outcomes: [
      'Agent et officier de sûreté portuaire',
      'Officier de l’action de l’État en mer',
      'Analyste en sûreté maritime',
      'Cadre des centres de coordination régionaux',
    ],
  },
  {
    slug: 'crempol',
    code: 'CREMPOL',
    tab: 'CREMPOL — Recherche',
    name: 'Centre de Recherche Maritime, Portuaire et Logistique',
    kind: 'Centre de recherche',
    text: 'Études sur le transport, les passages portuaires et les corridors de la sous-région.',
    intro:
      'Le CREMPOL apporte des solutions pragmatiques aux défis logistiques des États africains : offres de transport, passages portuaires, gestion des corridors. Il réalise des études pour les États, les ports et les bailleurs, et publie ses travaux dans l’espace média.',
    img: IMG.conference,
    alt: 'Intervenant lors d’une conférence',
    tone: 'teal',
    highlights: [
      { value: 'Études', label: 'Pour États et ports' },
      { value: 'Corridors', label: 'Logistique régionale' },
      { value: 'Publications', label: 'En accès libre' },
    ],
    outcomes: [
      'Études sectorielles et de faisabilité',
      'Appui aux politiques publiques de transport',
      'Observatoire des passages portuaires',
      'Séminaires et conférences scientifiques',
    ],
  },
  {
    slug: 'foad',
    code: 'FOAD',
    tab: 'FOAD — À distance',
    name: 'Formation à distance',
    kind: 'Plateforme',
    text: 'Se former aux métiers de la mer et de l’industrie, à distance et à son rythme.',
    intro:
      'La plateforme FOAD permet de suivre des modules de l’ARSTM depuis n’importe quel pays : cours vidéo, classes virtuelles, quiz et évaluations en ligne. Idéale pour les professionnels en activité qui veulent se spécialiser sans interrompre leur carrière.',
    img: IMG.campus,
    alt: 'Bâtiment à arcades du campus',
    tone: 'green',
    highlights: [
      { value: '100 % en ligne', label: 'À votre rythme' },
      { value: 'Classes virtuelles', label: 'Avec les formateurs' },
      { value: 'Attestation', label: 'Délivrée par l’ARSTM' },
    ],
    outcomes: [
      'Montée en compétences sans interruption de carrière',
      'Préparation aux certifications professionnelles',
      'Reconversion vers les métiers portuaires',
    ],
  },
];

const FEES_NOTE = 'Selon la nationalité et le statut (boursier OMAOC, auditeur libre) — voir la grille tarifaire.';

export const PROGRAMS: Program[] = [
  {
    slug: 'licence-navigation',
    school: 'esn',
    title: 'Licence — Officier chef de quart pont',
    type: 'Formation initiale',
    level: 'Licence',
    domain: 'Navigation',
    duration: '3 ans + embarquements',
    rhythm: 'Temps plein, alternance école / navire',
    summary: 'Former des officiers capables d’assurer le quart à la passerelle et la conduite nautique des navires de commerce.',
    objectives: [
      'Assurer le quart à la passerelle en toute sécurité',
      'Maîtriser la navigation électronique (radar, ARPA, ECDIS)',
      'Gérer la cargaison, la stabilité et l’arrimage',
      'Appliquer les règles internationales (COLREG, SOLAS, MARPOL)',
    ],
    admission: ['Baccalauréat C, D ou E', 'Réussite au concours d’entrée', 'Certificat médical d’aptitude à la navigation', 'Âge maximum : 25 ans'],
    modules: [
      { title: 'Année 1 — Fondamentaux', items: ['Mathématiques et physique appliquées', 'Navigation côtière', 'Matelotage et sécurité', 'Anglais maritime'] },
      { title: 'Année 2 — Conduite du navire', items: ['Navigation astronomique', 'Simulateur de passerelle', 'Météorologie marine', 'Stabilité du navire'] },
      { title: 'Année 3 — Officier chef de quart', items: ['ECDIS et GMDSS', 'Exploitation commerciale', 'Droit maritime', 'Embarquement de fin d’études'] },
    ],
    outcomes: ['Officier chef de quart pont', 'Lieutenant de pont', 'Officier de port'],
    fees: FEES_NOTE,
  },
  {
    slug: 'master-capitaine',
    school: 'esn',
    title: 'Master — Capitaine de 1re classe de la navigation maritime',
    type: 'Formation initiale',
    level: 'Master',
    domain: 'Navigation',
    duration: '2 ans',
    rhythm: 'Temps plein',
    summary: 'Préparer les officiers expérimentés aux fonctions de commandement et de direction à bord.',
    objectives: ['Commander un navire de toute jauge', 'Piloter la sécurité et la sûreté à bord', 'Manager un équipage multiculturel', 'Gérer les relations armateur, affréteur et port'],
    admission: ['Licence en navigation ou équivalent', 'Temps de navigation validé', 'Étude du dossier et entretien'],
    modules: [
      { title: 'Semestres 1–2', items: ['Manœuvre avancée sur simulateur', 'Gestion des situations d’urgence', 'Droit et assurances maritimes'] },
      { title: 'Semestres 3–4', items: ['Leadership et gestion d’équipage', 'Économie du transport maritime', 'Mémoire professionnel'] },
    ],
    outcomes: ['Capitaine au long cours', 'Second capitaine', 'Expert maritime', 'Inspecteur de la navigation'],
    fees: FEES_NOTE,
  },
  {
    slug: 'licence-machine',
    school: 'esn',
    title: 'Licence — Officier mécanicien',
    type: 'Formation initiale',
    level: 'Licence',
    domain: 'Machine',
    duration: '3 ans + embarquements',
    rhythm: 'Temps plein, alternance école / navire',
    summary: 'Former des officiers chargés de la conduite et de la maintenance des installations de propulsion et auxiliaires.',
    objectives: ['Conduire la machine principale et les auxiliaires', 'Planifier la maintenance préventive', 'Maîtriser l’électrotechnique embarquée', 'Prévenir la pollution par les navires'],
    admission: ['Baccalauréat C, D, E ou F', 'Réussite au concours d’entrée', 'Certificat médical d’aptitude'],
    modules: [
      { title: 'Année 1', items: ['Thermodynamique', 'Dessin industriel', 'Atelier et soudure'] },
      { title: 'Année 2', items: ['Moteurs diesel marins', 'Simulateur de salle des machines', 'Électricité navale'] },
      { title: 'Année 3', items: ['Automatismes', 'Gestion de la maintenance', 'Embarquement de fin d’études'] },
    ],
    outcomes: ['Officier mécanicien chef de quart', 'Second mécanicien', 'Technicien de chantier naval'],
    fees: FEES_NOTE,
  },
  {
    slug: 'bts-maintenance',
    school: 'esn',
    title: 'Technicien supérieur en maintenance industrielle',
    type: 'Formation initiale',
    level: 'BTS',
    domain: 'Industrie',
    duration: '2 ans',
    rhythm: 'Temps plein avec stages',
    summary: 'Former des techniciens capables de maintenir les équipements industriels et portuaires.',
    objectives: ['Diagnostiquer une panne mécanique ou électrique', 'Organiser la maintenance', 'Respecter les règles HSE'],
    admission: ['Baccalauréat scientifique ou technique', 'Étude du dossier'],
    modules: [
      { title: 'Année 1', items: ['Mécanique générale', 'Électrotechnique', 'Hydraulique'] },
      { title: 'Année 2', items: ['Automatismes industriels', 'GMAO', 'Stage en entreprise'] },
    ],
    outcomes: ['Technicien de maintenance', 'Chef d’équipe maintenance portuaire'],
    fees: FEES_NOTE,
  },
  {
    slug: 'licence-transport-logistique',
    school: 'estm',
    title: 'Licence — Transport maritime et logistique',
    type: 'Formation initiale',
    level: 'Licence',
    domain: 'Logistique',
    duration: '3 ans',
    rhythm: 'Temps plein avec stages',
    summary: 'Former des cadres opérationnels du transit, de la consignation et de la chaîne logistique.',
    objectives: ['Organiser un transport multimodal', 'Maîtriser les procédures douanières', 'Gérer une opération de consignation', 'Piloter des flux logistiques'],
    admission: ['Baccalauréat toutes séries', 'Réussite au concours d’entrée'],
    modules: [
      { title: 'Année 1', items: ['Économie générale', 'Géographie des transports', 'Comptabilité'] },
      { title: 'Année 2', items: ['Transit et douane', 'Commerce international', 'Incoterms'] },
      { title: 'Année 3', items: ['Supply chain', 'Droit des transports', 'Stage de fin d’études'] },
    ],
    outcomes: ['Transitaire', 'Agent consignataire', 'Assistant logistique'],
    fees: FEES_NOTE,
  },
  {
    slug: 'licence-gestion-portuaire',
    school: 'estm',
    title: 'Licence — Gestion portuaire',
    type: 'Formation initiale',
    level: 'Licence',
    domain: 'Ports',
    duration: '3 ans',
    rhythm: 'Temps plein avec stages',
    summary: 'Former des cadres de l’exploitation et de la gestion des terminaux portuaires.',
    objectives: ['Comprendre l’organisation d’un port', 'Gérer un terminal à conteneurs', 'Appliquer la réglementation portuaire'],
    admission: ['Baccalauréat toutes séries', 'Réussite au concours d’entrée'],
    modules: [
      { title: 'Années 1–2', items: ['Économie portuaire', 'Manutention', 'Statistiques'] },
      { title: 'Année 3', items: ['Exploitation des terminaux', 'Sûreté portuaire', 'Stage en port'] },
    ],
    outcomes: ['Cadre d’autorité portuaire', 'Planificateur de terminal', 'Agent de manutention'],
    fees: FEES_NOTE,
  },
  {
    slug: 'master-management-portuaire',
    school: 'estm',
    title: 'Master — Management portuaire et logistique',
    type: 'Formation initiale',
    level: 'Master',
    domain: 'Ports',
    duration: '2 ans',
    rhythm: 'Temps plein ou cours du soir',
    summary: 'Former les dirigeants des ports, des compagnies de transport et des plateformes logistiques.',
    objectives: ['Élaborer une stratégie portuaire', 'Piloter la performance d’un corridor', 'Manager les partenariats public-privé'],
    admission: ['Licence en transport, économie ou gestion', 'Étude du dossier et entretien'],
    modules: [
      { title: 'Semestres 1–2', items: ['Stratégie et gouvernance portuaires', 'Finance des infrastructures', 'Corridors et hinterland'] },
      { title: 'Semestres 3–4', items: ['PPP et concessions', 'Transformation numérique des ports', 'Mémoire'] },
    ],
    outcomes: ['Directeur de terminal', 'Responsable logistique', 'Consultant transport'],
    fees: FEES_NOTE,
  },
  {
    slug: 'c500',
    school: 'ceam',
    title: 'C 500 — Capitaine 500',
    type: 'Formation initiale',
    level: 'Brevet',
    domain: 'Navigation',
    duration: '12 mois',
    rhythm: 'Temps plein',
    summary: 'Former les capitaines des navires de moins de 500 UMS au cabotage et à la navigation côtière.',
    objectives: ['Commander un navire de moins de 500 UMS', 'Naviguer en zone côtière', 'Assurer la sécurité de l’équipage'],
    admission: ['BEPC ou niveau équivalent', 'Temps de navigation requis', 'Certificat médical'],
    modules: [
      { title: 'Programme', items: ['Navigation côtière', 'Manœuvre', 'Sécurité et survie en mer', 'Réglementation'] },
    ],
    outcomes: ['Capitaine 500', 'Patron de navire de servitude'],
    fees: FEES_NOTE,
  },
  {
    slug: 'cam-polyvalent',
    school: 'ceam',
    title: 'CAM Polyvalent',
    type: 'Formation initiale',
    level: 'Certificat',
    domain: 'Pont et machine',
    duration: '9 mois',
    rhythm: 'Temps plein',
    summary: 'Certificat d’aptitude maritime polyvalent pour les matelots des services pont et machine.',
    objectives: ['Assurer les tâches de matelotage', 'Participer à la conduite de la machine', 'Appliquer les consignes de sécurité'],
    admission: ['Niveau 3e', 'Certificat médical', 'Âge minimum : 16 ans'],
    modules: [{ title: 'Programme', items: ['Matelotage', 'Mécanique de base', 'Formation de base à la sécurité (STCW)'] }],
    outcomes: ['Matelot polyvalent', 'Ouvrier mécanicien'],
    fees: FEES_NOTE,
  },
  {
    slug: 'surete-portuaire-isps',
    school: 'ismi',
    title: 'Agent de sûreté portuaire (code ISPS)',
    type: 'Formation continue',
    level: 'Module court',
    domain: 'Sûreté',
    duration: '5 jours',
    rhythm: 'Session intensive',
    summary: 'Appliquer le code ISPS dans une installation portuaire.',
    objectives: ['Évaluer la sûreté d’une installation', 'Mettre en œuvre un plan de sûreté', 'Conduire des exercices'],
    admission: ['Personnel portuaire ou des forces de sécurité'],
    modules: [{ title: 'Programme', items: ['Code ISPS', 'Évaluation de la menace', 'Contrôle d’accès', 'Exercices pratiques'] }],
    outcomes: ['Agent de sûreté de l’installation portuaire (PFSO)'],
    fees: 'Tarif session — inscription en ligne',
  },
  {
    slug: 'action-etat-en-mer',
    school: 'ismi',
    title: 'Action de l’État en mer',
    type: 'Formation continue',
    level: 'Certificat',
    domain: 'Sûreté',
    duration: '6 semaines',
    rhythm: 'Session',
    summary: 'Former les cadres civils et militaires à la coordination de l’action de l’État en mer.',
    objectives: ['Comprendre le cadre juridique', 'Coordonner les administrations', 'Conduire une opération de police en mer'],
    admission: ['Cadres civils et militaires désignés par leur État'],
    modules: [{ title: 'Programme', items: ['Droit de la mer', 'Lutte contre la piraterie', 'Pêche INN', 'Exercice de synthèse'] }],
    outcomes: ['Officier de l’action de l’État en mer'],
    fees: 'Sur désignation — prise en charge par les États',
  },
  {
    slug: 'foad-logistique',
    school: 'foad',
    title: 'Fondamentaux de la logistique portuaire',
    type: 'Formation à distance',
    level: 'Module court',
    domain: 'Logistique',
    duration: '8 semaines',
    rhythm: '4 h par semaine, en ligne',
    summary: 'Découvrir l’organisation des ports et des chaînes logistiques, à votre rythme.',
    objectives: ['Comprendre le passage portuaire', 'Identifier les acteurs', 'Lire un connaissement'],
    admission: ['Ouvert à tous, niveau baccalauréat conseillé'],
    modules: [{ title: 'Programme', items: ['Le port et ses acteurs', 'Documents de transport', 'Incoterms', 'Évaluation finale'] }],
    outcomes: ['Attestation de suivi ARSTM'],
    fees: 'Inscription et paiement en ligne',
  },
  {
    slug: 'foad-anglais-maritime',
    school: 'foad',
    title: 'Anglais maritime (SMCP)',
    type: 'Formation à distance',
    level: 'Module court',
    domain: 'Navigation',
    duration: '10 semaines',
    rhythm: 'Classes virtuelles hebdomadaires',
    summary: 'Communiquer à bord et avec la terre selon les phrases normalisées de l’OMI.',
    objectives: ['Maîtriser les SMCP de l’OMI', 'Communiquer en VHF', 'Rédiger un rapport de bord'],
    admission: ['Navigants et élèves officiers'],
    modules: [{ title: 'Programme', items: ['Phraséologie VHF', 'Situations d’urgence', 'Rédaction technique'] }],
    outcomes: ['Attestation de suivi ARSTM'],
    fees: 'Inscription et paiement en ligne',
  },
];

export const schoolBySlug = (slug: string) => SCHOOLS.find((s) => s.slug === slug);
export const programsOf = (slug: string) => PROGRAMS.filter((p) => p.school === slug);

/* ------------------------------------------------------------------ */
/* Formation continue : sessions STCW (inscription + paiement démo)     */
/* ------------------------------------------------------------------ */

export interface Session {
  id: string;
  title: string;
  code: string;
  dates: string;
  duration: string;
  place: string;
  seats: number;
  seatsLeft: number;
  price: number;
  online?: boolean;
}

export const STCW_SESSIONS: Session[] = [
  { id: 's1', code: 'STCW A-VI/1', title: 'Formation de base à la sécurité (FBS)', dates: '7 – 18 déc. 2026', duration: '10 jours', place: 'Campus de Yopougon', seats: 24, seatsLeft: 6, price: 180000 },
  { id: 's2', code: 'STCW A-VI/5', title: 'Officier de sûreté du navire (SSO)', dates: '11 – 15 janv. 2027', duration: '5 jours', place: 'Campus de Yopougon', seats: 20, seatsLeft: 12, price: 220000 },
  { id: 's3', code: 'STCW A-II/1', title: 'Radar et ARPA — niveau opérationnel', dates: '18 – 29 janv. 2027', duration: '10 jours', place: 'Simulateur de passerelle', seats: 12, seatsLeft: 3, price: 350000 },
  { id: 's4', code: 'STCW A-II/1', title: 'ECDIS — cartes électroniques', dates: '1 – 5 févr. 2027', duration: '5 jours', place: 'Simulateur de passerelle', seats: 12, seatsLeft: 0, price: 300000 },
  { id: 's5', code: 'STCW A-IV/2', title: 'Opérateur radio GMDSS', dates: '15 – 26 févr. 2027', duration: '10 jours', place: 'Campus de Yopougon', seats: 16, seatsLeft: 9, price: 280000 },
  { id: 's6', code: 'FOAD', title: 'Sensibilisation à la sûreté (en ligne)', dates: 'Entrée permanente', duration: '2 jours', place: 'Plateforme FOAD', seats: 200, seatsLeft: 142, price: 45000, online: true },
];

export const CONTINUING_TRACKS = [
  { title: 'Navigation et industries', icon: 'compass', tone: 'blue' as Tone, text: 'Recyclages et revalidations des brevets, modules machine, maintenance industrielle et HSE pour les entreprises.' },
  { title: 'Certificats STCW', icon: 'badge', tone: 'orange' as Tone, text: 'Sécurité, sûreté, radar, ECDIS, GMDSS : les certificats exigés par la convention STCW de l’OMI.' },
  { title: 'Sûreté maritime — ISMI', icon: 'shield', tone: 'violet' as Tone, text: 'Sûreté portuaire ISPS, action de l’État en mer, lutte contre les actes illicites.' },
  { title: 'Recherche — CREMPOL', icon: 'chart', tone: 'teal' as Tone, text: 'Séminaires et formations sur mesure sur la logistique, les corridors et les passages portuaires.' },
];

/* ------------------------------------------------------------------ */
/* Actualités & agenda                                                 */
/* ------------------------------------------------------------------ */

export interface Article {
  slug: string;
  title: string;
  category: string;
  tone: Tone;
  date: string;
  img: string;
  alt: string;
  excerpt: string;
  body: string[];
}

export const NEWS: Article[] = [
  {
    slug: 'ceremonie-fin-salut-aux-couleurs',
    title: 'Cérémonie de fin du salut aux couleurs à l’ARSTM',
    category: 'Vie de l’Académie',
    tone: 'blue',
    date: '26 mai 2026',
    img: IMG.salut,
    alt: 'Cérémonie de fin du salut aux couleurs',
    excerpt: 'Élèves officiers, personnel et invités se sont réunis sur la place d’armes pour clôturer l’année académique.',
    body: [
      'Élèves officiers, personnel administratif et invités se sont réunis sur la place d’armes du campus de Yopougon pour la cérémonie de fin du salut aux couleurs, moment fort qui clôture chaque année académique.',
      'Ce rituel, hérité des traditions de la marine marchande, rappelle les valeurs que l’Académie transmet à ses élèves : discipline, rigueur et esprit d’équipage.',
      'La Direction générale a félicité les promotions sortantes et salué l’engagement des formateurs tout au long de l’année.',
    ],
  },
  {
    slug: 'appel-offres-site-web',
    title: 'Appel d’offres : conception et réalisation du site web de l’ARSTM',
    category: 'Annonce',
    tone: 'orange',
    date: '21 mai 2026',
    img: IMG.appel,
    alt: 'Affiche de l’appel d’offres pour le site web de l’ARSTM',
    excerpt: 'L’ARSTM lance un appel d’offres pour la troisième version de son site institutionnel.',
    body: [
      'Le Département Communication et Marketing lance un appel d’offres pour la conception et la réalisation de la troisième version du site web institutionnel de l’ARSTM.',
      'Le futur site, bilingue et mobile-first, intégrera notamment l’inscription et le paiement en ligne, un portail thématique et une médiathèque.',
      'Le cahier des charges est disponible sur demande auprès du Département Communication et Marketing.',
    ],
  },
  {
    slug: 'delegation-port-autonome-douala',
    title: 'L’ARSTM accueille une délégation du Port Autonome de Douala',
    category: 'Partenariats',
    tone: 'green',
    date: '13 avril 2026',
    img: IMG.douala,
    alt: 'Délégation du Port Autonome de Douala',
    excerpt: 'Une visite d’échange pour renforcer la coopération en matière de formation portuaire.',
    body: [
      'Une délégation du Port Autonome de Douala a été reçue à l’ARSTM pour une visite d’échange consacrée à la formation des cadres portuaires.',
      'Les deux institutions ont exploré des pistes de coopération : formations sur mesure, accueil de stagiaires et études conjointes avec le CREMPOL.',
    ],
  },
  {
    slug: 'seminaire-surete-golfe-de-guinee',
    title: 'Séminaire régional sur la sûreté dans le golfe de Guinée',
    category: 'Conférences',
    tone: 'violet',
    date: '28 mars 2026',
    img: IMG.reunion,
    alt: 'Participants au séminaire de l’ISMI',
    excerpt: 'L’ISMI a réuni des cadres civils et militaires de onze pays autour de la lutte contre les actes illicites en mer.',
    body: [
      'L’Institut de Sécurité Maritime Interrégional a réuni pendant trois jours des cadres civils et militaires de onze pays de la sous-région.',
      'Les échanges ont porté sur le partage de l’information maritime et la coordination des interventions en mer.',
    ],
  },
  {
    slug: 'conference-corridors-logistiques',
    title: 'Le CREMPOL présente son étude sur les corridors logistiques',
    category: 'Recherche',
    tone: 'teal',
    date: '9 mars 2026',
    img: IMG.conference,
    alt: 'Intervenant lors de la conférence du CREMPOL',
    excerpt: 'Temps de passage portuaire, coûts et goulots d’étranglement : les résultats d’une année d’enquête.',
    body: [
      'Le Centre de Recherche Maritime, Portuaire et Logistique a présenté les résultats de son étude sur les corridors desservant les pays sans littoral.',
      'L’étude complète est disponible dans l’espace Publications de la médiathèque.',
    ],
  },
  {
    slug: 'journee-portes-ouvertes-2026',
    title: 'Retour sur la journée portes ouvertes 2026',
    category: 'Portes ouvertes',
    tone: 'navy',
    date: '14 février 2026',
    img: IMG.campus,
    alt: 'Visiteurs devant le bâtiment à arcades du campus',
    excerpt: 'Simulateurs, piscine olympique, ateliers : plus de 1 500 visiteurs ont découvert le campus.',
    body: [
      'Lycéens, parents et professionnels ont découvert les installations du campus : simulateurs de passerelle et de salle des machines, ateliers, piscine olympique.',
      'Les élèves officiers ont présenté leur quotidien et répondu aux questions des futurs candidats.',
    ],
  },
];

export const NEWS_CATEGORIES = ['Toutes', ...Array.from(new Set(NEWS.map((n) => n.category)))];

export interface EventItem {
  day: string;
  month: string;
  year: string;
  title: string;
  place: string;
  time: string;
  category: string;
  tone: Tone;
  text: string;
  important?: boolean;
  isoStart: string;
  isoEnd: string;
}

export const EVENTS: EventItem[] = [
  { day: '05', month: 'déc.', year: '2026', isoStart: '20261205T090000', isoEnd: '20261205T170000', title: 'Journée portes ouvertes', place: 'Campus de Yopougon', time: '9 h – 17 h', category: 'Portes ouvertes', tone: 'navy', text: 'Visite des simulateurs, rencontres avec les écoles et ateliers d’orientation.', important: true },
  { day: '12', month: 'déc.', year: '2026', isoStart: '20261212T100000', isoEnd: '20261212T130000', title: 'Soutenances du Master Management portuaire', place: 'Amphithéâtre A', time: '10 h – 13 h', category: 'Soutenances', tone: 'blue', text: 'Soutenances publiques des mémoires de la promotion 2026.' },
  { day: '15', month: 'janv.', year: '2027', isoStart: '20270115T080000', isoEnd: '20270315T180000', title: 'Ouverture des inscriptions au concours 2027', place: 'En ligne et dans les ministères', time: 'Jusqu’au 15 mars', category: 'Concours', tone: 'orange', text: 'Dépôt des dossiers de candidature pour l’ESN, l’ESTM et le CEAM.', important: true },
  { day: '04', month: 'févr.', year: '2027', isoStart: '20270204T090000', isoEnd: '20270205T170000', title: 'Séminaire ISMI : sûreté des installations portuaires', place: 'ISMI', time: '2 jours', category: 'Séminaires', tone: 'violet', text: 'Retours d’expérience et exercices de mise en œuvre du code ISPS.' },
  { day: '18', month: 'mars', year: '2027', isoStart: '20270318T150000', isoEnd: '20270318T170000', title: 'Webinaire : devenir officier de la marine marchande', place: 'En ligne', time: '15 h – 17 h', category: 'Webinaires', tone: 'green', text: 'Les filières, le concours et la vie à bord, présentés par les élèves officiers.' },
  { day: '24', month: 'avr.', year: '2027', isoStart: '20270424T090000', isoEnd: '20270424T120000', title: 'Cérémonie de remise des diplômes', place: 'Place d’armes', time: '9 h', category: 'Cérémonies officielles', tone: 'teal', text: 'Remise des diplômes des promotions 2026 en présence des États membres.' },
];

export const PRESS = [
  { outlet: 'Fraternité Matin', title: 'L’ARSTM, pépinière des cadres maritimes africains', date: 'Avril 2026' },
  { outlet: 'Abidjan.net', title: 'Sûreté maritime : l’ISMI forme les cadres de onze pays', date: 'Mars 2026' },
  { outlet: 'Maritime Afrique', title: 'Corridors logistiques : l’étude qui bouscule les idées reçues', date: 'Mars 2026' },
];

/* ------------------------------------------------------------------ */
/* Admissions                                                          */
/* ------------------------------------------------------------------ */

export const ADMISSION_RESOURCES = [
  { title: 'Guide complet de l’ARSTM', desc: 'Formations, concours, vie sur le campus et démarches : tout en un document.', badge: 'Guide', tone: 'blue' as Tone, icon: 'book', cta: 'Télécharger', meta: 'PDF · 2,1 Mo', metaIcon: 'file', path: '/admissions', fragment: 'guide' },
  { title: 'Concours d’entrée 2027', desc: 'Conditions, pièces à fournir et déroulement des épreuves dans les pays membres.', badge: 'Procédure', tone: 'orange' as Tone, icon: 'check', cta: 'Voir les détails', meta: 'Jusqu’au 15 mars', metaIcon: 'clock', path: '/admissions', fragment: 'concours' },
  { title: 'Calendrier pédagogique', desc: 'Les grandes dates de l’année, des candidatures à la rentrée académique.', badge: 'Calendrier', tone: 'navy' as Tone, icon: 'calendar', cta: 'Voir les détails', meta: 'Rentrée oct. 2027', metaIcon: 'calendar', path: '/admissions', fragment: 'calendrier' },
  { title: 'Tarifs, bourses et aides', desc: 'Frais de scolarité par cycle, bourses des États membres et d’excellence.', badge: 'Tarifs', tone: 'green' as Tone, icon: 'coin', cta: 'Voir les détails', meta: 'Mobile money, carte', metaIcon: 'smartphone', path: '/admissions', fragment: 'tarifs' },
  { title: 'Inscription sur analyse de dossier', desc: 'Masters et formations continues accessibles sans concours, sur étude du parcours.', badge: 'Procédure', tone: 'violet' as Tone, icon: 'shield', cta: 'Voir les détails', meta: 'Sans concours', metaIcon: 'file', path: '/admissions', fragment: 'dossier' },
  { title: 'Hébergement sur le campus', desc: 'Internat, restauration et services pour les élèves officiers sur 33 hectares.', badge: 'Campus', tone: 'teal' as Tone, icon: 'home', cta: 'Voir les détails', meta: 'Campus de Yopougon', metaIcon: 'pin', path: '/campus', fragment: 'hebergement' },
];

export const FAQ = [
  { q: 'Comment s’inscrire au concours d’entrée ?', a: 'Le dossier se dépose en ligne depuis l’espace candidat, ou auprès du ministère chargé de la marine marchande de votre pays. Le calendrier est publié chaque année.' },
  { q: 'Quels documents faut-il fournir ?', a: '[Liste des pièces fournie par la scolarité : pièce d’identité, relevés de notes, certificat médical d’aptitude…]' },
  { q: 'Peut-on être logé sur le campus ?', a: '[Capacité et conditions d’hébergement à préciser par l’ARSTM.]' },
  { q: 'Comment payer les frais de formation ?', a: 'Par mobile money ou carte bancaire, en ligne et en toute sécurité. Un reçu est envoyé automatiquement par e-mail.' },
  { q: 'Les diplômes sont-ils reconnus à l’international ?', a: 'Les formations navigantes sont conformes à la convention STCW de l’OMI, et les diplômes sont homologués par le Ministère de l’Enseignement Supérieur et de la Recherche Scientifique.' },
  { q: 'Puis-je me former sans quitter mon emploi ?', a: 'Oui : la Formation à distance (FOAD) et les sessions courtes de formation continue sont conçues pour les professionnels en activité.' },
];

export const CALENDAR = [
  { period: '15 janv. – 15 mars 2027', label: 'Dépôt des candidatures au concours', tone: 'orange' as Tone },
  { period: '10 – 14 mai 2027', label: 'Épreuves écrites dans les pays membres', tone: 'blue' as Tone },
  { period: 'Juillet 2027', label: 'Publication des résultats', tone: 'navy' as Tone },
  { period: 'Septembre 2027', label: 'Inscriptions administratives', tone: 'green' as Tone },
  { period: 'Octobre 2027', label: 'Rentrée académique', tone: 'violet' as Tone },
];

export const MEMBER_STATES = ['Bénin', 'Burkina Faso', 'Congo', 'Côte d’Ivoire', 'Gabon', 'Guinée', 'Togo', 'RD Congo'];

/* ------------------------------------------------------------------ */
/* Contacts                                                            */
/* ------------------------------------------------------------------ */

export const USEFUL_CONTACTS = [
  { label: 'Standard', value: '27 23 46 08 08', href: 'tel:+2252723460808' },
  { label: 'Mobile', value: '01 01 08 08 02', href: 'tel:+2250101080802' },
  { label: 'Fax', value: '27 23 46 08 11', href: null },
  { label: 'Scolarité et admissions', value: '[numéro]', href: null },
  { label: 'Formation continue (DFCP)', value: '[numéro]', href: null },
  { label: 'E-mail', value: 'arstminfo@arstm.net', href: 'mailto:arstminfo@arstm.net' },
];

export const CONTACT_SUBJECTS = [
  { label: 'Admissions et concours', service: 'Scolarité' },
  { label: 'Formation continue', service: 'DDFCP' },
  { label: 'Partenariat entreprise', service: 'Département Communication et Marketing' },
  { label: 'Sûreté maritime (ISMI)', service: 'ISMI' },
  { label: 'Recherche et études (CREMPOL)', service: 'CREMPOL' },
  { label: 'Autre demande', service: 'Accueil' },
];

/* ------------------------------------------------------------------ */
/* Références, médias, ressources, carrières, campus                    */
/* ------------------------------------------------------------------ */

export const PARTNERS = [
  { name: 'OMAOC', desc: 'Organisation Maritime de l’Afrique de l’Ouest et du Centre' },
  { name: 'OMI', desc: 'Organisation Maritime Internationale' },
  { name: 'UEMOA', desc: 'Union Économique et Monétaire Ouest-Africaine' },
  { name: 'CEDEAO', desc: 'Communauté Économique des États de l’Afrique de l’Ouest' },
  { name: 'PAA', desc: 'Port Autonome d’Abidjan' },
  { name: 'PASP', desc: 'Port Autonome de San-Pedro' },
  { name: 'PAD', desc: 'Port Autonome de Douala' },
  { name: 'CIC', desc: 'Centre Interrégional de Coordination (Yaoundé)' },
];

export const CERTIFICATIONS = [
  { title: 'ISO 9001:2015', text: 'Système de management de la qualité certifié pour l’ensemble des activités de formation.', icon: 'badge', tone: 'blue' as Tone },
  { title: 'Conformité STCW', text: 'Formations navigantes conformes à la convention internationale de l’OMI.', icon: 'anchor', tone: 'orange' as Tone },
  { title: 'Homologation MESRS', text: 'Diplômes homologués par le Ministère de l’Enseignement Supérieur et de la Recherche Scientifique.', icon: 'cap', tone: 'green' as Tone },
];

export const GALLERY = [
  { img: IMG.hero, alt: 'Élèves en uniforme blanc présentant les drapeaux', cap: 'Présentation des drapeaux', cat: 'Promotions' },
  { img: IMG.salut, alt: 'Élèves officiers et drapeaux sur la place d’armes', cap: 'Salut aux couleurs', cat: 'Vie de l’Académie' },
  { img: IMG.campus, alt: 'Participants devant le bâtiment à arcades de l’ARSTM', cap: 'Campus de Yopougon', cat: 'Infrastructures' },
  { img: IMG.douala, alt: 'Délégation portuaire reçue à l’ARSTM', cap: 'Partenariats portuaires', cat: 'Partenariats' },
  { img: IMG.reunion, alt: 'Réunion de travail à l’ARSTM', cap: 'Séminaire de l’ISMI', cat: 'Événements' },
  { img: IMG.conference, alt: 'Intervenant lors d’une conférence', cap: 'Conférence du CREMPOL', cat: 'Événements' },
  { img: IMG.aerien, alt: 'Vue aérienne du campus de l’ARSTM', cap: 'Le campus vu du ciel', cat: 'Infrastructures' },
];

export const VIDEOS = [
  { title: 'Film institutionnel de l’ARSTM', duration: '6:42', img: IMG.hero, tag: 'Institution' },
  { title: 'Une journée d’élève officier', duration: '4:15', img: IMG.salut, tag: 'Vie étudiante' },
  { title: 'Webinaire : les métiers portuaires', duration: '58:10', img: IMG.douala, tag: 'Webinaire' },
  { title: 'Les simulateurs de passerelle', duration: '3:20', img: IMG.campus, tag: 'Équipements' },
];

export const DOCUMENTS = [
  { title: 'Brochure générale de l’ARSTM', type: 'Brochure', size: 'PDF · 4,2 Mo', cat: 'documents' },
  { title: 'Catalogue de la formation continue 2027', type: 'Catalogue', size: 'PDF · 6,8 Mo', cat: 'documents' },
  { title: 'Guide complet du candidat', type: 'Guide', size: 'PDF · 2,1 Mo', cat: 'documents' },
  { title: 'Formulaire d’inscription', type: 'Formulaire', size: 'PDF · 320 Ko', cat: 'documents' },
  { title: 'Étude : performance des corridors logistiques', type: 'Publication CREMPOL', size: 'PDF · 3,4 Mo', cat: 'publications' },
  { title: 'Rapport annuel 2025', type: 'Publication', size: 'PDF · 5,0 Mo', cat: 'publications' },
  { title: 'Communiqué : ouverture du concours 2027', type: 'Communiqué', size: 'PDF · 180 Ko', cat: 'communiques' },
  { title: 'Communiqué : partenariat avec le Port de Douala', type: 'Communiqué', size: 'PDF · 150 Ko', cat: 'communiques' },
];

export const THEMES = ['Transport maritime', 'Ingénierie navale', 'Logistique portuaire', 'Sûreté et sécurité maritimes', 'Environnement marin'];

export const ARTICLES = [
  { title: 'Décarbonation du transport maritime : quels enjeux pour les ports africains ?', theme: 'Environnement marin', date: 'Octobre 2026', read: '7 min', img: IMG.douala },
  { title: 'Le code ISPS vingt ans après : bilan dans le golfe de Guinée', theme: 'Sûreté et sécurité maritimes', date: 'Septembre 2026', read: '9 min', img: IMG.reunion },
  { title: 'Terminaux à conteneurs : l’automatisation est-elle une menace pour l’emploi ?', theme: 'Logistique portuaire', date: 'Août 2026', read: '6 min', img: IMG.conference },
  { title: 'Ce que change la révision de la convention STCW', theme: 'Transport maritime', date: 'Juillet 2026', read: '5 min', img: IMG.salut },
  { title: 'Construction navale en Afrique de l’Ouest : un potentiel inexploité', theme: 'Ingénierie navale', date: 'Juin 2026', read: '8 min', img: IMG.campus },
];

export const LIBRARY = [
  { title: 'Manuel de navigation côtière', theme: 'Transport maritime', access: 'Libre' },
  { title: 'Recueil des conventions OMI (SOLAS, MARPOL)', theme: 'Sûreté et sécurité maritimes', access: 'Réservé' },
  { title: 'Économie portuaire — cours de Licence', theme: 'Logistique portuaire', access: 'Réservé' },
  { title: 'Atlas des corridors d’Afrique de l’Ouest', theme: 'Logistique portuaire', access: 'Libre' },
  { title: 'Stabilité du navire — exercices corrigés', theme: 'Ingénierie navale', access: 'Réservé' },
  { title: 'Guide de prévention de la pollution marine', theme: 'Environnement marin', access: 'Libre' },
];

export const JOBS = [
  { title: 'Officier chef de quart pont', company: 'Armement régional', place: 'Abidjan', type: 'CDD', kind: 'Emploi', date: 'Il y a 2 jours' },
  { title: 'Stage — planification de terminal', company: 'Terminal à conteneurs', place: 'San-Pedro', type: '6 mois', kind: 'Stage', date: 'Il y a 4 jours' },
  { title: 'Agent consignataire', company: 'Agence maritime', place: 'Lomé', type: 'CDI', kind: 'Emploi', date: 'Il y a 1 semaine' },
  { title: 'Stage — logistique et transit', company: 'Commissionnaire en douane', place: 'Cotonou', type: '3 mois', kind: 'Stage', date: 'Il y a 1 semaine' },
  { title: 'Second mécanicien', company: 'Compagnie offshore', place: 'Port-Gentil', type: 'CDD', kind: 'Emploi', date: 'Il y a 2 semaines' },
  { title: 'Analyste sûreté maritime', company: 'Centre de coordination régional', place: 'Abidjan', type: 'CDI', kind: 'Emploi', date: 'Il y a 3 semaines' },
];

export const TESTIMONIALS = [
  { name: 'Aïcha K.', role: 'Officier chef de quart, promotion 2019', quote: 'Les heures passées sur le simulateur de passerelle m’ont donné une vraie assurance pour mon premier quart en haute mer.' },
  { name: 'Serge M.', role: 'Responsable logistique, promotion 2015', quote: 'L’ESTM m’a ouvert les portes des ports de toute la sous-région. Mes camarades de promotion sont aujourd’hui mon réseau professionnel.' },
  { name: 'Lt. Paul D.', role: 'Stagiaire ISMI, 2024', quote: 'Travailler avec des collègues de onze pays sur des cas réels de sûreté maritime, c’est unique dans la région.' },
];

export const FACILITIES = [
  { title: 'Simulateurs', text: 'Simulateurs de passerelle full-mission, de salle des machines et de radiocommunications GMDSS.', icon: 'compass', tone: 'blue' as Tone },
  { title: 'Salles de classe', text: 'Amphithéâtres et salles équipées pour l’enseignement et les classes virtuelles.', icon: 'monitor', tone: 'navy' as Tone },
  { title: 'Laboratoires', text: 'Électrotechnique, automatismes, mécanique et ateliers de soudure.', icon: 'wrench', tone: 'orange' as Tone },
  { title: 'Bibliothèque', text: 'Fonds documentaire spécialisé et accès à la bibliothèque numérique.', icon: 'book', tone: 'violet' as Tone },
  { title: 'Campus et hébergement', text: 'Un campus de 33 hectares avec internat pour les élèves officiers.', icon: 'home', tone: 'teal' as Tone },
  { title: 'Piscine olympique', text: 'Pour la formation à la survie en mer et la pratique sportive.', icon: 'wave', tone: 'green' as Tone },
];

export const KEY_FIGURES = [
  { value: '1987', label: 'Année de création' },
  { value: '10 000+', label: 'Cadres formés' },
  { value: '15', label: 'Pays francophones desservis' },
  { value: '33 ha', label: 'Campus à Yopougon' },
];

/** Données de visualisation (EF-DAT-01) — valeurs indicatives de démo */
export const ENROLMENT = [
  { year: '2021', value: 980 },
  { year: '2022', value: 1040 },
  { year: '2023', value: 1125 },
  { year: '2024', value: 1210 },
  { year: '2025', value: 1290 },
  { year: '2026', value: 1365 },
];
export const STUDENTS_BY_COUNTRY = [
  { country: 'Côte d’Ivoire', share: 34 },
  { country: 'Cameroun', share: 12 },
  { country: 'Bénin', share: 10 },
  { country: 'Togo', share: 9 },
  { country: 'Gabon', share: 8 },
  { country: 'Congo', share: 7 },
  { country: 'Autres pays', share: 20 },
];

/** Diplômes vérifiables (EF-COM-02) — jeu de démo */
export const DIPLOMAS: Record<string, { name: string; diploma: string; year: string; school: string }> = {
  'ARSTM-2019-ESN-0142': { name: 'Aïcha K.', diploma: 'Licence — Officier chef de quart pont', year: '2019', school: 'ESN' },
  'ARSTM-2015-ESTM-0087': { name: 'Serge M.', diploma: 'Licence — Transport maritime et logistique', year: '2015', school: 'ESTM' },
  'ARSTM-2022-CEAM-0310': { name: 'Moussa T.', diploma: 'C 500 — Capitaine 500', year: '2022', school: 'CEAM' },
};

export const ORG_CHART = {
  top: { title: 'Conseil d’Administration', sub: 'Ministres de la Marine Marchande des 8 États signataires et OMAOC' },
  control: { title: 'Commissariat aux Comptes', sub: 'Contrôle des comptes' },
  dg: { title: 'Direction Générale', sub: 'Directeur Général' },
  staff: ['Département Communication et Marketing', 'Cellule Qualité ISO 9001', 'Secrétariat général'],
  directions: [
    { title: 'ESN', sub: 'École Supérieure de Navigation' },
    { title: 'ESTM', sub: 'École Supérieure des Transports Maritimes' },
    { title: 'CEAM', sub: 'Collège d’Enseignement et d’Apprentissage Maritime' },
    { title: 'ISMI', sub: 'Institut de Sécurité Maritime Interrégional' },
    { title: 'CREMPOL', sub: 'Centre de Recherche Maritime, Portuaire et Logistique' },
    { title: 'DDFCP', sub: 'Formation Continue et Professionnelle' },
  ],
};

/** Index pour la recherche interne (EF-ERG-02) */
export interface SearchEntry {
  title: string;
  kind: 'Page' | 'Formation' | 'Actualité' | 'Document' | 'Événement';
  path: string;
  fragment?: string;
  text: string;
}

export function buildSearchIndex(): SearchEntry[] {
  const pages: SearchEntry[] = [
    { title: 'Présentation de l’ARSTM', kind: 'Page', path: '/institution', text: 'institution missions histoire chiffres omaoc' },
    { title: 'Mot du Directeur Général', kind: 'Page', path: '/institution/mot-du-dg', text: 'directeur général message' },
    { title: 'Politique qualité', kind: 'Page', path: '/institution/politique-qualite', text: 'iso 9001 qualité certification' },
    { title: 'Situation géographique', kind: 'Page', path: '/institution/situation', text: 'carte plan accès abidjan yopougon san-pedro' },
    { title: 'Organigramme', kind: 'Page', path: '/institution/organigramme', text: 'gouvernance conseil administration direction' },
    { title: 'Admissions', kind: 'Page', path: '/admissions', text: 'concours entrée dossier calendrier tarifs bourses aide faq candidature' },
    { title: 'Candidater en ligne', kind: 'Page', path: '/admissions/candidater', text: 'pré-inscription candidature formulaire stage' },
    { title: 'Formation continue et certificats STCW', kind: 'Page', path: '/formation-continue', text: 'stcw sessions inscription paiement recyclage' },
    { title: 'Vérifier un diplôme', kind: 'Page', path: '/verifier-diplome', text: 'authenticité diplôme vérification' },
    { title: 'Campus et vie étudiante', kind: 'Page', path: '/campus', text: 'simulateurs piscine hébergement bibliothèque clubs associations' },
    { title: 'Centre de carrière', kind: 'Page', path: '/carrieres', text: 'emploi stage offres recrutement alumni' },
    { title: 'Contact', kind: 'Page', path: '/contact', text: 'contact téléphone email adresse newsletter' },
    { title: 'Nos références', kind: 'Page', path: '/references', text: 'partenaires clients ridamer club marine marchande prix distinctions certifications' },
  ];
  return [
    ...pages,
    ...SCHOOLS.map((s) => ({ title: `${s.name} (${s.code})`, kind: 'Page' as const, path: `/formations/${s.slug}`, text: `${s.text} ${s.intro}` })),
    ...PROGRAMS.map((p) => ({ title: p.title, kind: 'Formation' as const, path: `/formations/${p.school}/${p.slug}`, text: `${p.summary} ${p.domain} ${p.level} ${p.type}` })),
    ...NEWS.map((n) => ({ title: n.title, kind: 'Actualité' as const, path: `/actualites/${n.slug}`, text: `${n.excerpt} ${n.category}` })),
    ...EVENTS.map((e) => ({ title: e.title, kind: 'Événement' as const, path: '/agenda', text: `${e.text} ${e.category} ${e.place}` })),
    ...DOCUMENTS.map((d) => ({ title: d.title, kind: 'Document' as const, path: '/mediatheque', fragment: d.cat, text: d.type })),
    ...STCW_SESSIONS.map((s) => ({ title: s.title, kind: 'Formation' as const, path: '/formation-continue', fragment: 'sessions', text: `${s.code} stcw session` })),
  ];
}
