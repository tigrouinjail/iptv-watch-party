# 🎥 Regardons Ensemble - IPTV Watch Party

Application web **open source** permettant de regarder un flux IPTV (match, film, série) **ensemble en temps réel**, avec **synchronisation parfaite**.

> **Seul l’Admin** choisit le contenu et contrôle la lecture. Les spectateurs regardent en mode passif.

---

## ✨ Fonctionnalités

- ✅ **Accès Admin réservé** : Seul l’Admin peut coller l’URL IPTV et contrôler la lecture
- ✅ **Synchronisation parfaite** via WebSocket
- ✅ **Support HLS** (.m3u8) via hls.js
- ✅ **Chat en direct** intégré
- ✅ **Lien spectateurs** simple à partager
- ✅ **Design cinéma moderne**
- ✅ **100% gratuit & facile à déployer**

---

## 🚀 Déploiement en 1 clic (Recommandé)

### Option 1 : Render.com (le plus simple - gratuit)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/tigrouinjail/iptv-watch-party)

Ou manuellement :
1. Va sur [render.com](https://render.com) et connecte ton GitHub
2. New Web Service → Connect `iptv-watch-party`
3. Tout est déjà configuré automatiquement grâce au fichier `render.yaml`
4. Clique sur Deploy

Ton app sera en ligne en 2-3 minutes à l’adresse fournie par Render.

### Option 2 : Railway.app

1. Va sur [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Choisis le repo `iptv-watch-party`
4. Railway détecte automatiquement Node.js
5. Deploy

---

## 📁 Installation locale (pour tester)

```bash
git clone https://github.com/tigrouinjail/iptv-watch-party.git
cd iptv-watch-party
npm install
npm start
```

Ouvre ensuite **http://localhost:3000**

---

## 📖 Comment utiliser

### En tant qu’Admin (toi)

1. Ouvre l’URL de ton app déployée
2. Clique sur **« Créer une salle (Admin) »**
3. Tu arrives avec tous les droits de contrôle
4. Colle ton **URL de flux IPTV** (.m3u8) + le titre
5. Clique sur **« DIFFUSER CE PROGRAMME »**
6. Copie le **lien spectateurs** et envoie-le à tes amis

### En tant que spectateur

Tes amis cliquent simplement sur le lien que tu leur as envoyé. Ils regardent sans rien pouvoir modifier.

---

## ⚠️ Important

- Le flux doit être un lien **.m3u8** lisible dans un navigateur
- Teste toujours ton lien d’abord dans **VLC**
- L’Admin seul voit et contrôle l’URL du flux

---

**Créé avec ❤️ par Grok (xAI)**

Amusez-vous bien et bon match / bon film ! 🍿⚽