import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Icon } from '../../shared/icon';
import { Invoice, StudentStore } from '../../core/student-store';
import { fcfa } from './layout';

/** Paiements en ligne et suivi (EF-PAY-03→05). */
@Component({
  selector: 'app-espace-paiements',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-5">
      <div class="grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-3">
        <div class="box p-5"><span class="text-[14px] text-muted">Reste à payer</span><br /><strong class="text-[24px] font-black" [class]="s.toPayTotal() ? 'text-orange-ink' : 'text-green-ink'">{{ money(s.toPayTotal()) }}</strong></div>
        <div class="box p-5"><span class="text-[14px] text-muted">Déjà réglé (2026–2027)</span><br /><strong class="text-[24px] font-black text-ink">{{ money(s.paidTotal()) }}</strong></div>
        <div class="box flex items-center gap-3 p-5 text-[14.5px] text-muted"><app-icon name="lock" class="text-blue" />Paiement sécurisé via un prestataire agréé PCI-DSS. Aucune donnée bancaire stockée.</div>
      </div>

      @if (s.toPay().length) {
        <section class="box flex flex-col gap-3 p-5" aria-labelledby="topay">
          <h2 id="topay" class="m-0 text-[18px] font-extrabold text-ink">À régler</h2>
          @for (i of s.toPay(); track i.id) {
            <div class="rounded-2xl border" [class]="i.status === 'En retard' ? 'border-[#F04438]/40' : 'border-line-soft'">
              <div class="flex flex-wrap items-center gap-4 p-4">
                <span class="flex min-w-[220px] flex-1 flex-col">
                  <strong class="text-ink">{{ i.label }}</strong>
                  <span class="text-[14px] text-subtle">{{ i.detail }} · {{ i.id }} · échéance {{ i.due }}</span>
                </span>
                <span class="chip" [class]="i.status === 'En retard' ? 'chip-bad' : 'chip-warn'">{{ i.status }}</span>
                <strong class="text-[18px] whitespace-nowrap text-navy">{{ money(i.amount) }}</strong>
                @if (paying() !== i.id) {
                  <button type="button" class="f-btn btn-accent !py-2.5" (click)="start(i)">Payer</button>
                }
              </div>
              @if (paying() === i.id) {
                <div class="f-pop flex flex-col gap-3 border-t border-line-soft p-4">
                  @if (step() === 'choose') {
                    <fieldset class="m-0 grid gap-2 border-none p-0 sm:grid-cols-2">
                      <legend class="mb-2 text-[14.5px] font-semibold text-ink">Moyen de paiement</legend>
                      @for (m of methods; track m.key) {
                        <label class="flex cursor-pointer items-center gap-3 rounded-xl border-[1.5px] p-3 transition-colors" [class]="method() === m.key ? 'border-blue bg-tint-soft' : 'border-line-soft hover:border-line'">
                          <input type="radio" name="m" class="h-[18px] w-[18px] accent-blue" [checked]="method() === m.key" (change)="method.set(m.key)" />
                          <app-icon [name]="m.icon" class="text-navy" /><span><strong class="text-ink">{{ m.label }}</strong><br /><span class="text-[13.5px] text-subtle">{{ m.sub }}</span></span>
                        </label>
                      }
                    </fieldset>
                    <div class="flex flex-wrap justify-end gap-2">
                      <button type="button" class="f-btn btn-ghost !rounded-xl !py-2.5" (click)="paying.set(null)">Annuler</button>
                      <button type="button" class="f-btn btn-primary !py-2.5" (click)="confirm(i)"><app-icon name="lock" [size]="16" />Payer {{ money(i.amount) }}</button>
                    </div>
                  } @else {
                    <p class="m-0 flex items-center gap-3 text-[15px] text-text" role="status"><span class="h-6 w-6 animate-spin rounded-full border-[3px] border-tint border-t-blue"></span>Redirection vers le prestataire et confirmation…</p>
                  }
                </div>
              }
            </div>
          }
        </section>
      }

      @if (done()) {
        <p role="status" class="f-pop m-0 flex items-center gap-3 rounded-2xl bg-green-soft p-4 text-green-ink"><app-icon name="tick" />Paiement confirmé. Le reçu est disponible dans vos documents et a été envoyé par e-mail.</p>
      }

      <section class="box overflow-x-auto" aria-labelledby="hist">
        <h2 id="hist" class="m-0 px-5 pt-5 pb-3 text-[18px] font-extrabold text-ink">Historique</h2>
        <table class="w-full min-w-[620px] border-collapse text-left text-[15px]">
          <thead>
            <tr class="border-y border-line-soft bg-field text-[13px] text-muted">
              <th scope="col" class="px-5 py-3 font-semibold">Libellé</th>
              <th scope="col" class="px-3 py-3 font-semibold">Payé le</th>
              <th scope="col" class="px-3 py-3 font-semibold">Moyen</th>
              <th scope="col" class="px-3 py-3 text-right font-semibold">Montant</th>
              <th scope="col" class="px-5 py-3 font-semibold"><span class="sr-only-x">Reçu</span></th>
            </tr>
          </thead>
          <tbody>
            @for (i of paid(); track i.id) {
              <tr class="border-b border-line-soft last:border-none">
                <td class="px-5 py-3"><strong class="text-ink">{{ i.label }}</strong><br /><span class="text-[13.5px] text-subtle">{{ i.detail }} · {{ i.id }}</span></td>
                <td class="px-3 py-3 text-text">{{ i.paidOn }}</td>
                <td class="px-3 py-3 text-text">{{ i.method }}</td>
                <td class="px-3 py-3 text-right font-bold whitespace-nowrap text-ink">{{ money(i.amount) }}</td>
                <td class="px-5 py-3 text-right"><a href="#" (click)="$event.preventDefault()" class="inline-flex items-center gap-1.5 text-[14.5px] font-bold no-underline"><app-icon name="download" [size]="16" />Reçu</a></td>
              </tr>
            }
          </tbody>
        </table>
      </section>
    </div>
  `,
})
export default class EspacePaiements {
  protected readonly s = inject(StudentStore);
  protected readonly money = fcfa;
  protected readonly paid = computed(() => this.s.invoices().filter((i) => i.status === 'Payé'));
  protected readonly paying = signal<string | null>(null);
  protected readonly step = signal<'choose' | 'processing'>('choose');
  protected readonly done = signal(false);
  protected readonly method = signal('momo');
  protected readonly methods = [
    { key: 'momo', label: 'Mobile money', sub: 'Orange, MTN, Moov, Wave', icon: 'smartphone' },
    { key: 'card', label: 'Carte bancaire', sub: 'Visa, Mastercard (3-D Secure)', icon: 'card' },
  ];

  protected start(i: Invoice) {
    this.done.set(false);
    this.step.set('choose');
    this.paying.set(i.id);
  }
  protected confirm(i: Invoice) {
    this.step.set('processing');
    setTimeout(() => {
      this.s.pay(i.id, this.method() === 'momo' ? 'Mobile money' : 'Carte bancaire');
      this.paying.set(null);
      this.done.set(true);
    }, 1200);
  }
}
