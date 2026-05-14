# Airflow ATC

Airflow ATC is a Vite-powered Leaflet map focused on ATC Assistance with Montreal-Trudeau airport surface visualization. It renders KML-derived runways, taxiways, roads, center lines, holds, parking guidance, runway labels, and animated taxi traffic over a clipped imagery view.

## Features

- Direct rendering from `Media/Montreal YUL.kml`
- Grouped airfield layers for runways, taxiways, center lines, holds, roads, and parking lines
- Custom runway labeling based on KML runway names
- Zoom-responsive line styling for better readability at different scales
- Animated plane markers moving along taxiway geometry
- Interactive per-plane controls for runway assignment, speed changes, and aborting takeoff
- Scrollable left-side aircraft control rail with flight-number search
- Expanded live fleet with deterministic Airbus and Boeing model assignment
- Dark dashboard layout with a full-width map hero

## Project Structure

- `Index.html` — main app shell and dashboard markup
- `Script.js` — map setup, KML parsing, layer styling, labels, movement logic, and control wiring
- `AircraftCatalog.js` — commercial aircraft catalog and deterministic fleet model assignment helpers
- `Styles.css` — dashboard, map, overlay, and marker styling
- `Media/Montreal YUL.kml` — primary airport surface geometry source
- `Media/Plane Logo.png` — plane image used for taxi animation markers

## Requirements

- Node.js
- npm

## Install

```bash
npm install
```

## Run

```bash
npm run dev
```

Vite will start a local development server and print the local URL in the terminal.

## How It Works

The app imports the KML file as raw text, parses placemarks in the browser, classifies them by feature name, and draws them with Leaflet. Taxiway traffic is animated by projecting gate-adjacent starting positions onto taxiway geometry and moving plane markers along those routes.

The aircraft catalog is kept in `AircraftCatalog.js` so the Airbus and Boeing model list is maintained separately from the main map logic. `Script.js` imports those helpers and assigns models across the active fleet before spawning planes on parking stands.

The plane control system is available in two places:

- Hover popups directly on the map markers
- A persistent left-side control rail with one card per aircraft

Both surfaces expose the same live controls for runway assignment, speed adjustment, and aborting takeoff, and they stay synchronized with each plane's live movement state.

## Notes

- The visualization is tuned around Montreal-Trudeau (`YUL`) data in `Media/Montreal YUL.kml`.
- Styling and classification are intentionally customized for readability rather than strict aeronautical chart compliance.
- Plane marker size and line weights are zoom-sensitive and can be adjusted in `Script.js`.
- The commercial aircraft catalog can be expanded or reordered in `AircraftCatalog.js` without modifying the main animation code.