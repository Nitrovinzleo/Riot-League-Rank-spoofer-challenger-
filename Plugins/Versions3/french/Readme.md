# RANKMODIF - Plugin de Modification de Rang

## 📋 Description

RANKMODIF est un plugin Pengu Loader qui permet de modifier l'affichage des rangs dans League of Legends en utilisant une configuration par joueur (PUUID). Il supporte les bannières, crests, tooltips et les informations de LP/victoires.

## 🎯 Fonctionnalités

- **Modification par joueur** : Configuration individuelle via PUUID
- **Bannières personnalisées** : Change les bannières de rang
- **Crests complets** : Attributs crest complets avec animations
- **Tooltips améliorés** : Support Solo/Duo et Last Season
- **LP/Victoires** : Affichage personnalisé des wins et LP
- **Méthode agressive** : Détection robuste des éléments de rang
- **Support multi-langues** : Fonctionne en français et anglais

## ⚙️ Configuration

### 1. Trouver votre PUUID

1. Allez sur votre profil League of Legends
2. Appuyez sur `Ctrl+Maj+I` (ouvrir les outils de développement)
3. Appuyez sur `Ctrl+F` et cherchez `"puuid"`
4. Copiez le PUUID trouvé (ex: `f8cfb78f-66e6-5401-a710-02f1491b4c42`)

**Note** : Si ce n'est pas votre profil, cherchez le PUUID où `"is-searched"` est `false`.

### 2. Trouver les liens de bannières

Les liens de bannières peuvent être trouvés sur CommunityDragon ou utilisés comme suit :
```
/lol-game-data/assets/ASSETS/Regalia/BannerSkins/CHALLENGER.png
```

**Rangs disponibles** : IRON, BRONZE, SILVER, GOLD, PLATINUM, DIAMOND, MASTER, GRANDMASTER, CHALLENGER

### 3. Configurer les joueurs

Modifiez la section `PLAYERS_CONFIG` dans le fichier :

```javascript
const PLAYERS_CONFIG = {
  "VOTRE_PUUID": {
    tier: 'CHALLENGER',        // Rang (majuscules)
    div: "I",                  // Division (I, II, III, IV)
    text: 'Challenger',        // Texte affiché
    wins: 327,                 // Nombre de victoires
    lp: 1468,                  // Points de ligue
    banner: '/lol-game-data/assets/ASSETS/Regalia/BannerSkins/CHALLENGER.png'
  }, //  <--------N'OUBLIEZ PAS CETTE VIRGULE !!!!!!!!
  "AUTRE_PUUID": {
    tier: 'GRANDMASTER',
    div: "I",
    text: 'Grandmaster',
    wins: 245,
    lp: 892,
    banner: '/lol-game-data/assets/ASSETS/Regalia/BannerSkins/GRANDMASTER.png'
  }
}
```

## 🚀 Installation

1. Placez `RANKMODIF.js` dans le dossier `plugins` de Pengu Loader
2. Configurez vos PUUID et rangs dans le fichier
3. Redémarrez League of Legends ou rechargez la page
4. Les modifications s'appliqueront automatiquement

## 🔧 Options de Configuration

### Attributs de Rang

- `tier` : Rang principal (ex: 'CHALLENGER')
- `div` : Division (I, II, III, IV ou espace pour Master+)
- `text` : Texte affiché (ex: 'Challenger')
- `wins` : Nombre de victoires
- `lp` : Points de ligue
- `banner` : URL de la bannière

### Attributs Crest (automatiques)

Le plugin ajoute automatiquement :
- `crystal-level: 'DIAMOND'`
- `prestige-crest-id: '23'`
- `ranked-split-reward: '0'`
- `crest-sizing: 'huge'`
- `animations: 'true'`

## 🎮 Utilisation

### Modification de votre profil

1. Trouvez votre PUUID comme indiqué ci-dessus
2. Ajoutez votre configuration dans `PLAYERS_CONFIG`
3. Le plugin détectera automatiquement votre profil

### Modification d'autres profils

1. Trouvez le PUUID du joueur ciblé
2. Ajoutez sa configuration dans `PLAYERS_CONFIG`
3. Le plugin appliquera les modifications quand vous visiterez son profil

### Last Season

Le rang de la saison précédente est automatiquement déduit de la bannière configurée via la fonction `getTierFromBanner()`.

## 🐛 Dépannage

### Problèmes courants

**Le rang ne s'affiche pas correctement**
- Vérifiez que le PUUID est correct
- Assurez-vous que la virgule est présente après chaque configuration
- Vérifiez que les liens de bannières sont valides

**Les tooltips ne se mettent pas à jour**
- Attendez quelques secondes (le plugin utilise des intervalles)
- Vérifiez que vous êtes bien sur Solo/Duo

**Last Season ne fonctionne pas**
- Vérifiez que votre lien de bannière correspond au rang souhaité
- Le rang de Last Season est extrait automatiquement du nom de fichier de la bannière

### Mode Debug

Le plugin inclut une méthode agressive qui recherche tous les éléments contenant :
- `[class*="ranked"]`
- `[class*="rank"]`
- `[class*="emblem"]`
- `[class*="tier"]`

Cela garantit une détection maximale des éléments de rang.

## ⚠️ Notes importantes

- **N'oubliez pas les virgules** entre les configurations de joueurs
- **Les PUUID doivent être entre guillemets**
- **Les liens de bannières doivent être valides**
- **Le plugin fonctionne mieux avec les bannières de rang classiques**
- **Pour les bannières non-classiques, utilisez RankedLobby.js**

## 🔄 Mises à jour

Le plugin s'actualise automatiquement toutes les 30ms pour garantir une application rapide des modifications.

## 📝 Exemple Complet

```javascript
//"PUUID (FOUND BY CTRL+MAJ+I ON YOUR/THE PERSON'S PROFILE -> CTRL+F -> type 'PUUID'. IF NOT YOUR PROFILE SEARCH FOR THE ONE WHERE 'is-seached' IS FALSE": 
//'BANNER LINK (CAN BE FOUND ON COMUNITYDRAGON) THE RANK OF THE BANNER CHANGES YOUR LAST SEASON RANK (MIGHT BE PROBLEMATIC WITH NON RANKED BANNERS : USE RANKEDLOBBY.JS)'

(function () {
  const PLAYERS_CONFIG = {
     //exemple of working profile
   "f8cfb78f-66e6-5401-a710-02f1491b4c42": {
      tier: 'Challenger',
      div: " ",
      text: 'Challenger',
      wins: 327,
      lp: 1468,
      banner:'/lol-game-data/assets/ASSETS/Regalia/BannerSkins/CHALLENGER.png'
   }, //  <--------DONT FORGET THIS COMA IF U PASTE MORE PROFILES !!!!!!!!!!!!
   "6c1fec8c-6741-5448-a1fa-5b9fc0afa6b4": {
      tier: 'Grandmaster',
      div: "I",
      text: 'Grandmaster',
      wins: 245,
      lp: 892,
      banner:'/lol-game-data/assets/ASSETS/Regalia/BannerSkins/GRANDMASTER.png'
   }
  }
  // ... reste du code
})();
