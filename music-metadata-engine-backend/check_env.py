import os
from dotenv import load_dotenv

load_dotenv()

key = os.getenv("GROQ_API_KEY")
print(f"Key loaded: {key is not None}")
if key:
    print(f"Key length: {len(key)}")
    try:
        key.encode('ascii')
        print("Key is valid ASCII.")
    except UnicodeEncodeError as e:
        print(f"Key contains non-ASCII characters: {e}")
        # Show obscure representation
        print(f"Repr: {repr(key[:15])}...")
