# PRD - SportWissen Kugelstoßen App

## Original Problem Statement
Der Benutzer, ein Sportlehrer in Deutschland, möchte eine moderne Web-App erstellen, um seine alten FileMaker-basierten Lernwerkzeuge zu ersetzen. Das erste Projekt ist für Kugelstoßen mit der O'Brien-Technik.

## Completed Work (Februar 2026)

### Core Features
- ✅ Media-Upload-System (MongoDB-basiert)
- ✅ Interaktives Zeichenwerkzeug mit Kreis, Linie, Pfeil
- ✅ **Winkelmessung** - Winkel zur Horizontalen + Freier Winkel (2 Linien)
- ✅ Lightbox/Zoom für Bilder
- ✅ Alle Seiten refaktoriert

### Video-Analyse-Tool (Fehlerbilder-Seite)
- ✅ **Video-Aufnahme** direkt von iPad/Tablet-Kamera
- ✅ **Video-Wiedergabe** mit Schieberegler für präzise Navigation
- ✅ **Standbild-Extraktion** aus Videos
- ✅ **Zuweisung** zu 4 Phasen (Angleiten, Stoßauslage, Dreh-Streck, Abstoß)
- ✅ **Speichern** von Standbildern in Medienverwaltung
- ✅ **Zeichenwerkzeuge** auf zugewiesenen Bildern
- ✅ Vollbild-Overlay für Video-Tool (iPad-optimiert)

### Navigation & UI
- ✅ Dropdown-Menü mit allen Seiten inkl. Medienverwaltung
- ✅ "Übersicht"-Breadcrumbs entfernt (Ausgangsstellung, Stoß, O'Brien)
- ✅ "Zur Übersicht"-Buttons entfernt (O'Brien, Fehlerbilder)
- ✅ Einstein als Kugelstoßer auf Startseite ("Es ist alles nur Mathematik!")

### Medienverwaltung
- ✅ Eigene Seite unter /medien
- ✅ Alle Videos und Bilder anzeigen
- ✅ Nach Seiten gruppiert
- ✅ Filter (Alle/Videos/Bilder)
- ✅ Löschen von Medien

## Tech Stack
- **Frontend:** React, Tailwind CSS, Framer Motion, dnd-kit
- **Backend:** FastAPI (Python), Motor (async MongoDB)
- **Database:** MongoDB
- **File Storage:** /app/backend/uploads/

## Key Files
- `/app/frontend/src/pages/Errors.jsx` - Fehlerbilder mit Video-Tool
- `/app/frontend/src/components/VideoRecorder.jsx` - Video-Aufnahme-Komponente
- `/app/frontend/src/components/DrawingCanvas.jsx` - Zeichenwerkzeuge + Winkelmessung
- `/app/frontend/src/pages/MediaLibrary.jsx` - Medienverwaltung
- `/app/backend/server.py` - API Server

## Zukünftige Ideen
- **Universelle Video-Analyse-App** für Schule, Universität und Leistungssport
- Schüler-Upload-Funktion
- App-Vorlage für andere Sportarten

## Deployment
Geplant: DSGVO-konformes Hosting (EU-Server)
- Optionen: Hetzner, netcup, IONOS, Hostinger VPS
