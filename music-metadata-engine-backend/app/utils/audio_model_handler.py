# music-metadata-engine-backend/app/utils/audio_model_handler.py
import numpy as np
import librosa
import tensorflow as tf
import os
from typing import List, Dict, Any

# --- Konfiguracja ---
# Ścieżka do modelu zostanie wczytana ze zmiennych środowiskowych lub configu w przyszłości
MODEL_PATH = os.getenv("MOOD_MODEL_PATH", "models/mood_model_v2_finetuned.h5")
# Te parametry MUSZĄ być identyczne jak podczas treningu
AUDIO_PARAMS = {
    "sample_rate": 22050,
    "duration_secs": 30,
    "n_mels": 128
}
# Etykiety klas MUSZĄ odpowiadać kolejności z treningu
CLASS_LABELS = [
    'Angry', 'Anxious', 'Calm', 'Celebratory', 'Dark', 'Dreamy', 'Energetic', 
    'Euphoric', 'Heartbreaking', 'Intense', 'Melancholic', 'Mysterious', 
    'Nostalgic', 'Passionate', 'Peaceful', 'Reflective', 'Romantic', 
    'Sad', 'Sensual', 'Somber', 'Triumphant', 'Upbeat'
]

class AudioModelHandler:
    """
    Klasa do obsługi modelu klasyfikacji nastroju audio.
    Ładuje model, przetwarza pliki audio i zwraca predykcje.
    """
    model: tf.keras.Model = None

    def load_model(self):
        """Ładuje model Keras do pamięci."""
        if not os.path.exists(MODEL_PATH):
            print(f"Ostrzeżenie: Plik modelu nie został znaleziony w '{MODEL_PATH}'. Funkcjonalność analizy nastroju będzie wyłączona.")
            self.model = None
            return

        try:
            print(f"Ładowanie modelu z: {MODEL_PATH}")
            self.model = tf.keras.models.load_model(MODEL_PATH)
            print("Model analizy nastroju załadowany pomyślnie.")
        except Exception as e:
            print(f"Błąd podczas ładowania modelu z '{MODEL_PATH}': {e}")
            self.model = None

    def _preprocess_audio(self, audio_bytes: bytes) -> np.ndarray:
        """Przetwarza surowe bajty audio na spektrogram Mel, gotowy do predykcji."""
        try:
            signal, sr = librosa.load(io.BytesIO(audio_bytes), sr=AUDIO_PARAMS['sample_rate'], duration=AUDIO_PARAMS['duration_secs'])
            
            # Wyrównanie długości sygnału
            expected_length = AUDIO_PARAMS['sample_rate'] * AUDIO_PARAMS['duration_secs']
            if len(signal) < expected_length:
                signal = np.pad(signal, (0, expected_length - len(signal)), 'constant')
            else:
                signal = signal[:expected_length]

            # Ekstrakcja cech (spektrogram Mel)
            mel_spectrogram = librosa.feature.melspectrogram(y=signal, sr=sr, n_mels=AUDIO_PARAMS['n_mels'])
            log_mel_spectrogram = librosa.power_to_db(mel_spectrogram, ref=np.max)

            # Normalizacja
            min_val, max_val = np.min(log_mel_spectrogram), np.max(log_mel_spectrogram)
            if max_val - min_val > 0:
                normalized_spectrogram = (log_mel_spectrogram - min_val) / (max_val - min_val)
            else:
                normalized_spectrogram = log_mel_spectrogram

            # Dodanie wymiaru batcha i kanału
            return normalized_spectrogram[np.newaxis, ..., np.newaxis]

        except Exception as e:
            print(f"Błąd podczas przetwarzania audio: {e}")
            return None

    def predict_moods(self, audio_bytes: bytes, top_n: int = 5) -> List[Dict[str, Any]]:
        """
        Dokonuje predykcji nastrojów na podstawie dostarczonych bajtów audio.
        """
        if self.model is None:
            return []

        spectrogram = self._preprocess_audio(audio_bytes)
        if spectrogram is None:
            return []

        try:
            predictions = self.model.predict(spectrogram)[0]
            
            # Powiązanie predykcji z etykietami i sortowanie
            results = [{"mood": label, "score": float(score)} for label, score in zip(CLASS_LABELS, predictions)]
            sorted_results = sorted(results, key=lambda x: x['score'], reverse=True)
            
            return sorted_results[:top_n]
        except Exception as e:
            print(f"Błąd podczas predykcji modelu: {e}")
            return []

# Utworzenie pojedynczej instancji, która będzie używana w całej aplikacji
mood_model_handler = AudioModelHandler()
