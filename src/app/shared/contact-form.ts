import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Icon } from './icon';
import { CONTACT_SUBJECTS } from '../data/site';

/** Formulaire de contact général, routé vers le bon service (EF-ENG-01, EF-ADMS-03/05). */
@Component({
  selector: 'app-contact-form',
  imports: [ReactiveFormsModule, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @if (!sent()) {
      <form
        [formGroup]="form"
        (ngSubmit)="submit()"
        novalidate
        class="grid h-full grid-cols-[repeat(auto-fit,minmax(200px,1fr))] content-start gap-3.5 rounded-[22px] bg-white p-[clamp(20px,3vw,32px)] shadow-soft"
      >
        <div class="col-span-full">
          <strong class="text-[22px] text-ink">Envoyez-nous un message</strong><br />
          <span class="text-[15px] text-subtle">Choisissez l’objet, votre demande arrive au bon service.</span>
        </div>
        <label class="field" [class.invalid]="bad('name')">
          Nom complet
          <input formControlName="name" autocomplete="name" />
          @if (bad('name')) {
            <span class="error">Indiquez votre nom.</span>
          }
        </label>
        <label class="field" [class.invalid]="bad('email')">
          E-mail
          <input type="email" formControlName="email" autocomplete="email" />
          @if (bad('email')) {
            <span class="error">Saisissez une adresse e-mail valide.</span>
          }
        </label>
        <label class="field">
          Téléphone
          <input type="tel" formControlName="phone" autocomplete="tel" placeholder="+225" />
        </label>
        <label class="field">
          Objet
          <select formControlName="subject">
            @for (s of subjects; track s.label) {
              <option [value]="s.label">{{ s.label }}</option>
            }
          </select>
        </label>
        <label class="field col-span-full" [class.invalid]="bad('message')">
          Message
          <textarea rows="4" formControlName="message"></textarea>
          @if (bad('message')) {
            <span class="error">Votre message doit contenir au moins 10 caractères.</span>
          }
        </label>
        <label class="col-span-full flex items-start gap-2.5 text-[14.5px] text-muted" [class.text-red-700]="bad('consent')">
          <input type="checkbox" formControlName="consent" class="mt-1 h-[18px] w-[18px] flex-none accent-blue" />
          <span>J’accepte que l’ARSTM traite mes données pour répondre à ma demande, conformément à la loi ivoirienne n° 2013-450.</span>
        </label>
        <p class="col-span-full m-0 flex items-center gap-2 text-[14px] text-subtle">
          <app-icon name="info" [size]="16" />Transmis à : <strong class="text-navy">{{ service() }}</strong>
        </p>
        <button type="submit" class="f-btn col-span-full min-h-[52px] rounded-xl bg-blue text-white" [disabled]="sending()">
          {{ sending() ? 'Envoi en cours…' : 'Envoyer le message' }}
        </button>
      </form>
    } @else {
      <div role="status" class="f-pop flex h-full flex-col items-start gap-4 rounded-[22px] bg-white p-[clamp(20px,3vw,32px)] shadow-soft">
        <span class="icon-tile bg-green-soft text-green-ink"><app-icon name="tick" [size]="24" /></span>
        <strong class="text-[22px] text-ink">Message envoyé</strong>
        <p class="m-0 text-text">
          Merci {{ form.value.name }}. Votre demande a été transmise au service <strong class="text-blue">{{ service() }}</strong>. Un accusé
          de réception vient d’être envoyé à {{ form.value.email }} ; réponse sous 48 h ouvrées.
        </p>
        <button type="button" class="f-btn btn-ghost" (click)="reset()">Envoyer un autre message</button>
      </div>
    }
  `,
})
export class ContactForm {
  private readonly fb = inject(FormBuilder);
  protected readonly subjects = CONTACT_SUBJECTS;
  protected readonly sent = signal(false);
  protected readonly sending = signal(false);
  private readonly submitted = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    subject: [CONTACT_SUBJECTS[0].label],
    message: ['', [Validators.required, Validators.minLength(10)]],
    consent: [false, Validators.requiredTrue],
  });

  private readonly subject = toSignal(this.form.controls.subject.valueChanges, { initialValue: CONTACT_SUBJECTS[0].label });
  protected readonly service = computed(() => CONTACT_SUBJECTS.find((s) => s.label === this.subject())?.service ?? 'Accueil');
  private readonly status = toSignal(this.form.statusChanges, { initialValue: this.form.status });

  protected bad(name: keyof typeof this.form.controls) {
    this.status();
    const c = this.form.controls[name];
    return c.invalid && (c.touched || this.submitted());
  }

  protected submit() {
    this.submitted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.sending.set(true);
    setTimeout(() => {
      this.sending.set(false);
      this.sent.set(true);
    }, 700);
  }

  protected reset() {
    this.form.reset();
    this.submitted.set(false);
    this.sent.set(false);
  }
}
