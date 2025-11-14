<<<<<<< HEAD
import sys
import os
import json
from datetime import datetime
import pandas as pd
from PyQt6.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                            QHBoxLayout, QPushButton, QLabel, QLineEdit, 
                            QFileDialog, QTableWidget, QTableWidgetItem,
                            QStackedWidget, QGroupBox, QRadioButton, 
                            QTextEdit, QProgressBar, QMessageBox, QHeaderView,
                            QSplitter, QFrame, QListWidget, QToolTip,
                            QMenu, QComboBox)
from PyQt6.QtCore import Qt, QThread, pyqtSignal, QTimer, QSettings
from PyQt6.QtGui import QFont, QPalette, QColor, QAction, QDragEnterEvent, QDropEvent

# Import des modules existants
from rh_utils import charger_et_preparer_rh
from ext_utils import charger_et_preparer_ext
from match_utils import associer_rh_aux_utilisateurs
from anomalies import detecter_anomalies, extraire_cas_a_verifier
from report import inject_to_template
from profils_valides import ajouter_profil_valide, charger_profils_valides
from directions_conservees import ajouter_direction_conservee, charger_directions_conservees

# Mapping décision -> labels (depuis main.py)
DECISION_TO_LABEL = {
    "Conserver":    ("A conserver", "Conservé"),
    "Désactiver":   ("A desactiver", "Désactivé"),
    "Modifier":     ("A Modifier", "Modifié"),
}

class ProcessingThread(QThread):
    """Thread pour le traitement des données"""
    progress = pyqtSignal(str)
    finished = pyqtSignal(object, object)
    error = pyqtSignal(str)
    
    def __init__(self, rh_paths, ext_path, certificateur):
        super().__init__()
        self.rh_paths = rh_paths
        self.ext_path = ext_path
        self.certificateur = certificateur
    
    def run(self):
        try:
            self.progress.emit("Chargement des fichiers RH...")
            rh_df = charger_et_preparer_rh(self.rh_paths)
            
            self.progress.emit("Chargement du fichier d'extraction...")
            ext_df = charger_et_preparer_ext(self.ext_path)
            
            self.progress.emit("Association des données RH...")
            ext_df = associer_rh_aux_utilisateurs(ext_df, rh_df)
            
            self.progress.emit("Détection des anomalies...")
            ext_df = detecter_anomalies(ext_df, certificateur=self.certificateur)
            
            self.progress.emit("Extraction des cas à vérifier...")
            cas_a_verifier = extraire_cas_a_verifier(ext_df)
            
            self.finished.emit(ext_df, cas_a_verifier)
        except Exception as e:
            self.error.emit(str(e))

class FileDropWidget(QWidget):
    """Widget qui accepte le glisser-déposer de fichiers"""
    filesDropped = pyqtSignal(list)
    
    def __init__(self, label_text, accepted_extensions=None):
        super().__init__()
        self.accepted_extensions = accepted_extensions or ['.xlsx']
        self.setAcceptDrops(True)
        
        layout = QVBoxLayout()
        self.label = QLabel(label_text)
        self.label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.label.setStyleSheet("""
            QLabel {
                border: 2px dashed #999;
                border-radius: 5px;
                padding: 20px;
                background-color: #f9f9f9;
            }
        """)
        layout.addWidget(self.label)
        self.setLayout(layout)
        
        # État hover
        self.hover = False
    
    def dragEnterEvent(self, event: QDragEnterEvent):
        if event.mimeData().hasUrls():
            event.acceptProposedAction()
            self.setStyleSheet("""
                QLabel {
                    border: 2px dashed #1976d2;
                    background-color: #e3f2fd;
                }
            """)
    
    def dragLeaveEvent(self, event):
        self.setStyleSheet("")
    
    def dropEvent(self, event: QDropEvent):
        files = []
        for url in event.mimeData().urls():
            file_path = url.toLocalFile()
            if any(file_path.endswith(ext) for ext in self.accepted_extensions):
                files.append(file_path)
        
        if files:
            self.filesDropped.emit(files)
        
        self.setStyleSheet("")

class CertificateurApp(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Certificateur de Comptes - Gatekeeper")
        self.setGeometry(100, 100, 1400, 900)
        
        # Variables d'état
        self.ext_df = None
        self.cas_a_verifier = None
        self.current_cas_index = 0
        self.certificateur = ""
        self.template_path = ""
        self.rh_paths = []
        self.ext_path = ""
        
        # Settings pour persistance
        self.settings = QSettings("Gatekeeper", "Certificateur")
        
        # Configuration du style amélioré
        self.setStyleSheet("""
            QMainWindow {
                background-color: #f5f5f5;
            }
            QPushButton {
                padding: 10px 20px;
                border-radius: 6px;
                font-weight: 500;
                border: 1px solid #ddd;
                background-color: white;
            }
            QPushButton:hover {
                background-color: #f0f0f0;
                border-color: #999;
            }
            QPushButton#primaryButton {
                background-color: #1976d2;
                color: white;
                border: none;
                font-size: 14px;
            }
            QPushButton#primaryButton:hover {
                background-color: #1565c0;
            }
            QPushButton#primaryButton:disabled {
                background-color: #cccccc;
            }
            QPushButton#successButton {
                background-color: #4caf50;
                color: white;
                border: none;
            }
            QPushButton#successButton:hover {
                background-color: #45a049;
            }
            QGroupBox {
                font-weight: bold;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                margin-top: 12px;
                padding-top: 15px;
                background-color: white;
            }
            QGroupBox::title {
                subcontrol-origin: margin;
                left: 15px;
                padding: 0 10px 0 10px;
                color: #1976d2;
            }
            QLineEdit {
                padding: 8px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 13px;
            }
            QLineEdit:focus {
                border-color: #1976d2;
                outline: none;
            }
            QProgressBar {
                border: 1px solid #ddd;
                border-radius: 4px;
                text-align: center;
                height: 25px;
            }
            QProgressBar::chunk {
                background-color: #1976d2;
                border-radius: 3px;
            }
            QTableWidget {
                border: 1px solid #ddd;
                background-color: white;
                gridline-color: #f0f0f0;
            }
            QHeaderView::section {
                background-color: #f5f5f5;
                padding: 8px;
                border: none;
                font-weight: bold;
            }
        """)
        
        # Widget central
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        # Layout principal
        main_layout = QVBoxLayout(central_widget)
        main_layout.setSpacing(15)
        
        # Menu bar
        self.create_menu_bar()
        
        # Barre de navigation
        self.create_navigation_bar(main_layout)
        
        # Stack pour les différentes étapes
        self.stack = QStackedWidget()
        main_layout.addWidget(self.stack)
        
        # Création des pages
        self.create_page1_loading()
        self.create_page2_anomalies()
        self.create_page3_validation()
        self.create_page4_report()
        
        # Barre de statut améliorée
        self.status_label = QLabel("Prêt")
        self.statusBar().addPermanentWidget(self.status_label)
        
        # Timer pour les messages temporaires
        self.status_timer = QTimer()
        self.status_timer.timeout.connect(lambda: self.status_label.setText("Prêt"))
        
        # Charger les derniers fichiers utilisés
        self.load_recent_files()
        
    def create_menu_bar(self):
        """Créer la barre de menu avec actions utiles"""
        menubar = self.menuBar()
        
        # Menu Fichier
        file_menu = menubar.addMenu('Fichier')
        
        # Nouvelle certification
        new_action = QAction('Nouvelle certification', self)
        new_action.setShortcut('Ctrl+N')
        new_action.triggered.connect(self.reset_app)
        file_menu.addAction(new_action)
        
        file_menu.addSeparator()
        
        # Fichiers récents
        self.recent_menu = file_menu.addMenu('Fichiers récents')
        self.update_recent_menu()
        
        file_menu.addSeparator()
        
        # Quitter
        quit_action = QAction('Quitter', self)
        quit_action.setShortcut('Ctrl+Q')
        quit_action.triggered.connect(self.close)
        file_menu.addAction(quit_action)
        
        # Menu Aide
        help_menu = menubar.addMenu('Aide')
        
        # Documentation
        doc_action = QAction('Documentation', self)
        doc_action.setShortcut('F1')
        doc_action.triggered.connect(self.show_documentation)
        help_menu.addAction(doc_action)
        
        # À propos
        about_action = QAction('À propos', self)
        about_action.triggered.connect(self.show_about)
        help_menu.addAction(about_action)
    
    def create_navigation_bar(self, parent_layout):
        """Créer la barre de navigation avec les étapes"""
        nav_widget = QWidget()
        nav_widget.setFixedHeight(80)
        nav_layout = QHBoxLayout(nav_widget)
        nav_layout.setSpacing(20)
        
        self.step_labels = []
        steps = ["📁 Chargement", "🔍 Anomalies", "✅ Validation", "📊 Rapport"]
        
        for i, step in enumerate(steps):
            step_widget = QWidget()
            step_layout = QVBoxLayout(step_widget)
            step_layout.setSpacing(5)
            
            # Numéro de l'étape
            number_label = QLabel(str(i + 1))
            number_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
            number_label.setFixedSize(30, 30)
            number_label.setStyleSheet("""
                QLabel {
                    border-radius: 15px;
                    background-color: #e0e0e0;
                    color: #666;
                    font-weight: bold;
                    font-size: 14px;
                }
            """)
            
            # Nom de l'étape
            label = QLabel(step)
            label.setAlignment(Qt.AlignmentFlag.AlignCenter)
            label.setStyleSheet("""
                QLabel {
                    color: #666;
                    font-weight: normal;
                    font-size: 13px;
                }
            """)
            
            step_layout.addWidget(number_label, alignment=Qt.AlignmentFlag.AlignCenter)
            step_layout.addWidget(label)
            
            self.step_labels.append((number_label, label))
            nav_layout.addWidget(step_widget)
            
            if i < len(steps) - 1:
                arrow = QLabel("→")
                arrow.setStyleSheet("color: #ccc; font-size: 20px;")
                arrow.setAlignment(Qt.AlignmentFlag.AlignCenter)
                nav_layout.addWidget(arrow)
        
        parent_layout.addWidget(nav_widget)
        self.update_navigation(0)
    
    def update_navigation(self, current_step):
        """Mettre à jour l'apparence de la barre de navigation"""
        for i, (number_label, text_label) in enumerate(self.step_labels):
            if i == current_step:
                number_label.setStyleSheet("""
                    QLabel {
                        border-radius: 15px;
                        background-color: #1976d2;
                        color: white;
                        font-weight: bold;
                        font-size: 14px;
                    }
                """)
                text_label.setStyleSheet("""
                    QLabel {
                        color: #1976d2;
                        font-weight: bold;
                        font-size: 13px;
                    }
                """)
            elif i < current_step:
                number_label.setStyleSheet("""
                    QLabel {
                        border-radius: 15px;
                        background-color: #4caf50;
                        color: white;
                        font-weight: bold;
                        font-size: 14px;
                    }
                """)
                text_label.setStyleSheet("""
                    QLabel {
                        color: #4caf50;
                        font-weight: normal;
                        font-size: 13px;
                    }
                """)
            else:
                number_label.setStyleSheet("""
                    QLabel {
                        border-radius: 15px;
                        background-color: #e0e0e0;
                        color: #666;
                        font-weight: bold;
                        font-size: 14px;
                    }
                """)
                text_label.setStyleSheet("""
                    QLabel {
                        color: #666;
                        font-weight: normal;
                        font-size: 13px;
                    }
                """)
    
    def create_page1_loading(self):
        """Page 1: Chargement des fichiers"""
        page = QWidget()
        layout = QVBoxLayout(page)
        layout.setSpacing(20)
        
        # Titre avec sous-titre
        title_widget = QWidget()
        title_layout = QVBoxLayout(title_widget)
        title_layout.setSpacing(5)
        
        title = QLabel("📁 Chargement des données")
        title.setFont(QFont("Arial", 18, QFont.Weight.Bold))
        title_layout.addWidget(title)
        
        subtitle = QLabel("Veuillez renseigner toutes les informations nécessaires pour lancer la certification")
        subtitle.setStyleSheet("color: #666; font-size: 13px;")
        title_layout.addWidget(subtitle)
        
        layout.addWidget(title_widget)
        
        # Conteneur pour les champs
        fields_widget = QWidget()
        fields_layout = QVBoxLayout(fields_widget)
        fields_layout.setSpacing(15)
        
        # Nom du certificateur avec tooltip
        cert_group = QGroupBox("Certificateur")
        cert_layout = QVBoxLayout()
        cert_layout.setSpacing(10)
        
        cert_input_layout = QHBoxLayout()
        self.cert_input = QLineEdit()
        self.cert_input.setPlaceholderText("Entrez votre nom complet...")
        self.cert_input.textChanged.connect(self.check_can_process)
        self.cert_input.setToolTip("Votre nom sera associé à toutes les validations de cette session")
        cert_input_layout.addWidget(self.cert_input)
        
        # Indicateur de validation
        self.cert_valid_label = QLabel()
        cert_input_layout.addWidget(self.cert_valid_label)
        
        cert_layout.addLayout(cert_input_layout)
        cert_group.setLayout(cert_layout)
        fields_layout.addWidget(cert_group)
        
        # Fichiers RH avec liste détaillée
        rh_group = QGroupBox("Fichiers RH")
        rh_layout = QVBoxLayout()
        
        rh_button_layout = QHBoxLayout()
        self.rh_button = QPushButton("📂 Sélectionner les fichiers RH")
        self.rh_button.clicked.connect(self.select_rh_files)
        self.rh_button.setToolTip("Sélectionnez un ou plusieurs fichiers Excel contenant les données RH de référence")
        rh_button_layout.addWidget(self.rh_button)
        
        self.rh_count_label = QLabel()
        rh_button_layout.addWidget(self.rh_count_label)
        rh_button_layout.addStretch()
        
        rh_layout.addLayout(rh_button_layout)
        
        # Liste des fichiers RH
        self.rh_list = QListWidget()
        self.rh_list.setMaximumHeight(80)
        self.rh_list.setVisible(False)
        rh_layout.addWidget(self.rh_list)
        
        # Mini résumé RH
        self.rh_summary = QLabel()
        self.rh_summary.setStyleSheet("color: #666; font-size: 12px; padding: 5px;")
        rh_layout.addWidget(self.rh_summary)
        
        rh_group.setLayout(rh_layout)
        fields_layout.addWidget(rh_group)
        
        # Fichier d'extraction avec détails
        ext_group = QGroupBox("Fichier d'extraction")
        ext_layout = QVBoxLayout()
        
        ext_button_layout = QHBoxLayout()
        self.ext_button = QPushButton("📄 Sélectionner le fichier d'extraction")
        self.ext_button.clicked.connect(self.select_ext_file)
        self.ext_button.setToolTip("Fichier Excel exporté depuis l'application à auditer")
        ext_button_layout.addWidget(self.ext_button)
        
        self.ext_valid_label = QLabel()
        ext_button_layout.addWidget(self.ext_valid_label)
        ext_button_layout.addStretch()
        
        ext_layout.addLayout(ext_button_layout)
        
        self.ext_label = QLabel("Aucun fichier sélectionné")
        self.ext_label.setStyleSheet("color: #666; padding: 5px;")
        ext_layout.addWidget(self.ext_label)
        
        # Mini résumé extraction
        self.ext_summary = QLabel()
        self.ext_summary.setStyleSheet("color: #666; font-size: 12px; padding: 5px;")
        ext_layout.addWidget(self.ext_summary)
        
        ext_group.setLayout(ext_layout)
        fields_layout.addWidget(ext_group)
        
        # Template
        template_group = QGroupBox("Template de rapport")
        template_layout = QVBoxLayout()
        
        template_button_layout = QHBoxLayout()
        self.template_button = QPushButton("📋 Sélectionner le template")
        self.template_button.clicked.connect(self.select_template_file)
        self.template_button.setToolTip("Template Excel qui sera utilisé pour générer le rapport final")
        template_button_layout.addWidget(self.template_button)
        
        self.template_valid_label = QLabel()
        template_button_layout.addWidget(self.template_valid_label)
        template_button_layout.addStretch()
        
        template_layout.addLayout(template_button_layout)
        
        self.template_label = QLabel("Aucun fichier sélectionné")
        self.template_label.setStyleSheet("color: #666; padding: 5px;")
        template_layout.addWidget(self.template_label)
        
        template_group.setLayout(template_layout)
        fields_layout.addWidget(template_group)
        
        layout.addWidget(fields_widget)
        
        # Message d'aide contextuel
        self.help_message = QLabel()
        self.help_message.setStyleSheet("""
            QLabel {
                background-color: #fff3cd;
                border: 1px solid #ffeeba;
                border-radius: 4px;
                padding: 10px;
                color: #856404;
            }
        """)
        self.help_message.setWordWrap(True)
        self.help_message.setVisible(False)
        layout.addWidget(self.help_message)
        
        # Bouton de traitement avec feedback
        button_layout = QHBoxLayout()
        button_layout.addStretch()
        
        self.process_button = QPushButton("🚀 Lancer le traitement")
        self.process_button.setObjectName("primaryButton")
        self.process_button.clicked.connect(self.process_data)
        self.process_button.setEnabled(False)
        self.process_button.setMinimumWidth(200)
        button_layout.addWidget(self.process_button)
        
        button_layout.addStretch()
        layout.addLayout(button_layout)
        
        # Barre de progression avec label
        progress_widget = QWidget()
        progress_layout = QVBoxLayout(progress_widget)
        progress_layout.setSpacing(5)
        
        self.progress_label = QLabel()
        self.progress_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.progress_label.setVisible(False)
        progress_layout.addWidget(self.progress_label)
        
        self.progress_bar = QProgressBar()
        self.progress_bar.setVisible(False)
        progress_layout.addWidget(self.progress_bar)
        
        layout.addWidget(progress_widget)
        
        layout.addStretch()
        self.stack.addWidget(page)
    
    def create_page2_anomalies(self):
        """Page 2: Affichage des anomalies"""
        page = QWidget()
        layout = QVBoxLayout(page)
        
        # Titre
        title = QLabel("🔍 Anomalies détectées")
        title.setFont(QFont("Arial", 18, QFont.Weight.Bold))
        layout.addWidget(title)
        
        # Statistiques améliorées
        self.stats_widget = QWidget()
        self.stats_widget.setStyleSheet("""
            QWidget {
                background-color: white;
                border-radius: 8px;
                padding: 15px;
            }
        """)
        stats_layout = QHBoxLayout(self.stats_widget)
        
        self.stat_total = self.create_stat_widget("Total comptes", "0", "#2196F3")
        self.stat_anomalies = self.create_stat_widget("Avec anomalies", "0", "#FF9800")
        self.stat_manual = self.create_stat_widget("À vérifier", "0", "#F44336")
        self.stat_auto = self.create_stat_widget("Automatiques", "0", "#4CAF50")
        
        stats_layout.addWidget(self.stat_total)
        stats_layout.addWidget(self.stat_anomalies)
        stats_layout.addWidget(self.stat_manual)
        stats_layout.addWidget(self.stat_auto)
        
        layout.addWidget(self.stats_widget)
        
        # Graphique des anomalies (placeholder)
        anomalies_summary = QGroupBox("Répartition des anomalies")
        anomalies_layout = QVBoxLayout()
        self.anomalies_summary_label = QLabel()
        anomalies_layout.addWidget(self.anomalies_summary_label)
        anomalies_summary.setLayout(anomalies_layout)
        layout.addWidget(anomalies_summary)
        
        # Tableau des anomalies
        table_group = QGroupBox("Détail des comptes avec anomalies")
        table_layout = QVBoxLayout()
        
        # Message informatif
        info_label = QLabel("💡 Vous pouvez prendre les décisions directement dans le tableau ci-dessous en utilisant les menus déroulants.")
        info_label.setStyleSheet("""
            QLabel {
                background-color: #e3f2fd;
                border: 1px solid #90caf9;
                border-radius: 4px;
                padding: 10px;
                color: #1565c0;
                font-size: 13px;
            }
        """)
        info_label.setWordWrap(True)
        table_layout.addWidget(info_label)
        
        # Barre d'outils pour actions groupées
        toolbar_layout = QHBoxLayout()
        
        self.select_all_combo = QComboBox()
        self.select_all_combo.addItems(["Actions groupées...", "Tout désactiver", "Tout conserver", "Réinitialiser"])
        self.select_all_combo.currentIndexChanged.connect(self.on_bulk_action)
        self.select_all_combo.setMinimumWidth(150)
        toolbar_layout.addWidget(QLabel("Actions en masse:"))
        toolbar_layout.addWidget(self.select_all_combo)
        
        toolbar_layout.addStretch()
        
        # Légende des couleurs
        legend_widget = QWidget()
        legend_layout = QHBoxLayout(legend_widget)
        legend_layout.setSpacing(15)
        
        # Conserver
        conserv_label = QLabel("■ Conserver")
        conserv_label.setStyleSheet("color: #4caf50; font-weight: bold;")
        legend_layout.addWidget(conserv_label)
        
        # Modifier
        modif_label = QLabel("■ Modifier")
        modif_label.setStyleSheet("color: #ff9800; font-weight: bold;")
        legend_layout.addWidget(modif_label)
        
        # Désactiver
        desact_label = QLabel("■ Désactiver")
        desact_label.setStyleSheet("color: #f44336; font-weight: bold;")
        legend_layout.addWidget(desact_label)
        
        toolbar_layout.addWidget(legend_widget)
        
        # Bouton d'aide rapide
        help_button = QPushButton("💡 Aide")
        help_button.clicked.connect(self.show_decision_help)
        toolbar_layout.addWidget(help_button)
        
        table_layout.addLayout(toolbar_layout)
        
        self.anomalies_table = QTableWidget()
        self.anomalies_table.setAlternatingRowColors(True)
        self.anomalies_table.setSortingEnabled(True)
        table_layout.addWidget(self.anomalies_table)
        
        table_group.setLayout(table_layout)
        layout.addWidget(table_group)
        
        # Boutons
        button_layout = QHBoxLayout()
        self.back_button1 = QPushButton("← Retour")
        self.back_button1.clicked.connect(lambda: self.go_to_step(0))
        button_layout.addWidget(self.back_button1)
        
        button_layout.addStretch()
        
        self.next_button1 = QPushButton("Passer à la validation →")
        self.next_button1.setObjectName("primaryButton")
        self.next_button1.clicked.connect(lambda: self.go_to_step(2))
        self.next_button1.setToolTip("Vous pouvez prendre les décisions directement dans le tableau ci-dessus ou passer à la validation détaillée")
        button_layout.addWidget(self.next_button1)
        
        layout.addLayout(button_layout)
        
        self.stack.addWidget(page)
    
    def create_page3_validation(self):
        """Page 3: Validation manuelle"""
        page = QWidget()
        layout = QVBoxLayout(page)
        
        # Titre avec compteur
        title_layout = QHBoxLayout()
        title = QLabel("✅ Validation manuelle")
        title.setFont(QFont("Arial", 18, QFont.Weight.Bold))
        title_layout.addWidget(title)
        
        title_layout.addStretch()
        
        self.validation_counter = QLabel()
        self.validation_counter.setStyleSheet("font-size: 16px; color: #1976d2; font-weight: bold;")
        title_layout.addWidget(self.validation_counter)
        
        layout.addLayout(title_layout)
        
        # Progression
        self.validation_progress = QProgressBar()
        self.validation_progress.setTextVisible(True)
        layout.addWidget(self.validation_progress)
        
        # Conteneur principal avec deux colonnes
        content_widget = QWidget()
        content_layout = QHBoxLayout(content_widget)
        
        # Colonne gauche: Détails
        left_column = QWidget()
        left_layout = QVBoxLayout(left_column)
        
        # Détails du cas
        self.cas_details = QGroupBox("Détails du cas")
        cas_layout = QVBoxLayout()
        
        self.cas_info_label = QLabel()
        self.cas_info_label.setStyleSheet("font-size: 13px; line-height: 1.6;")
        cas_layout.addWidget(self.cas_info_label)
        
        self.cas_details.setLayout(cas_layout)
        left_layout.addWidget(self.cas_details)
        
        # Comparaison visuelle
        self.comparison_group = QGroupBox("Comparaison Extraction vs RH")
        comparison_layout = QVBoxLayout()
        
        self.comparison_label = QLabel()
        comparison_layout.addWidget(self.comparison_label)
        
        self.comparison_group.setLayout(comparison_layout)
        left_layout.addWidget(self.comparison_group)
        
        content_layout.addWidget(left_column, 2)
        
        # Colonne droite: Actions
        right_column = QWidget()
        right_layout = QVBoxLayout(right_column)
        
        # Actions possibles
        self.actions_group = QGroupBox("Actions possibles")
        actions_layout = QVBoxLayout()
        
        self.radio_modifier = QRadioButton("✏️ Modifier - Mettre à jour selon le RH")
        self.radio_conserver = QRadioButton("✓ Conserver - Tolérer l'écart")
        self.radio_desactiver = QRadioButton("❌ Désactiver - Supprimer le compte")
        
        # Style pour les radio buttons
        radio_style = """
            QRadioButton {
                padding: 10px;
                font-size: 13px;
            }
            QRadioButton::indicator {
                width: 18px;
                height: 18px;
            }
        """
        self.radio_modifier.setStyleSheet(radio_style)
        self.radio_conserver.setStyleSheet(radio_style)
        self.radio_desactiver.setStyleSheet(radio_style)
        
        actions_layout.addWidget(self.radio_modifier)
        actions_layout.addWidget(self.radio_conserver)
        actions_layout.addWidget(self.radio_desactiver)
        
        # Commentaire
        comment_label = QLabel("Commentaire (optionnel):")
        comment_label.setStyleSheet("font-weight: bold; margin-top: 10px;")
        actions_layout.addWidget(comment_label)
        
        self.comment_edit = QTextEdit()
        self.comment_edit.setPlaceholderText("Ajoutez un commentaire pour justifier votre décision...")
        self.comment_edit.setMaximumHeight(100)
        actions_layout.addWidget(self.comment_edit)
        
        self.actions_group.setLayout(actions_layout)
        right_layout.addWidget(self.actions_group)
        
        # Boutons d'action
        action_buttons_layout = QHBoxLayout()
        
        self.back_to_table_button = QPushButton("← Retour au tableau")
        self.back_to_table_button.clicked.connect(lambda: self.go_to_step(1))
        self.back_to_table_button.setToolTip("Retourner au tableau pour prendre les décisions directement")
        action_buttons_layout.addWidget(self.back_to_table_button)
        
        action_buttons_layout.addStretch()
        
        self.skip_button = QPushButton("⏭️ Passer ce cas")
        self.skip_button.clicked.connect(self.skip_case)
        action_buttons_layout.addWidget(self.skip_button)
        
        self.validate_button = QPushButton("✅ Valider")
        self.validate_button.setObjectName("successButton")
        self.validate_button.clicked.connect(self.validate_decision)
        self.validate_button.setMinimumWidth(120)
        action_buttons_layout.addWidget(self.validate_button)
        
        right_layout.addLayout(action_buttons_layout)
        
        content_layout.addWidget(right_column, 1)
        
        layout.addWidget(content_widget)
        
        # Bouton pour terminer
        finish_layout = QHBoxLayout()
        finish_layout.addStretch()
        
        self.finish_validation_button = QPushButton("Terminer la validation →")
        self.finish_validation_button.setObjectName("primaryButton")
        self.finish_validation_button.clicked.connect(lambda: self.go_to_step(3))
        self.finish_validation_button.setVisible(False)
        self.finish_validation_button.setMinimumWidth(200)
        finish_layout.addWidget(self.finish_validation_button)
        
        finish_layout.addStretch()
        layout.addLayout(finish_layout)
        
        self.stack.addWidget(page)
    
    def create_page4_report(self):
        """Page 4: Génération du rapport"""
        page = QWidget()
        layout = QVBoxLayout(page)
        
        # Titre
        title = QLabel("📊 Génération du rapport")
        title.setFont(QFont("Arial", 18, QFont.Weight.Bold))
        layout.addWidget(title)
        
        # Message de confirmation
        self.report_message = QLabel()
        self.report_message.setStyleSheet("""
            QLabel {
                background-color: #d4edda;
                border: 1px solid #c3e6cb;
                border-radius: 4px;
                padding: 15px;
                color: #155724;
                font-size: 14px;
            }
        """)
        self.report_message.setWordWrap(True)
        layout.addWidget(self.report_message)
        
        # Statistiques finales
        self.final_stats_widget = QWidget()
        self.final_stats_widget.setStyleSheet("""
            QWidget {
                background-color: white;
                border-radius: 8px;
                padding: 15px;
            }
        """)
        final_stats_layout = QHBoxLayout(self.final_stats_widget)
        
        self.final_stat_total = self.create_stat_widget("Total", "0", "#2196F3")
        self.final_stat_conserver = self.create_stat_widget("À conserver", "0", "#4CAF50")
        self.final_stat_modifier = self.create_stat_widget("À modifier", "0", "#FF9800")
        self.final_stat_desactiver = self.create_stat_widget("À désactiver", "0", "#F44336")
        
        final_stats_layout.addWidget(self.final_stat_total)
        final_stats_layout.addWidget(self.final_stat_conserver)
        final_stats_layout.addWidget(self.final_stat_modifier)
        final_stats_layout.addWidget(self.final_stat_desactiver)
        
        layout.addWidget(self.final_stats_widget)
        
        # Aperçu du rapport
        preview_group = QGroupBox("Aperçu du rapport (100 premières lignes)")
        preview_layout = QVBoxLayout()
        
        self.report_preview = QTableWidget()
        self.report_preview.setAlternatingRowColors(True)
        self.report_preview.setSortingEnabled(True)
        preview_layout.addWidget(self.report_preview)
        
        preview_group.setLayout(preview_layout)
        layout.addWidget(preview_group)
        
        # Boutons
        button_layout = QHBoxLayout()
        
        self.generate_button = QPushButton("📥 Télécharger le rapport Excel")
        self.generate_button.setObjectName("primaryButton")
        self.generate_button.clicked.connect(self.generate_report)
        self.generate_button.setMinimumWidth(200)
        button_layout.addWidget(self.generate_button)
        
        button_layout.addStretch()
        
        self.new_button = QPushButton("🔄 Nouvelle certification")
        self.new_button.clicked.connect(self.reset_app)
        button_layout.addWidget(self.new_button)
        
        layout.addLayout(button_layout)
        
        self.stack.addWidget(page)
    
    def create_stat_widget(self, label, value, color="#1976d2"):
        """Créer un widget de statistique amélioré"""
        widget = QFrame()
        widget.setFrameStyle(QFrame.Shape.Box)
        widget.setStyleSheet(f"""
            QFrame {{
                background-color: white;
                border: 2px solid {color}22;
                border-radius: 8px;
                padding: 15px;
                min-width: 150px;
            }}
        """)
        
        layout = QVBoxLayout(widget)
        layout.setSpacing(5)
        
        value_label = QLabel(value)
        value_label.setFont(QFont("Arial", 24, QFont.Weight.Bold))
        value_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        value_label.setStyleSheet(f"color: {color};")
        layout.addWidget(value_label)
        
        text_label = QLabel(label)
        text_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        text_label.setStyleSheet("color: #666; font-size: 13px;")
        layout.addWidget(text_label)
        
        # Stocker le label de valeur pour mise à jour
        widget.value_label = value_label
        
        return widget
    
    def select_rh_files(self):
        """Sélectionner les fichiers RH"""
        files, _ = QFileDialog.getOpenFileNames(
            self, 
            "Sélectionner les fichiers RH",
            self.get_last_directory(),
            "Fichiers Excel (*.xlsx)"
        )
        if files:
            self.rh_paths = files
            self.update_rh_display()
            self.save_last_directory(files[0])
            self.check_can_process()
            
            # Analyser rapidement le premier fichier
            try:
                df = pd.read_excel(files[0], nrows=5)
                self.rh_summary.setText(f"📊 {len(df.columns)} colonnes détectées")
            except:
                pass
    
    def update_rh_display(self):
        """Mettre à jour l'affichage des fichiers RH"""
        if self.rh_paths:
            self.rh_count_label.setText(f"✓ {len(self.rh_paths)} fichier(s)")
            self.rh_count_label.setStyleSheet("color: #4caf50; font-weight: bold;")
            
            # Afficher la liste
            self.rh_list.clear()
            for path in self.rh_paths:
                self.rh_list.addItem(os.path.basename(path))
            self.rh_list.setVisible(True)
        else:
            self.rh_count_label.setText("")
            self.rh_list.setVisible(False)
            self.rh_summary.setText("")
    
    def select_ext_file(self):
        """Sélectionner le fichier d'extraction"""
        file, _ = QFileDialog.getOpenFileName(
            self,
            "Sélectionner le fichier d'extraction",
            self.get_last_directory(),
            "Fichiers Excel (*.xlsx)"
        )
        if file:
            self.ext_path = file
            self.ext_label.setText(f"📄 {os.path.basename(file)}")
            self.ext_valid_label.setText("✓")
            self.ext_valid_label.setStyleSheet("color: #4caf50; font-weight: bold; font-size: 16px;")
            self.save_last_directory(file)
            self.check_can_process()
            
            # Analyser rapidement le fichier
            try:
                df = pd.read_excel(file, nrows=5)
                size = os.path.getsize(file) / 1024 / 1024  # MB
                self.ext_summary.setText(f"📊 {len(df.columns)} colonnes, Taille: {size:.1f} MB")
            except:
                pass
    
    def select_template_file(self):
        """Sélectionner le template"""
        file, _ = QFileDialog.getOpenFileName(
            self,
            "Sélectionner le template",
            self.get_last_directory(),
            "Fichiers Excel (*.xlsx)"
        )
        if file:
            self.template_path = file
            self.template_label.setText(f"📋 {os.path.basename(file)}")
            self.template_valid_label.setText("✓")
            self.template_valid_label.setStyleSheet("color: #4caf50; font-weight: bold; font-size: 16px;")
            self.save_last_directory(file)
            self.check_can_process()
    
    def check_can_process(self):
        """Vérifier si on peut lancer le traitement"""
        cert_ok = bool(self.cert_input.text().strip())
        rh_ok = bool(self.rh_paths)
        ext_ok = bool(self.ext_path)
        template_ok = bool(self.template_path)
        
        # Feedback visuel pour le certificateur
        if cert_ok:
            self.cert_valid_label.setText("✓")
            self.cert_valid_label.setStyleSheet("color: #4caf50; font-weight: bold; font-size: 16px;")
        else:
            self.cert_valid_label.setText("")
        
        # Activer/désactiver le bouton
        can_process = cert_ok and rh_ok and ext_ok and template_ok
        self.process_button.setEnabled(can_process)
        
        # Message d'aide contextuel
        if not can_process:
            missing = []
            if not cert_ok:
                missing.append("nom du certificateur")
            if not rh_ok:
                missing.append("fichiers RH")
            if not ext_ok:
                missing.append("fichier d'extraction")
            if not template_ok:
                missing.append("template de rapport")
            
            self.help_message.setText(f"⚠️ Veuillez renseigner: {', '.join(missing)}")
            self.help_message.setVisible(True)
        else:
            self.help_message.setVisible(False)
    
    def process_data(self):
        """Lancer le traitement des données"""
        self.certificateur = self.cert_input.text()
        
        # Animation du bouton
        self.process_button.setText("⏳ Traitement en cours...")
        self.process_button.setEnabled(False)
        
        # Afficher la progression
        self.progress_bar.setVisible(True)
        self.progress_label.setVisible(True)
        self.progress_bar.setRange(0, 0)  # Mode indéterminé
        
        # Créer et lancer le thread
        self.processing_thread = ProcessingThread(
            self.rh_paths, 
            self.ext_path, 
            self.certificateur
        )
        self.processing_thread.progress.connect(self.update_progress)
        self.processing_thread.finished.connect(self.processing_finished)
        self.processing_thread.error.connect(self.processing_error)
        self.processing_thread.start()
    
    def update_progress(self, message):
        """Mettre à jour le message de progression"""
        self.progress_label.setText(message)
        self.show_status_message(message, 0)
    
    def processing_finished(self, ext_df, cas_a_verifier):
        """Traitement terminé avec succès"""
        self.ext_df = ext_df
        self.cas_a_verifier = cas_a_verifier
        
        # Masquer la progression
        self.progress_bar.setVisible(False)
        self.progress_label.setVisible(False)
        
        # Restaurer le bouton
        self.process_button.setText("🚀 Lancer le traitement")
        
        # Message de succès
        self.show_status_message("✅ Traitement terminé avec succès!", 3000)
        
        # Sauvegarder comme fichiers récents
        self.save_recent_files()
        
        # Mettre à jour la page des anomalies
        self.update_anomalies_page()
        
        # Passer à la page suivante
        self.go_to_step(1)
    
    def processing_error(self, error_message):
        """Erreur lors du traitement"""
        self.progress_bar.setVisible(False)
        self.progress_label.setVisible(False)
        self.process_button.setText("🚀 Lancer le traitement")
        self.process_button.setEnabled(True)
        
        QMessageBox.critical(
            self, 
            "Erreur", 
            f"Erreur lors du traitement:\n\n{error_message}\n\nVérifiez que les fichiers sont au bon format."
        )
    
    def update_anomalies_page(self):
        """Mettre à jour la page des anomalies"""
        # Statistiques
        total = len(self.ext_df)
        anomalies = len(self.ext_df[self.ext_df['anomalie'].str.len() > 0])
        manual = len(self.cas_a_verifier)
        auto = len(self.ext_df[self.ext_df['decision_manuelle'] != ""])
        
        self.stat_total.value_label.setText(str(total))
        self.stat_anomalies.value_label.setText(str(anomalies))
        self.stat_manual.value_label.setText(str(manual))
        self.stat_auto.value_label.setText(str(auto))
        
        # Résumé des anomalies
        anomalies_count = {}
        for anomalie in self.ext_df['anomalie']:
            if anomalie:
                for a in anomalie.split(', '):
                    if a:
                        anomalies_count[a] = anomalies_count.get(a, 0) + 1
        
        if anomalies_count:
            summary_text = "Distribution:\n"
            for anomalie, count in sorted(anomalies_count.items(), key=lambda x: x[1], reverse=True):
                summary_text += f"• {anomalie}: {count} cas\n"
            self.anomalies_summary_label.setText(summary_text)
        
        # Tableau des anomalies avec décisions éditables
        columns = ['code_utilisateur', 'nom_prenom', 'anomalie', 'decision_manuelle']
        anomalies_mask = self.ext_df['anomalie'].str.len() > 0
        data = self.ext_df[anomalies_mask]
        
        self.anomalies_table.setRowCount(len(data))
        self.anomalies_table.setColumnCount(len(columns))
        self.anomalies_table.setHorizontalHeaderLabels(
            ['Code utilisateur', 'Nom/Prénom', 'Anomalie', 'Décision']
        )
        
        # Stocker les indices pour référence
        self.anomalies_indices = data.index.tolist()
        
        for i, (idx, row) in enumerate(data.iterrows()):
            # Code utilisateur
            item = QTableWidgetItem(str(row['code_utilisateur']))
            item.setFlags(item.flags() & ~Qt.ItemFlag.ItemIsEditable)
            self.anomalies_table.setItem(i, 0, item)
            
            # Nom/Prénom
            item = QTableWidgetItem(str(row['nom_prenom']))
            item.setFlags(item.flags() & ~Qt.ItemFlag.ItemIsEditable)
            self.anomalies_table.setItem(i, 1, item)
            
            # Anomalie
            item = QTableWidgetItem(str(row['anomalie']))
            item.setFlags(item.flags() & ~Qt.ItemFlag.ItemIsEditable)
            self.anomalies_table.setItem(i, 2, item)
            
            # Décision - ComboBox
            combo = QComboBox()
            
            # Déterminer les options selon l'anomalie
            anomalie = row['anomalie']
            if "Changement de profil à vérifier" in anomalie or "Changement de direction à vérifier" in anomalie:
                options = ["", "Modifier", "Conserver", "Désactiver"]
            elif "Compte non RH" in anomalie:
                options = ["", "Conserver", "Désactiver"]
            else:
                options = ["", "Conserver", "Désactiver"]
            
            combo.addItems(options)
            
            # Sélectionner la décision actuelle si elle existe
            current_decision = row.get('decision_manuelle', '')
            if current_decision in options:
                combo.setCurrentText(current_decision)
            
            # Colorer la ligne si une décision est prise
            if current_decision:
                color = QColor("#e8f5e9") if current_decision == "Conserver" else \
                       QColor("#fff3e0") if current_decision == "Modifier" else \
                       QColor("#ffebee")
                for col in range(3):
                    self.anomalies_table.item(i, col).setBackground(color)
            
            # Connecter le signal de changement
            combo.currentTextChanged.connect(
                lambda text, row_idx=idx, row_num=i: self.on_decision_changed(row_idx, text, row_num)
            )
            
            # Style pour le combo
            combo.setStyleSheet("""
                QComboBox {
                    padding: 5px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                }
                QComboBox:hover {
                    border-color: #1976d2;
                }
            """)
            
            self.anomalies_table.setCellWidget(i, 3, combo)
        
        # Ajuster les colonnes
        self.anomalies_table.horizontalHeader().setSectionResizeMode(0, QHeaderView.ResizeMode.ResizeToContents)
        self.anomalies_table.horizontalHeader().setSectionResizeMode(1, QHeaderView.ResizeMode.ResizeToContents)
        self.anomalies_table.horizontalHeader().setSectionResizeMode(2, QHeaderView.ResizeMode.Stretch)
        self.anomalies_table.horizontalHeader().setSectionResizeMode(3, QHeaderView.ResizeMode.Fixed)
        self.anomalies_table.setColumnWidth(3, 150)
        
        # Activer/désactiver le bouton suivant
        self.next_button1.setEnabled(True)
        
        # Vérifier si toutes les décisions ont été prises
        all_decided = all(self.ext_df.loc[anomalies_mask, 'decision_manuelle'] != '')
        
        if manual == 0 or all_decided:
            self.next_button1.setText("Générer le rapport →")
            try:
                self.next_button1.clicked.disconnect()
            except:
                pass
            self.next_button1.clicked.connect(lambda: self.go_to_step(3))
            
            # Message informatif si toutes les décisions sont prises
            if all_decided:
                self.show_status_message("✅ Toutes les décisions ont été prises ! Vous pouvez générer le rapport.", 5000)
        else:
            self.next_button1.setText("Validation manuelle détaillée →")
            try:
                self.next_button1.clicked.disconnect()
            except:
                pass
            self.next_button1.clicked.connect(lambda: self.go_to_step(2))
    
    def on_decision_changed(self, row_idx, decision, row_num=None):
        """Gérer le changement de décision dans le tableau"""
        # Enregistrer la décision
        self.ext_df.loc[row_idx, 'decision_manuelle'] = decision
        
        # Si c'est une décision de conservation ou modification, ajouter aux whitelists
        if decision in ["Modifier", "Conserver"]:
            row = self.ext_df.loc[row_idx]
            anomalie = row.get('anomalie', '')
            if "Changement de profil à vérifier" in anomalie:
                ajouter_profil_valide(row, certificateur=self.certificateur)
            if "Changement de direction à vérifier" in anomalie:
                ajouter_direction_conservee(row, certificateur=self.certificateur)
        
        # Colorer la ligne si row_num est fourni
        if row_num is not None and self.anomalies_table.rowCount() > row_num:
            if decision:
                color = QColor("#e8f5e9") if decision == "Conserver" else \
                       QColor("#fff3e0") if decision == "Modifier" else \
                       QColor("#ffebee")
            else:
                color = QColor("white")
            
            for col in range(3):
                item = self.anomalies_table.item(row_num, col)
                if item:
                    item.setBackground(color)
        
        # Mettre à jour les cas à vérifier
        self.cas_a_verifier = extraire_cas_a_verifier(self.ext_df)
        
        # Mettre à jour les statistiques
        manual = len(self.cas_a_verifier)
        auto = len(self.ext_df[self.ext_df['decision_manuelle'] != ""])
        self.stat_manual.value_label.setText(str(manual))
        self.stat_auto.value_label.setText(str(auto))
        
        # Message de confirmation
        if decision:
            self.show_status_message(f"✅ Décision '{decision}' enregistrée", 2000)
    
    def go_to_step(self, step):
        """Naviguer vers une étape"""
        self.stack.setCurrentIndex(step)
        self.update_navigation(step)
        
        if step == 2:
            self.show_current_case()
        elif step == 3:
            self.update_report_page()
    
    def show_current_case(self):
        """Afficher le cas en cours de validation"""
        # Mettre à jour la liste des cas à vérifier
        self.cas_a_verifier = extraire_cas_a_verifier(self.ext_df)
        
        if len(self.cas_a_verifier) == 0:
            self.validation_counter.setText("✅ Tous les cas traités")
            self.cas_info_label.setText("Tous les cas ont été traités!")
            self.comparison_group.setVisible(False)
            self.actions_group.setEnabled(False)
            self.validate_button.setVisible(False)
            self.skip_button.setVisible(False)
            self.finish_validation_button.setVisible(True)
            
            # Message informatif
            info_text = """
<p style="font-size: 14px; color: #4caf50;">
<b>✅ Excellente nouvelle !</b><br><br>
Tous les cas ont été traités avec succès.<br>
Vous pouvez maintenant générer le rapport final.
</p>
<p style="margin-top: 20px;">
<b>Récapitulatif des décisions :</b><br>
• Comptes à conserver : {}<br>
• Comptes à modifier : {}<br>
• Comptes à désactiver : {}<br>
</p>
            """.format(
                len(self.ext_df[self.ext_df['decision_manuelle'] == 'Conserver']),
                len(self.ext_df[self.ext_df['decision_manuelle'] == 'Modifier']),
                len(self.ext_df[self.ext_df['decision_manuelle'] == 'Désactiver'])
            )
            self.cas_info_label.setText(info_text)
            return
        
        # Réinitialiser l'index si nécessaire
        if self.current_cas_index >= len(self.cas_a_verifier):
            self.current_cas_index = 0
        
        # Compteur
        self.validation_counter.setText(f"Cas {self.current_cas_index + 1} sur {len(self.cas_a_verifier)}")
        
        # Récupérer le cas actuel
        cas_idx = self.cas_a_verifier.index[self.current_cas_index]
        cas = self.cas_a_verifier.loc[cas_idx]
        
        # Afficher les informations de base
        try:
            jours = cas.get('days_inactive', '')
            if isinstance(jours, (int, float)) and not pd.isna(jours):
                jours_affiche = f"{jours:.0f}"
            else:
                jours_affiche = "Non renseigné"
        except:
            jours_affiche = "Non renseigné"
        
        info_text = f"""
<p><b>Utilisateur:</b> {cas.get('code_utilisateur', 'N/A')}</p>
<p><b>Nom/Prénom:</b> {cas.get('nom_prenom', 'N/A')}</p>
<p><b>Jours d'inactivité:</b> {jours_affiche}</p>
<p style="margin-top: 10px;"><b style="color: #ff9800;">⚠️ Anomalie détectée:</b><br>{cas.get('anomalie', 'N/A')}</p>
        """
        
        self.cas_info_label.setText(info_text)
        
        # Comparaison visuelle
        comparison_text = f"""
<table style="width: 100%; border-collapse: collapse;">
<tr>
    <th style="text-align: left; padding: 8px; background-color: #f5f5f5;">Champ</th>
    <th style="text-align: left; padding: 8px; background-color: #f5f5f5;">Extraction</th>
    <th style="text-align: left; padding: 8px; background-color: #f5f5f5;">RH</th>
</tr>
<tr>
    <td style="padding: 8px; border-top: 1px solid #ddd;"><b>Profil</b></td>
    <td style="padding: 8px; border-top: 1px solid #ddd;">{cas.get('profil', 'N/A')}</td>
    <td style="padding: 8px; border-top: 1px solid #ddd; background-color: #e3f2fd;">{cas.get('profil_rh', 'N/A')}</td>
</tr>
<tr>
    <td style="padding: 8px; border-top: 1px solid #ddd;"><b>Direction</b></td>
    <td style="padding: 8px; border-top: 1px solid #ddd;">{cas.get('direction', 'N/A')}</td>
    <td style="padding: 8px; border-top: 1px solid #ddd; background-color: #e3f2fd;">{cas.get('direction_rh', 'N/A')}</td>
</tr>
</table>
        """
        
        self.comparison_label.setText(comparison_text)
        self.comparison_group.setVisible(True)
        
        # Configurer les actions selon l'anomalie
        anomalie = cas.get('anomalie', '')
        
        if "Changement de profil à vérifier" in anomalie or "Changement de direction à vérifier" in anomalie:
            self.radio_modifier.setVisible(True)
            self.radio_modifier.setChecked(True)
        else:
            self.radio_modifier.setVisible(False)
            self.radio_conserver.setChecked(True)
        
        # Réinitialiser le commentaire
        self.comment_edit.clear()
        
        # Mise à jour de la progression
        progress = self.current_cas_index / len(self.cas_a_verifier) * 100
        self.validation_progress.setValue(int(progress))
        self.validation_progress.setFormat(f"{int(progress)}% - {self.current_cas_index}/{len(self.cas_a_verifier)} cas traités")
    
    def validate_decision(self):
        """Valider la décision pour le cas en cours"""
        if len(self.cas_a_verifier) == 0:
            return
        
        # Récupérer la décision
        decision = ""
        if self.radio_modifier.isChecked():
            decision = "Modifier"
        elif self.radio_conserver.isChecked():
            decision = "Conserver"
        elif self.radio_desactiver.isChecked():
            decision = "Désactiver"
        
        # Récupérer le cas actuel
        cas_idx = self.cas_a_verifier.index[self.current_cas_index]
        cas = self.cas_a_verifier.loc[cas_idx]
        
        # Enregistrer la décision
        self.ext_df.loc[cas_idx, 'decision_manuelle'] = decision
        
        # Enregistrer le commentaire si présent
        comment = self.comment_edit.toPlainText().strip()
        if comment:
            self.ext_df.loc[cas_idx, 'comment_certificateur'] = comment
        
        # Ajouter aux whitelists si nécessaire
        if decision in ["Modifier", "Conserver"]:
            anomalie = cas.get('anomalie', '')
            if "Changement de profil à vérifier" in anomalie:
                ajouter_profil_valide(cas, certificateur=self.certificateur)
            if "Changement de direction à vérifier" in anomalie:
                ajouter_direction_conservee(cas, certificateur=self.certificateur)
        
        # Mettre à jour les cas à vérifier
        self.cas_a_verifier = extraire_cas_a_verifier(self.ext_df)
        
        # Message de confirmation
        self.show_status_message(f"✅ Décision '{decision}' enregistrée", 2000)
        
        # Passer au cas suivant ou terminer
        if len(self.cas_a_verifier) > 0:
            self.current_cas_index = 0  # Réinitialiser l'index
            self.show_current_case()
        else:
            self.show_current_case()  # Affichera le message de fin
    
    def skip_case(self):
        """Passer au cas suivant"""
        self.current_cas_index += 1
        if self.current_cas_index >= len(self.cas_a_verifier):
            self.current_cas_index = 0
        self.show_current_case()
    
    def update_report_page(self):
        """Mettre à jour la page du rapport"""
        # Message de confirmation
        cas_non_traites = len(self.cas_a_verifier)
        if cas_non_traites == 0:
            self.report_message.setText(
                "✅ Certification terminée avec succès!\n"
                "Tous les cas ont été traités. Vous pouvez maintenant générer le rapport Excel."
            )
        else:
            self.report_message.setText(
                f"⚠️ Attention: {cas_non_traites} cas n'ont pas été traités.\n"
                "Vous pouvez quand même générer le rapport, mais il sera incomplet."
            )
            self.report_message.setStyleSheet("""
                QLabel {
                    background-color: #fff3cd;
                    border: 1px solid #ffeeba;
                    border-radius: 4px;
                    padding: 15px;
                    color: #856404;
                    font-size: 14px;
                }
            """)
        
        # Statistiques finales
        total = len(self.ext_df)
        conserver = len(self.ext_df[self.ext_df['decision_manuelle'] == 'Conserver'])
        modifier = len(self.ext_df[self.ext_df['decision_manuelle'] == 'Modifier'])
        desactiver = len(self.ext_df[self.ext_df['decision_manuelle'] == 'Désactiver'])
        
        self.final_stat_total.value_label.setText(str(total))
        self.final_stat_conserver.value_label.setText(str(conserver))
        self.final_stat_modifier.value_label.setText(str(modifier))
        self.final_stat_desactiver.value_label.setText(str(desactiver))
        
        # Préparer les données pour l'aperçu
        df_rapport = self.ext_df.copy()
        df_rapport = self.set_decision_columns(df_rapport)
        
        # Colonnes à afficher
        columns = ['code_utilisateur', 'nom_prenom', 'profil', 'direction', 
                  'decision', 'execution_reco_decision', 'anomalie']
        
        # Filtrer les colonnes existantes
        columns = [col for col in columns if col in df_rapport.columns]
        
        # Afficher dans le tableau
        self.report_preview.setRowCount(min(len(df_rapport), 100))
        self.report_preview.setColumnCount(len(columns))
        self.report_preview.setHorizontalHeaderLabels(columns)
        
        for i in range(min(len(df_rapport), 100)):
            for j, col in enumerate(columns):
                value = df_rapport.iloc[i][col]
                item = QTableWidgetItem(str(value))
                self.report_preview.setItem(i, j, item)
        
        self.report_preview.horizontalHeader().setSectionResizeMode(
            QHeaderView.ResizeMode.ResizeToContents
        )
    
    def set_decision_columns(self, df):
        """Ajouter les colonnes de décision (depuis main.py)"""
        dec = []
        exe = []
        for v in df.get("decision_manuelle", []):
            lbl = DECISION_TO_LABEL.get(v, ("", ""))
            dec.append(lbl[0])
            exe.append(lbl[1])
        df["decision"] = dec
        df["execution_reco_decision"] = exe
        df["certificateur"] = self.certificateur
        df["recommendation"] = "A certifier"
        return df
    
    def on_bulk_action(self, index):
        """Gérer les actions groupées sur les anomalies"""
        if index == 0:  # "Actions groupées..."
            return
        
        action = self.select_all_combo.currentText()
        
        if action == "Tout désactiver":
            decision = "Désactiver"
        elif action == "Tout conserver":
            decision = "Conserver"
        elif action == "Réinitialiser":
            decision = ""
        else:
            return
        
        # Confirmation
        if decision:
            reply = QMessageBox.question(
                self,
                "Confirmation",
                f"Voulez-vous vraiment appliquer '{decision}' à tous les comptes avec anomalies?",
                QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No,
                QMessageBox.StandardButton.No
            )
            
            if reply != QMessageBox.StandardButton.Yes:
                self.select_all_combo.setCurrentIndex(0)
                return
        
        # Appliquer la décision à tous les comptes avec anomalies
        anomalies_mask = self.ext_df['anomalie'].str.len() > 0
        self.ext_df.loc[anomalies_mask, 'decision_manuelle'] = decision
        
        # Si conservation, ajouter aux whitelists
        if decision == "Conserver":
            for idx, row in self.ext_df[anomalies_mask].iterrows():
                anomalie = row.get('anomalie', '')
                if "Changement de profil à vérifier" in anomalie:
                    ajouter_profil_valide(row, certificateur=self.certificateur)
                if "Changement de direction à vérifier" in anomalie:
                    ajouter_direction_conservee(row, certificateur=self.certificateur)
        
        # Mettre à jour l'affichage
        self.update_anomalies_page()
        self.show_status_message(f"✅ Action '{action}' appliquée à tous les cas", 3000)
        
        # Réinitialiser le combo
        self.select_all_combo.setCurrentIndex(0)
    
    def show_decision_help(self):
        """Afficher l'aide pour les décisions"""
        help_text = """
<h3>💡 Guide des décisions</h3>

<h4>🔧 Modifier</h4>
<p>Utilisez cette option quand :</p>
<ul>
<li>Le profil/direction RH est plus à jour que celui de l'application</li>
<li>L'utilisateur a changé de poste récemment</li>
<li>C'est une erreur de saisie dans l'application</li>
</ul>

<h4>✅ Conserver</h4>
<p>Utilisez cette option quand :</p>
<ul>
<li>L'écart est justifié et acceptable</li>
<li>C'est un cas particulier validé</li>
<li>Le compte nécessite des droits spéciaux</li>
</ul>

<h4>❌ Désactiver</h4>
<p>Utilisez cette option quand :</p>
<ul>
<li>L'utilisateur a quitté l'entreprise</li>
<li>Le compte est inactif depuis longtemps (>120 jours)</li>
<li>C'est un compte de test ou temporaire</li>
<li>Aucune justification valable pour l'écart</li>
</ul>

<p><b>Note:</b> Les décisions "Conserver" et "Modifier" ajoutent automatiquement 
les cas à la whitelist pour les prochaines certifications.</p>
        """
        
        msg = QMessageBox(self)
        msg.setWindowTitle("Aide aux décisions")
        msg.setTextFormat(Qt.TextFormat.RichText)
        msg.setText(help_text)
        msg.setIcon(QMessageBox.Icon.Information)
        msg.exec()
    
    def generate_report(self):
        """Générer le rapport Excel"""
        # Demander où sauvegarder
        output_path, _ = QFileDialog.getSaveFileName(
            self,
            "Enregistrer le rapport",
            os.path.join(self.get_last_directory(), f"rapport_certification_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"),
            "Fichiers Excel (*.xlsx)"
        )
        
        if not output_path:
            return
        
        try:
            # Animation du bouton
            self.generate_button.setText("⏳ Génération en cours...")
            self.generate_button.setEnabled(False)
            
            # Préparer les données
            df_rapport = self.ext_df.copy()
            df_rapport = self.set_decision_columns(df_rapport)
            
            # Générer le rapport
            inject_to_template(
                df_rapport, 
                self.template_path, 
                output_path,
                certificateur=self.certificateur
            )
            
            self.generate_button.setText("📥 Télécharger le rapport Excel")
            self.generate_button.setEnabled(True)
            
            # Message de succès avec option d'ouvrir
            reply = QMessageBox.information(
                self,
                "Rapport généré",
                f"Le rapport a été généré avec succès!\n\n{output_path}\n\nVoulez-vous l'ouvrir?",
                QMessageBox.StandardButton.Open | QMessageBox.StandardButton.Ok,
                QMessageBox.StandardButton.Ok
            )
            
            if reply == QMessageBox.StandardButton.Open:
                os.startfile(output_path) if sys.platform == "win32" else os.system(f"open {output_path}")
            
        except Exception as e:
            self.generate_button.setText("📥 Télécharger le rapport Excel")
            self.generate_button.setEnabled(True)
            QMessageBox.critical(
                self,
                "Erreur",
                f"Erreur lors de la génération du rapport:\n{str(e)}"
            )
        """Afficher l'aide pour les décisions"""
        help_text = """
<h3>💡 Guide des décisions</h3>

<h4>🔧 Modifier</h4>
<p>Utilisez cette option quand :</p>
<ul>
<li>Le profil/direction RH est plus à jour que celui de l'application</li>
<li>L'utilisateur a changé de poste récemment</li>
<li>C'est une erreur de saisie dans l'application</li>
</ul>

<h4>✅ Conserver</h4>
<p>Utilisez cette option quand :</p>
<ul>
<li>L'écart est justifié et acceptable</li>
<li>C'est un cas particulier validé</li>
<li>Le compte nécessite des droits spéciaux</li>
</ul>

<h4>❌ Désactiver</h4>
<p>Utilisez cette option quand :</p>
<ul>
<li>L'utilisateur a quitté l'entreprise</li>
<li>Le compte est inactif depuis longtemps (>120 jours)</li>
<li>C'est un compte de test ou temporaire</li>
<li>Aucune justification valable pour l'écart</li>
</ul>

<p><b>Note:</b> Les décisions "Conserver" et "Modifier" ajoutent automatiquement 
les cas à la whitelist pour les prochaines certifications.</p>
        """
        
        msg = QMessageBox(self)
        msg.setWindowTitle("Aide aux décisions")
        msg.setTextFormat(Qt.TextFormat.RichText)
        msg.setText(help_text)
        msg.setIcon(QMessageBox.Icon.Information)
        msg.exec()
        """Générer le rapport Excel"""
        # Demander où sauvegarder
        output_path, _ = QFileDialog.getSaveFileName(
            self,
            "Enregistrer le rapport",
            os.path.join(self.get_last_directory(), f"rapport_certification_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"),
            "Fichiers Excel (*.xlsx)"
        )
        
        if not output_path:
            return
        
        try:
            # Animation du bouton
            self.generate_button.setText("⏳ Génération en cours...")
            self.generate_button.setEnabled(False)
            
            # Préparer les données
            df_rapport = self.ext_df.copy()
            df_rapport = self.set_decision_columns(df_rapport)
            
            # Générer le rapport
            inject_to_template(
                df_rapport, 
                self.template_path, 
                output_path,
                certificateur=self.certificateur
            )
            
            self.generate_button.setText("📥 Télécharger le rapport Excel")
            self.generate_button.setEnabled(True)
            
            # Message de succès avec option d'ouvrir
            reply = QMessageBox.information(
                self,
                "Rapport généré",
                f"Le rapport a été généré avec succès!\n\n{output_path}\n\nVoulez-vous l'ouvrir?",
                QMessageBox.StandardButton.Open | QMessageBox.StandardButton.Ok,
                QMessageBox.StandardButton.Ok
            )
            
            if reply == QMessageBox.StandardButton.Open:
                os.startfile(output_path) if sys.platform == "win32" else os.system(f"open {output_path}")
            
        except Exception as e:
            self.generate_button.setText("📥 Télécharger le rapport Excel")
            self.generate_button.setEnabled(True)
            QMessageBox.critical(
                self,
                "Erreur",
                f"Erreur lors de la génération du rapport:\n{str(e)}"
            )
    
    def reset_app(self):
        """Réinitialiser l'application"""
        reply = QMessageBox.question(
            self,
            "Nouvelle certification",
            "Voulez-vous vraiment recommencer une nouvelle certification?\n\nToutes les données non sauvegardées seront perdues.",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No,
            QMessageBox.StandardButton.No
        )
        
        if reply == QMessageBox.StandardButton.Yes:
            # Réinitialiser toutes les variables
            self.ext_df = None
            self.cas_a_verifier = None
            self.current_cas_index = 0
            self.cert_input.clear()
            self.rh_paths = []
            self.ext_path = ""
            self.template_path = ""
            
            # Réinitialiser l'interface
            self.update_rh_display()
            self.ext_label.setText("Aucun fichier sélectionné")
            self.ext_valid_label.setText("")
            self.ext_summary.setText("")
            self.template_label.setText("Aucun fichier sélectionné")
            self.template_valid_label.setText("")
            self.process_button.setEnabled(False)
            self.help_message.setVisible(False)
            
            # Retourner à la première page
            self.go_to_step(0)
            
            self.show_status_message("Application réinitialisée", 2000)
    
    def show_status_message(self, message, duration=0):
        """Afficher un message dans la barre de statut"""
        self.status_label.setText(message)
        if duration > 0:
            self.status_timer.start(duration)
    
    def get_last_directory(self):
        """Récupérer le dernier répertoire utilisé"""
        return self.settings.value("last_directory", os.path.expanduser("~"))
    
    def save_last_directory(self, file_path):
        """Sauvegarder le dernier répertoire utilisé"""
        self.settings.setValue("last_directory", os.path.dirname(file_path))
    
    def save_recent_files(self):
        """Sauvegarder les fichiers récents"""
        recent = {
            "rh_files": self.rh_paths,
            "ext_file": self.ext_path,
            "template_file": self.template_path,
            "certificateur": self.certificateur,
            "date": datetime.now().isoformat()
        }
        
        # Charger l'historique existant
        recent_list = json.loads(self.settings.value("recent_files", "[]"))
        recent_list.insert(0, recent)
        
        # Garder seulement les 5 derniers
        recent_list = recent_list[:5]
        
        self.settings.setValue("recent_files", json.dumps(recent_list))
        self.update_recent_menu()
    
    def load_recent_files(self):
        """Charger la liste des fichiers récents"""
        try:
            return json.loads(self.settings.value("recent_files", "[]"))
        except:
            return []
    
    def update_recent_menu(self):
        """Mettre à jour le menu des fichiers récents"""
        self.recent_menu.clear()
        
        recent_list = self.load_recent_files()
        if not recent_list:
            action = QAction("(Aucun fichier récent)", self)
            action.setEnabled(False)
            self.recent_menu.addAction(action)
            return
        
        for i, recent in enumerate(recent_list):
            date = datetime.fromisoformat(recent["date"]).strftime("%d/%m/%Y %H:%M")
            text = f"{recent['certificateur']} - {date}"
            action = QAction(text, self)
            action.triggered.connect(lambda checked, r=recent: self.load_recent_session(r))
            self.recent_menu.addAction(action)
    
    def load_recent_session(self, recent):
        """Charger une session récente"""
        try:
            self.cert_input.setText(recent["certificateur"])
            self.rh_paths = recent["rh_files"]
            self.ext_path = recent["ext_file"]
            self.template_path = recent["template_file"]
            
            self.update_rh_display()
            self.ext_label.setText(f"📄 {os.path.basename(self.ext_path)}")
            self.ext_valid_label.setText("✓")
            self.ext_valid_label.setStyleSheet("color: #4caf50; font-weight: bold; font-size: 16px;")
            self.template_label.setText(f"📋 {os.path.basename(self.template_path)}")
            self.template_valid_label.setText("✓")
            self.template_valid_label.setStyleSheet("color: #4caf50; font-weight: bold; font-size: 16px;")
            
            self.check_can_process()
            self.show_status_message("Session récente chargée", 3000)
        except Exception as e:
            QMessageBox.warning(self, "Erreur", f"Impossible de charger la session:\n{str(e)}")
    
    def show_documentation(self):
        """Afficher la documentation"""
        doc_text = """
<h2>Guide d'utilisation du Certificateur de Comptes</h2>

<h3>🚀 Démarrage rapide</h3>
<ol>
<li><b>Renseignez votre nom</b> dans le champ "Certificateur"</li>
<li><b>Sélectionnez les fichiers RH</b> (un ou plusieurs fichiers Excel)</li>
<li><b>Sélectionnez le fichier d'extraction</b> depuis l'application à auditer</li>
<li><b>Sélectionnez le template</b> pour la génération du rapport</li>
<li><b>Lancez le traitement</b> et suivez les étapes</li>
</ol>
=======
# 🚗 Promoto - Application de mise en relation Automobilistes ↔ Garages

**Promoto** est une application mobile multiplateforme (Android & iOS) permettant aux automobilistes de trouver rapidement un garage automobile à proximité selon leurs besoins (panne, entretien, urgence, etc.).

## 📋 Table des matières

- [Technologies utilisées](#technologies-utilisées)
- [Structure du projet](#structure-du-projet)
- [Installation et démarrage](#installation-et-démarrage)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Fonctionnalités](#fonctionnalités)
- [Rôles utilisateurs](#rôles-utilisateurs)
 - [Frontend Web (Admin)](#frontend-web-admin)

## 🛠 Technologies utilisées

### Backend
- **Node.js** avec **Express.js**
- **MongoDB** (via Mongoose)
- **JWT** pour l'authentification
- **bcrypt** pour le hashage des mots de passe
- **Cloudinary** pour le stockage d'images (optionnel)

### Frontend (Mobile)
- **Flutter** (Dart)
- **Provider** pour la gestion d'état
- **Google Maps** pour la géolocalisation
- **Firebase** pour les notifications push (à configurer)
- **Dio** pour les appels API

## 📁 Structure du projet

```
PROMOTO/
├── backend/              # API Node.js/Express
│   ├── controllers/      # Contrôleurs des routes
│   ├── models/           # Modèles MongoDB
│   ├── routes/           # Définition des routes
│   ├── middleware/       # Middlewares (auth, validation)
│   ├── utils/            # Utilitaires (upload, token)
│   ├── server.js         # Point d'entrée du serveur
│   └── package.json
│
├── mobile/               # Application Flutter
│   ├── lib/
│   │   ├── models/       # Modèles de données
│   │   ├── providers/    # Providers (état)
│   │   ├── screens/      # Écrans de l'application
│   │   ├── utils/        # Utilitaires (API, thème)
│   │   └── main.dart     # Point d'entrée
│   └── pubspec.yaml
│
└── README.md
```

## 🚀 Installation et démarrage

### Prérequis

- **Node.js** (v18 ou supérieur)
- **MongoDB** (installation locale ou MongoDB Atlas)
- **Flutter SDK** (v3.0 ou supérieur)
- **Git**

### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd PROMOTO
```

### 2. Backend - Configuration et démarrage

```bash
# Aller dans le dossier backend
cd backend

# Installer les dépendances
npm install

# Créer le fichier .env (copier depuis .env.example)
cp .env.example .env

# Modifier le fichier .env avec vos configurations
# - MONGODB_URI: votre URI MongoDB
# - JWT_SECRET: une clé secrète pour JWT
# - CLOUDINARY_*: vos clés Cloudinary (optionnel)

# Démarrer le serveur en mode développement
npm run dev

# Ou en mode production
npm start
```

Le serveur backend sera accessible sur `http://localhost:5000`

### 3. Mobile - Configuration et démarrage

```bash
# Aller dans le dossier mobile
cd mobile

# Installer les dépendances Flutter
flutter pub get

# Configurer l'URL de l'API dans lib/utils/api_client.dart
# Modifier la constante baseUrl selon votre environnement

# Lancer l'application sur un émulateur ou appareil
flutter run
```

**Note importante :** Pour la géolocalisation sur Android, ajouter dans `android/app/src/main/AndroidManifest.xml` :

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

Pour iOS, configurer `ios/Runner/Info.plist` :

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>Promoto a besoin de votre localisation pour trouver les garages à proximité</string>
```

## ⚙️ Configuration

### Variables d'environnement Backend (.env)

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/promoto
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=30d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### Configuration de l'API dans Flutter

Modifier `mobile/lib/utils/api_client.dart` :

```dart
static const String baseUrl = 'http://YOUR_IP_ADDRESS:5000/api';
// Pour un émulateur Android : utiliser http://10.0.2.2:5000/api
// Pour un émulateur iOS : utiliser http://localhost:5000/api
// Pour un appareil physique : utiliser l'IP locale de votre machine
```

## 📡 API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur connecté (protégé)

### Utilisateurs
- `GET /api/users/profile` - Profil (protégé)
- `PUT /api/users/profile` - Mettre à jour le profil (protégé)
- `GET /api/users` - Liste des utilisateurs (Admin)
- `GET /api/users/:id` - Détails utilisateur (Admin)

### Garages
- `GET /api/garages/nearby?latitude=X&longitude=Y` - Garages à proximité
- `GET /api/garages` - Liste des garages
- `GET /api/garages/:id` - Détails d'un garage
- `GET /api/garages/owner/me` - Garage du garagiste connecté (protégé)
- `POST /api/garages` - Créer un garage (Admin)
- `PUT /api/garages/:id` - Mettre à jour (Garagiste/Admin)
- `DELETE /api/garages/:id` - Supprimer (Admin)

### Services
- `GET /api/services` - Liste des services
- `GET /api/services/garage/:garageId` - Services d'un garage
- `GET /api/services/:id` - Détails d'un service
- `POST /api/services` - Créer (Garagiste/Admin)
- `PUT /api/services/:id` - Mettre à jour (Garagiste/Admin)
- `DELETE /api/services/:id` - Supprimer (Garagiste/Admin)

### Rendez-vous
- `GET /api/appointments` - Liste (protégé)
- `GET /api/appointments/client/me` - Rendez-vous du client (protégé)
- `GET /api/appointments/garage/me` - Rendez-vous du garage (protégé/Garagiste)
- `POST /api/appointments` - Créer (protégé/Client)
- `PUT /api/appointments/:id` - Mettre à jour (protégé)
- `DELETE /api/appointments/:id` - Supprimer (protégé)

### Avis
- `GET /api/reviews` - Liste des avis
- `GET /api/reviews/garage/:garageId` - Avis d'un garage
- `POST /api/reviews` - Créer un avis (protégé/Client)
- `PUT /api/reviews/:id` - Mettre à jour (protégé)
- `DELETE /api/reviews/:id` - Supprimer (protégé)

### Admin
- `GET /api/admin/dashboard` - Statistiques (Admin)
- `POST /api/admin/garagistes` - Créer compte garagiste (Admin)
- `GET /api/admin/garagistes` - Liste des garagistes (Admin)
- `PUT /api/admin/garages/:id/suspend` - Suspendre un garage (Admin)
- `PUT /api/admin/garages/:id/activate` - Activer un garage (Admin)

## 🖥 Frontend Web (Admin)

### Démarrage

```bash
cd web
cp .env.example .env   # VITE_API_BASE_URL=http://localhost:5000/api
npm install
npm run dev
```

L’interface admin sera accessible sur `http://localhost:5173`. Connectez‑vous avec un compte `admin`.

## ✨ Fonctionnalités

### Côté Client
- ✅ Création de compte / Connexion
- ✅ Géolocalisation automatique
- ✅ Recherche de garages à proximité
- ✅ Consultation des détails du garage
- ✅ Réservation de rendez-vous
- ✅ Historique des rendez-vous
- ✅ Évaluation et avis (à implémenter)

### Côté Garagiste
- ✅ Connexion (compte créé par l'admin)
- ✅ Gestion du profil garage (à implémenter complètement)
- ✅ Gestion des services (à implémenter)
- ✅ Gestion des rendez-vous (à implémenter)
- ✅ Consultation des avis (à implémenter)

### Côté Admin
- ✅ Dashboard avec statistiques
- ✅ Création de comptes garagistes
- ✅ Gestion des garages (suspendre/activer)
- ✅ Gestion des utilisateurs (à implémenter complètement)

## 👥 Rôles utilisateurs

| Rôle        | Description                          | Accès principal                              |
| ----------- | ------------------------------------ | -------------------------------------------- |
| **Client**  | Utilisateur de l'application        | Recherche, réservation, avis                 |
| **Garagiste** | Propriétaire d'un garage          | Gestion services, rendez-vous, profil garage |
| **Admin**   | Gestionnaire global                  | Supervision complète, création de comptes   |

## 📝 Notes importantes

1. **Premier utilisateur Admin** : Créer manuellement un utilisateur avec le rôle `admin` dans MongoDB ou via un script d'initialisation.

2. **Géolocalisation** : L'application nécessite des permissions de localisation sur l'appareil.

3. **Base URL API** : Pour tester sur un appareil physique, remplacer `localhost` par l'adresse IP locale de votre machine dans `api_client.dart`.

4. **Firebase** : Pour les notifications push, configurer Firebase dans le projet Flutter (voir la documentation Firebase).

5. **Cloudinary** : Optionnel, pour le stockage d'images. Vous pouvez utiliser un autre service ou un stockage local.

## 🔒 Sécurité

- Authentification JWT avec tokens
- Mots de passe hashés avec bcrypt
- Middlewares d'autorisation par rôle
- Validation des inputs côté serveur

## 🚧 Évolutions futures

- [ ] Paiement en ligne (Stripe, PayPal)
- [ ] Système de fidélité client
- [ ] Chat en direct client ↔ garagiste
- [ ] Version web de l'interface admin
- [ ] Recommandations automatiques
- [ ] Notifications push
- [ ] Filtrage avancé des garages
- [ ] Mode hors ligne avec synchronisation

## 📄 Licence

Ce projet est sous licence [MIT](LICENSE).

## 👨‍💻 Développement

Pour contribuer au projet :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request
>>>>>>> 6f864a9354689338c0291177a5001b210eb5edba

<h3>📋 Format des fichiers</h3>
<p><b>Fichiers RH:</b> Doivent contenir au minimum les colonnes code_utilisateur, nom_prenom, profil, direction</p>
<p><b>Fichier d'extraction:</b> Export de l'application avec les mêmes colonnes</p>
<p><b>Template:</b> Modèle Excel avec les en-têtes pour le rapport final</p>

<<<<<<< HEAD
<h3>🔍 Types d'anomalies détectées</h3>
<ul>
<li><b>Compte non RH:</b> Utilisateur présent dans l'application mais absent du référentiel RH</li>
<li><b>Changement de profil:</b> Différence entre le profil dans l'application et celui du RH</li>
<li><b>Changement de direction:</b> Différence entre la direction dans l'application et celle du RH</li>
<li><b>Compte inactif:</b> Compte sans connexion depuis plus de 120 jours</li>
</ul>

<h3>✅ Actions possibles</h3>
<ul>
<li><b>Modifier:</b> Mettre à jour selon les données RH</li>
<li><b>Conserver:</b> Tolérer l'écart et l'ajouter à la whitelist</li>
<li><b>Désactiver:</b> Supprimer ou suspendre le compte</li>
</ul>

<h3>💡 Astuces</h3>
<ul>
<li>Les fichiers récents sont accessibles via le menu Fichier</li>
<li>La whitelist est automatiquement mise à jour lors des validations</li>
<li>Vous pouvez ajouter des commentaires pour justifier vos décisions</li>
<li>Le rapport peut être généré même si tous les cas n'ont pas été traités</li>
</ul>
        """
        
        msg = QMessageBox(self)
        msg.setWindowTitle("Documentation")
        msg.setTextFormat(Qt.TextFormat.RichText)
        msg.setText(doc_text)
        msg.setIcon(QMessageBox.Icon.Information)
        msg.exec()
    
    def show_about(self):
        """Afficher la boîte À propos"""
        QMessageBox.about(
            self,
            "À propos",
            """<h2>Certificateur de Comptes - Gatekeeper</h2>
            <p>Version 1.0</p>
            <p>Application de certification et d'audit des comptes utilisateurs.</p>
            <p>Cette application permet de comparer les données d'extraction 
            d'une application avec le référentiel RH pour détecter les anomalies 
            et prendre les décisions appropriées.</p>
            <p><br><i>Développé avec PyQt6 et pandas</i></p>"""
        )

def main():
    app = QApplication(sys.argv)
    app.setStyle('Fusion')  # Style moderne
    
    # Définir l'icône de l'application (si disponible)
    # app.setWindowIcon(QIcon('icon.png'))
    
    window = CertificateurApp()
    window.show()
    sys.exit(app.exec())
=======
**Développé avec ❤️ pour Promoto**
>>>>>>> 6f864a9354689338c0291177a5001b210eb5edba

if __name__ == "__main__":
    main()
