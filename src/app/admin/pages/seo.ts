import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../shared/icon';
import { AdminStore, PageNode } from '../admin-store';
import { AdmPageHead, AdmStat } from '../ui';

/** Référencement par page, redirections 301, sitemap (ADM-09, SEO-02/03/06/07). */
@Component({
  selector: 'adm-seo',
  imports: [RouterLink, Icon, AdmPageHead, AdmStat],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <adm-page-head title="Référencement" desc="Balises par page, redirections de l’ancien site et fichiers techniques." />

    <div class="grid grid-cols-2 gap-3 lg:grid-cols-[repeat(auto-fit,minmax(190px,1fr))]">
      <adm-stat label="Pages indexables" [value]="store.pages().length" icon="file" />
      <adm-stat label="Titles manquants ou trop longs" [value]="issues().title" icon="alert" tone="bg-orange-soft text-orange-ink" />
      <adm-stat label="Méta-descriptions à revoir" [value]="issues().desc" icon="alert" tone="bg-orange-soft text-orange-ink" />
      <adm-stat label="Images sans alt" [value]="missingAlt()" icon="sparkle" [tone]="missingAlt() ? 'bg-[#fef3f2] text-[#b42318]' : 'bg-green-soft text-green-ink'" />
    </div>

    <section class="adm-card flex flex-col" aria-labelledby="pages">
      <div class="flex flex-wrap items-center justify-between gap-2 px-5 pt-4 pb-3">
        <h2 id="pages" class="m-0 text-[16px] font-bold text-ink">Balises par page</h2>
        <label class="inline-flex items-center gap-2 text-[13.5px]"><input type="checkbox" class="h-4 w-4 accent-blue" [checked]="onlyIssues()" (change)="onlyIssues.set(!onlyIssues())" />Problèmes uniquement</label>
      </div>
      <div class="overflow-x-auto">
        <table class="adm-table min-w-[980px]">
          <thead><tr><th>Page</th><th class="w-[34%]">Balise title</th><th class="w-[38%]">Méta-description</th><th>hreflang</th></tr></thead>
          <tbody>
            @for (p of rows(); track p.id) {
              <tr>
                <td><strong class="text-ink">{{ p.title }}</strong><br /><span class="font-mono text-[12px] text-subtle">/fr{{ p.path === '/' ? '' : p.path }}</span></td>
                <td>
                  <input class="adm-input" [class.!border-orange]="!p.seoTitle || p.seoTitle.length > 60" [value]="p.seoTitle" [attr.aria-label]="'Title de ' + p.title" (change)="update(p, { seoTitle: $any($event.target).value })" />
                  <span class="text-[11.5px]" [class]="!p.seoTitle || p.seoTitle.length > 60 ? 'text-orange-ink' : 'text-subtle'">{{ p.seoTitle.length }}/60{{ !p.seoTitle ? ' · manquant' : '' }}</span>
                </td>
                <td>
                  <input class="adm-input" [class.!border-orange]="p.seoDesc.length < 50 || p.seoDesc.length > 160" [value]="p.seoDesc" [attr.aria-label]="'Méta-description de ' + p.title" (change)="update(p, { seoDesc: $any($event.target).value })" />
                  <span class="text-[11.5px]" [class]="p.seoDesc.length < 50 || p.seoDesc.length > 160 ? 'text-orange-ink' : 'text-subtle'">{{ p.seoDesc.length }}/160{{ p.seoDesc.length < 50 ? ' · trop courte' : '' }}</span>
                </td>
                <td>@if (p.en) { <span class="chip chip-ok">fr · en</span> } @else { <span class="chip chip-warn">fr seul</span> }</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>

    <div class="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
      <section class="adm-card flex flex-col gap-3 p-5" aria-labelledby="redir">
        <h2 id="redir" class="m-0 text-[16px] font-bold text-ink">Redirections 301 depuis l’ancien site</h2>
        <form class="flex flex-wrap gap-2" (submit)="addRedirect($event)">
          <input name="from" class="adm-input min-w-[180px] flex-1 font-mono text-[13px]" placeholder="/ancienne-url.php" aria-label="Ancienne URL" required />
          <input name="to" class="adm-input min-w-[180px] flex-1 font-mono text-[13px]" placeholder="/fr/nouvelle-url" aria-label="Nouvelle URL" required />
          <button type="submit" class="adm-btn adm-btn-primary">Ajouter</button>
        </form>
        <ul class="m-0 flex list-none flex-col gap-1 p-0">
          @for (r of redirects(); track r.from) {
            <li class="flex items-center gap-2 rounded-lg bg-[#f7f9fc] px-3 py-2 font-mono text-[12.5px]">
              <span class="truncate text-muted">{{ r.from }}</span><app-icon name="arrow-right" [size]="14" class="flex-none text-subtle" /><span class="truncate text-ink">{{ r.to }}</span>
              <span class="ml-auto font-sans text-[12px] text-subtle">{{ r.hits }} visites</span>
            </li>
          }
        </ul>
      </section>
      <section class="adm-card flex flex-col gap-2 p-5" aria-labelledby="tech">
        <h2 id="tech" class="m-0 mb-1 text-[16px] font-bold text-ink">Fichiers et données structurées</h2>
        @for (t of tech; track t.label) {
          <div class="flex items-center gap-3 rounded-lg border border-[#e4eaf2] px-3 py-2.5">
            <app-icon name="tick" [size]="16" class="text-green" />
            <span class="flex flex-1 flex-col"><strong class="text-[14px] text-ink">{{ t.label }}</strong><span class="text-[12.5px] text-subtle">{{ t.sub }}</span></span>
          </div>
        }
        <a routerLink="/plan-du-site" target="_blank" class="mt-1 text-[13.5px] font-semibold">Voir le plan du site public →</a>
      </section>
    </div>
  `,
})
export default class AdmSeo {
  protected readonly store = inject(AdminStore);
  protected readonly onlyIssues = signal(false);
  protected readonly redirects = signal([
    { from: '/index.php?page=formations', to: '/fr/formations', hits: 412 },
    { from: '/ecoles/esn.html', to: '/fr/formations/esn', hits: 188 },
    { from: '/concours.php', to: '/fr/admissions#concours', hits: 957 },
    { from: '/contact.html', to: '/fr/contact', hits: 236 },
  ]);
  protected readonly tech = [
    { label: 'sitemap.xml', sub: 'Généré automatiquement · FR et EN' },
    { label: 'robots.txt', sub: 'Back-office et espaces privés exclus' },
    { label: 'Schema.org', sub: 'EducationalOrganization, Course, Event' },
    { label: 'Search Console et Bing Webmaster', sub: 'Site soumis et vérifié' },
  ];
  private bad(p: PageNode) {
    return !p.seoTitle || p.seoTitle.length > 60 || p.seoDesc.length < 50 || p.seoDesc.length > 160;
  }
  protected readonly rows = computed(() => (this.onlyIssues() ? this.store.pages().filter((p) => this.bad(p)) : this.store.pages()));
  protected readonly issues = computed(() => ({
    title: this.store.pages().filter((p) => !p.seoTitle || p.seoTitle.length > 60).length,
    desc: this.store.pages().filter((p) => p.seoDesc.length < 50 || p.seoDesc.length > 160).length,
  }));
  protected readonly missingAlt = computed(() => this.store.media().filter((m) => m.kind === 'Image' && !m.alt).length);
  protected update(p: PageNode, v: Partial<PageNode>) {
    this.store.savePage({ ...p, ...v }, 'a modifié le référencement de');
  }
  protected addRedirect(e: Event) {
    e.preventDefault();
    const f = e.target as HTMLFormElement;
    const from = (f.elements.namedItem('from') as HTMLInputElement).value.trim();
    const to = (f.elements.namedItem('to') as HTMLInputElement).value.trim();
    if (!from || !to) return;
    this.redirects.update((l) => [{ from, to, hits: 0 }, ...l]);
    this.store.log('a ajouté la redirection 301', `${from} → ${to}`);
    f.reset();
  }
}
