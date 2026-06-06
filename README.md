# 🎥 Regardons Ensemble - IPTV Watch Party

Application web **open source** permettant de regarder un flux IPTV (match, film, série) **ensemble en temps réel**, avec **synchronisation parfaite**.

> **Seul l’hôte** choisit le contenu et contrôle la lecture (play/pause/seek). Les invités regardent en parfaite synchronisation.

---

## ✨ Fonctionnalités

- ✅ **Création de salle privée** en un clic
- ✅ **Contrôle total par l’hôte** : changement de flux + play/pause/seek
- ✅ **Synchronisation temps réel** via WebSocket (Socket.io)
- ✅ **Support HLS** (.m3u8) via hls.js + fallback natif
- ✅ **Chat en direct** intégré
- ✅ **Liste des participants** en temps réel
- ✅ **Lien partageable** pour les invités (aucun compte requis)
- ✅ **Lien hôte secret** pour retrouver les droits de contrôle
- ✅ **Design cinéma moderne** (dark mode)
- ✅ **Responsive** (desktop + mobile)
- ✅ **100% gratuit & auto-hébergeable**

---

## 🚀 Installation & Lancement (en local)

### 1. Prérequis
- Node.js 18+ (https://nodejs.org)
- npm (inclus avec Node)

### 2. Installation

```bash
cd iptv-watch-party
npm install
```

### 3. Lancer le serveur

```bash
npm start
```

Ouvrez ensuite **http://localhost:3000** dans votre navigateur.

---

## 📦 Déploiement gratuit (recommandé)

### Option 1 : Render.com (le plus simple)

1. Créez un compte sur [render.com](https://render.com)
2. New Web Service → Connectez votre repo GitHub
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Deploy !

### Option 2 : Railway.app

Même principe, très rapide.

### Option 3 : VPS / Serveur personnel

```bash
npm install -g pm2
pm2 start server.js --name "iptv-party"
pm2 save
pm2 startup
```

N’oubliez pas d’ouvrir le port 3000 (ou utilisez Nginx + reverse proxy + HTTPS).

---

## 📖 Comment utiliser (pour vous et vos amis)

### En tant qu’Hôte (vous)

1. Allez sur la page d’accueil
2. Cliquez sur **« Créer une salle maintenant »**
3. Entrez votre pseudo + titre du match/film (ex: "PSG vs OM - 1/2 finale")
4. Vous arrivez dans la salle avec les droits d’hôte
5. **Collez votre URL de flux IPTV** (idéalement `.m3u8`) dans le champ prévu
6. Cliquez sur **DIFFUSER**
7. Copiez le **lien invités** et envoyez-le à vos amis

> **Important** : Gardez précieusement le lien complet de la page (avec le `hostToken` dans l’URL). C’est ce qui vous permet de garder les droits d’hôte même si vous rafraîchissez ou revenez plus tard.

### En tant qu’Invité

1. Cliquez sur le lien que l’hôte vous a envoyé
2. Entrez votre pseudo
3. Rejoignez → vous voyez directement le flux en cours (synchronisé)

---

## ⚠️ Notes importantes sur les flux IPTV

- L’application supporte le mieux les flux **HLS (.m3u8)**
- Le flux doit être **accessible publiquement depuis un navigateur** (pas de protection anti-hotlink forte, pas de token éphémère, pas de geo-blocage strict)
- Testez toujours votre lien d’abord dans **VLC** ou directement dans un onglet Chrome
- Certains providers IPTV ne permettent pas la lecture navigateur → dans ce cas, utilisez un flux alternatif ou un proxy

---

## 🛠️ Personnalisation

Vous pouvez facilement :
- Changer les couleurs (rose par défaut)
- Ajouter un logo
- Modifier les messages
- Ajouter une authentification simple
- Stocker les rooms en base de données (MongoDB / PostgreSQL)

Le code est volontairement simple et bien commenté.

---

## 📄 Licence

MIT — libre d’utilisation, modification et déploiement.

---

**Créé avec ❤️ par Grok (xAI) pour votre plaisir de regarder ensemble.**

Amusez-vous bien et bon match / bon film ! 🍿⚽