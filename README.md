# Airflow ATC

Airflow ATC is a Vite-powered Leaflet map focused on ATC Assistance with Montreal-Trudeau airport surface visualization. It renders KML-derived runways, taxiways, roads, center lines, holds, parking guidance, runway labels, and animated taxi traffic over a clipped imagery view.

## Features

- Direct rendering from `Media/Montreal YUL.kml`
- Grouped airfield layers for runways, taxiways, center lines, holds, roads, and parking lines
- Custom runway labeling based on KML runway names
- Zoom-responsive line styling for better readability at different scales
- Animated plane markers moving along taxiway geometry
- Dark dashboard layout with a full-width map hero

## Project Structure

- `index.html` — main app shell and dashboard markup
- `script.js` — map setup, KML parsing, layer styling, labels, and animation logic
- `styles.css` — dashboard, map, overlay, and marker styling
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

## Notes

- The visualization is tuned around Montreal-Trudeau (`YUL`) data in `Media/Montreal YUL.kml`.
- Styling and classification are intentionally customized for readability rather than strict aeronautical chart compliance.
- Plane marker size and line weights are zoom-sensitive and can be adjusted in `script.js`.