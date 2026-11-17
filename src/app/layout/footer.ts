import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../shared/icon';
import { I18n, TPipe } from '../core/i18n';
import { A11y } from '../core/a11y';
import { IMG } from '../data/site';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, Icon, TPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="relative z-[1] bg-navy-deep text-[15px] text-foot-text">
      <div class="container-x flex flex-col gap-9 pt-14 pb-6">
        <!-- Newsletter (EF-ACT-05) -->
        <div
          id="newsletter-footer"
          class="flex flex-wrap items-center justify-between gap-5 rounded-[20px] border border-navy-line bg-white/4 p-[clamp(18px,2.5vw,28px)]"
        >
          <div class="flex items-center gap-3.5">
            <span class="icon-tile bg-orange text-navy"><app-icon name="mail" [size]="22" /></span>
            <span>
              <strong class="text-[20px] font-extrabold text-white">{{ 'newsletter' | t }}</strong><br />
              <span class="text-foot-text">{{ 'newsletterLead' | t }}</span>
            </span>
          </div>
          @if (!subscribed()) {
            <form class="flex w-full max-w-[460px] flex-wrap gap-2" (submit)="subscribe($event)">
              <label class="flex min-w-[220px] flex-1">
                <span class="sr-only-x">Adresse e-mail</span>
                <input
                  type="email"
                  required
                  placeholder="votre@email.com"
                  class="min-h-[48px] w-full rounded-[10px] border border-navy-line bg-white px-3.5 font-[inherit] text-ink"
                  [value]="email()"
                  (input)="email.set($any($event.target).value)"
                />
              </label>
              <button type="submit" class="f-btn btn-accent !py-0 min-h-[48px]">{{ 'subscribe' | t }}</button>
            </form>
          } @else {
            <p role="status" class="f-pop m-0 flex max-w-[460px] items-start gap-2.5 text-white">
              <app-icon name="tick" class="mt-0.5 text-orange" />
              <span>Merci ! Un e-mail de confirmation vient d’être envoyé à <strong>{{ email() }}</strong> (double opt-in).</span>
            </p>
          }
        </div>

        <div class="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-8">
          <div class="flex flex-col gap-3">
            <span class="flex items-center gap-2.5">
              <img [src]="img.logo" alt="" width="48" height="48" class="block" />
              <strong class="text-[20px] font-black text-white">ARSTM</strong>
            </span>
            <span>{{ 'footerTagline' | t }}</span>
            <span class="flex gap-2">
              @for (s of socials; track s.name) {
                <a
                  href="#"
                  (click)="$event.preventDefault()"
                  class="inline-flex h-10 w-10 items-center justify-center rounded-[10px] bg-white/8 text-foot-text transition-colors hover:bg-white/16 hover:text-white"
                  [attr.aria-label]="'ARSTM sur ' + s.name"
                  ><app-icon [name]="s.icon" [size]="18"
                /></a>
              }
            </span>
          </div>
          <div class="flex flex-col gap-2">
            <strong class="text-white">{{ 'formations' | t }}</strong>
            <a routerLink="/formations" class="foot-link">ESN · ESTM · CEAM</a>
            <a routerLink="/formation-continue" class="foot-link">{{ 'continuing' | t }}</a>
            <a routerLink="/formations/foad" class="foot-link">FOAD</a>
            <a routerLink="/admissions" class="foot-link">{{ 'admissions' | t }}</a>
          </div>
          <div class="flex flex-col gap-2">
            <strong class="text-white">{{ 'services' | t }}</strong>
            <a routerLink="/espace" class="foot-link">{{ 'candidateSpace' | t }}</a>
            <a routerLink="/verifier-diplome" class="foot-link">{{ 'verifyDiploma' | t }}</a>
            <a routerLink="/carrieres" class="foot-link">{{ 'careerCenter' | t }}</a>
            <a routerLink="/ressources" class="foot-link">Bibliothèque numérique</a>
          </div>
          <div class="flex flex-col gap-2">
            <strong class="text-white">{{ 'ourSites' | t }}</strong>
            <a routerLink="/formations/ismi" class="foot-link">ISMI</a>
            <a routerLink="/formations/crempol" class="foot-link">CREMPOL</a>
            <a routerLink="/formation-continue" class="foot-link">DDFCP</a>
            <a routerLink="/institution/situation" class="foot-link">Antenne de San-Pedro</a>
          </div>
          <div class="flex flex-col gap-2">
            <strong class="text-white">Contact</strong>
            <span>Yopougon Niangon Lokoa<br />B.P. V 158 Abidjan</span>
            <a href="tel:+2252723460808" class="foot-link">(225) 27 23 46 08 08</a>
            <a href="mailto:arstminfo@arstm.net" class="foot-link">arstminfo&#64;arstm.net</a>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3.5 border-t border-navy-line pt-5 text-[13.5px] text-foot-muted">
          <span>© 2026 ARSTM · ISO 9001:2015 · STCW · MESRS</span>
          <nav aria-label="Liens légaux" class="flex flex-wrap gap-x-4 gap-y-1">
            <a routerLink="/mentions-legales" class="foot-link !text-foot-muted">{{ 'legal' | t }}</a>
            <a routerLink="/mentions-legales" fragment="confidentialite" class="foot-link !text-foot-muted">{{ 'privacy' | t }}</a>
            <a routerLink="/plan-du-site" class="foot-link !text-foot-muted">{{ 'sitemap' | t }}</a>
            <button type="button" class="foot-link cursor-pointer border-none bg-transparent p-0 font-[inherit] !text-foot-muted" [attr.aria-pressed]="a11y.largeText()" (click)="a11y.largeText.set(!a11y.largeText())">
              A+ {{ 'textSize' | t }}
            </button>
            <button type="button" class="foot-link cursor-pointer border-none bg-transparent p-0 font-[inherit] !text-foot-muted" [attr.aria-pressed]="a11y.contrast()" (click)="a11y.contrast.set(!a11y.contrast())">
              {{ 'contrast' | t }}
            </button>
          </nav>
          <img [src]="img.flags" alt="" class="block h-3.5 w-auto max-w-full" />
        </div>
        <p class="m-0 -mt-4 text-[12.5px] text-foot-muted">{{ 'demoNote' | t }}</p>
      </div>
    </footer>
  `,
  styles: `
    .foot-link {
      color: var(--color-foot-text);
      text-decoration: none;
      transition: color 0.2s;
    }
    .foot-link:hover {
      color: #fff;
    }
  `,
})
export class Footer {
  protected readonly i18n = inject(I18n);
  protected readonly a11y = inject(A11y);
  protected readonly img = IMG;
  protected readonly email = signal('');
  protected readonly subscribed = signal(false);
  protected readonly socials = [
    { name: 'Facebook', icon: 'facebook' },
    { name: 'LinkedIn', icon: 'linkedin' },
    { name: 'YouTube', icon: 'youtube' },
  ];

  protected subscribe(e: Event) {
    e.preventDefault();
    if ((e.target as HTMLFormElement).checkValidity()) this.subscribed.set(true);
  }
}
