# Roadmap Rozwoju Music Metadata Engine (MME)

## 1. Stabilizacja i Fundamenty (Q1)

- Finalizacja modułu prawnego:
  - Pełna obsługa ramki TIPL (Involved People List)
  - Walidacja ISRC

- Douczenie modeli AI (Mood, Instrumenty)

- Testy beta z wybranymi wytwórniami

## 2. Monetyzacja i Integracje (Q2)

- Wdrożenie bramek płatności (Stripe) i modelu subskrypcyjnego

- Eksport danych w standardzie DDEX (XML)

- Integracja z dodatkowymi DSP/API

## 3. Ekosystem i Rozszerzenia (Q3+)

- Pełna obsługa metadanych dla FLAC (Vorbis Comments) i MP4/M4A (iTunes tags)

- Udostępnienie publicznego API dla deweloperów

- Rozszerzenie wsparcia dla nowych typów plików audio i metadanych

- Skalowanie backendu (optymalizacja Celery, mutagen)

## 4. Optymalizacja AI i UX

- Kalibracja modelu nastroju (Mood)

- Usprawnienie logiki parsowania ramek TIPL

- Automatyczna walidacja prawna i cyfrowa

## 5. Marketing i Biznes

- Wdrożenie komunikacji marketingowej

- Rozwój modelu SaaS: Free/Trial, Prosumer PRO, Enterprise

- Analiza ROI i potencjału rynkowego

---

### Priorytety techniczne na najbliższy sprint

1. Ukończyć obsługę TIPL i walidację ISRC w silniku tagowania
2. Przeprowadzić fine-tuning modeli AI na nowych danych
3. Przygotować integrację eksportu DDEX
4. Rozpocząć wdrożenie systemu płatności/subskrypcji
5. Zoptymalizować backend (Celery, mutagen) pod kątem dużych wsadów

---

## Plan dalszego rozwoju i komercjalizacji (v1.3 BETA → Full Live)

Jako Główny Architekt Systemowy, na podstawie dogłębnej analizy obecnego stanu aplikacji Music Metadata Engine (MME), przedstawiam szczegółowy plan dalszego rozwoju, mający na celu doprowadzenie produktu do fazy pełnego wdrożenia produkcyjnego oraz komercjalizacji.

### Etap 1: Infrastruktura i Bezpieczeństwo (Priorytet Absolutny)
- Backend Proxy (BFF): [ZROBIONE]
  - Wdrożenie serwera (Next.js API Routes lub Python FastAPI) do obsługi zapytań z frontendu i ukrycia kluczy API.
- Uwierzytelnianie użytkowników: [ZROBIONE]
  - Integracja z Supabase Auth lub Clerk, dodanie ekranów logowania/rejestracji, zabezpieczenie tras.
- Baza danych w chmurze: [ZROBIONE]
  - Migracja historii analiz i danych uczenia z localStorage do Supabase (PostgreSQL) lub Firestore.

### Etap 2: Monetyzacja i Biznes (Q2 2024)
- Bramki płatności (Stripe/Lemon Squeezy)
- Modele subskrypcji: Freemium, Pro, Credits
- Zarządzanie limitami (Quota System) po stronie backendu

### Etap 3: Funkcjonalność "Pro" (Q3 2024)
- Pełna obsługa formatów (FLAC/AIFF, Vorbis Comments, atomy MP4)
- Licensing Guard: Walidacja pól Copyright, ISRC, Publisher przed eksportem
- Integracja dystrybucyjna (DDEX/API, partnerstwa z dystrybutorami)

### Etap 4: Ekosystem i Skalowanie (Q4 2024+)
- Wtyczka VST/AU do DAW
- API B2B dla zewnętrznych firm

---

## Krytyczne usprawnienia techniczne i biznesowe

### Technical Architecture Improvements
- Celery: Ustawienie limitów pamięci (--max-tasks-per-child, --max-memory-per-child)
- Optymalizacja task pool (prefork/gevent)
- Migracja z Librosa na Essentia (szybsza analiza audio)
- Deep Duplicate Detection: Integracja AcoustID (Chromaprint)

### Product Functionality
- Style Guide Validator: Linter sprawdzający zgodność z wytycznymi Spotify/Apple
- AI-Generated Content Detection: Moduł ostrzegający przed AI-spamem
- Advanced Classical & Jazz Support: Obsługa TMCL, TIPL, hierarchii dla klasyki i jazzu

### Business Logic & Compliance
- ISRC-ISWC Linking: Wymuszenie powiązania ISWC z ISRC
- DDEX ERN 4 Native Architecture: Model danych oparty o PartyList
- Commercial Data Licensing: Licencje na MusicBrainz/Discogs/AcoustID dla komercyjnego użycia

---

## Podsumowanie najważniejszych kroków
- Migracja z process.env na bezpieczny Backend Proxy [ZROBIONE]
- Implementacja limitów pamięci dla Celery
- Walidator stylu eksportu
- Migracja silnika analizy audio na Essentia
- Ostrzeżenia dla AI-generated content
- Rozbudowa wsparcia dla klasyki/jazzu
- Wdrożenie architektury DDEX ERN 4
- Pozyskanie licencji na dane zewnętrzne

---

Każdy z powyższych punktów jest kluczowy dla przejścia z wersji beta do stabilnej, skalowalnej i bezpiecznej aplikacji gotowej do komercjalizacji.
