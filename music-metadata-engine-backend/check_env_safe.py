
import os
# We read the file manually to avoid loading into env which might be stale
try:
    with open('.env', 'r', encoding='utf-8') as f:
        content = f.read()
        if "TWÓJ_NOWY_KLUCZ" in content:
            print("STATUS: BAD_KEY_PRESENT")
        else:
            print("STATUS: KEY_UPDATED")
except Exception as e:
    print(f"Error reading .env: {e}")
