import httpx
import asyncio
import os
import json

API_URL = "http://127.0.0.1:8001/analysis/generate"

async def diagnose():
    print(f"Diagnosing API: {API_URL}")
    files_to_try = [f for f in os.listdir('.') if f.endswith('.mp3') and os.path.getsize(f) > 1000]
    target_file = files_to_try[0] if files_to_try else None
    
    if not target_file:
         print("No suitable test audio file found.")
         return

    print(f"Using file: {target_file}")

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            with open(target_file, "rb") as f:
                # Force 'is_pro_mode=false' to use the AI path (if that's where the logic is)
                # Ensure we are testing the path that USES Groq.
                # In analysis.py/generate_analysis:
                # if is_pro_mode: ... await GroqWhisperService.full_pipeline ...
                
                files = {"file": (target_file, f, "audio/mpeg")}
                # Try with is_pro_mode=true to ensure AI is triggered if that's the logic (check analysis.py again or assume default)
                # User says "Engine Pro" in screenshot maybe?
                # analysis.py: is_pro_mode defaults to False?
                # Let's check both or start with False (Standard).
                
                # actually checking analysis.py logic is needed to know which flag triggers what.
                # Assuming 'False' or default triggers the standard analysis which SHOULD include AI if configured.
                response = await client.post(API_URL, files=files, data={"is_pro_mode": "false"})
                
            if response.status_code != 200:
                print(f"FAILED: Status {response.status_code}")
                print(response.text)
                return

            data = response.json()
            
            # API returns metadata directly
            metadata = data
            error = metadata.get("error")
            
            if error:
                print(f"!!! CRITICAL: AI Generation Error reported: {error}")
                print(f"TRACE: {metadata.get('trace')}")
                print(f"Note: {metadata.get('_note')}")
            else:
                print("No explicit error in metadata.")
                
            print("\n--- Full Metadata Keys ---")
            print(list(metadata.keys()))
            
            print("\n--- Value Check ---")
            print(f"Genre: {metadata.get('mainGenre')}")
            print(f"Instruments: {metadata.get('instrumentation')}")
            print(f"Description: {metadata.get('trackDescription')}")
            print(f"Moods: {metadata.get('moods')}")

        except Exception as e:
            print(f"Exception during request: {e}")

if __name__ == "__main__":
    asyncio.run(diagnose())
