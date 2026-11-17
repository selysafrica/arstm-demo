import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { Icon } from '../shared/icon';
import { AdminStore, ROLES, Role } from './admin-store';
import { IMG } from '../data/site';

interface NavEntry {
  label: string;
  path: string;
  icon: string;
  badge?: () => number;
}

/** Gabarit du back-office : barre latérale + barre supérieure. */
@Component({
  selector: 'adm-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'menu.set(false); userMenu.set(false)' },
  template: `
    <div class="adm fixed inset-0 z-[55] flex bg-[#f3f6fa]">
      <!-- Barre latérale -->
      @if (menu()) {
        <div class="fixed inset-0 z-[56] bg-[rgba(14,24,62,.4)] lg:hidden" (click)="menu.set(false)" aria-hidden="true"></div>
      }
      <aside
        class="fixed inset-y-0 left-0 z-[57] flex w-[248px] flex-col bg-navy-deep text-foot-text transition-transform duration-200 lg:static lg:translate-x-0"
        [class.-translate-x-full]="!menu()"
        aria-label="Navigation du back-office"
      >
        <a routerLink="/admin" class="flex items-center gap-2.5 px-5 pt-5 pb-4 text-white no-underline hover:text-white">
          <img [src]="img.logo" alt="" width="34" height="34" />
          <span class="flex flex-col leading-tight"><strong class="text-[15px] font-black tracking-[.02em]">ARSTM</strong><span class="text-[12px] text-foot-muted">Back-office</span></span>
        </a>
        <nav class="flex-1 overflow-y-auto px-3 pb-4">
          @for (g of groups; track g.title) {
            <p class="mt-4 mb-1.5 px-2.5 text-[11.5px] font-bold tracking-[.06em] text-foot-muted uppercase">{{ g.title }}</p>
            <ul class="m-0 flex list-none flex-col gap-0.5 p-0">
              @for (n of g.items; track n.path) {
                <li>
                  <a
                    [routerLink]="n.path"
                    routerLinkActive="!bg-white/10 !text-white"
                    [routerLinkActiveOptions]="{ exact: n.path === '/admin' }"
                    class="flex min-h-[36px] items-center gap-2.5 rounded-lg px-2.5 text-[14px] font-medium text-foot-text no-underline transition-colors hover:bg-white/6 hover:text-white"
                    (click)="menu.set(false)"
                  >
                    <app-icon [name]="n.icon" [size]="17" />
                    <span class="flex-1">{{ n.label }}</span>
                    @if (n.badge && n.badge()) {
                      <span class="rounded-full bg-orange px-1.5 text-[11.5px] font-black text-navy">{{ n.badge() }}</span>
                    }
                  </a>
                </li>
              }
            </ul>
          }
        </nav>
        <a routerLink="/" class="m-3 flex items-center gap-2 rounded-lg border border-navy-line px-3 py-2 text-[13.5px] text-foot-text no-underline hover:bg-white/6 hover:text-white">
          <app-icon name="external" [size]="15" />Voir le site public
        </a>
      </aside>

      <!-- Zone principale -->
      <div class="flex min-w-0 flex-1 flex-col">
        <header class="flex h-[60px] flex-none items-center gap-3 border-b border-[#e4eaf2] bg-white px-4 lg:px-6">
          <button type="button" class="adm-btn adm-btn-ghost !h-9 !w-9 !p-0 lg:hidden" aria-label="Ouvrir le menu" (click)="menu.set(true)"><app-icon name="menu" [size]="18" /></button>
          <nav aria-label="Fil d’Ariane" class="hidden min-w-0 items-center gap-1.5 text-[13.5px] text-subtle sm:flex">
            <span>Back-office</span><app-icon name="chevron-right" [size]="14" /><strong class="truncate font-semibold text-ink">{{ current() }}</strong>
          </nav>
          <div class="ml-auto flex items-center gap-2">
            <label class="hidden items-center gap-2 text-[13px] text-subtle md:flex" title="Simuler les droits d’un autre rôle (ADM-01)">
              <span>Rôle</span>
              <select class="adm-input !min-h-[34px] !w-auto !py-0 font-semibold" [value]="store.role()" (change)="setRole($any($event.target).value)">
                @for (r of roles; track r) { <option [value]="r" [selected]="r === store.role()">{{ r }}</option> }
              </select>
            </label>
            <a routerLink="/admin/demandes" class="adm-btn adm-btn-ghost relative !h-9 !w-9 !p-0" [attr.aria-label]="store.newRequests() + ' nouvelles demandes'">
              <app-icon name="bell" [size]="17" />
              @if (store.newRequests()) { <span class="absolute -top-1 -right-1 rounded-full bg-orange px-1 text-[11px] font-black text-navy">{{ store.newRequests() }}</span> }
            </a>
            <div class="relative">
              <button type="button" class="flex cursor-pointer items-center gap-2 rounded-lg border-none bg-transparent p-1 font-[inherit] hover:bg-[#f3f6fa]" [attr.aria-expanded]="userMenu()" (click)="userMenu.set(!userMenu())">
                <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue text-[13px] font-bold text-white">{{ store.user().initials }}</span>
                <span class="hidden flex-col text-left leading-tight md:flex"><strong class="text-[13.5px] text-ink">{{ store.user().name }}</strong><span class="text-[12px] text-subtle">{{ store.role() }}</span></span>
                <app-icon name="chevron-down" [size]="15" class="text-subtle" />
              </button>
              @if (userMenu()) {
                <div class="f-pop adm-card absolute top-[calc(100%+6px)] right-0 z-[58] flex w-[240px] flex-col p-1.5 shadow-soft">
                  <span class="px-2.5 py-2 text-[12.5px] text-subtle">{{ store.user().title }}</span>
                  <label class="flex flex-col gap-1 px-2.5 pb-2 text-[12.5px] text-subtle md:hidden">Rôle simulé
                    <select class="adm-input" [value]="store.role()" (change)="setRole($any($event.target).value)">
                      @for (r of roles; track r) { <option [value]="r" [selected]="r === store.role()">{{ r }}</option> }
                    </select>
                  </label>
                  <a routerLink="/admin/journal" (click)="userMenu.set(false)" class="flex items-center gap-2 rounded-md px-2.5 py-2 text-ink no-underline hover:bg-[#f3f6fa]"><app-icon name="clock" [size]="16" />Mon activité</a>
                  <button type="button" class="flex cursor-pointer items-center gap-2 rounded-md border-none bg-transparent px-2.5 py-2 text-left font-[inherit] text-[#b42318] hover:bg-[#fef3f2]" (click)="logout()"><app-icon name="logout" [size]="16" />Se déconnecter</button>
                </div>
              }
            </div>
          </div>
        </header>
        <main class="min-h-0 flex-1 overflow-y-auto">
          @if (!store.rights().data && dataPage()) {
            <div class="m-6 flex items-start gap-3 rounded-xl border border-orange/40 bg-orange-soft p-4 text-orange-ink">
              <app-icon name="lock" />
              <span><strong>Accès restreint.</strong> Le rôle « {{ store.role() }} » ne permet pas de consulter les données personnelles (demandes, inscriptions, abonnés). Changez de rôle pour la démo.</span>
            </div>
          } @else {
            <div class="mx-auto flex max-w-[1320px] flex-col gap-5 p-4 lg:p-6">
              <router-outlet />
            </div>
          }
        </main>
      </div>
    </div>
  `,
})
export default class AdmLayout {
  protected readonly store = inject(AdminStore);
  private readonly router = inject(Router);
  protected readonly img = IMG;
  protected readonly roles = ROLES;
  protected readonly menu = signal(false);
  protected readonly userMenu = signal(false);

  protected readonly groups: { title: string; items: NavEntry[] }[] = [
    { title: 'Pilotage', items: [{ label: 'Tableau de bord', path: '/admin', icon: 'grid' }] },
    {
      title: 'Contenus',
      items: [
        { label: 'Pages', path: '/admin/pages', icon: 'sitemap', badge: () => this.store.pendingReview() },
        { label: 'Actualités et agenda', path: '/admin/actualites', icon: 'bell' },
        { label: 'Formations et sessions', path: '/admin/formations', icon: 'cap' },
        { label: 'Offres d’emploi', path: '/admin/emplois', icon: 'briefcase' },
        { label: 'Médiathèque', path: '/admin/medias', icon: 'sparkle' },
        { label: 'Bannières et données', path: '/admin/bannieres', icon: 'chart' },
      ],
    },
    {
      title: 'Relations',
      items: [
        { label: 'Demandes', path: '/admin/demandes', icon: 'mail', badge: () => this.store.newRequests() },
        { label: 'Inscriptions et commandes', path: '/admin/inscriptions', icon: 'coin' },
        { label: 'Newsletter', path: '/admin/newsletter', icon: 'share' },
      ],
    },
    {
      title: 'Administration',
      items: [
        { label: 'Utilisateurs et rôles', path: '/admin/utilisateurs', icon: 'users' },
        { label: 'Référencement', path: '/admin/seo', icon: 'search' },
        { label: 'Journal d’activité', path: '/admin/journal', icon: 'clock' },
      ],
    },
  ];

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );
  protected readonly current = computed(() => {
    const u = this.url().split(/[?#]/)[0];
    for (const g of this.groups) for (const n of g.items) if (n.path === u) return n.label;
    return 'Tableau de bord';
  });
  protected readonly dataPage = computed(() => ['/admin/demandes', '/admin/inscriptions', '/admin/newsletter'].some((p) => this.url().startsWith(p)));

  protected setRole(r: Role) {
    this.store.role.set(r);
    this.store.log('a basculé sur le rôle', r);
  }

  protected logout() {
    this.store.logout();
    this.router.navigate(['/admin/connexion']);
  }
}
