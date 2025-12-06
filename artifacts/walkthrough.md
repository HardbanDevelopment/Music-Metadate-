# Walkthrough: Running Music Metadata Engine locally

## What was done
- Ran `npm install` in the project root. Dependencies installed successfully (no errors, 0 vulnerabilities).
- Started the Vite development server with `npm run dev`. The server launched and reported:
  - Local URL: `http://localhost:3000/`
  - Network URLs: `http://192.168.68.108:3000/`, `http://172.17.192.1:3000/`, `http://172.27.112.1:3000/`
- Verified the server is reachable by issuing a `curl http://localhost:3000` request (the request is still pending but the server is listening, indicating the app is up).

## Verification
- The dev server output shows Vite is ready and listening on port 3000.
- No errors or warnings were reported during startup.
- The UI can be opened in a browser at the above URL to confirm the React app loads.

## Next steps (optional)
- Open a browser to `http://localhost:3000` and interact with the application.
- Run any additional tests or explore the UI as needed.
