import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageHero } from '../../shared/ui';
import { IMG } from '../../data/site';

/** Pages légales (EF-ERG-05, § 10.6). */
@Component({
  selector: 'app-legal',
  imports: [PageHero],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero title="Mentions légales" accent="et confidentialité" [image]="img.campus" [crumbs]="[{ label: 'Mentions légales' }]" [compact]="true" />
    <section class="container-x section-y relative z-[1] pt-10">
      <article class="prose-arstm mx-auto max-w-[820px] rounded-[22px] bg-white p-[clamp(22px,4vw,48px)] shadow-card">
        <h2 class="!mt-0">Éditeur du site</h2>
        <p>Académie Régionale des Sciences et Techniques de la Mer (ARSTM) — Yopougon Niangon Lokoa, B.P. V 158 Abidjan, Côte d’Ivoire. Téléphone : (225) 27 23 46 08 08. E-mail : arstminfo&#64;arstm.net.</p>
        <p>Directeur de la publication : le Directeur Général de l’ARSTM. Responsable éditorial : Département Communication et Marketing.</p>
        <h2>Hébergement</h2>
        <p>[Hébergeur à préciser après le choix technologique.]</p>
        <h2 id="confidentialite">Protection des données personnelles</h2>
        <p>Les données collectées via les formulaires (contact, candidature, inscription, newsletter) sont traitées par l’ARSTM conformément à la <strong>loi ivoirienne n° 2013-450 du 19 juin 2013</strong> relative à la protection des données à caractère personnel, après formalités auprès de l’ARTCI.</p>
        <ul>
          <li>Finalités : répondre aux demandes, gérer les candidatures, inscriptions et paiements, envoyer la newsletter.</li>
          <li>Durées de conservation : limitées à la finalité du traitement.</li>
          <li>Droits : accès, rectification et suppression, sur demande à arstminfo&#64;arstm.net.</li>
          <li>Paiements : délégués à un prestataire certifié PCI-DSS ; aucune donnée bancaire n’est stockée par le site.</li>
        </ul>
        <h2>Cookies</h2>
        <p>Le site n’utilise que des cookies techniques nécessaires à son fonctionnement et, avec votre consentement, des cookies de mesure d’audience.</p>
        <h2>Propriété intellectuelle</h2>
        <p>L’ensemble des contenus (textes, photos, logos, vidéos) est la propriété de l’ARSTM, sauf mention contraire.</p>
      </article>
    </section>
  `,
})
export default class Legal {
  protected readonly img = IMG;
}
