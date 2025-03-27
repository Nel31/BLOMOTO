# Documentation du Projet BLOMOTO
## Architecture du Projet

### Frontend (blomoto-app)
```
└── blomoto-app
    └── README.md
    └── eslint.config.js
    └── index.html
    └── package-lock.json
    └── package.json
    └── postcss.config.js
    └── public
        └── 2.jpeg
        └── index.html
        └── vite.svg
    └── src
        └── App.css
        └── App.jsx
        └── Home.jsx
        └── assets
            └── 0fc404_ebef14f1549447ecb9acbdbe811515ac~mv2.jpg
            └── 1.png
            └── 3.png
            └── 3.webp
            └── 4.jpeg
            └── 4.png
            └── 5.png
            └── 642ec33ad58cc78a9f2ac756_9f6be7e21e6854da18d99b26b8325ec80f286671_arbre-transmission-automobile.jpeg
            └── 64886295_l-scaled.jpg
            └── Booster.jpg
            └── Courroie-de-distribution.png
            └── apprendre_la_mecanique_auto_avec_un_livre_7401_2_600.jpg
            └── car-engine-2021-08-27-11-27-27-utc-1024x683.webp
            └── changer-plaquettes-de-frein.jpg
            └── diagnostic-auto-opt-scaled.jpg
            └── dsc04624-scaled.jpg
            └── face.avif
            └── face.png
            └── fonctionnemetn-role-utilite-amortisseur-3.jpg
            └── iStock-1340269597.jpg
            └── images.jpeg
            └── images.png
            └── istockphoto-957612802-612x612.jpg
            └── logo-de-reparation-de-l-entretien-de-la-voiture-2bkgetb.jpg
            └── photo-1486262715619-67b85e0b08d3.avif
            └── photo-1492962827063-e5ea0d8c01f5.avif
            └── photo-1530046339160-ce3e530c7d2f.avif
            └── photo-1578844251758-2f71da64c96f.avif
            └── quest-ce_que_carrosserie.jpg
            └── reparateur-climatiseur-auto.jpg
            └── toyota-land-cruiser-front-view.jpg
            └── truck.png
        └── components
            └── Footer.jsx
            └── Header.jsx
            └── Profile.jsx
        └── config
            └── api.js
        └── index.css
        └── index.js
        └── main.jsx
        └── pages
            └── About.jsx
            └── Cards
                └── GarageCards.jsx
            └── Contact.jsx
            └── Homepage
                └── Features.jsx
                └── GetStarted.jsx
                └── Hero.jsx
                └── Home.jsx
                └── Services.jsx
                └── Stats.jsx
                └── Testimonials.jsx
            └── List
                └── GarageDashboard.jsx
                └── GarageDetails.jsx
                └── GarageList.jsx
            └── Login.jsx
            └── Register.jsx
            └── Services
                └── ServiceList.jsx
    └── tailwind.config.js
    └── vite.config.js
```

### Backend (blomotobackend)
```
└── blomotobackend
    └── blomotobackend
        └── __init__.py
        └── asgi.py
        └── media
            └── services_pictures
                └── 642ec33ad58cc78a9f2ac756_9f6be7e21e6854da18d99b26b8325ec80f286671_arb_Kyq43mi.jpeg
                └── 64886295_l-scaled.jpg
                └── Booster.jpg
                └── Courroie-de-distribution.png
                └── apprendre_la_mecanique_auto_avec_un_livre_7401_2_600.jpg
                └── car-engine-2021-08-27-11-27-27-utc-1024x683.webp
                └── car-engine-2021-08-27-11-27-27-utc-1024x683_I0FqnV8.webp
                └── changer-plaquettes-de-frein.jpg
                └── dsc04624-scaled.jpg
                └── dsc04624-scaled_SfL8Kz2.jpg
                └── fonctionnemetn-role-utilite-amortisseur-3.jpg
                └── istockphoto-957612802-612x612.jpg
                └── quest-ce_que_carrosserie.jpg
                └── reparateur-climatiseur-auto.jpg
                └── truck.png
        └── settings.py
        └── urls.py
        └── wsgi.py
    └── db.sqlite3
    └── garage_app
        └── __init__.py
        └── admin.py
        └── apps.py
        └── migrations
            └── 0001_initial.py
            └── __init__.py
        └── models.py
        └── serializers.py
        └── tests.py
        └── urls.py
        └── views.py
    └── manage.py
    └── media
        └── services_pictures
            └── 642ec33ad58cc78a9f2ac756_9f6be7e21e6854da18d99b26b8325ec80f286671_arb_Kyq43mi.jpeg
            └── 64886295_l-scaled.jpg
            └── Booster.jpg
            └── Courroie-de-distribution.png
            └── apprendre_la_mecanique_auto_avec_un_livre_7401_2_600.jpg
            └── car-engine-2021-08-27-11-27-27-utc-1024x683.webp
            └── car-engine-2021-08-27-11-27-27-utc-1024x683_I0FqnV8.webp
            └── changer-plaquettes-de-frein.jpg
            └── dsc04624-scaled.jpg
            └── dsc04624-scaled_SfL8Kz2.jpg
            └── fonctionnemetn-role-utilite-amortisseur-3.jpg
            └── istockphoto-957612802-612x612.jpg
            └── quest-ce_que_carrosserie.jpg
            └── reparateur-climatiseur-auto.jpg
            └── truck.png
    └── package-lock.json
    └── requirements.txt
    └── run_backend.sh
    └── service_app
        └── __init__.py
        └── admin.py
        └── apps.py
        └── migrations
            └── 0001_initial.py
            └── 0002_category_comment.py
            └── 0003_remove_category_comment_service_comment.py
            └── __init__.py
        └── models.py
        └── serializers.py
        └── tests.py
        └── urls.py
        └── views.py
    └── user_app
        └── __init__.py
        └── admin.py
        └── apps.py
        └── authentication.py
        └── migrations
            └── 0001_initial.py
            └── 0002_alter_avis_rating.py
            └── __init__.py
        └── models.py
        └── serializers.py
        └── tests.py
        └── urls.py
        └── views.py
```

## Dépendances

### Frontend (package.json)
```json
{
  "name": "blomoto",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "start": "react-scripts start",
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.8.4",
    "lucide-react": "^0.483.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-icons": "^5.5.0",
    "react-router-dom": "^6.30.0",
    "swiper": "^11.0.6"
  },
  "devDependencies": {
    "@eslint/js": "^9.22.0",
    "@types/react": "^19.0.10",
    "@types/react-dom": "^19.0.4",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.17",
    "eslint": "^9.22.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.19",
    "globals": "^16.0.0",
    "postcss": "^8.4.35",
    "react-refresh": "^0.16.0",
    "react-scripts": "^5.0.1",
    "tailwindcss": "^3.4.1",
    "vite": "^6.2.1"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
```

### Backend (requirements.txt)
```txt
django
djangorestframework
djangorestframework-simplejwt
django-cors-headers
Pillow
```

## Configuration

### Frontend (vite.config.js)
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    minify: false // Désactive la minification des logs en production
  }
})
```

### Backend (settings.py)
```python
"""
Django settings for blomotobackend project.

Generated by 'django-admin startproject' using Django 5.1.7.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.1/ref/settings/
"""

from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-2!4$09d5w8@=3w&tkby8cfxwr^s8td_f78nzs1bzfg0vnr6sy*'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'blomotobackend',
    'user_app',
    'garage_app',
    'service_app',
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
]

AUTH_USER_MODEL = 'user_app.CustomUser'

SIMPLE_JWT = {
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': False,
}

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
}

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # L'URL de votre application React
]

CORS_ALLOW_CREDENTIALS = True

AUTHENTICATION_BACKENDS = ['user_app.authentication.EmailOrUsernameAuthBackend']

ROOT_URLCONF = 'blomotobackend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'blomotobackend.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Media files
MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
```
