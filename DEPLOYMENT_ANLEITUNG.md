# 🚀 SportWissen App - Deployment Anleitung für Hostinger VPS

Diese Anleitung führt Sie Schritt für Schritt durch das Deployment Ihrer SportWissen App auf Ihrem Hostinger VPS (KVM 2).

---

## 📋 Voraussetzungen

- Hostinger VPS (KVM 2) ✅ (haben Sie bereits)
- Domain (optional, aber empfohlen)
- Ca. 30-45 Minuten Zeit

---

## Teil 1: MongoDB Atlas einrichten (kostenlos)

### 1.1 Account erstellen

1. Öffnen Sie **https://www.mongodb.com/atlas**
2. Klicken Sie auf **"Try Free"**
3. Registrieren Sie sich (E-Mail oder Google)

### 1.2 Cluster erstellen

1. Wählen Sie **"Build a Database"**
2. Wählen Sie **"M0 FREE"** (kostenlos!)
3. **Provider:** AWS
4. **Region:** `eu-central-1 (Frankfurt)` 🇩🇪 ← WICHTIG für DSGVO!
5. **Cluster Name:** `sportwissen-cluster`
6. Klicken Sie **"Create"**

### 1.3 Datenbank-Benutzer anlegen

1. Gehen Sie zu **"Database Access"** (linkes Menü)
2. Klicken Sie **"Add New Database User"**
3. **Username:** `sportwissen-admin`
4. **Password:** Generieren Sie ein sicheres Passwort (NOTIEREN!)
5. **Rolle:** "Read and write to any database"
6. Klicken Sie **"Add User"**

### 1.4 Netzwerk-Zugriff erlauben

1. Gehen Sie zu **"Network Access"** (linkes Menü)
2. Klicken Sie **"Add IP Address"**
3. Klicken Sie **"Allow Access from Anywhere"** (für VPS)
   - Oder tragen Sie die IP Ihres VPS ein (sicherer)
4. Klicken Sie **"Confirm"**

### 1.5 Connection String kopieren

1. Gehen Sie zu **"Database"** → **"Connect"**
2. Wählen Sie **"Connect your application"**
3. Kopieren Sie den Connection String, z.B.:
   ```
   mongodb+srv://sportwissen-admin:<password>@sportwissen-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Ersetzen Sie `<password>` mit Ihrem Passwort!

---

## Teil 2: Hostinger VPS vorbereiten

### 2.1 Mit VPS verbinden

1. Loggen Sie sich bei **Hostinger** ein
2. Gehen Sie zu **VPS** → Ihr Server
3. Notieren Sie die **IP-Adresse** und **Root-Passwort**
4. Öffnen Sie ein Terminal (Mac/Linux) oder PuTTY (Windows)
5. Verbinden Sie sich:
   ```bash
   ssh root@IHRE_VPS_IP
   ```

### 2.2 System aktualisieren

```bash
apt update && apt upgrade -y
```

### 2.3 Docker installieren

```bash
# Docker installieren
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Docker Compose installieren
apt install docker-compose -y

# Docker starten
systemctl enable docker
systemctl start docker

# Prüfen ob es funktioniert
docker --version
docker-compose --version
```

### 2.4 Firewall einrichten

```bash
# UFW installieren und konfigurieren
apt install ufw -y
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable
```

---

## Teil 3: App auf den VPS laden

### 3.1 Projekt-Ordner erstellen

```bash
mkdir -p /var/www/sportwissen
cd /var/www/sportwissen
```

### 3.2 Code von Emergent herunterladen

**Option A: Mit Git (empfohlen)**

Falls Sie das Projekt auf GitHub gespeichert haben:
```bash
git clone https://github.com/IHR_USERNAME/sportwissen.git .
```

**Option B: Manuell hochladen**

1. In Emergent: Klicken Sie auf **"Download Code"**
2. Entpacken Sie die ZIP-Datei
3. Laden Sie die Dateien mit SFTP hoch (z.B. mit FileZilla):
   - Host: Ihre VPS IP
   - User: root
   - Passwort: Ihr Root-Passwort
   - Ziel: `/var/www/sportwissen/`

### 3.3 Umgebungsvariablen konfigurieren

```bash
cd /var/www/sportwissen
cp .env.example .env
nano .env
```

Passen Sie die Werte an:
```
DOMAIN_URL=https://ihre-domain.de
MONGO_URL=mongodb+srv://sportwissen-admin:IHR_PASSWORT@sportwissen-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
DB_NAME=sportwissen
```

Speichern: `Ctrl+X`, dann `Y`, dann `Enter`

---

## Teil 4: App starten

### 4.1 Container bauen und starten

```bash
cd /var/www/sportwissen
docker-compose up -d --build
```

Das dauert beim ersten Mal ca. 5-10 Minuten!

### 4.2 Status prüfen

```bash
docker-compose ps
```

Sie sollten sehen:
```
NAME                    STATUS
sportwissen-frontend    Up
sportwissen-backend     Up
```

### 4.3 Logs prüfen (bei Problemen)

```bash
# Alle Logs
docker-compose logs

# Nur Backend
docker-compose logs backend

# Nur Frontend
docker-compose logs frontend
```

---

## Teil 5: Domain einrichten (optional)

### 5.1 DNS-Einstellungen

Bei Ihrem Domain-Anbieter:
1. Erstellen Sie einen **A-Record**:
   - Name: `@` oder `www`
   - Wert: Ihre VPS IP-Adresse

### 5.2 SSL-Zertifikat (HTTPS)

```bash
# Certbot installieren
apt install certbot python3-certbot-nginx -y

# Zertifikat anfordern
certbot --nginx -d ihre-domain.de -d www.ihre-domain.de
```

Folgen Sie den Anweisungen und geben Sie Ihre E-Mail ein.

---

## 🎉 Fertig!

Ihre App ist jetzt erreichbar unter:
- **Mit Domain:** `https://ihre-domain.de`
- **Ohne Domain:** `http://IHRE_VPS_IP`

---

## 🔧 Nützliche Befehle

```bash
# App stoppen
docker-compose down

# App neu starten
docker-compose restart

# App aktualisieren (nach Code-Änderungen)
docker-compose up -d --build

# Logs in Echtzeit anzeigen
docker-compose logs -f

# Speicherplatz aufräumen
docker system prune -a
```

---

## ❓ Häufige Probleme

### "Connection refused"
→ Prüfen Sie ob die Container laufen: `docker-compose ps`

### "MongoDB connection failed"
→ Prüfen Sie den MONGO_URL in der .env Datei
→ Prüfen Sie ob die IP in MongoDB Atlas freigegeben ist

### Seite lädt nicht
→ Prüfen Sie die Firewall: `ufw status`
→ Prüfen Sie die Logs: `docker-compose logs`

---

## 📞 Support

Bei Fragen können Sie mich (den Emergent AI Agenten) jederzeit fragen!
Öffnen Sie einfach einen neuen Chat mit Ihrem Projekt.

---

Erstellt am: März 2026
Für: SportWissen Kugelstoßen App
