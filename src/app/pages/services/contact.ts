import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../shared/icon';
import { PageHero } from '../../shared/ui';
import { ContactForm } from '../../shared/contact-form';
import { IMG, USEFUL_CONTACTS } from '../../data/site';

/** Page Contacts (EF-INS-04). */
@Component({
  selector: 'app-contact',
  imports: [RouterLink, Icon, PageHero, ContactForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero title="Contactez" accent="notre équipe" kicker="Contacts" lead="Une question sur une formation, un concours ou une inscription ? Nous vous répondons sous 48 h ouvrées." [image]="img.aerien" [crumbs]="[{ label: 'Contacts' }]" [compact]="true" />

    <section class="container-x section-y relative z-[1] pt-[clamp(40px,5vw,64px)]">
      <div class="grid items-start gap-5 lg:grid-cols-[1.35fr_1fr]">
        <app-contact-form />
        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-2.5 rounded-[22px] bg-white p-6 shadow-card">
            <strong class="flex items-center gap-2 text-[18px] text-ink"><app-icon name="phone" class="text-blue" />Contacts utiles <span class="ml-auto rounded-full bg-orange-soft px-2.5 py-0.5 text-[12.5px] font-extrabold text-orange-ink">Lun – ven</span></strong>
            @for (c of contacts; track c.label) {
              @if (c.href) {
                <a [href]="c.href" class="flex items-center justify-between gap-2 rounded-xl border border-line-soft px-3.5 py-3 text-[15px] text-ink no-underline hover:bg-tint-soft">{{ c.label }}<strong class="rounded-lg bg-tint-soft px-2 py-0.5 text-navy">{{ c.value }}</strong></a>
              } @else {
                <div class="flex items-center justify-between gap-2 rounded-xl border border-line-soft px-3.5 py-3 text-[15px] text-ink">{{ c.label }}<strong class="rounded-lg bg-tint-soft px-2 py-0.5 text-navy">{{ c.value }}</strong></div>
              }
            }
          </div>
          <div class="flex flex-col gap-3 rounded-[22px] bg-blue p-6 text-white">
            <strong class="text-[18px]">Adresse</strong>
            <span>Yopougon Niangon Lokoa<br />B.P. V 158 Abidjan, Côte d’Ivoire</span>
            <a routerLink="/institution/situation" class="f-btn self-start rounded-[10px] bg-white px-4 py-2.5 text-[15px] text-navy hover:text-navy"><app-icon name="pin" [size]="16" />Plan d’accès</a>
          </div>
          <div class="flex flex-col gap-3 rounded-[22px] bg-white p-6 shadow-card">
            <strong class="text-[18px] text-ink">Médias sociaux</strong>
            <div class="flex flex-wrap gap-2">
              @for (s of socials; track s.name) {
                <a href="#" (click)="$event.preventDefault()" class="inline-flex items-center gap-2 rounded-xl border border-line px-3.5 py-2.5 text-[15px] font-semibold text-navy no-underline hover:bg-tint"><app-icon [name]="s.icon" [size]="18" />{{ s.name }}</a>
              }
            </div>
            <a href="#" (click)="$event.preventDefault()" class="inline-flex items-center gap-2 text-[15px] font-semibold no-underline"><app-icon name="mail" [size]="16" />Accéder au mail institutionnel</a>
          </div>
        </div>
      </div>
    </section>

    <section id="newsletter" class="container-x section-y relative z-[1]">
      <div class="grid items-center gap-5 rounded-3xl bg-navy p-[clamp(24px,4vw,48px)] text-white md:grid-cols-[1fr_1.1fr]">
        <div class="flex flex-col gap-2">
          <h2 class="m-0 text-[clamp(26px,3vw,36px)] font-black">Newsletter de l’ARSTM</h2>
          <p class="m-0 text-hero-text">Concours, événements et nouvelles formations, une fois par mois. Désinscription en un clic.</p>
        </div>
        @if (!subscribed()) {
          <form class="flex flex-col gap-3" (submit)="sub($event)">
            <div class="flex flex-wrap gap-2">
              <label class="min-w-[220px] flex-1"><span class="sr-only-x">Adresse e-mail</span><input type="email" required placeholder="votre@email.com" class="min-h-[52px] w-full rounded-xl border-none px-4 font-[inherit] text-ink" /></label>
              <button type="submit" class="f-btn btn-accent">S’abonner</button>
            </div>
            <fieldset class="m-0 flex flex-wrap gap-x-4 gap-y-2 border-none p-0 text-[14.5px] text-hero-text">
              <legend class="sr-only-x">Centres d’intérêt</legend>
              @for (i of interests; track i) {
                <label class="inline-flex items-center gap-2"><input type="checkbox" checked class="h-4 w-4 accent-orange" />{{ i }}</label>
              }
            </fieldset>
          </form>
        } @else {
          <p role="status" class="f-pop m-0 flex items-start gap-2.5 rounded-2xl bg-white/8 p-4"><app-icon name="tick" class="mt-0.5 text-orange" />Presque terminé : confirmez votre abonnement en cliquant sur le lien reçu par e-mail.</p>
        }
      </div>
    </section>
  `,
})
export default class Contact {
  protected readonly img = IMG;
  protected readonly contacts = USEFUL_CONTACTS;
  protected readonly subscribed = signal(false);
  protected readonly interests = ['Concours et admissions', 'Formation continue', 'Événements', 'Publications'];
  protected readonly socials = [
    { name: 'Facebook', icon: 'facebook' },
    { name: 'LinkedIn', icon: 'linkedin' },
    { name: 'YouTube', icon: 'youtube' },
  ];
  protected sub(e: Event) {
    e.preventDefault();
    if ((e.target as HTMLFormElement).checkValidity()) this.subscribed.set(true);
  }
}
