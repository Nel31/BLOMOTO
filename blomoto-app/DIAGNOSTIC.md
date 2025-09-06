# 🔧 Guide de Diagnostic - Pages Blanches

## 🚨 Problème identifié
Vous rencontrez des pages blanches lors de la navigation dans l'application.

## 🛠️ Solutions de diagnostic

### 1. **Test de base**
Allez sur : `http://localhost:5173/test`
- ✅ Si vous voyez la page de test → Le routage fonctionne
- ❌ Si page blanche → Problème de configuration

### 2. **Test d'authentification**
Allez sur : `http://localhost:5173/test-auth`
- ✅ Si vous voyez la page d'auth → L'authentification fonctionne
- ❌ Si page blanche → Problème avec AuthContext

### 3. **Diagnostic complet**
Allez sur : `http://localhost:5173/diagnostic`
- Cette page vous donnera toutes les informations de debug
- Vérifiez les erreurs dans la console (F12)

## 🔍 Causes possibles des pages blanches

### 1. **Erreurs JavaScript**
- Ouvrez la console (F12)
- Regardez les erreurs en rouge
- Les erreurs peuvent empêcher le rendu des composants

### 2. **Problèmes d'import**
- Vérifiez que tous les composants sont correctement importés
- Vérifiez les chemins d'import (relatifs vs absolus)

### 3. **Problèmes de contexte**
- AuthContext ou GarageContext peuvent causer des erreurs
- Vérifiez que les providers sont bien configurés

### 4. **Problèmes de CSS**
- Tailwind CSS peut ne pas être chargé
- Vérifiez que les classes CSS sont correctes

## 🚀 Solutions rapides

### 1. **Redémarrer le serveur**
```bash
cd blomoto-app
npm run dev
```

### 2. **Vider le cache**
- Ouvrez les outils de développement (F12)
- Clic droit sur le bouton de rechargement
- Sélectionnez "Vider le cache et recharger"

### 3. **Vérifier la console**
- Appuyez sur F12
- Allez dans l'onglet "Console"
- Regardez les erreurs en rouge

### 4. **Tester les routes une par une**
Utilisez la page de test : `http://localhost:5173/test`
- Cliquez sur chaque lien
- Identifiez quelle page cause le problème

## 📋 Checklist de diagnostic

- [ ] Le serveur de développement fonctionne
- [ ] Aucune erreur dans la console
- [ ] La page de test se charge
- [ ] Les composants sont correctement importés
- [ ] Les contextes sont bien configurés
- [ ] Tailwind CSS est chargé

## 🆘 Si le problème persiste

1. **Vérifiez la console** pour les erreurs spécifiques
2. **Testez chaque route** individuellement
3. **Utilisez la page de diagnostic** pour plus d'informations
4. **Redémarrez** le serveur de développement

## 📞 Informations utiles

- **Port par défaut** : 5173
- **URL de test** : http://localhost:5173/test
- **URL de diagnostic** : http://localhost:5173/diagnostic
- **Console** : F12 → Console
