import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Icon } from '../../shared/icon';
import { PageHero } from '../../shared/ui';
import { DIPLOMAS, IMG } from '../../data/site';

type Result = { status: 'ok'; data: (typeof DIPLOMAS)[string] } | { status: 'ko' } | null;

/** Service « Vérifier un diplôme » (EF-COM-02). */
@Component({
  selector: 'app-verify',
  imports: [Icon, PageHero],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero title="Vérifier" accent="un diplôme" kicker="Service en ligne" lead="Employeurs, administrations : contrôlez en quelques secondes l’authenticité d’un diplôme délivré par l’ARSTM." [image]="img.salut" [crumbs]="[{ label: 'Vérifier un diplôme' }]" [compact]="true" />

    <section class="container-x section-y relative z-[1] pt-[clamp(40px,5vw,64px)]">
      <div class="mx-auto grid max-w-[980px] gap-5 md:grid-cols-[1.2fr_1fr]">
        <form class="flex flex-col gap-4 rounded-[22px] bg-white p-[clamp(22px,3vw,36px)] shadow-soft" (submit)="check($event)">
          <h2 class="m-0 text-[22px] font-extrabold text-ink">Référence du diplôme</h2>
          <label class="field">
            Numéro figurant au verso du diplôme
            <input [value]="ref()" (input)="ref.set($any($event.target).value)" placeholder="ARSTM-AAAA-ÉCOLE-0000" autocomplete="off" class="uppercase" required />
            <span class="hint">Exemples de démo : ARSTM-2019-ESN-0142 · ARSTM-2015-ESTM-0087</span>
          </label>
          <button type="submit" class="f-btn btn-primary" [disabled]="loading()">{{ loading() ? 'Vérification…' : 'Vérifier' }}</button>

          @if (result(); as r) {
            @if (r.status === 'ok') {
              <div role="status" class="f-pop flex flex-col gap-3 rounded-2xl border-[1.5px] border-green bg-green-soft p-5">
                <strong class="flex items-center gap-2 text-[18px] text-green-ink"><app-icon name="shield" />Diplôme authentique</strong>
                <dl class="m-0 grid gap-2 text-[15px] sm:grid-cols-2">
                  <div><dt class="text-[13px] text-muted">Titulaire</dt><dd class="m-0 font-semibold text-ink">{{ r.data.name }}</dd></div>
                  <div><dt class="text-[13px] text-muted">Année</dt><dd class="m-0 font-semibold text-ink">{{ r.data.year }}</dd></div>
                  <div class="sm:col-span-2"><dt class="text-[13px] text-muted">Diplôme</dt><dd class="m-0 font-semibold text-ink">{{ r.data.diploma }} ({{ r.data.school }})</dd></div>
                </dl>
              </div>
            } @else {
              <div role="alert" class="f-pop flex items-start gap-3 rounded-2xl border-[1.5px] border-[#F04438] bg-[#FEF3F2] p-5">
                <app-icon name="alert" class="mt-0.5 text-[#B42318]" />
                <span><strong class="text-[#B42318]">Aucun diplôme trouvé</strong><br /><span class="text-[15px] text-text">Vérifiez la référence ou contactez la scolarité : arstminfo&#64;arstm.net.</span></span>
              </div>
            }
          }
        </form>
        <aside class="flex flex-col gap-4 rounded-[22px] bg-navy p-6 text-white">
          <strong class="text-[19px]">Comment ça marche ?</strong>
          <ol class="m-0 flex list-none flex-col gap-3 p-0">
            @for (s of how; track s; let i = $index) {
              <li class="flex items-start gap-3 text-[15px] text-hero-text"><span class="inline-flex h-7 w-7 flex-none items-center justify-center rounded-full bg-orange text-[14px] font-black text-navy">{{ i + 1 }}</span>{{ s }}</li>
            }
          </ol>
          <p class="m-0 mt-auto text-[13.5px] text-foot-muted">Les données proviennent du registre des diplômes de l’ARSTM. Chaque vérification est journalisée.</p>
        </aside>
      </div>
    </section>
  `,
})
export default class Verify {
  protected readonly img = IMG;
  protected readonly ref = signal('');
  protected readonly loading = signal(false);
  protected readonly result = signal<Result>(null);
  protected readonly how = ['Saisissez la référence imprimée au verso du diplôme.', 'Le registre de l’ARSTM est interrogé en temps réel.', 'Le statut d’authenticité s’affiche immédiatement.'];

  protected check(e: Event) {
    e.preventDefault();
    const key = this.ref().trim().toUpperCase();
    if (!key) return;
    this.loading.set(true);
    this.result.set(null);
    setTimeout(() => {
      const data = DIPLOMAS[key];
      this.result.set(data ? { status: 'ok', data } : { status: 'ko' });
      this.loading.set(false);
    }, 600);
  }
}
