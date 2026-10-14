# Mise en service Firebase — Arttrixx Gallery

## Important — sécurité

Le site statique ne peut pas garder un secret admin. Le fichier Firebase Web config contient une clé d’identification du projet, pas un mot de passe. La protection des produits, commandes et photos dépend des règles Firebase ci-dessous. Ne publiez jamais une clé de compte de service dans ce dossier.

Le code saisi dans la page admin est vérifié par Firebase Authentication. Pour le premier accès, configurez le mot de passe du compte administrateur avec le code `Digitaldream`. Ce code est simple et ne doit pas rester en production : remplacez-le ensuite par un mot de passe long et unique.

## 1. Créer/configurer le projet Firebase

1. Ouvrir la console Firebase et créer un projet.
2. Ajouter une application Web et copier sa configuration.
3. Dans Authentication, activer le fournisseur **E-mail/Mot de passe** et créer un compte dédié à l’administration. Utiliser l’adresse configurée dans `adminEmail` et définir initialement `Digitaldream` comme mot de passe/code d’accès. Changez ce code après la mise en service.
4. Dans Firestore Database, créer une base en mode production.
5. Dans Storage, activer le bucket.
6. Copier les valeurs de l’application Web dans `firebase-config.js` : `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`.
7. Remplacer `adminEmail` par l’adresse exacte du compte administrateur.
8. Remplacer également `REMPLACER_PAR_LE_MAIL_ADMIN` dans `firestore.rules` et `storage.rules` par cette adresse, puis publier ces règles dans les onglets Rules correspondants de la console.
9. Héberger le dossier via un serveur HTTPS (par exemple Firebase Hosting). Les modules Firebase importés par navigateur ne fonctionnent pas correctement en ouvrant simplement les fichiers avec `file://`.

## 2. Double-clic sur le nom du footer

Le nom Arttrixx Gallery dans le footer de la page d’accueil ouvrira `admin.html` au double-clic. Le lien vers la page admin reste présent dans le HTML, mais la page exige une authentification Firebase autorisée. La sécurité réelle est appliquée côté Firestore/Storage Rules, pas par la discrétion du lien.

## 3. Catalogue attendu dans Firestore

La page admin ajoute des documents dans la collection `products` avec les champs :

- `category`: `tableaux` ou `streetwear`
- `name`, `description`, `price` (nombre FCFA), `image` (URL Storage)
- `sizes` (tableau, utilisé pour le streetwear)
- `available` (booléen)
- `badge`, `createdAt`, `updatedAt`

Les documents indisponibles restent dans Firestore mais ne sont plus affichés dans les grilles du site. Toute modification de disponibilité ou de catalogue est synchronisée en direct par Firestore.

## 4. Commandes

La collection `orders` reçoit les coordonnées client, l’heure de livraison souhaitée, la liste des articles/tailles, le sous-total, les frais fixes de livraison (1 500 FCFA), le total et le statut `pending`. L’administration peut ensuite marquer la commande `completed` ou la supprimer.

La validation du navigateur n’est pas un système de paiement. Les totaux devraient être recalculés côté serveur (Cloud Functions) avant d’accepter des paiements en ligne.
