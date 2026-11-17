import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Icon } from '../../shared/icon';
import { PageHero } from '../../shared/ui';
import { StudentStore } from '../../core/student-store';
import { IMG } from '../../data/site';

/** Connexion à l’espace élèves (EF-COM-01). */
@Component({
  selector: 'app-espace-login',
  imports: [RouterLink, Icon, PageHero],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero title="Espace" accent="élèves" kicker="Espace sécurisé" lead="Candidats, élèves et anciens : suivez votre dossier, votre scolarité, vos paiements et accédez à vos documents." [image]="img.campus" [crumbs]="[{ label: 'Espace élèves' }]" [compact]="true" />

    <section class="container-x section-y relative z-[1] pt-[clamp(40px,5vw,64px)]">
      <div class="mx-auto grid max-w-[1000px] gap-5 md:grid-cols-[1.1fr_1fr]">
        <form class="box flex flex-col gap-4 p-[clamp(22px,3vw,36px)]" (submit)="login($event)" novalidate>
          <div>
            <h2 class="m-0 text-[22px] font-extrabold text-ink">Connexion</h2>
            <p class="m-0 text-[15px] text-muted">Identifiants transmis par la scolarité lors de votre inscription.</p>
          </div>
          <label class="field" [class.invalid]="error()">
            Matricule ou e-mail
            <input name="id" autocomplete="username" (input)="error.set('')" />
          </label>
          <label class="field" [class.invalid]="error()">
            Mot de passe
            <span class="relative flex">
              <input name="pwd" [type]="show() ? 'text' : 'password'" autocomplete="current-password" class="w-full !pr-12" (input)="error.set('')" />
              <button type="button" class="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer rounded-lg border-none bg-transparent px-2 py-1 font-[inherit] text-[13px] font-bold text-blue" (click)="show.set(!show())" [attr.aria-pressed]="show()">{{ show() ? 'Masquer' : 'Afficher' }}</button>
            </span>
            @if (error()) {
              <span class="error" role="alert">{{ error() }}</span>
            }
          </label>
          <div class="flex flex-wrap items-center justify-between gap-2 text-[14.5px]">
            <label class="inline-flex items-center gap-2 text-muted"><input type="checkbox" class="h-4 w-4 accent-blue" />Rester connecté</label>
            <a href="#" (click)="$event.preventDefault(); forgot.set(true)" class="font-semibold no-underline">Mot de passe oublié ?</a>
          </div>
          @if (forgot()) {
            <p class="f-pop m-0 rounded-xl bg-tint-soft p-3 text-[14.5px] text-text" role="status">Un lien de réinitialisation sera envoyé à l’adresse e-mail associée à votre matricule.</p>
          }
          <button type="submit" class="f-btn btn-primary" [disabled]="loading()">
            <app-icon name="lock" [size]="16" />{{ loading() ? 'Connexion…' : 'Se connecter' }}
          </button>
          <div class="flex items-center gap-3 text-[13px] text-subtle"><span class="h-px flex-1 bg-line"></span>ou<span class="h-px flex-1 bg-line"></span></div>
          <button type="button" class="f-btn btn-ghost !rounded-xl" (click)="demo()"><app-icon name="sparkle" [size]="16" />Découvrir l’espace avec un compte de démo</button>
        </form>
        <div class="flex flex-col gap-4 rounded-[20px] bg-navy p-[clamp(22px,3vw,36px)] text-white">
          <strong class="text-[20px]">Dans votre espace</strong>
          <ul class="m-0 flex list-none flex-col gap-3 p-0">
            @for (f of features; track f.title) {
              <li class="flex items-start gap-3">
                <span class="icon-tile !h-10 !w-10 bg-white/10 text-orange"><app-icon [name]="f.icon" [size]="18" /></span>
                <span><strong class="text-[15.5px]">{{ f.title }}</strong><br /><span class="text-[14.5px] text-hero-text">{{ f.text }}</span></span>
              </li>
            }
          </ul>
          <p class="m-0 mt-auto text-[14.5px] text-hero-text">Pas encore de compte ? Il est créé lors de votre première <a routerLink="/admissions/candidater" class="font-bold text-orange hover:text-white">candidature en ligne</a>.</p>
        </div>
      </div>
    </section>
  `,
})
export default class EspaceLogin {
  private readonly s = inject(StudentStore);
  private readonly router = inject(Router);
  protected readonly img = IMG;
  protected readonly show = signal(false);
  protected readonly loading = signal(false);
  protected readonly forgot = signal(false);
  protected readonly error = signal('');
  protected readonly features = [
    { title: 'Candidature', text: 'Suivi étape par étape et dépôt des pièces manquantes.', icon: 'check' },
    { title: 'Scolarité', text: 'Emploi du temps, notes et relevés.', icon: 'cap' },
    { title: 'Paiements', text: 'Factures, paiement en ligne et reçus.', icon: 'coin' },
    { title: 'Documents', text: 'Certificats, convocations, bibliothèque réservée.', icon: 'file' },
  ];

  protected login(e: Event) {
    e.preventDefault();
    const f = e.target as HTMLFormElement;
    const id = (f.elements.namedItem('id') as HTMLInputElement).value.trim();
    const pwd = (f.elements.namedItem('pwd') as HTMLInputElement).value;
    if (!id || !pwd) {
      this.error.set('Saisissez votre matricule (ou e-mail) et votre mot de passe.');
      return;
    }
    this.demo();
  }

  protected demo() {
    this.loading.set(true);
    setTimeout(() => {
      this.s.login();
      this.router.navigate(['/espace']);
    }, 500);
  }
}
