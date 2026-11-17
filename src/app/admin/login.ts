import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Icon } from '../shared/icon';
import { AdminStore } from './admin-store';
import { IMG } from '../data/site';

/** Connexion au back-office (ET-SEC-04 : limitation des tentatives). */
@Component({
  selector: 'adm-login',
  imports: [Icon, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="adm fixed inset-0 z-[60] grid overflow-y-auto bg-[#f3f6fa] lg:grid-cols-[1fr_1.1fr]">
      <div class="relative hidden overflow-hidden bg-navy-deep text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <img [src]="img.salut" alt="" class="absolute inset-0 h-full w-full object-cover opacity-15" />
        <div class="relative flex items-center gap-3">
          <img [src]="img.logo" alt="" width="44" height="44" />
          <strong class="text-[18px] font-black tracking-[.02em]">ARSTM · Back-office</strong>
        </div>
        <div class="relative flex flex-col gap-3">
          <h1 class="m-0 max-w-[16ch] text-[34px] leading-tight font-extrabold">Gérez le site de l’Académie en toute autonomie.</h1>
          <p class="m-0 max-w-[46ch] text-[15px] text-hero-text">Contenus bilingues, circuit de validation, demandes, inscriptions, paiements et newsletter, au même endroit.</p>
        </div>
        <span class="relative text-[13px] text-foot-muted">Accès réservé au personnel habilité · connexion journalisée</span>
      </div>
      <div class="flex items-center justify-center p-6">
        <form class="adm-card flex w-full max-w-[400px] flex-col gap-4 p-7 shadow-soft" (submit)="submit($event)" novalidate>
          <div class="flex items-center gap-2.5 lg:hidden">
            <img [src]="img.logo" alt="" width="36" height="36" /><strong class="text-[16px] font-black text-navy">ARSTM · Back-office</strong>
          </div>
          <div>
            <h2 class="m-0 text-[20px] font-extrabold text-ink">Connexion</h2>
            <p class="m-0 text-[14px] text-subtle">Utilisez votre compte institutionnel.</p>
          </div>
          <label class="adm-label">E-mail<input name="email" type="email" class="adm-input !min-h-[42px]" autocomplete="username" placeholder="prenom.nom@arstm.net" /></label>
          <label class="adm-label">Mot de passe<input name="pwd" type="password" class="adm-input !min-h-[42px]" autocomplete="current-password" /></label>
          @if (error()) {
            <p class="m-0 rounded-lg bg-[#fef3f2] px-3 py-2 text-[13.5px] font-semibold text-[#b42318]" role="alert">{{ error() }}</p>
          }
          <button type="submit" class="adm-btn adm-btn-primary !min-h-[42px]" [disabled]="loading()"><app-icon name="lock" [size]="16" />{{ loading() ? 'Connexion…' : 'Se connecter' }}</button>
          <button type="button" class="adm-btn adm-btn-ghost !min-h-[42px]" (click)="enter()"><app-icon name="sparkle" [size]="16" />Accès démo (administrateur)</button>
          <p class="m-0 text-center text-[12.5px] text-subtle">5 tentatives maximum, puis blocage de 15 minutes. <a routerLink="/" class="font-semibold">Retour au site</a></p>
        </form>
      </div>
    </div>
  `,
})
export default class AdmLogin {
  private readonly store = inject(AdminStore);
  private readonly router = inject(Router);
  protected readonly img = IMG;
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  protected submit(e: Event) {
    e.preventDefault();
    const f = e.target as HTMLFormElement;
    const email = (f.elements.namedItem('email') as HTMLInputElement).value.trim();
    const pwd = (f.elements.namedItem('pwd') as HTMLInputElement).value;
    if (!email || !pwd) {
      this.error.set('Saisissez votre e-mail et votre mot de passe.');
      return;
    }
    this.enter();
  }

  protected enter() {
    this.loading.set(true);
    setTimeout(() => {
      this.store.login();
      this.router.navigate(['/admin']);
    }, 400);
  }
}
