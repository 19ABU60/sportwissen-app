# PRD - SportWissen Kugelstoßen App

## Original Problem Statement
Der Benutzer, ein Sportlehrer in Deutschland, möchte eine moderne Web-App erstellen, um seine alten FileMaker-basierten Lernwerkzeuge zu ersetzen. Das erste Projekt ist für Kugelstoßen mit der O'Brien-Technik.

## Completed Work (Februar 2026)
- ✅ Media-Upload-System (MongoDB-basiert)
- ✅ Interaktives Zeichenwerkzeug (Stoßauslage-Seite)
- ✅ Lightbox/Zoom für Bilder
- ✅ Alle Seiten refaktoriert (Phasen, Angleiten, Ausgangsstellung, Technique, Videos, O'Brien, Errors)
- ✅ "Übersicht" Breadcrumbs entfernt von: Ausgangsstellung, 4. Stoß, O'Brien-Technik
- ✅ Fehlerbilder-Seite: Neuer Titel, 4 Bilder mit Dropdowns
- ✅ Angleiten: 2. Video umbenannt zu "Angleiten in der O'Brien-Technik" / "Vorschau"
- ✅ Dropdowns zeigen "häufige Fehlerbilder"

## In Progress
- Dropdowns auf Fehlerbilder-Seite mit 3-4 konkreten Fehlerbeschreibungen pro Phase befüllen (wartet auf Benutzereingabe)

## Backlog (P1/P2)
- P1: Fehlerbeschreibungen für Dropdowns einfügen
- P2: Schüler-Upload-Funktion
- P2: App-Vorlage für andere Sportarten

## Tech Stack
- Frontend: React, Tailwind CSS, Framer Motion, dnd-kit
- Backend: FastAPI (Python), Motor (async MongoDB)
- Database: MongoDB
- File Storage: /app/backend/uploads/

## Key Files
- /app/frontend/src/pages/Errors.jsx - Fehlerbilder-Seite
- /app/frontend/src/components/MediaUpload.jsx - Media-Upload Komponente
- /app/backend/server.py - API Server
