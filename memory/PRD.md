# SportWissen Kugelstoßen - Product Requirements Document

## Original Problem Statement
Sportlehrer und Ausbilder aus Rheinland-Pfalz möchte seine FileMaker Sport-Lern-Apps modernisieren. Erste App: Kugelstoßen (O'Brien-Technik) für Schüler.

## User Choices
- Dark Theme (wie Speakly-App)
- Keine Login/Fortschrittsspeicherung (einfacher Start)
- Platzhalter für Videos/Bilder (später durch echte Medien ersetzen)
- Copyright "© A. Busse" und "SportWissen" Logo beibehalten

## User Personas
1. **Schüler (12-18 Jahre)** - Lernen die Kugelstoß-Technik
2. **Sportlehrer** - Nutzen die App im Unterricht
3. **Lehramtsanwärter** - Vertiefen Fachwissen

## Core Requirements (Static)
- Responsive Design (PC, Tablet, Handy)
- Dark Theme
- Deutsche Sprache
- Interaktive Übungen (Drag & Drop, Quiz, Video)
- Keine Anmeldung erforderlich

---

## What's Been Implemented
### Version 1.0 - 2026-02-08
- ✅ Homepage mit Bento Grid Navigation
- ✅ Phasen-Seite mit Drag & Drop Sortierung
- ✅ Technik-Seite mit Bildern und Dropdown-Zuordnung
- ✅ Angleiten-Seite mit Videos und Quiz
- ✅ Videos-Seite mit Hauptvideo-Player (Geschwindigkeitssteuerung)
- ✅ Fehlerbilder-Seite mit aufklappbaren Karten
- ✅ Floating Navigation Dock
- ✅ Header mit Logo "SportWissen"
- ✅ Footer mit Copyright "© A. Busse"
- ✅ Backend API für Phasen, Technikmerkmale, Videos

### Technical Stack
- Frontend: React 19, Tailwind CSS, Framer Motion, @dnd-kit
- Backend: FastAPI, MongoDB
- Design: Dark Theme, Oswald + Inter Fonts

---

## Prioritized Backlog

### P0 - Critical (Done)
- [x] Basic app structure and navigation
- [x] Drag & Drop Phasen-Übung
- [x] Video Player mit Steuerung

### P1 - High Priority (Next Phase)
- [ ] Echte Videos/Bilder einbinden
- [ ] Mehr Quiz-Fragen hinzufügen
- [ ] Lückentext-Übungen interaktiv machen
- [ ] Arbeitskarten-Sektion

### P2 - Medium Priority
- [ ] Fortschrittsspeicherung (optional)
- [ ] Lehrer-Admin-Bereich
- [ ] Weitere Disziplinen (Gerätturnen, Spiele)
- [ ] Print-Funktion für Arbeitskarten

### P3 - Nice to Have
- [ ] Offline-Modus (PWA)
- [ ] Sprachsynthese für Anleitungen
- [ ] Gamification (Punkte, Badges)

---

## Next Tasks
1. Echte Kugelstoß-Videos vom Benutzer erhalten und einbinden
2. Echte Technikbilder einbinden
3. Quiz erweitern mit mehr Fragen
4. Lückentext-Übungen interaktiv gestalten
