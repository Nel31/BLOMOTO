# Guide d'utilisation du système d'upload d'images

Ce guide explique comment utiliser le système d'upload d'images amélioré avec Cloudinary.

## 📋 Table des matières

1. [Configuration](#configuration)
2. [Endpoints disponibles](#endpoints-disponibles)
3. [Utilisation](#utilisation)
4. [Suppression d'images](#suppression-dimages)
5. [Gestion des erreurs](#gestion-des-erreurs)

---

## Configuration

### Variables d'environnement requises

Assurez-vous d'avoir ces variables dans votre fichier `.env` :

```env
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

### Structure des dossiers Cloudinary

Les images sont organisées automatiquement dans Cloudinary :
- `promoto/avatars/` - Avatars utilisateurs
- `promoto/garages/` - Images de garages
- `promoto/vehicles/` - Photos de véhicules

---

## Endpoints disponibles

### 1. Upload d'images de garage

**POST** `/api/upload/garage`

- **Accès** : Garagiste, Admin
- **Limite** : 10 images maximum
- **Format** : `multipart/form-data`
- **Champ** : `images` (array)

**Exemple avec cURL :**
```bash
curl -X POST http://localhost:5000/api/upload/garage \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "images=@image1.jpg" \
  -F "images=@image2.jpg"
```

**Réponse :**
```json
{
  "success": true,
  "count": 2,
  "images": [
    "https://res.cloudinary.com/.../image1.jpg",
    "https://res.cloudinary.com/.../image2.jpg"
  ],
  "details": [
    {
      "url": "https://res.cloudinary.com/.../image1.jpg",
      "publicId": "promoto/garages/image1"
    }
  ]
}
```

---

### 2. Upload d'avatar utilisateur

**POST** `/api/upload/avatar`

- **Accès** : Tous les utilisateurs authentifiés
- **Limite** : 1 image
- **Format** : `multipart/form-data`
- **Champ** : `avatar`

**Exemple avec cURL :**
```bash
curl -X POST http://localhost:5000/api/upload/avatar \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "avatar=@profile.jpg"
```

**Réponse :**
```json
{
  "success": true,
  "avatar": "https://res.cloudinary.com/.../avatar.jpg",
  "publicId": "promoto/avatars/avatar"
}
```

---

### 3. Upload de photos de véhicule

**POST** `/api/upload/vehicle`

- **Accès** : Client
- **Limite** : 5 images maximum
- **Format** : `multipart/form-data`
- **Champ** : `photos` (array)

**Exemple avec cURL :**
```bash
curl -X POST http://localhost:5000/api/upload/vehicle \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "photos=@car1.jpg" \
  -F "photos=@car2.jpg"
```

**Réponse :**
```json
{
  "success": true,
  "count": 2,
  "photos": [
    "https://res.cloudinary.com/.../car1.jpg",
    "https://res.cloudinary.com/.../car2.jpg"
  ],
  "details": [...]
}
```

---

## Suppression d'images

### 1. Supprimer par Public ID

**DELETE** `/api/upload/:publicId`

- **Accès** : Tous les utilisateurs authentifiés
- **Paramètre** : `publicId` (dans l'URL)

**Exemple :**
```bash
curl -X DELETE http://localhost:5000/api/upload/promoto/garages/image1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 2. Supprimer par URL

**DELETE** `/api/upload/url/delete`

- **Accès** : Tous les utilisateurs authentifiés
- **Body** : `{ "imageUrl": "https://res.cloudinary.com/..." }`

**Exemple :**
```bash
curl -X DELETE http://localhost:5000/api/upload/url/delete \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"imageUrl": "https://res.cloudinary.com/.../image.jpg"}'
```

---

## Utilisation dans les contrôleurs

### Mise à jour d'un garage avec suppression d'images

Lors de la mise à jour d'un garage, vous pouvez supprimer des images en incluant `imagesToDelete` :

```javascript
PUT /api/garages/me
{
  "name": "Nouveau nom",
  "images": ["https://nouvelle-image.jpg"],
  "imagesToDelete": [
    "https://ancienne-image1.jpg",
    "https://ancienne-image2.jpg"
  ]
}
```

### Mise à jour du profil avec suppression d'avatar

```javascript
PUT /api/users/profile
{
  "name": "Nouveau nom",
  "avatar": "https://nouvel-avatar.jpg",
  "deleteOldAvatar": true
}
```

---

## Transformations automatiques

Les images sont automatiquement optimisées selon leur type :

### Avatars
- Dimensions : 400x400px
- Crop : fill avec détection de visage
- Format : auto (WebP si supporté)

### Garages
- Dimensions : 1200x800px max
- Crop : limit (conserve les proportions)
- Format : auto

### Véhicules
- Dimensions : 1000x750px max
- Crop : limit
- Format : auto

---

## Gestion des erreurs

### Erreurs communes

**1. Image trop grande**
```json
{
  "message": "File too large"
}
```
- **Solution** : Limite de 10MB par fichier

**2. Format non supporté**
```json
{
  "message": "Seules les images sont autorisées"
}
```
- **Solution** : Utilisez JPG, PNG, WebP, etc.

**3. Cloudinary non configuré**
```json
{
  "message": "Erreur lors de l'upload Cloudinary: ..."
}
```
- **Solution** : Vérifiez vos variables d'environnement Cloudinary

**4. Image non trouvée lors de la suppression**
```json
{
  "message": "Image non trouvée"
}
```
- **Solution** : Vérifiez que le publicId ou l'URL est correct

---

## Exemples d'utilisation avec JavaScript/TypeScript

### Upload d'images de garage

```javascript
const formData = new FormData();
files.forEach(file => {
  formData.append('images', file);
});

const response = await fetch('/api/upload/garage', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const data = await response.json();
console.log('Images uploadées:', data.images);
```

### Upload d'avatar

```javascript
const formData = new FormData();
formData.append('avatar', file);

const response = await fetch('/api/upload/avatar', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const data = await response.json();
console.log('Avatar:', data.avatar);
```

### Supprimer une image

```javascript
const response = await fetch(`/api/upload/${publicId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
console.log('Image supprimée:', data);
```

---

## Bonnes pratiques

1. **Validation côté client** : Vérifiez la taille et le format avant l'upload
2. **Gestion des erreurs** : Toujours gérer les erreurs d'upload
3. **Nettoyage** : Supprimez les anciennes images lors de la mise à jour
4. **Optimisation** : Les images sont automatiquement optimisées, mais préférez des images déjà compressées
5. **Sécurité** : Ne partagez jamais vos clés Cloudinary publiquement

---

## Dépannage

### Les images ne s'uploadent pas

1. Vérifiez que Cloudinary est configuré dans `.env`
2. Vérifiez votre connexion internet
3. Vérifiez les logs du serveur pour les erreurs détaillées

### Les images sont supprimées mais restent visibles

- Cloudinary met parfois quelques minutes à supprimer complètement les images
- Vérifiez dans le dashboard Cloudinary

### Erreur "File too large"

- Réduisez la taille de vos images avant l'upload
- Utilisez un outil de compression d'images

---

## Support

Pour toute question ou problème, consultez :
- [Documentation Cloudinary](https://cloudinary.com/documentation)
- Les logs du serveur backend
- Le dashboard Cloudinary pour vérifier les uploads

