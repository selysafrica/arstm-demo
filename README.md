# ARSTM — démo du site institutionnel (v3)

Démo front-end du futur site de l’Académie Régionale des Sciences et Techniques de la Mer,
réalisée d’après le cahier des charges v3.0 et la maquette « F · Accueil ».

**Stack :** Angular 22 (composants standalone, signals, zoneless, routes paresseuses) · Tailwind CSS 4.

## Lancer

```bash
npm install
npm start          # http://localhost:4200
npm run build      # build de production dans dist/
```

## Pages

| Rubrique | Routes |
|---|---|
| Accueil | `/` |
| L’institution | `/institution`, `/institution/mot-du-dg`, `/institution/politique-qualite`, `/institution/film`, `/institution/situation`, `/institution/organigramme`, `/references` |
| Formations | `/formations` (catalogue filtrable), `/formations/:ecole`, `/formations/:ecole/:formation`, `/formation-continue` (sessions STCW + inscription/paiement démo) |
| Admissions | `/admissions`, `/admissions/candidater` (formulaire en 4 étapes) |
| Actualités | `/actualites`, `/actualites/:slug`, `/agenda` (export .ics), `/mediatheque`, `/ressources` |
| Services | `/carrieres`, `/campus`, `/verifier-diplome`, `/espace`, `/contact` |
| Transverses | `/recherche`, `/plan-du-site`, `/mentions-legales`, 404 |

## Organisation du code

- `src/styles.css` — jetons de design (couleurs, ombres, typo Figtree) et composants partagés repris de la maquette.
- `src/app/data/site.ts` — toutes les données de démo (à remplacer par l’API du back-office).
- `src/app/layout/` — en-tête flottant + méga-menus + portail « Tous les sites », pied de page, bandeau d’alerte.
- `src/app/shared/` — icônes, bandeau de page, FAQ, formulaire de contact…
- `src/app/pages/` — une page par route.

## Limites de la démo

- Les contenus, chiffres et montants sont indicatifs ; les valeurs entre crochets (`[numéro]`, `[montant]`) sont à fournir par l’ARSTM.
- Aucun envoi réel : formulaires, paiement, connexion et vérification de diplôme sont simulés côté navigateur.
- FR/EN : l’interface (menus, boutons, pied de page) bascule ; les contenus éditoriaux restent en français.
# arstm-demo
