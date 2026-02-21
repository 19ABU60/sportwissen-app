# SportWissen Kugelstoßen - Product Requirements Document

## Original Problem Statement
Sportlehrer und Ausbilder aus Rheinland-Pfalz möchte seine FileMaker Sport-Lern-Apps modernisieren. Erste App: Kugelstoßen (O'Brien-Technik) für Schüler UND Lehrer.

## User Choices
- Dark Theme (wie Speakly-App)
- Keine Login/Fortschrittsspeicherung (einfacher Start)
- Platzhalter für Videos/Bilder (später durch echte Medien ersetzen)
- Copyright "© A. Busse" und "SportWissen" Logo beibehalten
- Rollmenü-Navigation für chronologischen Bewegungsablauf
- Jede Bewegungsphase als eigene Seite

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
- Chronologischer Bewegungsablauf als Struktur

## Didaktische Struktur (3 Aspekte)
1. **Didaktisch-methodische Aspekte der Erstvermittlung**
2. **Kugelstoßen aus dem Nachstellschritt seitwärts oder mit einem Impulsschritt** (Didaktische Reduktion)
3. **O'Brien-Technik** (Zieltechnik)

---

## What's Been Implemented
### Version 1.2 - 2026-02-21
- ✅ Phasenstruktur-Seite: Zwei separate Drag-and-Drop-Menüs implementiert
  - "Phasen des Stoßes aus dem Nachstellschritt seitwärts"
  - "Phasen des Stoßes - O'Brien-Technik"
- ✅ Korrekte "ß"-Schreibung (Stoß, Stoßauslage, Stoßes) in allen UI-Elementen
- ✅ CSS uppercase-Bug bei "ß" behoben (entfernt uppercase von Menü-Titeln)
- ✅ **Medien-Upload-System** implementiert:
  - Backend-API für Bild/Video-Upload mit MongoDB-Speicherung
  - Chunked Upload für große Videos (bis 100MB)
  - Ersetzen und Löschen von Medien möglich
  - Medien werden seitenspezifisch gespeichert
- ✅ **Lightbox-Funktion** für Bildvergrößerung:
  - Klick auf Bild öffnet Vollbild-Ansicht
  - Schließen per X-Button oder Escape-Taste oder Klick außerhalb
- ✅ MediaUpload-Komponente auf Seiten:
  - Ausgangsstellung: Bilder für Nachstellschritt und O'Brien
  - Phasenstruktur: Video für Gesamtbewegung

### Version 1.1 - 2026-02-08
- ✅ Neue Startseite mit 3 didaktischen Aspekten
- ✅ Rollmenü-Navigation im Header für alle Bewegungsphasen
- ✅ Chronologischer Ablauf: Ausgangsstellung → Angleiten → Stoßauslage → Stoß → O'Brien
- ✅ Jede Phase als eigene Seite mit Vor/Zurück-Navigation
- ✅ Neue Seite: Ausgangsstellung (Phase 1)
- ✅ Neue Seite: O'Brien-Technik (Zieltechnik)
- ✅ Breadcrumb-Navigation auf allen Seiten

### Version 1.0 - 2026-02-08
- ✅ Homepage mit Bento Grid Navigation
- ✅ Phasen-Seite mit Drag & Drop Sortierung
- ✅ Technik-Seite (Stoßauslage) mit Bildern und Dropdown-Zuordnung
- ✅ Angleiten-Seite mit Videos und Multiple-Choice Quiz
- ✅ Videos-Seite (Stoß) mit Hauptvideo-Player
- ✅ Fehlerbilder-Seite mit aufklappbaren Karten
- ✅ Backend API für Phasen, Technikmerkmale, Videos

### Technical Stack
- Frontend: React 19, Tailwind CSS, Framer Motion, @dnd-kit
- Backend: FastAPI, MongoDB
- Design: Dark Theme, Oswald + Inter Fonts

---

## Prioritized Backlog

### P0 - Critical (Done)
- [x] Chronologische Kapitelstruktur
- [x] Rollmenü-Navigation
- [x] 3 didaktische Aspekte auf Startseite
- [x] Einzelseiten für jede Phase

### P1 - High Priority (Next Phase)
- [ ] MediaUpload auf alle weiteren Seiten hinzufügen (Angleiten, Technik, Videos, OBrien)
- [ ] Mehr Drag & Drop Übungen pro Phase
- [ ] Lückentext-Übungen interaktiv machen
- [ ] Arbeitskarten-Sektion

### P2 - Medium Priority
- [ ] Fortschrittsspeicherung (optional)
- [ ] Lehrer-Admin-Bereich
- [ ] Weitere Disziplinen (Gerätturnen, Spiele)
- [ ] Print-Funktion für Arbeitskarten

---

## Next Tasks
1. MediaUpload-Komponente auf alle anderen Seiten erweitern
2. Echte Kugelstoß-Videos/Bilder vom Benutzer hochladen
3. Mehr interaktive Übungen pro Phase
4. Struktur als Template für weitere Sport-Apps
