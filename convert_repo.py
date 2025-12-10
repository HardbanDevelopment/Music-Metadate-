import os
import unicodedata

# Ścieżka do folderu repo
repo_path = "H:/Projekty/music-metadate-engine"

# Funkcja do transliteracji znaków na ASCII
def to_ascii(text):
    # Normalizacja Unicode → rozdziela znaki z akcentami
    nfkd_form = unicodedata.normalize('NFKD', text)
    # Zostawia tylko znaki ASCII
    return "".join([c for c in nfkd_form if ord(c) < 128])

# Funkcja do konwersji pojedynczego pliku
def convert_file(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
    except UnicodeDecodeError:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
        print(f"Plik {file_path} miał problem z kodowaniem. Znaki nie-UTF8 zostały zignorowane.")
    
    # Transliteration na ASCII
    ascii_content = to_ascii(content)
    
    # Zapis w UTF-8 (już bez problematycznych znaków)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(ascii_content)

# Przechodzimy po wszystkich plikach w repo
for root, dirs, files in os.walk(repo_path):
    for file in files:
        if file.endswith((".py", ".txt", ".md")):  # możesz dopisać inne rozszerzenia
            file_path = os.path.join(root, file)
            convert_file(file_path)

print("Konwersja wszystkich plików repo zakończona.")
