# Film Equipment Manager

Eine vollständige Web-App zur Verwaltung und Vermietung von Filmequipment – inspiriert von [shelf.nu](https://www.shelf.nu). Die App bietet eine moderne, minimalistische UI mit Fokus auf Übersichtlichkeit und mobile Nutzbarkeit.

## 🚀 Features

### 🔐 Authentifizierung & Nutzerverwaltung
- JWT-basierte Authentifizierung
- Rollen: Admin / Mitarbeitende / Externe Nutzer
- Registrierung und Login
- Profilverwaltung mit Passwortänderung

### 🎥 Equipmentverwaltung
- Equipment-Listen mit Kartenansicht
- Detailseiten mit Beschreibung, Bildern, Seriennummer
- Status-Management (verfügbar, gebucht, in Reparatur, verliehen)
- CRUD-Operationen für Admins
- Kategorisierung und Filterung

### 📆 Buchungssystem
- Geräte für definierte Zeiträume reservieren
- Kalenderansicht (Wochenansicht)
- Verfügbarkeitsprüfung
- Buchungsübersicht für alle Nutzer

### 📱 QR-/Barcode-Integration
- Automatische QR-Code-Generierung pro Gerät
- QR-Scanner-Komponente im Frontend
- Workflow: Gerät scannen → Detailansicht / Auschecken / Rückgabe

### 🧠 KI-Features (vorbereitet)
- Verfügbarkeitsprognose basierend auf historischen Daten
- Smart Suggestions für Equipment-Kombinationen
- Anomalie-Erkennung bei verspäteter Rückgabe
- Dummy-KI-Modul für zukünftige Erweiterungen

### 📦 Lager- & Standortverwaltung
- Räume/Standorte anlegen und verwalten
- Geräte zu Standorten zuweisen
- Filterung nach Standort

### 🔔 Benachrichtigungen
- E-Mail-Benachrichtigungen (vorbereitet)
- Status-Änderungen im Dashboard
- Erinnerungen bei anstehenden Rückgaben

## 🛠 Tech-Stack

### Frontend
- **React 18** - UI Framework
- **TailwindCSS** - Styling
- **React Router** - Navigation
- **React Hook Form** - Formulare
- **Axios** - HTTP Client
- **React Hot Toast** - Benachrichtigungen
- **Framer Motion** - Animationen
- **React QR Reader** - QR-Code Scanner

### Backend
- **Node.js** - Runtime
- **Express.js** - Web Framework
- **MongoDB** - Datenbank
- **Mongoose** - ODM
- **JWT** - Authentifizierung
- **bcryptjs** - Passwort-Hashing
- **Multer** - File Upload
- **QRCode** - QR-Code Generierung
- **Nodemailer** - E-Mail Versand

## 📦 Installation

### Voraussetzungen
- Node.js (v16 oder höher)
- MongoDB (lokal oder Atlas)
- npm oder yarn

### 1. Repository klonen
```bash
git clone <repository-url>
cd filmequipment-manager
```

### 2. Dependencies installieren
```bash
# Root dependencies
npm install

# Backend dependencies
cd server
npm install

# Frontend dependencies
cd ../client
npm install
```

### 3. Umgebungsvariablen konfigurieren

#### Backend (.env)
```bash
cd server
cp env.example .env
```

Bearbeiten Sie die `.env` Datei:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/filmequipment

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Email Configuration (optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# OpenAI API (optional, für zukünftige KI-Features)
OPENAI_API_KEY=your-openai-api-key

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Security
CORS_ORIGIN=http://localhost:3000
```

### 4. Datenbank einrichten
```bash
# MongoDB starten (falls lokal)
mongod

# Oder MongoDB Atlas verwenden
# Aktualisieren Sie MONGODB_URI in der .env Datei
```

### 5. Beispieldaten laden
```bash
cd server
npm run seed
```

### 6. Anwendung starten

#### Entwicklung (beide Services gleichzeitig)
```bash
# Im Root-Verzeichnis
npm run dev
```

#### Oder separat starten
```bash
# Backend (Terminal 1)
cd server
npm run dev

# Frontend (Terminal 2)
cd client
npm start
```

## 🚀 Verwendung

### Standard-Login-Daten
Nach dem Laden der Beispieldaten können Sie sich mit folgenden Accounts anmelden:

#### Admin
- **E-Mail:** admin@filmequipment.com
- **Passwort:** admin123

#### Mitarbeiter
- **E-Mail:** staff1@filmequipment.com
- **Passwort:** staff123

#### Externer Nutzer
- **E-Mail:** user1@example.com
- **Passwort:** user123

### Hauptfunktionen

1. **Equipment verwalten**
   - Neue Geräte anlegen
   - Bilder hochladen
   - QR-Codes generieren
   - Status ändern

2. **Buchungen erstellen**
   - Equipment auswählen
   - Zeitraum festlegen
   - Verfügbarkeit prüfen
   - Buchung bestätigen

3. **Kalenderansicht**
   - Wochenübersicht aller Buchungen
   - Farbkodierte Status
   - Schnelle Navigation

4. **QR-Code Scanner**
   - Geräte scannen
   - Schneller Zugriff auf Details
   - Auschecken/Rückgabe

## 📁 Projektstruktur

```
filmequipment-manager/
├── client/                 # React Frontend
│   ├── public/
│   └── src/
│       ├── components/     # React Komponenten
│       ├── pages/         # Seiten-Komponenten
│       ├── services/      # API Services
│       ├── hooks/         # Custom Hooks
│       └── utils/         # Hilfsfunktionen
├── server/                # Node.js Backend
│   ├── controllers/       # Route Controller
│   ├── models/           # Mongoose Models
│   ├── routes/           # API Routes
│   ├── middleware/       # Express Middleware
│   ├── ai/              # KI-Module
│   └── utils/           # Hilfsfunktionen
└── README.md
```

## 🔧 API Endpunkte

### Authentifizierung
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registrierung
- `GET /api/auth/me` - Aktueller Benutzer

### Equipment
- `GET /api/equipment` - Alle Geräte
- `POST /api/equipment` - Neues Gerät
- `GET /api/equipment/:id` - Gerät Details
- `PUT /api/equipment/:id` - Gerät aktualisieren
- `DELETE /api/equipment/:id` - Gerät löschen

### Buchungen
- `GET /api/bookings` - Alle Buchungen
- `POST /api/bookings` - Neue Buchung
- `GET /api/bookings/:id` - Buchung Details
- `PUT /api/bookings/:id` - Buchung aktualisieren
- `PATCH /api/bookings/:id/cancel` - Buchung stornieren

### QR-Codes
- `GET /api/qr/:code` - Gerät per QR-Code finden
- `POST /api/equipment/:id/qr` - QR-Code generieren

## 🧠 KI-Features

Die App ist vorbereitet für zukünftige KI-Integrationen:

### Verfügbarkeitsprognose
- Analyse historischer Buchungsdaten
- Saisonale Trends berücksichtigen
- Wochentag-Patterns

### Smart Suggestions
- Equipment-Kombinationen vorschlagen
- Basierend auf Nutzerverhalten
- Häufig zusammen gebuchte Geräte

### Anomalie-Erkennung
- Verspätete Rückgaben erkennen
- Ungewöhnliche Buchungsmuster
- Automatische Benachrichtigungen

## 🚀 Deployment

### Produktionsumgebung
1. Umgebungsvariablen für Produktion konfigurieren
2. MongoDB Atlas oder andere Cloud-DB verwenden
3. Frontend build erstellen: `npm run build`
4. PM2 oder ähnliches für Node.js Prozess-Management
5. Nginx als Reverse Proxy

### Docker (optional)
```bash
# Docker Compose für lokale Entwicklung
docker-compose up -d
```

## 🤝 Beitragen

1. Fork des Repositories
2. Feature Branch erstellen (`git checkout -b feature/AmazingFeature`)
3. Änderungen committen (`git commit -m 'Add some AmazingFeature'`)
4. Branch pushen (`git push origin feature/AmazingFeature`)
5. Pull Request erstellen

## 📄 Lizenz

Dieses Projekt steht unter der MIT-Lizenz - siehe [LICENSE](LICENSE) Datei für Details.

## 🆘 Support

Bei Fragen oder Problemen:
1. Issues im GitHub Repository erstellen
2. Dokumentation durchsuchen
3. Community-Forum nutzen

## 🔮 Roadmap

- [ ] Echte KI-Integration mit OpenAI
- [ ] Mobile App (React Native)
- [ ] Erweiterte Berichte und Analytics
- [ ] Integration mit externen Kalendersystemen
- [ ] Automatische Inventur-Scans
- [ ] Multi-Tenant Support
- [ ] API für externe Systeme
