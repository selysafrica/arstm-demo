import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Icon } from '../../shared/icon';
import { StudentStore } from '../../core/student-store';

/** Profil, préférences de notification et sécurité du compte. */
@Component({
  selector: 'app-espace-profil',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let p = s.profile();
    <div class="flex flex-col gap-5">
      <form class="box flex flex-col gap-4 p-6" (submit)="save($event)">
        <h2 class="m-0 text-[18px] font-extrabold text-ink">Informations personnelles</h2>
        <div class="grid gap-3 sm:grid-cols-2">
          <label class="field">Prénom<input [value]="p.firstName" disabled /></label>
          <label class="field">Nom<input [value]="p.lastName" disabled /></label>
          <label class="field">E-mail<input type="email" name="email" [value]="p.email" required /></label>
          <label class="field">Téléphone<input type="tel" name="phone" [value]="p.phone" /></label>
          <label class="field">Pays<input [value]="p.country" disabled /></label>
          <label class="field">Hébergement<input [value]="p.housing" disabled /></label>
        </div>
        <p class="m-0 text-[14px] text-subtle">Les champs grisés sont gérés par la scolarité. Pour les modifier, envoyez un message.</p>
        <div class="flex items-center justify-end gap-3">
          @if (saved()) { <span role="status" class="f-pop flex items-center gap-1.5 text-[14.5px] font-semibold text-green-ink"><app-icon name="tick" [size]="16" />Enregistré</span> }
          <button type="submit" class="f-btn btn-primary !py-2.5">Enregistrer</button>
        </div>
      </form>

      <div class="box flex flex-col gap-1 p-6">
        <h2 class="m-0 mb-3 text-[18px] font-extrabold text-ink">Notifications</h2>
        @for (o of notifs; track o.key) {
          <label class="flex cursor-pointer items-center justify-between gap-4 border-b border-line-soft py-3 last:border-none">
            <span><strong class="text-[15px] text-ink">{{ o.label }}</strong><br /><span class="text-[14px] text-subtle">{{ o.sub }}</span></span>
            <span class="relative inline-flex flex-none">
              <input type="checkbox" role="switch" class="peer sr-only" [checked]="pref(o.key)" (change)="toggle(o.key)" />
              <span class="h-7 w-12 rounded-full bg-line transition-colors peer-checked:bg-blue peer-focus-visible:outline-3 peer-focus-visible:outline-orange"></span>
              <span class="absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5"></span>
            </span>
          </label>
        }
      </div>

      <form class="box flex flex-col gap-4 p-6" (submit)="changePwd($event)">
        <h2 class="m-0 text-[18px] font-extrabold text-ink">Sécurité</h2>
        <div class="grid gap-3 sm:grid-cols-3">
          <label class="field">Mot de passe actuel<input type="password" autocomplete="current-password" required /></label>
          <label class="field">Nouveau mot de passe<input type="password" autocomplete="new-password" minlength="10" required /><span class="hint">10 caractères minimum</span></label>
          <label class="field">Confirmation<input type="password" autocomplete="new-password" required /></label>
        </div>
        <div class="flex items-center justify-end gap-3">
          @if (pwdOk()) { <span role="status" class="f-pop flex items-center gap-1.5 text-[14.5px] font-semibold text-green-ink"><app-icon name="tick" [size]="16" />Mot de passe mis à jour</span> }
          <button type="submit" class="f-btn btn-ghost !rounded-xl !py-2.5">Changer le mot de passe</button>
        </div>
      </form>
    </div>
  `,
})
export default class EspaceProfil {
  protected readonly s = inject(StudentStore);
  protected readonly saved = signal(false);
  protected readonly pwdOk = signal(false);
  protected readonly notifs = [
    { key: 'email' as const, label: 'Notifications par e-mail', sub: 'Notes, convocations, paiements, messages' },
    { key: 'sms' as const, label: 'Alertes SMS', sub: 'Uniquement les échéances et convocations' },
    { key: 'newsletter' as const, label: 'Newsletter de l’ARSTM', sub: 'Une fois par mois' },
  ];
  protected pref(k: 'email' | 'sms' | 'newsletter') {
    return this.s.prefs()[k];
  }
  protected toggle(k: 'email' | 'sms' | 'newsletter') {
    this.s.prefs.update((p) => ({ ...p, [k]: !p[k] }));
  }
  protected save(e: Event) {
    e.preventDefault();
    const f = e.target as HTMLFormElement;
    if (!f.checkValidity()) {
      f.reportValidity();
      return;
    }
    const email = (f.elements.namedItem('email') as HTMLInputElement).value;
    const phone = (f.elements.namedItem('phone') as HTMLInputElement).value;
    this.s.profile.update((p) => ({ ...p, email, phone }));
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2500);
  }
  protected changePwd(e: Event) {
    e.preventDefault();
    const f = e.target as HTMLFormElement;
    if (!f.checkValidity()) {
      f.reportValidity();
      return;
    }
    f.reset();
    this.pwdOk.set(true);
  }
}
