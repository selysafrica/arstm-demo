import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { Icon } from '../shared/icon';
import { I18n, TPipe } from '../core/i18n';
import { MAIN_NAV, PORTAL, PROFILE_NAV, IMG } from '../data/site';
import { A11y } from '../core/a11y';

type Panel = 'profiles' | 'institution' | 'formations' | 'admissions' | 'actualites' | null;

@Component({
  selector: 'app-header',
  imports: [RouterLink, Icon, TPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'closeAll()',
    '(document:click)': 'onDocClick($event)',
    '(window:scroll)': 'onScroll()',
  },
  templateUrl: './header.html',
})
export class Header {
  private readonly router = inject(Router);
  private readonly host = inject(ElementRef<HTMLElement>);
  protected readonly i18n = inject(I18n);
  protected readonly a11y = inject(A11y);

  protected readonly nav = MAIN_NAV;
  protected readonly profiles = PROFILE_NAV;
  protected readonly portal = PORTAL;
  protected readonly img = IMG;

  protected readonly panel = signal<Panel>(null);
  protected readonly mobileOpen = signal(false);
  protected readonly mobileSection = signal<string | null>(null);
  protected readonly scrolled = signal(false);
  protected readonly query = signal('');

  private readonly portalDialog = viewChild<ElementRef<HTMLDialogElement>>('portalDialog');

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  protected readonly section = computed(() => {
    const u = this.url().split(/[?#]/)[0];
    if (u === '/' || u === '') return 'home';
    if (u.startsWith('/institution') || u.startsWith('/references') || u.startsWith('/contact')) return 'institution';
    if (u.startsWith('/formation')) return 'formations';
    if (u.startsWith('/admissions')) return 'admissions';
    if (u.startsWith('/actualites') || u.startsWith('/agenda') || u.startsWith('/mediatheque') || u.startsWith('/ressources'))
      return 'actualites';
    return '';
  });

  protected readonly activeItem = computed(() => this.nav.find((n) => n.key === this.panel()));

  constructor() {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => this.closeAll());
  }

  protected toggle(p: Panel) {
    this.panel.update((cur) => (cur === p ? null : p));
  }

  protected closeAll() {
    this.panel.set(null);
    this.mobileOpen.set(false);
    document.documentElement.style.overflow = '';
  }

  protected toggleMobile() {
    const next = !this.mobileOpen();
    this.mobileOpen.set(next);
    this.panel.set(null);
    document.documentElement.style.overflow = next ? 'hidden' : '';
  }

  protected onDocClick(e: MouseEvent) {
    if (this.panel() && !this.host.nativeElement.contains(e.target as Node)) this.panel.set(null);
  }

  protected onScroll() {
    this.scrolled.set(window.scrollY > 24);
  }

  protected submitSearch(e: Event) {
    e.preventDefault();
    const q = this.query().trim();
    this.router.navigate(['/recherche'], { queryParams: q ? { q } : {} });
    this.query.set('');
  }

  protected openPortal() {
    this.closeAll();
    this.portalDialog()?.nativeElement.showModal();
  }

  protected closePortal() {
    this.portalDialog()?.nativeElement.close();
  }

  protected onDialogClick(e: MouseEvent) {
    if (e.target === this.portalDialog()?.nativeElement) this.closePortal();
  }
}
