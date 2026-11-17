import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../shared/icon';
import { PageHero } from '../../shared/ui';
import { IMG } from '../../data/site';

/** Espace candidat / élève sécurisé — démo (EF-COM-01, EF-PAY-05). */
@Component({
  selector: 'app-espace',
  imports: [RouterLink, Icon, PageHero],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero [title]="logged() ? 'Bonjour, Aïcha' : 'Espace'" [accent]="logged() ? '' : 'candidat'" kicker="Espace sécurisé" [lead]="logged() ? 'Suivez vos dossiers, inscriptions et paiements.' : 'Suivez votre candidature, vos inscriptions et vos paiements, et accédez à vos documents.'" [image]="img.campus" [crumbs]="[{ label: 'Espace candidat' }]" [compact]="true" />

    <section class="container-x section-y relative z-[1] pt-[clamp(40px,5vw,64px)]">
      @if (!logged()) {
        <div class="mx-auto grid max-w-[980px] gap-5 md:grid-cols-2">
          <form class="flex flex-col gap-4 rounded-[22px] bg-white p-[clamp(22px,3vw,36px)] shadow-soft" (submit)="login($event)">
            <h2 class="m-0 text-[22px] font-extrabold text-ink">Connexion</h2>
            <label class="field">E-mail<input type="email" autocomplete="username" required /></label>
            <label class="field">Mot de passe<input type="password" autocomplete="current-password" required /></label>
            <a href="#" (click)="$event.preventDefault()" class="self-start text-[14.5px] font-semibold no-underline">Mot de passe oublié ?</a>
            <button type="submit" class="f-btn btn-primary"><app-icon name="lock" [size]="16" />Se connecter</button>
            <button type="button" class="f-btn btn-ghost !rounded-xl" (click)="logged.set(true)">Découvrir l’espace (démo)</button>
          </form>
          <div class="flex flex-col gap-4 rounded-[22px] bg-navy p-[clamp(22px,3vw,36px)] text-white">
            <strong class="text-[20px]">Pas encore de compte ?</strong>
            <p class="m-0 text-hero-text">Votre compte est créé automatiquement lors de votre première candidature ou inscription en ligne.</p>
            <ul class="m-0 flex list-none flex-col gap-2 p-0">
              @for (f of features; track f) {
                <li class="flex items-start gap-2.5 text-[15px]"><app-icon name="tick" [size]="18" class="mt-0.5 text-orange" />{{ f }}</li>
              }
            </ul>
            <a routerLink="/admissions/candidater" class="f-btn mt-auto self-start rounded-xl bg-orange px-5 py-3 font-extrabold text-navy hover:text-navy">Candidater</a>
          </div>
        </div>
      } @else {
        <div class="f-pop flex flex-col gap-5">
          <div class="grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-4">
            @for (k of kpis; track k.label) {
              <div class="flex items-center gap-4 rounded-[18px] bg-white p-5 shadow-card">
                <span class="icon-tile" [class]="k.cls"><app-icon [name]="k.icon" [size]="22" /></span>
                <span><strong class="text-[24px] leading-none font-black text-ink">{{ k.value }}</strong><br /><span class="text-[14.5px] text-muted">{{ k.label }}</span></span>
              </div>
            }
          </div>
          <div class="grid items-start gap-5 lg:grid-cols-[1.4fr_1fr]">
            <div class="flex flex-col gap-4 rounded-[22px] bg-white p-6 shadow-card">
              <strong class="text-[19px] text-ink">Mes dossiers et inscriptions</strong>
              <ul class="m-0 flex list-none flex-col gap-3 p-0">
                @for (d of dossiers; track d.ref) {
                  <li class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line-soft p-4">
                    <span class="flex flex-col"><strong class="text-ink">{{ d.title }}</strong><span class="text-[14px] text-subtle">{{ d.ref }} · {{ d.date }}</span></span>
                    <span class="tag" [class]="d.cls">{{ d.status }}</span>
                  </li>
                }
              </ul>
            </div>
            <div class="flex flex-col gap-4 rounded-[22px] bg-white p-6 shadow-card">
              <strong class="text-[19px] text-ink">Mes documents</strong>
              @for (doc of docs; track doc) {
                <a href="#" (click)="$event.preventDefault()" class="flex items-center gap-3 rounded-xl p-2 text-ink no-underline hover:bg-tint-soft">
                  <span class="icon-tile !h-10 !w-10 bg-tint text-blue"><app-icon name="file" [size]="18" /></span><span class="flex-1 text-[15px] font-semibold">{{ doc }}</span><app-icon name="download" [size]="18" class="text-blue" />
                </a>
              }
              <button type="button" class="f-btn btn-ghost mt-2 !rounded-xl" (click)="logged.set(false)"><app-icon name="logout" [size]="16" />Se déconnecter</button>
            </div>
          </div>
        </div>
      }
    </section>
  `,
})
export default class Espace {
  protected readonly img = IMG;
  protected readonly logged = signal(false);
  protected readonly features = ['Suivi en temps réel de votre candidature', 'Dépôt de pièces complémentaires', 'Historique des paiements et reçus', 'Convocations et résultats'];
  protected readonly kpis = [
    { label: 'Dossier en cours', value: '1', icon: 'file', cls: 'bg-tint text-blue' },
    { label: 'Inscription confirmée', value: '1', icon: 'tick', cls: 'bg-green-soft text-green-ink' },
    { label: 'Paiements', value: '180 000 F', icon: 'coin', cls: 'bg-orange-soft text-orange-ink' },
  ];
  protected readonly dossiers = [
    { title: 'Concours 2027 — Master Capitaine', ref: 'CAND-2027-48213', date: 'Déposé le 16 nov. 2026', status: 'En cours d’examen', cls: 'bg-orange-soft text-orange-ink' },
    { title: 'STCW — Formation de base à la sécurité', ref: 'ARSTM-FC-552104', date: 'Session du 7 déc. 2026', status: 'Payé · confirmé', cls: 'bg-green-soft text-green-ink' },
    { title: 'Commande — Recueil des conventions OMI', ref: 'CMD-2026-0912', date: 'Commandé le 2 nov. 2026', status: 'Expédié', cls: 'bg-tint text-blue' },
  ];
  protected readonly docs = ['Accusé de réception de candidature', 'Reçu de paiement FBS', 'Convocation — session STCW'];

  protected login(e: Event) {
    e.preventDefault();
    if ((e.target as HTMLFormElement).checkValidity()) this.logged.set(true);
  }
}
