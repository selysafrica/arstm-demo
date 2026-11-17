import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../shared/icon';
import { AdminStore } from '../admin-store';
import { ContentStore } from '../../core/content-store';
import { AdmPageHead } from '../ui';

/** Bannières (EF-ACC-02), encarts (EF-MED-06), bandeau d’alerte (EF-ACT-03), données de visualisation (EF-DAT-01). */
@Component({
  selector: 'adm-banners',
  imports: [RouterLink, Icon, AdmPageHead],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <adm-page-head title="Bannières, alertes et données" desc="Éléments de mise en avant de la page d’accueil et chiffres publiés." />

    <!-- Bandeau d’alerte -->
    <section class="adm-card flex flex-col gap-4 p-5" aria-labelledby="alert">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 id="alert" class="m-0 text-[16px] font-bold text-ink">Bandeau d’alerte du site</h2>
        <label class="relative inline-flex cursor-pointer items-center gap-2 text-[13.5px] font-semibold">
          <input type="checkbox" role="switch" class="peer sr-only" [checked]="content.alert().enabled" (change)="patchAlert({ enabled: !content.alert().enabled })" />
          <span class="h-5 w-9 rounded-full bg-[#cfd8e3] transition-colors peer-checked:bg-green"></span>
          <span class="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4"></span>
          {{ content.alert().enabled ? 'Affiché' : 'Masqué' }}
        </label>
      </div>
      <div class="grid gap-3 md:grid-cols-[2fr_1fr_1fr]">
        <label class="adm-label">Message<input class="adm-input" [value]="content.alert().text" (change)="patchAlert({ text: $any($event.target).value })" /></label>
        <label class="adm-label">Lien<input class="adm-input" [value]="content.alert().link" (change)="patchAlert({ link: $any($event.target).value })" /></label>
        <label class="adm-label">Ancre<input class="adm-input" [value]="content.alert().fragment ?? ''" (change)="patchAlert({ fragment: $any($event.target).value || undefined })" /></label>
      </div>
      <div class="flex items-start gap-3 rounded-xl border border-[#e4eaf2] bg-[#f7f9fc] p-3">
        <span class="inline-flex h-9 w-9 flex-none items-center justify-center rounded-[10px] bg-orange-soft text-orange-ink"><app-icon name="bell" [size]="16" /></span>
        <span class="flex flex-col"><strong class="text-[14px] text-ink">{{ content.alert().text }}</strong><span class="text-[13px] font-semibold text-blue">Voir le calendrier →</span></span>
        <span class="ml-auto text-[12px] text-subtle">Aperçu</span>
      </div>
      <p class="m-0 text-[12.5px] text-subtle">Le bandeau s’affiche en bas à gauche du site, une fois par session. <a routerLink="/" target="_blank">Voir sur le site</a></p>
    </section>

    <!-- Bannières -->
    <section class="adm-card overflow-hidden" aria-labelledby="ban">
      <h2 id="ban" class="m-0 px-5 pt-4 pb-3 text-[16px] font-bold text-ink">Bannières et encarts promotionnels</h2>
      <div class="overflow-x-auto">
        <table class="adm-table min-w-[680px]">
          <thead><tr><th>Visuel</th><th>Emplacement</th><th>Jusqu’au</th><th>Actif</th></tr></thead>
          <tbody>
            @for (b of store.banners(); track b.id) {
              <tr>
                <td><span class="flex items-center gap-3"><img [src]="b.img" alt="" class="h-11 w-16 rounded-md object-cover" /><strong class="text-ink">{{ b.title }}</strong></span></td>
                <td class="text-text">{{ b.place }}</td>
                <td class="text-subtle">{{ b.until }}</td>
                <td>
                  <label class="relative inline-flex cursor-pointer items-center">
                    <input type="checkbox" role="switch" class="peer sr-only" [checked]="b.active" [attr.aria-label]="'Activer ' + b.title" (change)="toggleBanner(b.id)" />
                    <span class="h-5 w-9 rounded-full bg-[#cfd8e3] transition-colors peer-checked:bg-green"></span>
                    <span class="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4"></span>
                  </label>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>

    <!-- Données de visualisation -->
    <section class="adm-card grid gap-5 p-5 lg:grid-cols-[1fr_1fr]" aria-labelledby="viz">
      <div class="flex flex-col gap-3">
        <h2 id="viz" class="m-0 text-[16px] font-bold text-ink">Évolution des effectifs</h2>
        <p class="m-0 text-[13px] text-subtle">Publiés sur la page Présentation. Saisissez les effectifs par année.</p>
        <div class="grid grid-cols-3 gap-2">
          @for (e of store.vizData().enrolment; track e.year; let i = $index) {
            <label class="adm-label">{{ e.year }}<input type="number" class="adm-input text-right tabular-nums" [value]="e.value" (input)="setEnrol(i, +$any($event.target).value)" /></label>
          }
        </div>
        <label class="adm-label max-w-[240px]">Taux d’insertion des diplômés (%)<input type="number" min="0" max="100" class="adm-input" [value]="store.vizData().employment" (input)="setEmployment(+$any($event.target).value)" /></label>
        @if (saved()) { <span role="status" class="text-[13px] font-semibold text-green-ink">Données enregistrées</span> }
      </div>
      <figure class="m-0 flex flex-col gap-2 rounded-xl bg-[#f7f9fc] p-4" aria-label="Aperçu du graphique">
        <figcaption class="text-[12.5px] text-subtle">Aperçu</figcaption>
        <div class="flex h-[180px] items-end gap-3 border-b border-[#e4eaf2]">
          @for (e of store.vizData().enrolment; track e.year; let last = $last) {
            <div class="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <span class="text-[12px] font-semibold text-muted tabular-nums">{{ e.value }}</span>
              <span class="w-full max-w-[40px] rounded-t-md transition-[height] duration-200" [class]="last ? 'bg-blue' : 'bg-sky'" [style.height.%]="max() ? (e.value / max()) * 80 : 0"></span>
            </div>
          }
        </div>
        <div class="flex gap-3">@for (e of store.vizData().enrolment; track e.year) { <span class="flex-1 text-center text-[12px] text-subtle">{{ e.year }}</span> }</div>
      </figure>
    </section>
  `,
})
export default class AdmBanners {
  protected readonly store = inject(AdminStore);
  protected readonly content = inject(ContentStore);
  protected readonly saved = signal(false);
  protected readonly max = computed(() => Math.max(...this.store.vizData().enrolment.map((e) => e.value || 0)));

  protected patchAlert(v: Partial<ReturnType<ContentStore['alert']>>) {
    this.content.alert.update((a) => ({ ...a, ...v }));
    this.store.log('a modifié', 'le bandeau d’alerte du site');
    try {
      sessionStorage.removeItem('arstm-alert');
    } catch {
      /* ignore */
    }
  }
  protected toggleBanner(id: number) {
    this.store.banners.update((l) => l.map((b) => (b.id === id ? { ...b, active: !b.active } : b)));
  }
  protected setEnrol(i: number, v: number) {
    this.store.vizData.update((d) => ({ ...d, enrolment: d.enrolment.map((e, k) => (k === i ? { ...e, value: v } : e)) }));
    this.flash();
  }
  protected setEmployment(v: number) {
    this.store.vizData.update((d) => ({ ...d, employment: v }));
    this.flash();
  }
  private flash() {
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 1500);
  }
}
