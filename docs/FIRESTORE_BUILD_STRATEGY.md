# Stratégie de build Firestore

## État actuel

Les pages publiques lisent `Barcelona` et `La-Rochelle` pendant le build. Chaque lecture possède un timeout de 15 secondes et jusqu’à trois tentatives avec backoff exponentiel et jitter. Une erreur réseau reste une erreur de build et n’est jamais remplacée par des données mock. Une collection entièrement vide est considérée comme suspecte et fait échouer la génération.

## Évolution possible

Si les builds distants restent sensibles à la disponibilité de Firestore, une étape contrôlée pourra produire un snapshot déterministe :

1. lire les deux collections avec un compte ou un workflow CI en lecture seule ;
2. valider schéma, nombre minimal de documents, identifiants, coordonnées et URLs d’images ;
3. dater et signer le snapshot ;
4. construire le site à partir du snapshot validé ;
5. conserver Firestore comme source de vérité et refuser un snapshot incomplet ou trop ancien.

Cette architecture n’est pas activée actuellement. Elle nécessite une décision sur la fréquence, la rétention, l’accès CI et les seuils de validation.
