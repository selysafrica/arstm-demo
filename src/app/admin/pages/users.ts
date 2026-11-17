import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Icon } from '../../shared/icon';
import { AdminStore, ROLES, ROLE_RIGHTS, Role } from '../admin-store';
import { AdmDrawer, AdmPageHead } from '../ui';

/** Utilisateurs, rôles et droits par rubrique / composante (ADM-01). */
@Component({
  selector: 'adm-users',
  imports: [Icon, AdmPageHead, AdmDrawer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <adm-page-head title="Utilisateurs et rôles" desc="Droits paramétrables par rubrique et par composante (écoles, ISMI, CREMPOL…).">
      <button type="button" class="adm-btn adm-btn-primary" [disabled]="!store.rights().manageUsers" (click)="invite()"><app-icon name="user" [size]="16" />Inviter un utilisateur</button>
    </adm-page-head>
    @if (!store.rights().manageUsers) {
      <p class="m-0 flex items-center gap-2 rounded-xl bg-orange-soft px-4 py-3 text-[14px] text-orange-ink"><app-icon name="lock" [size]="16" />Lecture seule : seul un administrateur peut gérer les comptes.</p>
    }

    <div class="adm-card overflow-x-auto">
      <table class="adm-table min-w-[820px]">
        <thead><tr><th>Utilisateur</th><th>Rôle</th><th>Périmètre</th><th>Dernière connexion</th><th>Statut</th></tr></thead>
        <tbody>
          @for (u of store.users(); track u.id) {
            <tr>
              <td>
                <span class="flex items-center gap-3">
                  <span class="inline-flex h-8 w-8 flex-none items-center justify-center rounded-full bg-tint text-[12px] font-bold text-navy">{{ initials(u.name) }}</span>
                  <span><strong class="text-ink">{{ u.name }}</strong><br /><span class="text-[12.5px] text-subtle">{{ u.email }}</span></span>
                </span>
              </td>
              <td>
                <select class="adm-input !min-h-8 !w-auto" [attr.aria-label]="'Rôle de ' + u.name" [value]="u.role" [disabled]="!store.rights().manageUsers || u.id === 1" (change)="setRole(u.id, $any($event.target).value)">
                  @for (r of roles; track r) { <option [value]="r" [selected]="r === u.role">{{ r }}</option> }
                </select>
              </td>
              <td class="text-text">{{ u.scope }}</td>
              <td class="text-subtle">{{ u.last }}</td>
              <td>
                <label class="relative inline-flex cursor-pointer items-center gap-2 text-[13px]">
                  <input type="checkbox" role="switch" class="peer sr-only" [checked]="u.active" [disabled]="!store.rights().manageUsers || u.id === 1" [attr.aria-label]="'Compte actif : ' + u.name" (change)="toggle(u.id)" />
                  <span class="h-5 w-9 rounded-full bg-[#cfd8e3] transition-colors peer-checked:bg-green peer-disabled:opacity-50"></span>
                  <span class="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4"></span>
                  {{ u.active ? 'Actif' : 'Désactivé' }}
                </label>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    <section class="adm-card overflow-hidden" aria-labelledby="matrix">
      <h2 id="matrix" class="m-0 px-5 pt-4 pb-3 text-[16px] font-bold text-ink">Matrice des droits</h2>
      <div class="overflow-x-auto">
        <table class="adm-table min-w-[720px]">
          <thead><tr><th>Rôle</th><th>Rédiger</th><th>Publier / valider</th><th>Données personnelles</th><th>Utilisateurs</th><th>Description</th></tr></thead>
          <tbody>
            @for (r of roles; track r) {
              <tr>
                <td><strong class="text-ink">{{ r }}</strong></td>
                @for (k of rightKeys; track k) {
                  <td>@if (rights[r][k]) { <app-icon name="tick" [size]="17" class="text-green" /> } @else { <app-icon name="x" [size]="15" class="text-[#c3ccd8]" /> }</td>
                }
                <td class="text-[13px] text-subtle">{{ rights[r].desc }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <p class="m-0 px-5 py-3 text-[12.5px] text-subtle">Mots de passe chiffrés, 10 caractères minimum, blocage après 5 tentatives (ET-SEC-04). Toutes les actions sont journalisées.</p>
    </section>

    @if (draft(); as d) {
      <adm-drawer title="Inviter un utilisateur" kicker="Un e-mail d’activation sera envoyé" (close)="draft.set(null)">
        <div class="flex flex-col gap-4">
          <label class="adm-label">Nom complet<input class="adm-input" [value]="d.name" (input)="draft.set({ ...d, name: $any($event.target).value })" /></label>
          <label class="adm-label">E-mail institutionnel<input type="email" class="adm-input" placeholder="prenom.nom@arstm.net" [value]="d.email" (input)="draft.set({ ...d, email: $any($event.target).value })" /></label>
          <fieldset class="m-0 flex flex-col gap-2 border-none p-0">
            <legend class="mb-1 text-[13px] font-semibold text-text">Rôle</legend>
            @for (r of roles; track r) {
              <label class="flex cursor-pointer items-start gap-3 rounded-lg border p-3" [class]="d.role === r ? 'border-blue bg-tint-soft' : 'border-[#e4eaf2]'">
                <input type="radio" name="role" class="mt-0.5 h-4 w-4 accent-blue" [checked]="d.role === r" (change)="draft.set({ ...d, role: r })" />
                <span><strong class="text-[14px] text-ink">{{ r }}</strong><br /><span class="text-[13px] text-subtle">{{ rights[r].desc }}</span></span>
              </label>
            }
          </fieldset>
          <fieldset class="m-0 flex flex-col gap-2 border-none p-0">
            <legend class="mb-1 text-[13px] font-semibold text-text">Périmètre</legend>
            <div class="flex flex-wrap gap-2">
              @for (s of store.scopes; track s) {
                <label class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[13px]" [class]="d.scopes.includes(s) ? 'border-blue bg-tint-soft text-navy' : 'border-[#e4eaf2]'">
                  <input type="checkbox" class="h-3.5 w-3.5 accent-blue" [checked]="d.scopes.includes(s)" (change)="toggleScope(s)" />{{ s }}
                </label>
              }
            </div>
          </fieldset>
          @if (error()) { <p class="m-0 rounded-lg bg-[#fef3f2] px-3 py-2 text-[13.5px] font-semibold text-[#b42318]" role="alert">{{ error() }}</p> }
        </div>
        <ng-container actions>
          <button type="button" class="adm-btn adm-btn-ghost" (click)="draft.set(null)">Annuler</button>
          <button type="button" class="adm-btn adm-btn-primary" (click)="save()">Envoyer l’invitation</button>
        </ng-container>
      </adm-drawer>
    }
  `,
})
export default class AdmUsers {
  protected readonly store = inject(AdminStore);
  protected readonly roles = ROLES;
  protected readonly rights = ROLE_RIGHTS;
  protected readonly rightKeys = ['edit', 'publish', 'data', 'manageUsers'] as const;
  protected readonly draft = signal<{ name: string; email: string; role: Role; scopes: string[] } | null>(null);
  protected readonly error = signal('');

  protected initials(n: string) {
    return n.split(/\s+/).map((x) => x[0]).slice(0, 2).join('').toUpperCase();
  }
  protected setRole(id: number, role: Role) {
    this.store.users.update((l) => l.map((u) => (u.id === id ? { ...u, role } : u)));
    this.store.log(`a attribué le rôle ${role} à`, this.store.users().find((u) => u.id === id)!.name);
  }
  protected toggle(id: number) {
    this.store.users.update((l) => l.map((u) => (u.id === id ? { ...u, active: !u.active } : u)));
    const u = this.store.users().find((x) => x.id === id)!;
    this.store.log(u.active ? 'a réactivé' : 'a désactivé', u.name);
  }
  protected invite() {
    this.error.set('');
    this.draft.set({ name: '', email: '', role: 'Contributeur', scopes: [] });
  }
  protected toggleScope(s: string) {
    this.draft.update((d) => (d ? { ...d, scopes: d.scopes.includes(s) ? d.scopes.filter((x) => x !== s) : [...d.scopes, s] } : d));
  }
  protected save() {
    const d = this.draft()!;
    if (!d.name.trim() || !/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(d.email)) return this.error.set('Nom et e-mail valide obligatoires.');
    if (!d.scopes.length) return this.error.set('Choisissez au moins un périmètre.');
    this.store.users.update((l) => [...l, { id: Date.now(), name: d.name, email: d.email, role: d.role, scope: d.scopes.join(', '), last: 'Invitation envoyée', active: true }]);
    this.store.log('a invité', `${d.name} (${d.role})`);
    this.draft.set(null);
  }
}
