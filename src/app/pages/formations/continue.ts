import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Icon } from '../../shared/icon';
import { PageHero, SectionHead, toneOf } from '../../shared/ui';
import { CONTINUING_TRACKS, IMG, STCW_SESSIONS, Session, Tone } from '../../data/site';

type Step = 'form' | 'pay' | 'processing' | 'done';

/** Formation continue, certificats STCW, inscription et paiement en ligne (EF-FOR-04, EF-PAY-01→05). */
@Component({
  selector: 'app-continue',
  imports: [RouterLink, Icon, PageHero, SectionHead, ReactiveFormsModule, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero
      title="Formations continues"
      accent="et professionnelles"
      kicker="DDFCP · Certificats STCW"
      lead="Recyclages, certificats STCW, sûreté et modules sur mesure pour les navigants, les portuaires et les entreprises."
      [image]="img.conference"
      [crumbs]="[{ label: 'Formations', path: '/formations' }, { label: 'Formation continue' }]"
    >
      <div class="mt-2 flex flex-wrap gap-3">
        <a routerLink="/formation-continue" fragment="sessions" class="f-btn btn-accent">Voir les sessions</a>
        <a href="#" (click)="$event.preventDefault()" class="f-chip inline-flex items-center gap-2 !py-3"><app-icon name="download" [size]="16" />Catalogue 2027 (PDF)</a>
        <a href="#" (click)="$event.preventDefault()" class="f-chip inline-flex items-center gap-2 !py-3"><app-icon name="external" [size]="16" />Plateforme de la formation continue</a>
      </div>
    </app-page-hero>

    <section class="container-x section-y relative z-[1] flex flex-col gap-7 pt-[clamp(48px,6vw,80px)]">
      <div class="grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-4">
        @for (t of tracks; track t.title) {
          <div class="flex flex-col gap-3 rounded-[18px] border-t-4 bg-white p-[22px] shadow-card" [style.border-top-color]="tone(t.tone).line">
            <span class="icon-tile" [style.background]="tone(t.tone).soft" [style.color]="tone(t.tone).ink"><app-icon [name]="t.icon" [size]="22" /></span>
            <strong class="text-[18px] text-ink">{{ t.title }}</strong>
            <p class="m-0 text-[15.5px] text-muted">{{ t.text }}</p>
          </div>
        }
      </div>
    </section>

    <section id="stcw" class="container-x section-y relative z-[1] flex flex-col gap-6">
      <span id="sessions"></span>
      <app-section-head pill="Inscription en ligne" lead="Places limitées : réservez votre session et payez par mobile money ou carte bancaire.">
        <h2 class="h-display">Prochaines sessions <span class="text-blue">STCW</span></h2>
      </app-section-head>
      <div class="flex flex-wrap justify-center gap-2" role="group" aria-label="Filtrer les sessions">
        @for (f of filters; track f.key) {
          <button
            type="button"
            class="min-h-[42px] cursor-pointer rounded-full border-[1.5px] px-4 font-[inherit] text-[14.5px] font-bold transition-colors"
            [class]="filter() === f.key ? 'border-blue bg-blue text-white' : 'border-[#DCE4EF] bg-white text-ink hover:border-blue'"
            [attr.aria-pressed]="filter() === f.key"
            (click)="filter.set(f.key)"
          >
            {{ f.label }}
          </button>
        }
      </div>
      <ul class="m-0 flex list-none flex-col gap-3 p-0">
        @for (s of sessions(); track s.id) {
          <li class="grid items-center gap-4 rounded-[18px] bg-white p-5 shadow-card md:grid-cols-[1fr_auto_auto]">
            <div class="flex flex-col gap-1">
              <span class="flex flex-wrap items-center gap-2">
                <span class="tag bg-tint text-blue">{{ s.code }}</span>
                @if (s.online) {
                  <span class="tag bg-green-soft text-green-ink">En ligne</span>
                }
              </span>
              <strong class="text-[18px] text-ink">{{ s.title }}</strong>
              <span class="flex flex-wrap gap-x-4 gap-y-1 text-[14.5px] text-subtle">
                <span class="inline-flex items-center gap-1.5"><app-icon name="calendar" [size]="15" />{{ s.dates }}</span>
                <span class="inline-flex items-center gap-1.5"><app-icon name="clock" [size]="15" />{{ s.duration }}</span>
                <span class="inline-flex items-center gap-1.5"><app-icon name="pin" [size]="15" />{{ s.place }}</span>
              </span>
            </div>
            <div class="flex min-w-[170px] flex-col gap-1.5">
              <span class="text-[14px] font-semibold" [class.text-orange-ink]="s.seatsLeft > 0 && s.seatsLeft <= 6" [class.text-muted]="s.seatsLeft > 6" [class.text-red-700]="s.seatsLeft === 0">
                {{ s.seatsLeft === 0 ? 'Complet' : s.seatsLeft + ' place' + (s.seatsLeft > 1 ? 's' : '') + ' restante' + (s.seatsLeft > 1 ? 's' : '') }}
              </span>
              <span class="h-2 overflow-hidden rounded-full bg-tint-soft" aria-hidden="true">
                <span class="block h-full rounded-full" [class.bg-orange]="s.seatsLeft <= 6" [class.bg-blue]="s.seatsLeft > 6" [style.width.%]="((s.seats - s.seatsLeft) / s.seats) * 100"></span>
              </span>
            </div>
            <div class="flex items-center gap-4 md:justify-end">
              <strong class="text-[20px] whitespace-nowrap text-navy">{{ s.price | number: '1.0-0' : 'fr' }} <span class="text-[14px] font-semibold">FCFA</span></strong>
              <button type="button" class="f-btn btn-primary !py-3" [disabled]="s.seatsLeft === 0" (click)="open(s)">
                {{ s.seatsLeft === 0 ? 'Liste d’attente' : 'S’inscrire' }}
              </button>
            </div>
          </li>
        }
      </ul>
      <p class="m-0 flex items-center justify-center gap-2 text-center text-[14px] text-subtle">
        <app-icon name="lock" [size]="16" />Paiement délégué à un prestataire certifié PCI-DSS — aucune donnée bancaire n’est stockée par le site.
      </p>
    </section>

    <section class="container-x section-y relative z-[1]">
      <div class="flex flex-wrap items-center justify-between gap-5 rounded-3xl bg-navy p-[clamp(24px,4vw,44px)] text-white">
        <div class="flex max-w-[60ch] flex-col gap-1.5">
          <strong class="text-[clamp(24px,2.6vw,32px)] leading-tight font-black">Former vos équipes sur mesure</strong>
          <span class="text-hero-text">Armements, ports, terminaux, industriels : la DDFCP conçoit des programmes adaptés à vos métiers, sur le campus ou dans vos locaux.</span>
        </div>
        <a routerLink="/contact" class="f-btn rounded-xl bg-white px-[22px] py-3.5 text-navy hover:text-navy">Demander un devis</a>
      </div>
    </section>

    <!-- Tunnel d’inscription et de paiement (démo) -->
    <dialog
      #dlg
      class="m-auto w-[min(620px,calc(100vw-24px))] max-w-none rounded-3xl border-none bg-white p-0 text-body shadow-[0_40px_90px_-30px_rgba(14,24,62,.7)] backdrop:bg-[rgba(14,24,62,.55)]"
      aria-labelledby="dlg-title"
      (close)="onClose()"
    >
      @if (selected(); as s) {
        <div class="flex flex-col gap-5 p-[clamp(20px,3vw,32px)]">
          <div class="flex items-start justify-between gap-3">
            <div>
              <span class="text-[13px] font-bold text-blue">{{ s.code }} · {{ s.dates }}</span>
              <h2 id="dlg-title" class="m-0 text-[22px] leading-tight font-black text-ink">{{ s.title }}</h2>
            </div>
            <button type="button" class="inline-flex h-10 w-10 flex-none cursor-pointer items-center justify-center rounded-full border-none bg-tint text-navy" aria-label="Fermer" (click)="close()"><app-icon name="x" /></button>
          </div>
          <ol class="m-0 flex list-none gap-2 p-0 text-[13px] font-bold" aria-label="Étapes">
            @for (st of stepsList; track st.key; let i = $index) {
              <li class="flex flex-1 flex-col gap-1.5" [class.text-blue]="stepIdx() >= i" [class.text-subtle]="stepIdx() < i">
                <span class="h-1.5 rounded-full" [class.bg-blue]="stepIdx() >= i" [class.bg-tint]="stepIdx() < i"></span>{{ st.label }}
              </li>
            }
          </ol>

          @switch (step()) {
            @case ('form') {
              <form [formGroup]="form" (ngSubmit)="toPay()" novalidate class="f-pop grid gap-3.5 sm:grid-cols-2">
                <label class="field" [class.invalid]="bad('name')">Nom complet<input formControlName="name" autocomplete="name" />
                  @if (bad('name')) { <span class="error">Champ obligatoire.</span> }
                </label>
                <label class="field" [class.invalid]="bad('email')">E-mail<input type="email" formControlName="email" autocomplete="email" />
                  @if (bad('email')) { <span class="error">E-mail invalide.</span> }
                </label>
                <label class="field" [class.invalid]="bad('phone')">Téléphone<input type="tel" formControlName="phone" autocomplete="tel" placeholder="+225" />
                  @if (bad('phone')) { <span class="error">Champ obligatoire.</span> }
                </label>
                <label class="field">Employeur (facultatif)<input formControlName="company" autocomplete="organization" /></label>
                <label class="col-span-full flex items-start gap-2.5 text-[14.5px] text-muted">
                  <input type="checkbox" formControlName="consent" class="mt-1 h-[18px] w-[18px] flex-none accent-blue" />
                  <span>J’accepte le traitement de mes données pour cette inscription (loi n° 2013-450).</span>
                </label>
                @if (submitted() && form.controls.consent.invalid) {
                  <p class="col-span-full m-0 text-[13.5px] font-semibold text-red-700">Merci d’accepter le traitement de vos données pour continuer.</p>
                }
                <button type="submit" class="f-btn btn-primary col-span-full">Continuer vers le paiement</button>
              </form>
            }
            @case ('pay') {
              <div class="f-pop flex flex-col gap-4">
                <div class="flex items-center justify-between rounded-2xl bg-tint-soft p-4">
                  <span class="text-muted">Montant à régler</span>
                  <strong class="text-[22px] text-navy">{{ s.price | number: '1.0-0' : 'fr' }} FCFA</strong>
                </div>
                <fieldset class="m-0 flex flex-col gap-2.5 border-none p-0">
                  <legend class="mb-2 text-[14.5px] font-semibold text-ink">Moyen de paiement</legend>
                  @for (m of methods; track m.key) {
                    <label class="flex cursor-pointer items-center gap-3.5 rounded-[14px] border-[1.5px] p-3.5 transition-colors" [class]="method() === m.key ? 'border-blue bg-tint-soft' : 'border-line-soft bg-white hover:border-line'">
                      <input type="radio" name="method" class="h-[18px] w-[18px] accent-blue" [checked]="method() === m.key" (change)="method.set(m.key)" />
                      <span class="icon-tile !h-10 !w-10 bg-white text-navy shadow-card"><app-icon [name]="m.icon" [size]="18" /></span>
                      <span><strong class="text-ink">{{ m.label }}</strong><br /><span class="text-[14px] text-subtle">{{ m.sub }}</span></span>
                    </label>
                  }
                </fieldset>
                <p class="m-0 flex items-start gap-2 rounded-xl bg-orange-soft p-3 text-[14px] text-orange-ink">
                  <app-icon name="info" [size]="16" class="mt-0.5" />Démo : vous serez redirigé vers la page sécurisée du prestataire agréé. Aucun paiement réel n’est effectué ici.
                </p>
                <div class="flex flex-wrap gap-2.5">
                  <button type="button" class="f-btn btn-ghost !rounded-xl" (click)="step.set('form')">Retour</button>
                  <button type="button" class="f-btn btn-accent flex-1" (click)="pay()"><app-icon name="lock" [size]="16" />Payer {{ s.price | number: '1.0-0' : 'fr' }} FCFA</button>
                </div>
              </div>
            }
            @case ('processing') {
              <div class="f-pop flex flex-col items-center gap-4 py-8 text-center" role="status">
                <span class="h-12 w-12 animate-spin rounded-full border-4 border-tint border-t-blue"></span>
                <strong class="text-ink">Confirmation du paiement auprès du prestataire…</strong>
              </div>
            }
            @case ('done') {
              <div class="f-pop flex flex-col gap-4" role="status">
                <div class="flex items-center gap-3.5">
                  <span class="icon-tile bg-green-soft text-green-ink"><app-icon name="tick" [size]="24" /></span>
                  <div><strong class="text-[20px] text-ink">Inscription confirmée</strong><br /><span class="text-[15px] text-muted">Reçu envoyé à {{ form.value.email }}</span></div>
                </div>
                <dl class="m-0 flex flex-col gap-2 rounded-2xl border border-dashed border-line p-4 text-[15px]">
                  <div class="flex justify-between gap-3"><dt class="text-subtle">N° de reçu</dt><dd class="m-0 font-bold text-ink">{{ receipt() }}</dd></div>
                  <div class="flex justify-between gap-3"><dt class="text-subtle">Stagiaire</dt><dd class="m-0 font-semibold text-ink">{{ form.value.name }}</dd></div>
                  <div class="flex justify-between gap-3"><dt class="text-subtle">Session</dt><dd class="m-0 text-right font-semibold text-ink">{{ s.dates }}</dd></div>
                  <div class="flex justify-between gap-3"><dt class="text-subtle">Moyen</dt><dd class="m-0 font-semibold text-ink">{{ methodLabel() }}</dd></div>
                  <div class="flex justify-between gap-3"><dt class="text-subtle">Montant</dt><dd class="m-0 font-black text-navy">{{ s.price | number: '1.0-0' : 'fr' }} FCFA</dd></div>
                  <div class="flex justify-between gap-3"><dt class="text-subtle">Statut</dt><dd class="m-0"><span class="tag bg-green-soft text-green-ink">Payé</span></dd></div>
                </dl>
                <div class="flex flex-wrap gap-2.5">
                  <a routerLink="/espace" class="f-btn btn-primary flex-1" (click)="close()">Suivre mon inscription</a>
                  <button type="button" class="f-btn btn-ghost !rounded-xl" (click)="close()">Fermer</button>
                </div>
              </div>
            }
          }
        </div>
      }
    </dialog>
  `,
})
export default class Continue {
  private readonly fb = inject(FormBuilder);
  private readonly dlg = viewChild.required<ElementRef<HTMLDialogElement>>('dlg');
  protected readonly img = IMG;
  protected readonly tracks = CONTINUING_TRACKS;
  protected readonly tone = (t: Tone) => toneOf(t);

  protected readonly filters = [
    { key: 'all', label: 'Toutes' },
    { key: 'campus', label: 'Sur le campus' },
    { key: 'online', label: 'En ligne' },
    { key: 'open', label: 'Places disponibles' },
  ];
  protected readonly filter = signal('all');
  protected readonly sessions = computed(() => {
    const f = this.filter();
    return STCW_SESSIONS.filter((s) => (f === 'online' ? s.online : f === 'campus' ? !s.online : f === 'open' ? s.seatsLeft > 0 : true));
  });

  protected readonly stepsList = [
    { key: 'form', label: 'Coordonnées' },
    { key: 'pay', label: 'Paiement' },
    { key: 'done', label: 'Confirmation' },
  ];
  protected readonly step = signal<Step>('form');
  protected readonly stepIdx = computed(() => ({ form: 0, pay: 1, processing: 1, done: 2 })[this.step()]);
  protected readonly selected = signal<Session | null>(null);
  protected readonly methods = [
    { key: 'momo', label: 'Mobile money', sub: 'Orange Money, MTN MoMo, Moov Money, Wave', icon: 'smartphone' },
    { key: 'card', label: 'Carte bancaire', sub: 'Visa, Mastercard — page sécurisée 3-D Secure', icon: 'card' },
  ];
  protected readonly method = signal('momo');
  protected readonly methodLabel = computed(() => this.methods.find((m) => m.key === this.method())?.label);
  protected readonly receipt = signal('');
  protected readonly submitted = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    company: [''],
    consent: [false, Validators.requiredTrue],
  });

  protected bad(n: 'name' | 'email' | 'phone') {
    const c = this.form.controls[n];
    return c.invalid && (c.touched || this.submitted());
  }

  protected open(s: Session) {
    this.selected.set(s);
    this.step.set('form');
    this.submitted.set(false);
    this.dlg().nativeElement.showModal();
  }
  protected close() {
    this.dlg().nativeElement.close();
  }
  protected onClose() {
    if (this.step() === 'done') this.form.reset();
    this.step.set('form');
  }
  protected toPay() {
    this.submitted.set(true);
    this.form.markAllAsTouched();
    if (this.form.valid) this.step.set('pay');
  }
  protected pay() {
    this.step.set('processing');
    setTimeout(() => {
      this.receipt.set('ARSTM-FC-' + Math.floor(100000 + Math.random() * 900000));
      this.step.set('done');
    }, 1300);
  }
}
