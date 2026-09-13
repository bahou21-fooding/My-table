# My Table — V23

V23 refond l'expérience mobile autour de la maquette validée :

- carte plein écran sur mobile ;
- recherche et filtres visibles ;
- bottom sheet de restaurants, avec ouverture/fermeture par glissement ;
- fiche restaurant en bottom sheet ;
- recentrage automatique sur le restaurant sélectionné ;
- interface desktop conservée en mode carte + liste ;
- filtres guides / 2+ / 3+ / Mes adresses ;
- Food Partners conservés ;
- ajout local de restaurants conservé ;
- base actuelle de 357 restaurants conservée dans `data.js`.

## Géolocalisation

V23 utilise :
1. des coordonnées enregistrées si disponibles ;
2. une adresse vérifiée si disponible ;
3. sinon le centre de la ville comme position de départ.

Depuis une fiche restaurant, **📍 Affiner la position** lance une recherche géographique à la demande et mémorise le résultat sur l'appareil. Cela évite de lancer 357 requêtes automatiquement.

## Déploiement

Remplacer `index.html` et `data.js` dans le dépôt GitHub Pages `My-table`, puis ouvrir :

https://bahou21-fooding.github.io/My-table/?v=23

Le paramètre `?v=23` sert aussi à contourner les anciens caches du navigateur.
