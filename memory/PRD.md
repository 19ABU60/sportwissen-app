# SportWissen - Product Requirements Document

## Original Problem Statement
A German sports teacher wants modern web apps to replace FileMaker-based tools. First project: Shot put ("Kugelstoßen") O'Brien technique application.

## Core Modules
1. **Phase Structure:** Interactive exercises on movement phases
2. **Technique Characteristics:** Images with descriptions and interactive analysis
3. **Videos:** Technique video integration
4. **Error Analysis:** Video recording, frame extraction, on-image drawing
5. **Methodical Exercises:** Series of drills

## Key Features
- Dark theme, responsive (tablet/iPad focus)
- Interactive elements (Drawing Canvas with angle measurement)
- Media management system with video thumbnails
- Video recording with frame extraction
- JWT Authentication with admin user management
- Portal page linking multiple apps

## Tech Stack
- **Frontend:** React, React Router, Tailwind CSS, Framer Motion
- **Backend:** FastAPI, Motor (async MongoDB), Pydantic
- **Auth:** JWT with python-jose, passlib/bcrypt
- **Database:** MongoDB
- **Deployment:** Docker, Docker Compose, Nginx, Coolify on Hostinger VPS
- **Live URL:** https://sport-wissen.com

## DB Schema
- **media:** `{ id, page, section, media_type, filename, original_name, url, uploaded_at, is_default, thumbnail_url }`
- **users:** `{ id, email, password_hash, name, is_active, is_admin, allowed_apps: [str], created_at }`

## Auth Credentials (Preview)
- Admin: admin@sport-wissen.com / SportWissen2026!

## Completed Features
- [x] Full deployment lifecycle (Docker/Coolify/VPS)
- [x] Domain & SSL (sport-wissen.com)
- [x] Portal landing page (3 apps)
- [x] JWT Authentication system (register, login, admin management)
- [x] Video thumbnail generation
- [x] Auto-save for recordings
- [x] Media library with image/video support
- [x] Camera functionality over HTTPS
- [x] Auth system fully tested (13/13 frontend tests, 11/11 backend tests) - March 2026

## Upcoming Tasks (P1)
- [ ] Video Trimming: Editor to shorten clips from media library
- [ ] App Template: Generalize structure for other sports

## Future Tasks (P2)
- [ ] New Video App: Universal video analysis for school/university/professional sports

## Refactoring Backlog
- [ ] Split server.py into routes/, models/, security/ modules
