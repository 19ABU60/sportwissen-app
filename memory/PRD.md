# PRD - SportWissen Kugelstoßen App

## Original Problem Statement
Der Benutzer, ein Sportlehrer in Deutschland, möchte eine moderne Web-App erstellen, um seine alten FileMaker-basierten Lernwerkzeuge zu ersetzen. Das erste Projekt ist für Kugelstoßen mit der O'Brien-Technik.

## Completed Work

### Deployment (März 2026) ✅
- App erfolgreich auf Hostinger VPS deployed via Coolify
- URL: http://187.77.64.225:9080
- Docker Compose mit Frontend (Nginx) + Backend (FastAPI)
- MongoDB Atlas (speakly-app Cluster, User: abusse_db_user)
- Dockerfiles für Coolify-Kompatibilität angepasst (context: . statt ./frontend)
- requirements.txt bereinigt (emergentintegrations entfernt)
- Node.js 18 → 20 für react-router-dom Kompatibilität
- nginx.conf Fix: Caching-Regel exkludiert jetzt /api/ Pfade (Bilder-Anzeige in Medienverwaltung)

### Fehlerbilder-Analyse (März 2026) ✅
- Direkter Bild-Upload in Phase-Fenster
- "Aus Medienverwaltung" Button zum Laden aus der Bibliothek
- 3 Fehlerkategorien pro Phase (häufige Fehlerbilder, Fehlerbild 2, 3)
- Fehlerbeschreibung als Textfeld
- Analyse mit Zeichenwerkzeugen
- Löschen von Bild + Beschreibung nach Korrektur
- Gespeicherte Medien werden beim Laden automatisch aus DB geladen
- Grüner Indikator im Dropdown für belegte Kategorien

### UI Updates (März 2026) ✅
- "App beenden" Button auf der Startseite mit Abmelde-Bildschirm

### Core Features (Februar 2026)
- Media-Upload-System (MongoDB-basiert)
- Interaktives Zeichenwerkzeug mit Winkelmessung
- Video-Aufnahme & Standbild-Extraktion
- Medienverwaltung (/medien)
- Dark Theme, responsive Design

## Tech Stack
- **Frontend:** React, Tailwind CSS, Framer Motion, lucide-react
- **Backend:** FastAPI (Python), Motor (async MongoDB)
- **Database:** MongoDB Atlas (speakly-app.7jliop3.mongodb.net)
- **Deployment:** Docker, Docker Compose, Nginx, Coolify auf Hostinger VPS

## Bekannte Einschränkungen
- **Kamera funktioniert nur über HTTPS** - Aktuell HTTP, daher Kamera auf VPS blockiert
- **Lösung:** Domain + SSL einrichten (Coolify + Let's Encrypt)

## Nächste Aufgaben (Priorität)
1. **Domain + SSL einrichten** (P0) - Für Kamera-Funktion und professionelle URL
2. **Save to GitHub + Redeploy** - Neueste Änderungen (Fehlerbilder, nginx-Fix, App-beenden) auf VPS deployen

## Zukünftige Aufgaben
- Video-Trimming (Clips kürzen)
- Schüler-Upload-Accounts
- App-Vorlage für andere Sportarten
- Universelle Video-Analyse-App

## Key Files
- `/app/frontend/src/pages/Errors.jsx` - Fehlerbilder mit Upload + Analyse + Medienverwaltung-Picker
- `/app/frontend/src/pages/Home.jsx` - Startseite mit App-beenden Button
- `/app/frontend/nginx.conf` - Nginx config (Fix für Bilder-Proxy)
- `/app/docker-compose.yml` - Docker Compose (Coolify-kompatibel)
- `/app/frontend/Dockerfile` - Frontend Build (Node 20)
- `/app/backend/Dockerfile` - Backend Build
- `/app/backend/server.py` - API Server

## Deployment Credentials
- **VPS IP:** 187.77.64.225
- **Coolify:** http://187.77.64.225:8000
- **MongoDB Atlas:** speakly-app.7jliop3.mongodb.net (User: abusse_db_user)
- **GitHub:** https://github.com/19ABU60/sportwissen-app
