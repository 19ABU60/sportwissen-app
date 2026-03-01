# PRD - SportWissen Kugelstoßen App

## Original Problem Statement
Der Benutzer, ein Sportlehrer in Deutschland, möchte eine moderne Web-App erstellen, um seine alten FileMaker-basierten Lernwerkzeuge zu ersetzen. Das erste Projekt ist für Kugelstoßen mit der O'Brien-Technik.

## Completed Work

### Deployment (März 2026) ✅
- App erfolgreich auf Hostinger VPS deployed via Coolify
- URL: http://187.77.64.225:9080
- Docker Compose mit Frontend (Nginx) + Backend (FastAPI)
- MongoDB Atlas (speakly-app Cluster, EU-Region)
- Dockerfiles für Coolify-Kompatibilität angepasst (context: . statt ./frontend)
- requirements.txt bereinigt (emergentintegrations entfernt)

### Core Features (Februar 2026)
- Media-Upload-System (MongoDB-basiert)
- Interaktives Zeichenwerkzeug mit Kreis, Linie, Pfeil
- Winkelmessung - Winkel zur Horizontalen + Freier Winkel (2 Linien)
- Lightbox/Zoom für Bilder

### Video-Analyse-Tool (Fehlerbilder-Seite)
- Video-Aufnahme direkt von iPad/Tablet-Kamera
- Video-Wiedergabe mit Schieberegler
- Standbild-Extraktion aus Videos
- Zuweisung zu 4 Phasen
- Vollbild-Overlay für Video-Tool

### Fehlerbilder-Analyse (März 2026 - NEU) ✅
- Direkter Bild-Upload in Phase-Fenster (ohne Video nötig)
- 3 Fehlerkategorien pro Phase (häufige Fehlerbilder, Fehlerbild 2, 3)
- Fehlerbeschreibung als Textfeld
- Analyse mit Zeichenwerkzeugen
- Löschen von Bild + Beschreibung nach Korrektur
- Grüner Indikator im Dropdown für belegte Kategorien

### Navigation & UI
- Dropdown-Menü mit allen Seiten inkl. Medienverwaltung
- Einstein als Kugelstoßer auf Startseite
- Dark Theme, responsive Design

### Medienverwaltung
- Eigene Seite unter /medien
- Filter (Alle/Videos/Bilder)
- Löschen von Medien

## Tech Stack
- **Frontend:** React, Tailwind CSS, Framer Motion, lucide-react
- **Backend:** FastAPI (Python), Motor (async MongoDB)
- **Database:** MongoDB Atlas
- **Deployment:** Docker, Docker Compose, Nginx, Coolify auf Hostinger VPS

## Key Files
- `/app/frontend/src/pages/Errors.jsx` - Fehlerbilder mit Upload + Analyse
- `/app/frontend/src/components/VideoRecorder.jsx` - Video-Aufnahme
- `/app/frontend/src/components/DrawingCanvas.jsx` - Zeichenwerkzeuge
- `/app/frontend/src/pages/MediaLibrary.jsx` - Medienverwaltung
- `/app/backend/server.py` - API Server
- `/app/docker-compose.yml` - Deployment Config
- `/app/frontend/Dockerfile` - Frontend Docker Build
- `/app/backend/Dockerfile` - Backend Docker Build

## Zukünftige Aufgaben
- **Domain einrichten** - Eigene Domain für die App
- **Video-Trimming** - Video-Editor zum Kürzen von Clips
- **Schüler-Uploads** - Schüler-Accounts für eigene Medien
- **App-Vorlage** - Wiederverwendbare Struktur für andere Sportarten
- **Universelle Video-Analyse-App** - Für Schule, Uni, Leistungssport
