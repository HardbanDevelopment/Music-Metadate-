import httpx
import asyncio
import os
import sys

API_URL = "http://127.0.0.1:8001/analysis/generate"

async def verify():
    print(f"Verifying AI Pipeline: {API_URL}")
    files_to_try = [f for f in os.listdir('.') if f.endswith('.mp3') and os.path.getsize(f) > 1000]
    target_file = files_to_try[0] if files_to_try else None
    
    if not target_file:
         print("No suitable test audio file found.")
         return

    print(f"Using file: {target_file}")

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            with open(target_file, "rb") as f:
                # is_pro_mode=false is enough to trigger Groq metadata if key is present
                files = {"file": (target_file, f, "audio/mpeg")}
                response = await client.post(API_URL, files=files, data={"is_pro_mode": "false"})
                
            if response.status_code != 200:
                print(f"FAILED: Status {response.status_code}")
                # print(response.text)
                return

            data = response.json()
            
            # Metadata is at root level now based on our previous diagnosis insights (it returns the dict directly)
            # wait, analysis.py returns `metadata` dict directly.
            
            error = data.get("error")
            if error:
                print(f"FAILURE: AI specific error still present: {error}")
                print(f"Trace: {data.get('trace')}")
                return

            print("\n--- Success! AI Data Received ---")
            print(f"Main Genre: {data.get('mainGenre')}")
            print(f"Instruments: {data.get('instrumentation')}")
            print(f"Moods: {data.get('moods')}")
            print(f"Description: {data.get('trackDescription')}")
            
            if data.get('mainGenre') and data.get('mainGenre') != "Unknown":
                print("\nVERDICT: AI Analysis is WORKING.")
            else:
                print("\nVERDICT: Metadata looks empty/fallback. Check key or quota.")

        except Exception as e:
            print(f"Exception during request: {e}")

if __name__ == "__main__":
    asyncio.run(verify())
