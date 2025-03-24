#!/bin/bash

# Création du dossier pour la documentation
mkdir -p documentation

# Fonction pour afficher l'arborescence d'un dossier
print_tree() {
    local dir=$1
    local prefix=$2
    local exclude_dirs=("node_modules" "env" "__pycache__" "venv" ".git")
    
    echo "${prefix}└── $(basename "$dir")"
    
    for item in "$dir"/*; do
        if [ -e "$item" ]; then
            local name=$(basename "$item")
            # Vérifier si le dossier doit être exclu
            if [[ ! " ${exclude_dirs[@]} " =~ " ${name} " ]]; then
                if [ -d "$item" ]; then
                    print_tree "$item" "$prefix    "
                else
                    echo "${prefix}    └── $name"
                fi
            fi
        fi
    done
}

# Génération du rapport
{
    echo "# Documentation du Projet BLOMOTO"
    echo "## Architecture du Projet"
    echo ""
    
    echo "### Frontend (blomoto-app)"
    echo "\`\`\`"
    print_tree "blomoto-app" ""
    echo "\`\`\`"
    echo ""
    
    echo "### Backend (blomotobackend)"
    echo "\`\`\`"
    print_tree "blomotobackend" ""
    echo "\`\`\`"
    echo ""
    
    echo "## Dépendances"
    echo ""
    
    echo "### Frontend (package.json)"
    echo "\`\`\`json"
    cat blomoto-app/package.json
    echo "\`\`\`"
    echo ""
    
    echo "### Backend (requirements.txt)"
    echo "\`\`\`txt"
    cat blomotobackend/requirements.txt
    echo "\`\`\`"
    echo ""
    
    echo "## Configuration"
    echo ""
    
    echo "### Frontend (vite.config.js)"
    echo "\`\`\`javascript"
    cat blomoto-app/vite.config.js
    echo "\`\`\`"
    echo ""
    
    echo "### Backend (settings.py)"
    echo "\`\`\`python"
    cat blomotobackend/blomotobackend/settings.py
    echo "\`\`\`"
    
} > documentation/project_documentation.md

# Rendre le fichier exécutable
chmod +x generate_doc.sh

echo "Documentation générée avec succès dans le dossier 'documentation'" 