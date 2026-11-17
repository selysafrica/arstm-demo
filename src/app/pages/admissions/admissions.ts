import { ChangeDetectionStrategy, Component, afterNextRender, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../shared/icon';
import { Faq, PageHero, toneOf } from '../../shared/ui';
import { CALENDAR, FAQ, IMG, TESTIMONIALS, Tone } from '../../data/site';

/** Rubrique Admissions complète (EF-ADMS-01). */
@Component({
  selector: 'app-admissions',
  imports: [RouterLink, Icon, PageHero, Faq],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero
      title="Rejoindre"
      accent="l’ARSTM"
      kicker="Admissions 2027"
      lead="Concours d’entrée, inscription sur dossier, calendrier, tarifs et bourses : tout pour préparer votre candidature."
      [image]="img.hero"
      [crumbs]="[{ label: 'Admissions' }]"
    >
      <div class="mt-2 flex flex-wrap gap-3">
        <a routerLink="/admissions/candidater" class="f-btn btn-accent">Candidater en ligne</a>
        <a routerLink="/espace" class="f-chip inline-flex items-center gap-2 !py-3"><app-icon name="user" [size]="16" />Espace candidat</a>
      </div>
    </app-page-hero>

    <div class="container-x section-y relative z-[1] grid items-start gap-[clamp(24px,4vw,48px)] pt-[clamp(40px,5vw,64px)] lg:grid-cols-[260px_1fr]">
      <!-- Sommaire -->
      <nav aria-label="Sommaire de la rubrique Admissions" class="lg:sticky lg:top-28">
        <ul class="panel m-0 flex list-none gap-1 overflow-x-auto p-2 lg:flex-col [scrollbar-width:none]">
          @for (s of toc; track s.id) {
            <li class="flex-none">
              <a
                [routerLink]="[]"
                [fragment]="s.id"
                class="flex min-h-[42px] items-center gap-2.5 rounded-xl px-3 text-[15px] font-semibold whitespace-nowrap no-underline transition-colors"
                [class]="active() === s.id ? 'bg-blue text-white hover:text-white' : 'text-ink hover:bg-tint'"
                ><app-icon [name]="s.icon" [size]="17" />{{ s.label }}</a
              >
            </li>
          }
        </ul>
      </nav>

      <div class="flex min-w-0 flex-col gap-[clamp(40px,5vw,64px)]">
        <!-- Pourquoi -->
        <section id="pourquoi" class="flex flex-col gap-5" data-toc>
          <h2 class="h-section">Pourquoi intégrer <span class="text-blue">l’ARSTM</span></h2>
          <div class="grid gap-3 sm:grid-cols-2">
            @for (r of reasons; track r.title) {
              <div class="flex flex-col gap-2.5 rounded-[18px] bg-white p-5 shadow-card">
                <span class="icon-tile" [style.background]="tone(r.tone).soft" [style.color]="tone(r.tone).ink"><app-icon [name]="r.icon" [size]="22" /></span>
                <strong class="text-ink">{{ r.title }}</strong>
                <p class="m-0 text-[15px] text-muted">{{ r.text }}</p>
              </div>
            }
          </div>
          <figure class="m-0 flex flex-col gap-3 rounded-[22px] bg-navy p-6 text-white md:flex-row md:items-center md:gap-6">
            <app-icon name="quote" [size]="36" class="text-orange" />
            <blockquote class="m-0 flex-1 text-[18px] leading-snug">{{ testimonial.quote }}</blockquote>
            <figcaption class="text-[14.5px] text-hero-text"><strong class="text-white">{{ testimonial.name }}</strong><br />{{ testimonial.role }}</figcaption>
          </figure>
        </section>

        <!-- Concours -->
        <section id="concours" class="flex flex-col gap-5" data-toc>
          <h2 class="h-section">Concours d’entrée <span class="text-blue">2027</span></h2>
          <p class="m-0 max-w-[68ch] text-text">
            Le concours est organisé chaque année dans les pays membres, en lien avec les ministères chargés de la marine marchande. Il donne accès
            aux formations initiales de l’ESN, de l’ESTM et du CEAM.
          </p>
          <ol class="m-0 grid list-none gap-3 p-0 md:grid-cols-4">
            @for (st of steps; track st.title; let i = $index) {
              <li class="relative flex flex-col gap-2 rounded-[18px] border border-line-soft bg-white p-5">
                <span class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue text-[15px] font-black text-white">{{ i + 1 }}</span>
                <strong class="text-ink">{{ st.title }}</strong>
                <span class="text-[14.5px] text-muted">{{ st.text }}</span>
              </li>
            }
          </ol>
          <div class="flex flex-wrap gap-3">
            <a routerLink="/admissions/candidater" class="f-btn btn-primary">Déposer mon dossier</a>
            <a href="#" (click)="$event.preventDefault()" class="f-btn btn-ghost"><app-icon name="download" [size]="16" />Avis de concours (PDF)</a>
          </div>
        </section>

        <!-- Dossier -->
        <section id="dossier" class="flex flex-col gap-4 rounded-[22px] border-t-4 border-violet bg-white p-[clamp(22px,3vw,32px)] shadow-card" data-toc>
          <h2 class="h-section !text-[28px]">Inscription sur analyse de dossier</h2>
          <p class="m-0 text-text">
            Les Masters, certaines Licences professionnelles et les formations continues sont accessibles sur dossier, sans concours. La commission
            pédagogique étudie votre parcours et votre expérience professionnelle.
          </p>
          <ul class="m-0 grid list-none gap-2 p-0 sm:grid-cols-2">
            @for (d of docs; track d) {
              <li class="flex items-start gap-2.5 text-[15.5px] text-text"><app-icon name="file" [size]="18" class="mt-0.5 text-violet-ink" />{{ d }}</li>
            }
          </ul>
        </section>

        <!-- Calendrier -->
        <section id="calendrier" class="flex flex-col gap-5" data-toc>
          <h2 class="h-section">Calendrier <span class="text-blue">pédagogique</span></h2>
          <ol class="m-0 flex list-none flex-col p-0">
            @for (c of calendar; track c.label; let last = $last) {
              <li class="grid grid-cols-[22px_1fr] gap-4">
                <span class="flex flex-col items-center">
                  <span class="mt-1.5 h-4 w-4 flex-none rounded-full border-4 bg-white" [style.border-color]="tone(c.tone).line"></span>
                  @if (!last) {
                    <span class="w-0.5 flex-1 bg-line"></span>
                  }
                </span>
                <span class="flex flex-col pb-6">
                  <span class="text-[14px] font-bold" [style.color]="tone(c.tone).ink">{{ c.period }}</span>
                  <strong class="text-[17px] text-ink">{{ c.label }}</strong>
                </span>
              </li>
            }
          </ol>
        </section>

        <!-- Tarifs -->
        <section id="tarifs" class="flex flex-col gap-5" data-toc>
          <h2 class="h-section">Tarifs, bourses <span class="text-blue">et aides</span></h2>
          <div class="overflow-x-auto rounded-[18px] bg-white shadow-card">
            <table class="w-full min-w-[560px] border-collapse text-left text-[15.5px]">
              <caption class="sr-only-x">Frais de scolarité annuels par cycle</caption>
              <thead>
                <tr class="bg-tint-soft text-[14px] text-navy">
                  <th scope="col" class="p-4 font-bold">Cycle</th>
                  <th scope="col" class="p-4 font-bold">Ressortissant État membre</th>
                  <th scope="col" class="p-4 font-bold">Autre nationalité</th>
                </tr>
              </thead>
              <tbody>
                @for (f of fees; track f.cycle) {
                  <tr class="border-t border-line-soft">
                    <th scope="row" class="p-4 font-semibold text-ink">{{ f.cycle }}</th>
                    <td class="p-4 text-text">{{ f.member }}</td>
                    <td class="p-4 text-text">{{ f.other }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <p class="m-0 text-[14px] text-subtle">Montants communiqués par la scolarité et publiés depuis le back-office.</p>
          <div class="grid gap-3 md:grid-cols-3">
            @for (b of aids; track b.title) {
              <div class="flex flex-col gap-2 rounded-[18px] bg-green-soft p-5">
                <strong class="text-green-ink">{{ b.title }}</strong>
                <span class="text-[15px] text-text">{{ b.text }}</span>
              </div>
            }
          </div>
          <p class="m-0 flex items-start gap-2.5 rounded-xl bg-white p-4 text-[15px] text-text shadow-card">
            <app-icon name="smartphone" class="mt-0.5 text-blue" />Paiement des frais en ligne par mobile money ou carte bancaire. Reçu envoyé automatiquement par e-mail.
          </p>
        </section>

        <!-- Guide -->
        <section id="guide" class="flex flex-wrap items-center gap-5 rounded-[22px] bg-blue p-[clamp(22px,3vw,32px)] text-white" data-toc>
          <span class="icon-tile !h-16 !w-16 !rounded-2xl bg-white/15"><app-icon name="book" [size]="30" /></span>
          <div class="flex min-w-[240px] flex-1 flex-col gap-1">
            <h2 class="m-0 text-[24px] font-black">Guide complet de l’ARSTM</h2>
            <span class="text-hero-text">Formations, concours, vie sur le campus, démarches administratives : 48 pages pour tout savoir.</span>
          </div>
          <a href="#" (click)="$event.preventDefault()" class="f-btn rounded-xl bg-white px-5 py-3.5 text-navy hover:text-navy"><app-icon name="download" [size]="18" />Télécharger · PDF 2,1 Mo</a>
        </section>

        <!-- FAQ -->
        <section id="faq" class="flex flex-col gap-5" data-toc>
          <h2 class="h-section">Questions <span class="text-blue">fréquentes</span></h2>
          <app-faq [items]="faq" />
        </section>
      </div>
    </div>
  `,
})
export default class Admissions {
  protected readonly img = IMG;
  protected readonly faq = FAQ;
  protected readonly calendar = CALENDAR;
  protected readonly testimonial = TESTIMONIALS[0];
  protected readonly tone = (t: Tone) => toneOf(t);
  protected readonly active = signal('pourquoi');

  protected readonly toc = [
    { id: 'pourquoi', label: 'Pourquoi l’ARSTM', icon: 'star' },
    { id: 'concours', label: 'Concours d’entrée', icon: 'check' },
    { id: 'dossier', label: 'Analyse de dossier', icon: 'file' },
    { id: 'calendrier', label: 'Calendrier', icon: 'calendar' },
    { id: 'tarifs', label: 'Tarifs et bourses', icon: 'coin' },
    { id: 'guide', label: 'Guide complet', icon: 'book' },
    { id: 'faq', label: 'FAQ', icon: 'info' },
  ];
  protected readonly reasons: { title: string; text: string; icon: string; tone: Tone }[] = [
    { title: 'Des diplômes reconnus', text: 'Conformes STCW et homologués par le MESRS.', icon: 'badge', tone: 'blue' },
    { title: 'Un réseau de 10 000 anciens', text: 'Dans les ports, armements et administrations de la région.', icon: 'users', tone: 'orange' },
    { title: 'Des équipements de pointe', text: 'Simulateurs de passerelle, de machine et piscine olympique.', icon: 'compass', tone: 'teal' },
    { title: 'Une école de caractère', text: 'Qualité, discipline et excellence au quotidien.', icon: 'anchor', tone: 'navy' },
  ];
  protected readonly steps = [
    { title: 'Inscription', text: 'En ligne ou au ministère de la marine marchande de votre pays.' },
    { title: 'Dossier', text: 'Pièces justificatives et certificat médical d’aptitude.' },
    { title: 'Épreuves', text: 'Écrits organisés simultanément dans les pays membres.' },
    { title: 'Résultats', text: 'Publication en ligne et notification par e-mail.' },
  ];
  protected readonly docs = [
    'Copie certifiée du dernier diplôme',
    'Relevés de notes des deux dernières années',
    'Curriculum vitae et lettre de motivation',
    'Attestations d’expérience professionnelle',
    'Copie de la pièce d’identité',
    'Certificat médical (formations navigantes)',
  ];
  protected readonly fees = [
    { cycle: 'Brevets et certificats (CEAM)', member: '[montant] FCFA', other: '[montant] FCFA' },
    { cycle: 'Licence (ESN, ESTM)', member: '[montant] FCFA', other: '[montant] FCFA' },
    { cycle: 'Master (ESN, ESTM)', member: '[montant] FCFA', other: '[montant] FCFA' },
  ];
  protected readonly aids = [
    { title: 'Bourses des États membres', text: 'Attribuées par les ministères aux lauréats du concours.' },
    { title: 'Bourses d’excellence', text: 'Pour les meilleurs élèves de chaque promotion.' },
    { title: 'Prise en charge employeur', text: 'Pour les professionnels en formation continue.' },
  ];

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const io = new IntersectionObserver(
        (entries) => {
          const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          if (vis[0]) this.active.set(vis[0].target.id);
        },
        { rootMargin: '-120px 0px -55% 0px' },
      );
      document.querySelectorAll('[data-toc]').forEach((el) => io.observe(el));
      destroyRef.onDestroy(() => io.disconnect());
    });
  }
}
