import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Icon } from '../../shared/icon';
import { PageHero } from '../../shared/ui';
import { IMG, MEMBER_STATES, PROGRAMS, schoolBySlug } from '../../data/site';

const TYPES = [
  { key: 'pre', label: 'Pré-inscription', text: 'À une formation initiale ou au concours', icon: 'cap' },
  { key: 'info', label: 'Demande de renseignements', text: 'Une question avant de candidater', icon: 'info' },
  { key: 'spont', label: 'Candidature spontanée', text: 'Proposer votre profil à l’ARSTM', icon: 'briefcase' },
  { key: 'stage', label: 'Demande de stage', text: 'Stage au sein de l’Académie', icon: 'users' },
];

/** Formulaires en ligne avec pièces jointes (EF-ADMS-02/03/05). */
@Component({
  selector: 'app-candidater',
  imports: [RouterLink, Icon, PageHero, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero title="Candidater" accent="en ligne" kicker="Admissions" lead="Quatre étapes, environ 10 minutes. Vous recevez un accusé de réception par e-mail dès l’envoi." [image]="img.salut" [crumbs]="[{ label: 'Admissions', path: '/admissions' }, { label: 'Candidater' }]" [compact]="true" />

    <section class="container-x section-y relative z-[1] pt-[clamp(40px,5vw,64px)]">
      <div class="mx-auto flex max-w-[880px] flex-col gap-6">
        @if (!done()) {
          <!-- Stepper -->
          <ol class="panel m-0 grid list-none grid-cols-4 gap-1 p-2" aria-label="Étapes du formulaire">
            @for (s of stepLabels; track s; let i = $index) {
              <li class="flex flex-col items-center gap-1 rounded-xl px-1 py-2.5 text-center text-[13px] font-bold sm:flex-row sm:justify-center sm:gap-2 sm:text-[14.5px]" [class]="i === step() ? 'bg-blue text-white' : i < step() ? 'text-blue' : 'text-subtle'" [attr.aria-current]="i === step() ? 'step' : null">
                <span class="inline-flex h-7 w-7 flex-none items-center justify-center rounded-full text-[13px]" [class]="i === step() ? 'bg-white/20' : i < step() ? 'bg-tint' : 'bg-tint-soft'">
                  @if (i < step()) { <app-icon name="tick" [size]="15" /> } @else { {{ i + 1 }} }
                </span>
                {{ s }}
              </li>
            }
          </ol>

          <form [formGroup]="form" (ngSubmit)="nextOrSubmit()" novalidate class="flex flex-col gap-5 rounded-[22px] bg-white p-[clamp(20px,3vw,36px)] shadow-soft">
            @switch (step()) {
              @case (0) {
                <fieldset class="f-pop m-0 flex flex-col gap-3 border-none p-0">
                  <legend class="mb-3 text-[20px] font-extrabold text-ink">Quelle est votre demande ?</legend>
                  <div class="grid gap-3 sm:grid-cols-2">
                    @for (t of types; track t.key) {
                      <label class="flex cursor-pointer items-start gap-3.5 rounded-[16px] border-[1.5px] p-4 transition-colors" [class]="form.value.type === t.key ? 'border-blue bg-tint-soft' : 'border-line-soft hover:border-line'">
                        <input type="radio" formControlName="type" [value]="t.key" class="sr-only-x" />
                        <span class="icon-tile !h-11 !w-11" [class]="form.value.type === t.key ? 'bg-blue text-white' : 'bg-tint text-blue'"><app-icon [name]="t.icon" [size]="20" /></span>
                        <span><strong class="text-ink">{{ t.label }}</strong><br /><span class="text-[14.5px] text-muted">{{ t.text }}</span></span>
                      </label>
                    }
                  </div>
                </fieldset>
                @if (form.value.type === 'pre' || form.value.type === 'info') {
                  <label class="field f-pop" [class.invalid]="bad('program')">
                    Formation visée
                    <select formControlName="program">
                      <option value="">— Choisir une formation —</option>
                      @for (p of programs; track p.slug) {
                        <option [value]="p.slug">{{ code(p.school) }} · {{ p.title }}</option>
                      }
                    </select>
                    @if (bad('program')) { <span class="error">Choisissez la formation qui vous intéresse.</span> }
                  </label>
                }
              }
              @case (1) {
                <div class="f-pop grid gap-3.5 sm:grid-cols-2">
                  <h2 class="col-span-full m-0 text-[20px] font-extrabold text-ink">Vos coordonnées</h2>
                  <label class="field" [class.invalid]="bad('firstName')">Prénom<input formControlName="firstName" autocomplete="given-name" />@if (bad('firstName')) { <span class="error">Champ obligatoire.</span> }</label>
                  <label class="field" [class.invalid]="bad('lastName')">Nom<input formControlName="lastName" autocomplete="family-name" />@if (bad('lastName')) { <span class="error">Champ obligatoire.</span> }</label>
                  <label class="field" [class.invalid]="bad('email')">E-mail<input type="email" formControlName="email" autocomplete="email" />@if (bad('email')) { <span class="error">Saisissez une adresse e-mail valide.</span> }</label>
                  <label class="field" [class.invalid]="bad('phone')">Téléphone<input type="tel" formControlName="phone" autocomplete="tel" placeholder="+225" />@if (bad('phone')) { <span class="error">Champ obligatoire.</span> }</label>
                  <label class="field">Pays de résidence
                    <select formControlName="country">
                      @for (c of countries; track c) { <option [value]="c">{{ c }}</option> }
                    </select>
                  </label>
                  <label class="field">Dernier diplôme obtenu<input formControlName="diploma" placeholder="Ex : Baccalauréat C, 2026" /></label>
                  <label class="field col-span-full">Message (facultatif)<textarea rows="3" formControlName="message"></textarea></label>
                </div>
              }
              @case (2) {
                <div class="f-pop flex flex-col gap-4">
                  <div>
                    <h2 class="m-0 text-[20px] font-extrabold text-ink">Pièces jointes</h2>
                    <p class="m-0 text-[15px] text-muted">PDF, JPG ou PNG, 5 Mo maximum par fichier. Vous pourrez compléter votre dossier depuis l’espace candidat.</p>
                  </div>
                  @for (d of attachments; track d.key) {
                    <label class="flex cursor-pointer flex-wrap items-center gap-3.5 rounded-[16px] border-[1.5px] border-dashed p-4 transition-colors hover:border-blue hover:bg-tint-soft" [class]="files()[d.key] ? 'border-green bg-green-soft/50' : 'border-line'">
                      <span class="icon-tile !h-11 !w-11" [class]="files()[d.key] ? 'bg-green-soft text-green-ink' : 'bg-tint text-blue'"><app-icon [name]="files()[d.key] ? 'tick' : 'upload'" [size]="20" /></span>
                      <span class="min-w-0 flex-1">
                        <strong class="text-ink">{{ d.label }}</strong>@if (d.required) { <span class="text-red-700"> *</span> }<br />
                        <span class="block truncate text-[14px] text-muted">{{ files()[d.key] ?? 'Cliquez pour choisir un fichier' }}</span>
                      </span>
                      <span class="rounded-lg bg-white px-3 py-1.5 text-[14px] font-bold text-blue shadow-card">{{ files()[d.key] ? 'Remplacer' : 'Parcourir' }}</span>
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" class="sr-only-x" (change)="pick(d.key, $event)" />
                    </label>
                  }
                  @if (fileError()) { <p class="m-0 text-[14px] font-semibold text-red-700" role="alert">{{ fileError() }}</p> }
                </div>
              }
              @case (3) {
                <div class="f-pop flex flex-col gap-4">
                  <h2 class="m-0 text-[20px] font-extrabold text-ink">Récapitulatif</h2>
                  <dl class="m-0 grid gap-x-6 gap-y-3 rounded-2xl bg-tint-soft p-5 text-[15.5px] sm:grid-cols-2">
                    <div><dt class="text-[13.5px] text-subtle">Demande</dt><dd class="m-0 font-semibold text-ink">{{ typeLabel() }}</dd></div>
                    <div><dt class="text-[13.5px] text-subtle">Formation</dt><dd class="m-0 font-semibold text-ink">{{ programLabel() }}</dd></div>
                    <div><dt class="text-[13.5px] text-subtle">Candidat</dt><dd class="m-0 font-semibold text-ink">{{ form.value.firstName }} {{ form.value.lastName }}</dd></div>
                    <div><dt class="text-[13.5px] text-subtle">Contact</dt><dd class="m-0 font-semibold break-all text-ink">{{ form.value.email }}</dd></div>
                    <div><dt class="text-[13.5px] text-subtle">Pays</dt><dd class="m-0 font-semibold text-ink">{{ form.value.country }}</dd></div>
                    <div><dt class="text-[13.5px] text-subtle">Pièces jointes</dt><dd class="m-0 font-semibold text-ink">{{ fileCount() }} fichier(s)</dd></div>
                  </dl>
                  <label class="field max-w-[320px]" [class.invalid]="bad('captcha')">
                    Vérification anti-spam : combien font 4 + 3 ?
                    <input formControlName="captcha" inputmode="numeric" />
                    @if (bad('captcha')) { <span class="error">Réponse incorrecte.</span> }
                  </label>
                  <input type="text" formControlName="website" tabindex="-1" autocomplete="off" class="sr-only-x" aria-hidden="true" />
                  <label class="flex items-start gap-2.5 text-[14.5px] text-muted">
                    <input type="checkbox" formControlName="consent" class="mt-1 h-[18px] w-[18px] flex-none accent-blue" />
                    <span>J’accepte que l’ARSTM traite mes données dans le cadre de ma demande, conformément à la loi n° 2013-450 du 19 juin 2013. Je peux exercer mes droits d’accès, de rectification et de suppression.</span>
                  </label>
                  @if (bad('consent')) { <p class="m-0 text-[13.5px] font-semibold text-red-700">Votre consentement est nécessaire pour envoyer la demande.</p> }
                </div>
              }
            }

            <div class="flex flex-wrap items-center justify-between gap-3 border-t border-line-soft pt-5">
              @if (step() > 0) {
                <button type="button" class="f-btn btn-ghost !rounded-xl" (click)="back()"><app-icon name="arrow-left" [size]="18" />Retour</button>
              } @else {
                <a routerLink="/admissions" class="font-semibold no-underline">Annuler</a>
              }
              <button type="submit" class="f-btn btn-primary" [disabled]="sending()">
                @if (step() < 3) { Continuer <app-icon name="arrow-right" [size]="18" /> } @else { {{ sending() ? 'Envoi…' : 'Envoyer ma demande' }} }
              </button>
            </div>
          </form>
        } @else {
          <div role="status" class="f-pop flex flex-col items-center gap-4 rounded-[22px] bg-white p-[clamp(24px,4vw,48px)] text-center shadow-soft">
            <span class="icon-tile !h-16 !w-16 !rounded-full bg-green-soft text-green-ink"><app-icon name="tick" [size]="32" /></span>
            <h2 class="m-0 text-[28px] font-black text-ink">Demande envoyée</h2>
            <p class="m-0 max-w-[52ch] text-text">
              Merci {{ form.value.firstName }}. Votre dossier <strong class="text-blue">{{ ref() }}</strong> a été transmis à la scolarité. Un accusé de
              réception vient d’être envoyé à {{ form.value.email }}.
            </p>
            <div class="flex flex-wrap justify-center gap-3">
              <a routerLink="/espace" class="f-btn btn-primary">Suivre mon dossier</a>
              <a routerLink="/admissions" class="f-btn btn-ghost">Retour aux admissions</a>
            </div>
          </div>
        }
      </div>
    </section>
  `,
})
export default class Candidater {
  /** ?formation=slug */
  readonly formation = input<string>();
  private readonly fb = inject(FormBuilder);
  protected readonly img = IMG;
  protected readonly types = TYPES;
  protected readonly programs = PROGRAMS;
  protected readonly countries = [...MEMBER_STATES, 'Cameroun', 'Sénégal', 'Mali', 'Niger', 'Tchad', 'Centrafrique', 'Mauritanie', 'Autre'];
  protected readonly stepLabels = ['Demande', 'Coordonnées', 'Pièces', 'Envoi'];
  protected readonly attachments = [
    { key: 'id', label: 'Pièce d’identité', required: true },
    { key: 'diploma', label: 'Dernier diplôme ou relevé de notes', required: true },
    { key: 'cv', label: 'CV et lettre de motivation', required: false },
    { key: 'medical', label: 'Certificat médical d’aptitude', required: false },
  ];

  protected readonly step = signal(0);
  protected readonly done = signal(false);
  protected readonly sending = signal(false);
  protected readonly submitted = signal<number[]>([]);
  protected readonly files = signal<Record<string, string>>({});
  protected readonly fileError = signal('');
  protected readonly ref = signal('');

  protected readonly form = this.fb.nonNullable.group({
    type: ['pre'],
    program: [''],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    country: ['Côte d’Ivoire'],
    diploma: [''],
    message: [''],
    captcha: ['', Validators.pattern(/^\s*7\s*$/)],
    website: [''],
    consent: [false, Validators.requiredTrue],
  });

  private readonly stepFields: (keyof typeof this.form.controls)[][] = [['program'], ['firstName', 'lastName', 'email', 'phone'], [], ['captcha', 'consent']];

  protected readonly fileCount = computed(() => Object.keys(this.files()).length);

  constructor() {
    effect(() => {
      const f = this.formation();
      if (f) this.form.patchValue({ program: f });
    });
  }

  protected code(slug: string) {
    return schoolBySlug(slug)?.code ?? '';
  }
  protected typeLabel() {
    return TYPES.find((t) => t.key === this.form.value.type)?.label;
  }
  protected programLabel() {
    return PROGRAMS.find((p) => p.slug === this.form.value.program)?.title ?? '—';
  }

  protected bad(name: keyof typeof this.form.controls) {
    const c = this.form.controls[name];
    if (name === 'program') {
      const needs = this.form.value.type === 'pre';
      return needs && !c.value && this.submitted().includes(0);
    }
    if (name === 'captcha') return this.submitted().includes(3) && (!c.value || c.invalid);
    const stepOf = this.stepFields.findIndex((f) => f.includes(name));
    return c.invalid && (c.touched || this.submitted().includes(stepOf));
  }

  protected pick(key: string, e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      this.fileError.set(`« ${file.name} » dépasse 5 Mo.`);
      return;
    }
    this.fileError.set('');
    this.files.update((f) => ({ ...f, [key]: `${file.name} · ${(file.size / 1024).toFixed(0)} Ko` }));
  }

  private stepValid(i: number): boolean {
    if (i === 0) return this.form.value.type !== 'pre' || !!this.form.value.program;
    if (i === 2) {
      const ok = !!(this.files()['id'] && this.files()['diploma']);
      this.fileError.set(ok ? '' : 'Ajoutez au minimum la pièce d’identité et le dernier diplôme.');
      return ok;
    }
    if (i === 3) return this.form.controls.consent.valid && /^\s*7\s*$/.test(this.form.value.captcha ?? '');
    return this.stepFields[i].every((f) => this.form.controls[f].valid);
  }

  protected nextOrSubmit() {
    const i = this.step();
    this.submitted.update((s) => [...s, i]);
    this.stepFields[i].forEach((f) => this.form.controls[f].markAsTouched());
    if (!this.stepValid(i)) return;
    if (i < 3) {
      this.step.set(i + 1);
      window.scrollTo({ top: 260, behavior: 'smooth' });
      return;
    }
    if (this.form.value.website) return; // honeypot
    this.sending.set(true);
    setTimeout(() => {
      this.sending.set(false);
      this.ref.set('CAND-2027-' + Math.floor(10000 + Math.random() * 90000));
      this.done.set(true);
    }, 900);
  }

  protected back() {
    this.step.update((s) => Math.max(0, s - 1));
  }
}
