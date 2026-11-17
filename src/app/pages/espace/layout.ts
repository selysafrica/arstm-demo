import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Icon } from '../../shared/icon';
import { StudentStore } from '../../core/student-store';
import { IMG } from '../../data/site';

export const fcfa = (n: number) => n.toLocaleString('fr-FR').replace(/ /g, ' ') + ' FCFA';

/** Gabarit de l’espace élèves : en-tête profil + navigation latérale. */
@Component({
  selector: 'app-espace-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="relative z-[1] overflow-hidden bg-navy text-white">
      <img [src]="img.campus" alt="" class="absolute inset-0 h-full w-full object-cover opacity-25" />
      <div aria-hidden="true" class="absolute inset-0" style="background: linear-gradient(180deg, rgba(14,24,62,.75), rgba(14,24,62,.95))"></div>
      <div class="container-x relative flex flex-wrap items-end justify-between gap-5 pt-[132px] pb-8">
        <div class="flex items-center gap-4">
          <span class="inline-flex h-16 w-16 flex-none items-center justify-center rounded-2xl bg-orange text-[22px] font-black text-navy">{{ s.profile().initials }}</span>
          <div class="flex flex-col">
            <span class="text-[14px] text-hero-text">Espace élèves · {{ s.profile().matricule }}</span>
            <h1 class="m-0 text-[clamp(26px,3vw,34px)] leading-tight font-extrabold">{{ s.profile().firstName }} {{ s.profile().lastName }}</h1>
            <span class="text-[15px] text-hero-text">{{ s.profile().program }} · {{ s.profile().year }}</span>
          </div>
        </div>
        <div class="flex gap-2">
          <a routerLink="/espace/messages" class="relative inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/12 text-white hover:bg-white/20 hover:text-white" [attr.aria-label]="'Messages, ' + s.unread() + ' non lus'">
            <app-icon name="bell" [size]="20" />
            @if (s.unread()) {
              <span class="absolute -top-1 -right-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-orange px-1 text-[12px] font-black text-navy">{{ s.unread() }}</span>
            }
          </a>
          <button type="button" class="f-btn rounded-xl bg-white/12 px-4 text-[15px] text-white hover:bg-white/20" (click)="logout()"><app-icon name="logout" [size]="18" />Se déconnecter</button>
        </div>
      </div>
    </section>

    <div class="container-x section-y relative z-[1] grid grid-cols-[minmax(0,1fr)] items-start gap-6 pt-8 lg:grid-cols-[250px_minmax(0,1fr)]">
      <nav aria-label="Espace élèves" class="min-w-0 lg:sticky lg:top-28">
        <ul class="box m-0 flex list-none gap-1 overflow-x-auto p-2 [scrollbar-width:none] lg:flex-col">
          @for (l of links; track l.path) {
            <li class="flex-none">
              <a
                [routerLink]="l.path"
                routerLinkActive="!bg-blue !text-white"
                [routerLinkActiveOptions]="{ exact: l.path === '/espace' }"
                class="flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-[15px] font-semibold whitespace-nowrap text-ink no-underline transition-colors hover:bg-tint"
              >
                <app-icon [name]="l.icon" [size]="18" />
                <span class="flex-1">{{ l.label }}</span>
                @if (l.path === '/espace/messages' && s.unread()) {
                  <span class="chip chip-warn">{{ s.unread() }}</span>
                }
                @if (l.path === '/espace/paiements' && s.toPay().length) {
                  <span class="chip chip-warn">{{ s.toPay().length }}</span>
                }
              </a>
            </li>
          }
        </ul>
        <div class="mt-3 hidden flex-col gap-1 rounded-2xl bg-tint-soft p-4 text-[14px] lg:flex">
          <strong class="text-navy">Besoin d’aide ?</strong>
          <span class="text-muted">Scolarité ESN · lun–ven, 8 h–16 h</span>
          <a href="tel:+2252723460808" class="font-bold no-underline">27 23 46 08 08</a>
        </div>
      </nav>
      <div class="min-w-0">
        <router-outlet />
      </div>
    </div>
  `,
})
export default class EspaceLayout {
  protected readonly s = inject(StudentStore);
  private readonly router = inject(Router);
  protected readonly img = IMG;
  protected readonly links = [
    { label: 'Tableau de bord', path: '/espace', icon: 'grid' },
    { label: 'Ma candidature', path: '/espace/candidature', icon: 'check' },
    { label: 'Scolarité', path: '/espace/scolarite', icon: 'cap' },
    { label: 'Paiements', path: '/espace/paiements', icon: 'coin' },
    { label: 'Commandes', path: '/espace/commandes', icon: 'briefcase' },
    { label: 'Documents', path: '/espace/documents', icon: 'file' },
    { label: 'Bibliothèque', path: '/espace/bibliotheque', icon: 'book' },
    { label: 'Messages', path: '/espace/messages', icon: 'mail' },
    { label: 'Mon profil', path: '/espace/profil', icon: 'user' },
  ];

  protected logout() {
    this.s.logout();
    this.router.navigate(['/espace/connexion']);
  }
}
