import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Router, RouterOutlet, Scroll } from '@angular/router';
import { filter } from 'rxjs';
import { Header } from './layout/header';
import { Footer } from './layout/footer';
import { AlertBanner } from './layout/alert-banner';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, AlertBanner],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-bg relative min-h-dvh overflow-x-clip">
      <!-- cercles d’arrière-plan (maquette) -->
      <div aria-hidden="true" class="pointer-events-none absolute inset-0 z-0 overflow-hidden" [hidden]="isAdmin()">
        <span class="f-blob" style="width: 420px; height: 420px; left: -120px; top: 1100px; background: rgba(147,190,240,.45)"></span>
        <span class="f-blob" style="width: 360px; height: 360px; right: -80px; top: 1900px; background: rgba(170,205,245,.5); animation-duration: 28s"></span>
        <span class="f-blob" style="width: 300px; height: 300px; left: 20%; top: 3100px; background: rgba(147,190,240,.4); animation-duration: 25s"></span>
        <span class="f-blob" style="width: 380px; height: 380px; right: 10%; top: 4200px; background: rgba(170,205,245,.45)"></span>
      </div>
      @if (!isAdmin()) {
        <app-header />
      }
      <main id="contenu" tabindex="-1" class="relative z-[1] outline-none">
        <router-outlet />
      </main>
      @if (!isAdmin()) {
        <app-footer />
        <app-alert-banner />
      }
    </div>
  `,
})
export class App {
  private readonly router = inject(Router);
  private lastPath = '';
  protected readonly isAdmin = toSignal(
    this.router.events.pipe(map(() => this.router.url.startsWith('/admin'))),
    { initialValue: location.pathname.startsWith('/admin') },
  );

  constructor() {
    // Défilement vers les ancres (#concours, #stcw…) une fois la page paresseuse rendue.
    this.router.events.pipe(filter((e): e is Scroll => e instanceof Scroll)).subscribe((ev) => {
      const e = ev.routerEvent;
      if (!('urlAfterRedirects' in e)) return;
      const tree = this.router.parseUrl(e.urlAfterRedirects);
      const path = e.urlAfterRedirects.split(/[?#]/)[0];
      const samePage = path === this.lastPath;
      this.lastPath = path;
      const id = tree.fragment;
      if (!id || ev.position) return;
      let tries = 0;
      const seek = () => {
        const el = document.getElementById(id);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY - 110;
          window.scrollTo({ top, behavior: samePage ? 'smooth' : 'instant' });
        } else if (tries++ < 30) setTimeout(seek, 40);
      };
      setTimeout(seek, 60);
    });
  }
}
