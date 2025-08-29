# 🔥 Guide de Test Firebase Storage

## 📊 Votre Structure Actuelle

### **Firestore Database** (✅ Déjà configuré)
```
apartments/ {
  "a1": { "floorId": "f1", "name": "A101", ... },
  "a2": { "floorId": "f1", "name": "A102", ... },
  ...
}
```

### **Firebase Storage** (🔧 À organiser)
```
Actuel:
├── ground-floor.glb (2.89 MB) ✅

Recommandé:
├── floors/
│   ├── ground-floor.glb     ✅ (déjà présent)
│   ├── first-floor.glb      📤 (à uploader)
│   ├── second-floor.glb     📤 (à uploader)
│   └── third-floor.glb      📤 (à uploader)
├── environments/
│   └── sky-background.exr   📤 (à uploader)
└── textures/
    └── floor-texture.jpg    📤 (à uploader)
```

## 🧪 Test 1: Vérifier le Chargement Actuel

1. **Lancez votre application:**
   ```bash
   npm run dev
   ```

2. **Ouvrez http://localhost:5173/viewer**

3. **Vérifiez la console du navigateur:**
   - Recherchez les messages: `🏢 Loading 3D model for floor: Ground Floor`
   - Vérifiez si le modèle se charge ou si vous voyez: `⚠️ No 3D model found`

## 🔧 Test 2: Organiser Firebase Storage

### **Option A: Déplacer le fichier existant**
1. Dans Firebase Console > Storage
2. Créez le dossier `floors/`
3. Déplacez `ground-floor.glb` vers `floors/ground-floor.glb`

### **Option B: Uploader dans la nouvelle structure**
1. Téléchargez votre `ground-floor.glb` localement
2. Dans Firebase Console > Storage, créez:
   ```
   floors/ground-floor.glb
   ```

## 🎯 Test 3: Vérifier le Mapping Floor Name → File

**Votre DataContext utilise ces noms:**
- `"Ground Floor"` → doit charger `floors/ground-floor.glb` ✅
- `"First Floor"` → doit charger `floors/first-floor.glb`
- `"Second Floor"` → doit charger `floors/second-floor.glb`
- `"Third Floor"` → doit charger `floors/third-floor.glb`

**Le service convertit automatiquement:**
- `"Ground Floor"` → `"ground-floor.glb"`
- `"First Floor"` → `"first-floor.glb"`
- etc.

## 🚀 Test 4: Ajouter Plus de Floors

### **Uploadez vos autres modèles 3D:**
```
Firebase Storage > floors/
├── ground-floor.glb    ✅
├── first-floor.glb     📤 Upload your file here
├── second-floor.glb    📤 Upload your file here
└── third-floor.glb     📤 Upload your file here
```

### **Ou utilisez le même modèle pour tester:**
1. Dupliquez `ground-floor.glb` 
2. Renommez-les:
   - `first-floor.glb`
   - `second-floor.glb`
   - `third-floor.glb`

## 🎨 Test 5: Ajouter Textures et Backgrounds (Plus tard)

### **Environments:**
```bash
Firebase Storage > environments/
└── sky-background.exr    # Votre fichier .exr
```

### **Textures:**
```bash
Firebase Storage > textures/
└── floor-texture.jpg     # Votre texture de sol
```

## 🔍 Debug: Messages Console à Surveiller

### **✅ Succès:**
```
🏢 Loading 3D model for floor: Ground Floor
🔥 Loading 3D model from Firebase Storage: https://...
✅ Successfully loaded 3D model for Ground Floor
```

### **⚠️ Fallback (Normal si pas de modèle):**
```
🏢 Loading 3D model for floor: First Floor
⚠️ No 3D model found for floor: First Floor
📦 Created fallback model for First Floor
```

### **❌ Erreur:**
```
❌ Error loading 3D model: [error message]
```

## 🎯 Prochaines Étapes

1. **Testez d'abord** avec la structure actuelle
2. **Organisez** vos fichiers dans Firebase Storage
3. **Uploadez** vos autres modèles 3D
4. **Ajoutez** textures et backgrounds
5. **Optimisez** les performances

## 📞 Support

Si vous voyez des erreurs, vérifiez:
1. **Permissions Firebase** - Storage rules
2. **Noms des fichiers** - doivent correspondre exactement
3. **Format des fichiers** - .glb pour les modèles 3D
4. **Taille des fichiers** - Firebase limite à 32MB par défaut

---

**Status Actuel:** 🧪 Phase de Test
**Prochaine Étape:** Organiser les fichiers dans Firebase Storage 