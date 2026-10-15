# Tableau de bord Firebase — configuration simple

Le code `Digitaldream` est vérifié directement dans JavaScript. Il n’y a ni Firebase Authentication ni Cloud Functions. Les articles et les commandes sont lus et modifiés directement dans Firebase depuis le navigateur.

## Première configuration

1. Vérifiez la configuration du projet dans `firebase-config.js`.
2. Dans Firebase Console, activez Firestore Database et Firebase Storage.
3. Copiez les règles des fichiers `firestore.rules` et `storage.rules` dans les onglets **Rules** correspondants de la console Firebase, puis publiez-les.
4. Ouvrez `admin.html` avec Live Server en local ou publiez les fichiers du site sur GitHub Pages.
5. Saisissez `Digitaldream` dans la page admin. Les changements d’articles et les commandes s’affichent depuis Firebase.

## En local et sur GitHub Pages

En local, utilisez Live Server (par exemple `http://localhost:5500/admin.html`) — ne double-cliquez pas sur le fichier HTML. Sur GitHub Pages, ouvrez l’adresse du site suivie de `/admin.html`. Les deux versions utilisent le même projet Firebase : il n’y a aucune donnée à copier quand vous publiez le site.

## Important — sécurité temporairement désactivée

Comme demandé, le code est visible dans les fichiers JavaScript et sert seulement à masquer l’écran de connexion. Les règles Firebase autorisent temporairement la lecture et la modification publiques des articles, commandes et images. Toute personne connaissant l’adresse du site pourra contourner le code et accéder aux données, notamment aux coordonnées des clients. Il faudra resserrer les règles Firebase avant une utilisation publique.

Les documents de `products` utilisent `category`, `name`, `description`, `price`, `image`, `sizes`, `available`, `badge`, `storagePath`, `createdAt` et `updatedAt`. La collection `orders` conserve les informations envoyées par la boutique.
