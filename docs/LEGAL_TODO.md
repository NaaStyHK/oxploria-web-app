# Validation juridique avant publication

Audit technique et éditorial réalisé le 10 octobre 2026. Les pages publiques décrivent le fonctionnement réel du site web : aucune authentification, aucun paiement, aucune publicité, aucune affiliation, aucune mesure d’audience active et aucune écriture de données visiteur dans Firestore.

## Informations obligatoires encore manquantes

Ces informations n’ont pas été communiquées et ne doivent pas être inventées :

- **Adresse postale complète de Kevin Hafsi EI.** La seule mention « La Rochelle, France » ne satisfait pas l’obligation d’adresse applicable au site professionnel d’un entrepreneur individuel.
- **Numéro de téléphone professionnel de l’éditeur.** La fiche officielle Service-Public demande un courriel et un numéro de téléphone.
- **Numéro de téléphone de l’hébergeur.** Vercel publie son identité et son adresse, mais aucun numéro général n’a été identifié dans les sources officielles consultées. Faire valider la présentation retenue ou demander cette information à Vercel.
- **Situation TVA et immatriculation.** Confirmer si une mention de TVA intracommunautaire, de non-assujettissement, de RNE ou de RCS doit s’ajouter au SIRET fourni.

Source : [Service-Public — mentions obligatoires d’un entrepreneur individuel](https://entreprendre.service-public.gouv.fr/vosdroits/F31228).

## Validation humaine demandée

- Faire relire les quatre documents par un professionnel du droit avant publication définitive.
- Confirmer les durées de conservation des courriels reçus à `contact@oxploria.com`.
- Vérifier les durées de journaux du compte Vercel, la région Firestore et celle du bucket Storage.
- Refaire l’audit avant toute activation de Firebase Auth, Analytics, AdSense, affiliation, paiement, formulaire, newsletter, CMP ou autre traceur.
- Ajouter des conditions générales de vente uniquement si Oxploria commence à vendre des biens ou services sur le site.

## Sources officielles consultées

- Service-Public Entreprendre — mentions obligatoires d’un entrepreneur individuel.
- CNIL — droits des personnes et recommandation consolidée sur les cookies et traceurs (2026).
- Vercel — Privacy Notice, Terms et DPA ; adresse vérifiée : 440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis.
- Firebase — Privacy and Security et Data Processing and Security Terms.
- OpenStreetMap — Copyright and License (ODbL et attribution).
- OpenMapTiles — licence et attribution du schéma cartographique.
