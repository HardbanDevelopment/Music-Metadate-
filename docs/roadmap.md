# Roadmap Rozwoju Music Metadata Engine (MME)

## 1. Stabilizacja i Fundamenty (Q1)
- Finalizacja modułu prawnego:
  - Pełna obsługa ramki TIPL (Involved People List)
  - Walidacja ISRC
- Douczenie modeli AI (Mood, Instrumenty)
- Testy beta z wybranymi wytwórniami

## 2. Monetyzacja i Integracje (Q2)
- Wdrożenie bramek płatności (Stripe) i modelu subskrypcyjnego
- Eksport danych w standardzie DDEX (XML) [ZAKOŃCZONE]
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
3. Przygotować integrację eksportu DDEX [ZAKOŃCZONE]
4. Rozpocząć wdrożenie systemu płatności/subskrypcji
5. Zoptymalizować backend (Celery, mutagen) pod kątem dużych wsadów
