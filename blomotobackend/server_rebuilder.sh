#!/bin/bash
# Script pour builder et démarrer le backend Django

# Vérifier si l'environnement virtuel existe et l'activer
if [ -f "env/bin/activate" ]; then
  echo "Activation de l'environnement virtuel..."
  source env/bin/activate
else
  echo "Environnement virtuel non trouvé. Veuillez créer un environnement virtuel dans le dossier 'env'."
  exit 1
fi

# Mettre à jour pip
echo "Mise à jour de pip..."
pip install --upgrade pip

# Installer les dépendances
echo "Installation des dépendances..."
pip install -r requirements.txt

# Appliquer les migrations
echo "Application des migrations..."
python manage.py migrate

# Lancer le serveur Django
echo "Lancement du serveur Django..."
python manage.py runserver
