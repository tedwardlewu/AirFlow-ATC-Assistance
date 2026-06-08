import L from "leaflet";
import "leaflet/dist/leaflet.css";
import montrealYulKml from "./Media/Montreal YUL.kml?raw";
import planeLogo from "./Media/Plane Logo.png";
import { MajorAirlines } from "./AirlineCatalog.js";
import { AssignAircraftModels } from "./AircraftCatalog.js";
import { createPlaneArrivalOperations, createPlaneArrivalSpawner } from "./arrivals.js";
import { createPlaneDepartureOperations } from "./departures.js";

const airlineLogoModules = import.meta.glob("./Media/*.{png,jpg,jpeg,webp,svg}", {
    eager: true,
    import: "default"
});

const airlineLogoUrlByFile = Object.fromEntries(
    Object.entries(airlineLogoModules).map(([modulePath, assetUrl]) => [
        modulePath.split("/").at(-1),
        assetUrl
    ])
);

const airlineDetailsByCode = new Map(MajorAirlines.map((airline) => [airline.code, airline]));

const flightFeed = [
    { callsign: "ACA430", route: "YYZ -> YUL", status: "Taxi to 24R", gate: "52", eta: "12:08Z" },
    { callsign: "PAL201", route: "YQB -> YUL", status: "On short final 24L", gate: "57", eta: "12:12Z" },
    { callsign: "AFR344", route: "CDG -> YUL", status: "At international gate", gate: "63", eta: "Arrived" },
    { callsign: "UPS721", route: "SDF -> YUL", status: "Cargo stand inbound", gate: "Cargo", eta: "12:22Z" },
    { callsign: "ACA311", route: "YUL -> YVR", status: "Pushback approved", gate: "54", eta: "12:25Z" },
    { callsign: "DAL136", route: "MSP -> YUL", status: "Landing roll 24L", gate: "59", eta: "12:28Z" }
];

const gateFeed = [
    { gate: "52", carrier: "AC", aircraft: "A220-300", state: "Boarding", notes: "Domestic turn in progress" },
    { gate: "54", carrier: "AC", aircraft: "A321", state: "Pushback", notes: "Towbar connected" },
    { gate: "57", carrier: "PD", aircraft: "E195-E2", state: "Inbound", notes: "Stand lead-in active" },
    { gate: "59", carrier: "DL", aircraft: "A220-100", state: "Arrival", notes: "Gate crew in position" },
    { gate: "63", carrier: "AF", aircraft: "A350-900", state: "Turnaround", notes: "International services on stand" },
    { gate: "Cargo", carrier: "UPS", aircraft: "B767F", state: "Unload", notes: "Main deck transfer active" }
];

const vehicleFeed = [
    { id: "OPS-2", role: "Airfield Ops", zone: "Taxiway Alpha", task: "Flow monitoring", eta: "2 min" },
    { id: "FUEL-9", role: "Fuel Truck", zone: "Gate 52", task: "Refuel ACA430", eta: "On stand" },
    { id: "TUG-3", role: "Push Tug", zone: "Gate 54", task: "Pushback ACA311", eta: "Ready" },
    { id: "RAMP-5", role: "Ramp Bus", zone: "International pier", task: "Crew transfer", eta: "5 min" },
    { id: "DEICE-1", role: "De-ice", zone: "South pad", task: "Standby", eta: "Idle" },
    { id: "MED-2", role: "Medical", zone: "Terminal core", task: "Priority cover", eta: "Available" }
];

const advisoryFeed = [
    { title: "Alpha flow reduced", detail: "One departure holding short while an arrival clears the terminal crossing.", severity: "medium", stamp: "Updated 1 min ago" },
    { title: "24L arrivals stable", detail: "Spacing is smooth with moderate inbound demand from the east.", severity: "low", stamp: "Active now" },
    { title: "International pier busy", detail: "Two widebody turns overlap on the north face stands.", severity: "high", stamp: "Updated 3 min ago" },
    { title: "Cargo road open", detail: "Ground traffic restored after loader repositioning.", severity: "low", stamp: "Updated 5 min ago" }
];

const runwayFeed = [
    { name: "24R / 06L", mode: "Departures", status: "active" },
    { name: "24L / 06R", mode: "Arrivals", status: "busy" },
    { name: "South Apron", mode: "De-ice access", status: "caution" },
    { name: "Cargo North", mode: "Ramp flow", status: "active" }
];

const airportCenter = [45.4706, -73.7408];
const airportImageryBounds = [
    [45.4840, -73.7670],
    [45.4550, -73.7170]
];

const baseLandingSuccessRate = 0.95;
const weatherUpdateIntervalMs = 24000;
const weatherState = initWeather();

const gateMarkers = [
    { name: "Gate 52", coords: [45.4697, -73.7415], detail: "Domestic pier" },
    { name: "Gate 54", coords: [45.4692, -73.7431], detail: "Air Canada narrowbody stand" },
    { name: "Gate 57", coords: [45.4686, -73.7447], detail: "Regional swing gate" },
    { name: "Gate 63", coords: [45.4680, -73.7466], detail: "International contact stand" },
    { name: "Cargo North", coords: [45.4761, -73.7487], detail: "Freight apron" },
    { name: "South Pad", coords: [45.4623, -73.7319], detail: "De-ice and remote stand area" }
];

const gateAliases = new Map([
    ["Cargo", "Cargo North"]
]);

const gateNumberByLabel = new Map(
    [...new Set([
        ...flightFeed.map((flight) => normalizeGateLabel(flight.gate)),
        ...gateFeed.map((gate) => normalizeGateLabel(gate.gate)),
        ...gateMarkers.map((gateMarker) => normalizeGateLabel(gateMarker.name))
    ])]
        .filter(Boolean)
        .sort(compareGateLabels)
        .map((label, index) => [label, String(index + 1)])
);

    let nextGateNumber = gateNumberByLabel.size + 1;

function normalizeGateLabel(label) {
    const cleanedLabel = String(label ?? "").trim().replace(/^Gate\s+/i, "");
    return gateAliases.get(cleanedLabel) ?? cleanedLabel;
}

function compareGateLabels(leftLabel, rightLabel) {
    const leftIsNumeric = /^\d+$/.test(leftLabel);
    const rightIsNumeric = /^\d+$/.test(rightLabel);

    if (leftIsNumeric && rightIsNumeric) {
        return Number(leftLabel) - Number(rightLabel);
    }

    if (leftIsNumeric) {
        return -1;
    }

    if (rightIsNumeric) {
        return 1;
    }

    return leftLabel.localeCompare(rightLabel, undefined, { numeric: true, sensitivity: "base" });
}

function getGateNumber(label, fallbackNumber = null) {
    const normalizedLabel = normalizeGateLabel(label);

    if (!normalizedLabel) {
        return fallbackNumber === null ? String(nextGateNumber++) : String(fallbackNumber);
    }

    if (gateNumberByLabel.has(normalizedLabel)) {
        return gateNumberByLabel.get(normalizedLabel);
    }

    const allocatedGateNumber = String(nextGateNumber++);
    gateNumberByLabel.set(normalizedLabel, allocatedGateNumber);
    return allocatedGateNumber;
}

function formatGateZone(zone) {
    const normalizedZone = String(zone ?? "").trim();
    const gateMatch = normalizedZone.match(/^Gate\s+(.+)$/i);

    if (gateMatch) {
        return `Gate ${getGateNumber(gateMatch[1])}`;
    }

    return gateNumberByLabel.has(normalizeGateLabel(normalizedZone))
        ? `Gate ${getGateNumber(normalizedZone)}`
        : normalizedZone;
}

const surfaceRoutes = [
    {
        name: "Terminal Lead",
        points: [
            [45.4702, -73.7399],
            [45.4698, -73.7412],
            [45.4691, -73.7428],
            [45.4683, -73.7446],
            [45.4678, -73.7462]
        ]
    },
    {
        name: "Runway 24L Exit",
        points: [
            [45.4637, -73.7249],
            [45.4650, -73.7282],
            [45.4661, -73.7310],
            [45.4671, -73.7340],
            [45.4680, -73.7371]
        ]
    },
    {
        name: "Cargo Connector",
        points: [
            [45.4764, -73.7510],
            [45.4757, -73.7494],
            [45.4748, -73.7474],
            [45.4736, -73.7449],
            [45.4720, -73.7416]
        ]
    },
    {
        name: "South Pad Access",
        points: [
            [45.4619, -73.7318],
            [45.4633, -73.7335],
            [45.4649, -73.7357],
            [45.4664, -73.7376],
            [45.4680, -73.7395]
        ]
    }
];

const movingAssets = [
    {
        id: "ACA430",
        type: "plane",
        label: "ACA430",
        speed: 0.00003,
        popup: "Air Canada A220 taxiing for departure at YUL.",
        path: [
            [45.4695, -73.7426],
            [45.4689, -73.7409],
            [45.4683, -73.7388],
            [45.4675, -73.7362],
            [45.4668, -73.7336]
        ]
    },
    {
        id: "ACA311",
        type: "plane",
        label: "ACA311",
        speed: 0.000026,
        popup: "Air Canada departure pushing from the domestic concourse.",
        path: [
            [45.4690, -73.7443],
            [45.4685, -73.7429],
            [45.4679, -73.7411],
            [45.4672, -73.7390],
            [45.4663, -73.7363]
        ]
    },
    {
        id: "PAL201",
        type: "plane",
        label: "PAL201",
        speed: 0.000032,
        popup: "Regional arrival vacating the runway and joining apron flow.",
        path: [
            [45.4639, -73.7254],
            [45.4650, -73.7280],
            [45.4662, -73.7311],
            [45.4674, -73.7342],
            [45.4686, -73.7370]
        ]
    },
    {
        id: "OPS-2",
        type: "vehicle",
        label: "OPS-2",
        speed: 0.00005,
        popup: "Airfield operations truck monitoring the Alpha corridor.",
        path: [
            [45.4716, -73.7428],
            [45.4707, -73.7410],
            [45.4698, -73.7391],
            [45.4687, -73.7368],
            [45.4678, -73.7346]
        ]
    },
    {
        id: "TUG-3",
        type: "vehicle",
        label: "TUG-3",
        speed: 0.000055,
        popup: "Push tug cycling between domestic stands 52 and 54.",
        path: [
            [45.4699, -73.7420],
            [45.4695, -73.7429],
            [45.4692, -73.7438],
            [45.4695, -73.7430],
            [45.4699, -73.7420]
        ]
    },
    {
        id: "HOLD-A",
        type: "hold",
        label: "ALPHA HOLD",
        popup: "Temporary hold point near the terminal crossing.",
        path: [[45.4677, -73.7378]]
    }
];

const startupOccupancyRatio = 0.64;
const startupInboundShare = 0.08;
const startupOpenStandReserve = 4;
const arrivalSpawnIntervalMs = 60000;
const arrivalSpawnDistanceMeters = 15000;
const arrivalApproachLineColor = "#6cff9d";
const minimumArrivalRunwayExitProgress = 0.14;
const preferredArrivalRunwayExitProgress = 0.24;
const extendedArrivalRunwayExitProgress06R = 0.8;
const goAroundPatternStraightAheadMeters = 2400;
const goAroundPatternOuterRadiusMeters = 4200;
const goAroundPatternRadiusVarianceMeters = 1050;
const goAroundPatternRejoinLeadMeters = 2100;
const goAroundMaximumTurnDegrees = 18;
const goAroundTurnTrimDistanceMeters = 1500;
const goAroundOrbitSamples = 72;

function getDirectChildrenByName(element, name) {
    return Array.from(element.children).filter((child) => child.localName === name);
}

function getDirectChildText(element, name) {
    return getDirectChildrenByName(element, name)[0]?.textContent.trim() ?? "";
}

function parseCoordinateString(coordinateText) {
    return coordinateText
        .trim()
        .split(/\s+/)
        .map((point) => {
            const [lng, lat] = point.split(",").map(Number);
            return [lat, lng];
        })
        .filter(([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng));
}

function parseKmlColor(kmlColor, fallback) {
    if (!kmlColor || kmlColor.length !== 8) {
        return fallback;
    }

    const alpha = parseInt(kmlColor.slice(0, 2), 16) / 255;
    const blue = parseInt(kmlColor.slice(2, 4), 16);
    const green = parseInt(kmlColor.slice(4, 6), 16);
    const red = parseInt(kmlColor.slice(6, 8), 16);

    return {
        color: `rgb(${red}, ${green}, ${blue})`,
        opacity: Number.isFinite(alpha) ? alpha : fallback.opacity
    };
}

function parseKmlOverlay(kmlText) {
    const xml = new DOMParser().parseFromString(kmlText, "application/xml");
    const parserError = xml.querySelector("parsererror");

    if (parserError) {
        return { placemarks: [] };
    }

    const styles = new Map();
    const styleMaps = new Map();

    Array.from(xml.getElementsByTagNameNS("*", "Style")).forEach((styleElement) => {
        const styleId = styleElement.getAttribute("id");

        if (!styleId) {
            return;
        }

        const lineStyle = styleElement.getElementsByTagNameNS("*", "LineStyle")[0];
        const polyStyle = styleElement.getElementsByTagNameNS("*", "PolyStyle")[0];

        const lineColor = parseKmlColor(
            lineStyle?.getElementsByTagNameNS("*", "color")[0]?.textContent.trim(),
            { color: "rgb(82, 39, 0)", opacity: 0.75 }
        );
        const polyColor = parseKmlColor(
            polyStyle?.getElementsByTagNameNS("*", "color")[0]?.textContent.trim(),
            { color: "rgb(55, 64, 93)", opacity: 0.2 }
        );

        styles.set(styleId, {
            lineColor: lineColor.color,
            lineOpacity: lineColor.opacity,
            lineWidth: Number(lineStyle?.getElementsByTagNameNS("*", "width")[0]?.textContent.trim()) || 2,
            polyColor: polyColor.color,
            polyOpacity: polyColor.opacity
        });
    });

    Array.from(xml.getElementsByTagNameNS("*", "StyleMap")).forEach((styleMapElement) => {
        const styleMapId = styleMapElement.getAttribute("id");

        if (!styleMapId) {
            return;
        }

        const normalPair = Array.from(styleMapElement.getElementsByTagNameNS("*", "Pair")).find((pair) => {
            return pair.getElementsByTagNameNS("*", "key")[0]?.textContent.trim() === "normal";
        });

        const styleUrl = normalPair?.getElementsByTagNameNS("*", "styleUrl")[0]?.textContent.trim();

        if (styleUrl?.startsWith("#")) {
            styleMaps.set(styleMapId, styleUrl.slice(1));
        }
    });

    const placemarks = Array.from(xml.getElementsByTagNameNS("*", "Placemark")).map((placemarkElement, index) => {
        const rawStyleUrl = getDirectChildText(placemarkElement, "styleUrl").replace(/^#/, "");
        const resolvedStyleId = styleMaps.get(rawStyleUrl) ?? rawStyleUrl;
        const style = styles.get(resolvedStyleId) ?? {
            lineColor: "rgb(0, 124, 245)",
            lineOpacity: 0.8,
            lineWidth: 2,
            polyColor: "rgb(55, 64, 93)",
            polyOpacity: 0.18
        };

        const lines = Array.from(placemarkElement.getElementsByTagNameNS("*", "LineString"))
            .map((lineString) => parseCoordinateString(lineString.getElementsByTagNameNS("*", "coordinates")[0]?.textContent ?? ""))
            .filter((points) => points.length > 1);

        const polygons = Array.from(placemarkElement.getElementsByTagNameNS("*", "Polygon"))
            .map((polygon) => {
                const coordinates = polygon.getElementsByTagNameNS("*", "coordinates")[0]?.textContent ?? "";
                return parseCoordinateString(coordinates);
            })
            .filter((points) => points.length > 2);

        const points = Array.from(placemarkElement.getElementsByTagNameNS("*", "Point"))
            .map((pointElement) => parseCoordinateString(pointElement.getElementsByTagNameNS("*", "coordinates")[0]?.textContent ?? ""))
            .flat()
            .filter((point) => point.length === 2);

        return {
            id: placemarkElement.getAttribute("id") ?? `placemark-${index}`,
            name: getDirectChildText(placemarkElement, "name") || `Feature ${index + 1}`,
            style,
            lines,
            polygons,
            points
        };
    }).filter((placemark) => placemark.lines.length || placemark.polygons.length || placemark.points.length);

    return { placemarks };
}

function classifyKmlPlacemark(name) {
    const rawName = name.trim();
    const normalizedName = name.trim().toLowerCase();

    if (
        normalizedName.includes("center") ||
        normalizedName.includes("cente line") ||
        normalizedName.includes("centre")
    ) {
        return "centerlines";
    }

    if (/\b\d{2}[lrc]?\s*\/\s*\d{2}[lrc]?\b/.test(normalizedName)) {
        return "runways";
    }

    if (normalizedName.includes("hold")) {
        return "holds";
    }

    if (normalizedName.includes("road")) {
        return "roads";
    }

    if (normalizedName.includes("taxiway")) {
        return "taxiways";
    }

    if (/^\d{1,2}[lrc]?$/i.test(normalizedName)) {
        return "other";
    }

    return "other";
}

function getCategoryPresentation(category, style) {
    const presentations = {
        runways: {
            label: "Runways",
            color: "#c3d0db",
            fillColor: "#c3d0db",
            pointRadius: 4,
            lineWeight: 7,
            lineCap: "butt",
            lineJoin: "miter"
        },
        taxiways: {
            label: "Taxiways",
            color: "#c79b48",
            fillColor: "#c79b48",
            pointRadius: 3,
            lineWeight: 3.5,
            lineCap: "round",
            lineJoin: "round"
        },
        holds: {
            label: "Holds",
            color: "#8e24aa",
            fillColor: "#8e24aa",
            pointRadius: 4,
            lineWeight: 3,
            lineCap: "round",
            lineJoin: "round"
        },
        roads: {
            label: "Roads",
            color: "#b56d24",
            fillColor: "#b56d24",
            pointRadius: 4,
            lineWeight: 3,
            lineCap: "round",
            lineJoin: "round"
        },
        centerlines: {
            label: "Center Lines",
            color: "#000000",
            fillColor: "#000000",
            pointRadius: 3,
            lineWeight: 3.25,
            lineCap: "butt",
            lineJoin: "round"
        },
        other: {
            label: "Parking Lines",
            color: "#4e94b8",
            fillColor: "#4e94b8",
            pointRadius: 3,
            lineWeight: 2.25,
            lineCap: "butt",
            lineJoin: "miter"
        }
    };

    return presentations[category];
}

function getZoomScaledLineWeight(baseWeight, zoom, minScale = 0.06, minWeight = 0.2) {
    const minZoom = 12;
    const maxZoom = 19;
    const zoomRatio = Math.min(Math.max((zoom - minZoom) / (maxZoom - minZoom), 0), 1);
    const effectiveMinScale = Math.max(minScale, 0.72);
    const effectiveMinWeight = Math.max(minWeight, baseWeight * effectiveMinScale);
    const easedZoomRatio = Math.pow(zoomRatio, 1.35);
    const scale = effectiveMinScale + (easedZoomRatio * (1 - effectiveMinScale));

    return Math.max(baseWeight * scale, effectiveMinWeight);
}

const yulKmlOverlay = parseKmlOverlay(montrealYulKml);

function createDivIcon(type, label) {
    const iconText = type === "plane" ? "✈" : type === "vehicle" ? "▣" : "!";

    return L.divIcon({
        className: "",
        html: `
            <div class="map-marker ${type}">
                <span class="map-marker-icon">${iconText}</span>
                <span class="map-marker-label">${label}</span>
            </div>
        `,
        iconSize: [110, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -14]
    });
}

function renderClock() {
    const clock = document.getElementById("clock");
    const stamp = new Date().toISOString().slice(11, 19) + "Z";
    clock.textContent = stamp;
}

function clampNumber(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function formatPercent(value) {
    return `${Math.round(value * 100)}%`;
}

function initWeather() {
    return {
        category: "VFR",
        windDirection: 260,
        windSpeedKnots: 9,
        gustKnots: 12,
        visibilityKm: 12,
        precipitation: "Dry",
        precipitationRate: 0,
        temperatureC: 17,
        humidityPercent: 58,
        landingSuccessRate: baseLandingSuccessRate,
        goAroundRate: 1 - baseLandingSuccessRate,
        updatedAt: Date.now()
    };
}

function pickWeather(roll) {
    if (roll < 0.52) {
        return {
            category: "VFR",
            windSpeedKnots: 7 + Math.round(Math.random() * 7),
            gustExtraKnots: 1 + Math.round(Math.random() * 4),
            visibilityKm: 10 + Math.round(Math.random() * 8),
            precipitation: "Dry",
            precipitationRate: 0
        };
    }

    if (roll < 0.77) {
        return {
            category: "VFR",
            windSpeedKnots: 12 + Math.round(Math.random() * 8),
            gustExtraKnots: 4 + Math.round(Math.random() * 7),
            visibilityKm: 8 + Math.round(Math.random() * 6),
            precipitation: "Light rain",
            precipitationRate: 0.4
        };
    }

    if (roll < 0.92) {
        return {
            category: "MVFR",
            windSpeedKnots: 18 + Math.round(Math.random() * 11),
            gustExtraKnots: 8 + Math.round(Math.random() * 9),
            visibilityKm: 5 + Math.round(Math.random() * 4),
            precipitation: "Moderate rain",
            precipitationRate: 0.7
        };
    }

    return {
        category: "IFR",
        windSpeedKnots: 26 + Math.round(Math.random() * 15),
        gustExtraKnots: 10 + Math.round(Math.random() * 12),
        visibilityKm: 2 + Math.round(Math.random() * 3),
        precipitation: Math.random() < 0.25 ? "Heavy rain" : "Showers",
        precipitationRate: 1
    };
}

function syncWeather() {
    const preset = pickWeather(Math.random());
    const windDirectionBase = 220 + Math.round(Math.random() * 95);
    const windDirectionJitter = Math.round((Math.random() - 0.5) * 12);
    const windDirection = ((windDirectionBase + windDirectionJitter) + 360) % 360;
    const windSpeedKnots = preset.windSpeedKnots;
    const gustKnots = windSpeedKnots + preset.gustExtraKnots;
    const temperatureC = Math.round(14 + (Math.random() * 12) - (preset.precipitationRate * 4));
    const humidityPercent = Math.round(clampNumber(52 + (preset.precipitationRate * 30) + ((gustKnots - windSpeedKnots) * 1.8), 45, 96));
    const crosswindFactor = clampNumber((windSpeedKnots - 12) / 30, 0, 1);
    const gustFactor = clampNumber((gustKnots - windSpeedKnots) / 18, 0, 1);
    const rainFactor = preset.precipitationRate;
    const visibilityFactor = clampNumber((10 - preset.visibilityKm) / 10, 0, 1);
    const penalty = (crosswindFactor * 0.16)
        + (gustFactor * 0.09)
        + (rainFactor * 0.1)
        + (visibilityFactor * 0.06);
    const landingSuccessRate = clampNumber(baseLandingSuccessRate - penalty, 0.65, 0.98);

    weatherState.category = preset.category;
    weatherState.windDirection = windDirection;
    weatherState.windSpeedKnots = windSpeedKnots;
    weatherState.gustKnots = gustKnots;
    weatherState.visibilityKm = preset.visibilityKm;
    weatherState.precipitation = preset.precipitation;
    weatherState.precipitationRate = preset.precipitationRate;
    weatherState.temperatureC = temperatureC;
    weatherState.humidityPercent = humidityPercent;
    weatherState.landingSuccessRate = landingSuccessRate;
    weatherState.goAroundRate = 1 - landingSuccessRate;
    weatherState.updatedAt = Date.now();
}

function renderWeather() {
    const weatherCallout = document.querySelector(".map-callout.weather");
    const wxSum = document.getElementById("wx-sum");
    const wxWind = document.getElementById("wx-wind");
    const wxTemp = document.getElementById("wx-temp");
    const wxHumid = document.getElementById("wx-humid");

    if (weatherCallout) {
        const title = weatherCallout.querySelector("strong");
        const detail = weatherCallout.querySelector("small");

        if (title) {
            title.textContent = `${weatherState.category} · Landing ${formatPercent(weatherState.landingSuccessRate)}`;
        }

        if (detail) {
            detail.textContent = `Wind ${String(weatherState.windDirection).padStart(3, "0")}@${weatherState.windSpeedKnots}kt G${weatherState.gustKnots} · ${weatherState.precipitation} · Vis ${weatherState.visibilityKm}km`;
        }
    }

    if (wxSum) {
        wxSum.textContent = `Weather ${weatherState.category} ${weatherState.precipitation}`;
    }

    if (wxWind) {
        wxWind.textContent = `Wind ${String(weatherState.windDirection).padStart(3, "0")}@${weatherState.windSpeedKnots}kt G${weatherState.gustKnots}`;
    }

    if (wxTemp) {
        wxTemp.textContent = `Temp ${weatherState.temperatureC} C`;
    }

    if (wxHumid) {
        wxHumid.textContent = `Humidity ${weatherState.humidityPercent}%`;
    }
}

function renderFlights() {
    const flightTable = document.getElementById("flight-table");
    flightTable.innerHTML = flightFeed.map((flight) => `
        <article class="table-row">
            <div class="table-row-main">
                <span class="table-head">Callsign</span>
                <strong>${flight.callsign}</strong>
                <small class="mono">${flight.route}</small>
            </div>
            <div class="table-row-block">
                <span class="table-head">Status</span>
                <strong class="table-inline-value">${flight.status}</strong>
            </div>
            <div class="table-row-block table-row-block-end">
                <span class="table-head">Gate</span>
                <strong>${getGateNumber(flight.gate)}</strong>
                <small class="mono">${flight.eta}</small>
            </div>
        </article>
    `).join("");
}

function renderGates() {
    const gateGrid = document.getElementById("gate-grid");
    gateGrid.innerHTML = gateFeed.map((gate) => `
        <article class="gate-card">
            <span class="status-label">Gate ${getGateNumber(gate.gate)}</span>
            <strong>${gate.carrier}</strong>
            <small class="gate-aircraft">${gate.aircraft}</small>
            <div class="gate-card-footer">
                <span class="gate-state-pill">${gate.state}</span>
                <small class="mono">${gate.notes}</small>
            </div>
        </article>
    `).join("");
}

function renderVehicles() {
    const vehicleList = document.getElementById("vehicle-list");
    vehicleList.innerHTML = vehicleFeed.map((vehicle) => `
        <article class="vehicle-card">
            <div class="vehicle-card-main">
                <span class="status-label">${vehicle.id}</span>
                <strong>${vehicle.role}</strong>
                <small>${vehicle.task}</small>
            </div>
            <div class="vehicle-meta">
                <span class="status-label">Current Zone</span>
                <strong>${formatGateZone(vehicle.zone)}</strong>
                <small class="mono">${vehicle.eta}</small>
            </div>
        </article>
    `).join("");
}

function renderAdvisories() {
    const advisoryStack = document.getElementById("advisory-stack");
    advisoryStack.innerHTML = advisoryFeed.map((advisory) => `
        <article class="advisory-card">
            <div class="advisory-card-main">
                <span class="status-label">Advisory</span>
                <strong>${advisory.title}</strong>
                <small>${advisory.detail}</small>
            </div>
            <div class="advisory-meta">
                <span class="severity ${advisory.severity}">${advisory.severity}</span>
                <small>${advisory.stamp}</small>
            </div>
        </article>
    `).join("");
}

function renderRunways() {
    const runwayStrip = document.getElementById("runway-strip");
    runwayStrip.innerHTML = runwayFeed.map((runway) => `
        <article class="runway-card">
            <div>
                <span class="status-label">Runway</span>
                <strong>${runway.name}</strong>
                <small class="mono">${runway.mode}</small>
            </div>
            <span class="status-pill ${runway.status}">${runway.status}</span>
        </article>
    `).join("");
}

function interpolatePath(points, progress) {
    if (points.length === 1) {
        return { lat: points[0][0], lng: points[0][1] };
    }

    const segments = points.length - 1;
    const segmentProgress = progress * segments;
    const startIndex = Math.min(Math.floor(segmentProgress), segments - 1);
    const localProgress = segmentProgress - startIndex;
    const [startLat, startLng] = points[startIndex];
    const [endLat, endLng] = points[startIndex + 1];

    return {
        lat: startLat + (endLat - startLat) * localProgress,
        lng: startLng + (endLng - startLng) * localProgress
    };
}

function measurePolylineLength(points) {
    let total = 0;

    for (let index = 0; index < points.length - 1; index += 1) {
        const [startLat, startLng] = points[index];
        const [endLat, endLng] = points[index + 1];
        const deltaLat = endLat - startLat;
        const deltaLng = endLng - startLng;
        total += Math.hypot(deltaLat, deltaLng);
    }

    return total;
}

function createRouteProfile(points) {
    if (points.length < 2) {
        return {
            points,
            totalLength: 0,
            segments: []
        };
    }

    const segments = [];
    let totalLength = 0;

    for (let index = 0; index < points.length - 1; index += 1) {
        const start = points[index];
        const end = points[index + 1];
        const segmentLength = Math.hypot(end[0] - start[0], end[1] - start[1]);

        if (!segmentLength) {
            continue;
        }

        segments.push({
            start,
            end,
            startDistance: totalLength,
            endDistance: totalLength + segmentLength,
            length: segmentLength
        });
        totalLength += segmentLength;
    }

    return {
        points,
        totalLength,
        segments
    };
}

function interpolateRouteProfile(routeProfile, progress) {
    if (!routeProfile.totalLength || !routeProfile.segments.length) {
        const [lat, lng] = routeProfile.points[0] ?? [0, 0];
        return { lat, lng };
    }

    const targetDistance = Math.min(Math.max(progress, 0), 0.999999) * routeProfile.totalLength;
    const segment = routeProfile.segments.find((entry) => targetDistance <= entry.endDistance) ?? routeProfile.segments.at(-1);
    const localDistance = targetDistance - segment.startDistance;
    const localProgress = segment.length ? localDistance / segment.length : 0;

    return {
        lat: segment.start[0] + ((segment.end[0] - segment.start[0]) * localProgress),
        lng: segment.start[1] + ((segment.end[1] - segment.start[1]) * localProgress)
    };
}

function projectPointOnSegment(point, start, end) {
    const segmentLat = end[0] - start[0];
    const segmentLng = end[1] - start[1];
    const segmentLengthSquared = (segmentLat ** 2) + (segmentLng ** 2);

    if (!segmentLengthSquared) {
        return { point: start, distanceSquared: Infinity, projectionFactor: 0 };
    }

    const pointLat = point[0] - start[0];
    const pointLng = point[1] - start[1];
    const rawProjectionFactor = ((pointLat * segmentLat) + (pointLng * segmentLng)) / segmentLengthSquared;
    const projectionFactor = Math.min(Math.max(rawProjectionFactor, 0), 1);
    const projectedPoint = [
        start[0] + (segmentLat * projectionFactor),
        start[1] + (segmentLng * projectionFactor)
    ];
    const deltaLat = point[0] - projectedPoint[0];
    const deltaLng = point[1] - projectedPoint[1];

    return {
        point: projectedPoint,
        distanceSquared: (deltaLat ** 2) + (deltaLng ** 2),
        projectionFactor
    };
}

function getPointDistanceSquared(start, end) {
    const deltaLat = start[0] - end[0];
    const deltaLng = start[1] - end[1];
    return (deltaLat ** 2) + (deltaLng ** 2);
}

function getLatLngDistanceSquared(start, end) {
    const deltaLat = start.lat - end.lat;
    const deltaLng = start.lng - end.lng;
    return (deltaLat ** 2) + (deltaLng ** 2);
}

function getLinePoints(entry) {
    return Array.isArray(entry) ? entry : entry.linePoints;
}

function shuffleItems(items) {
    const shuffledItems = [...items];

    for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [shuffledItems[index], shuffledItems[swapIndex]] = [shuffledItems[swapIndex], shuffledItems[index]];
    }

    return shuffledItems;
}

function dedupeRoutePoints(points) {
    return points.reduce((route, point) => {
        if (!point) {
            return route;
        }

        if (!route.length || getPointDistanceSquared(route.at(-1), point) > 1e-12) {
            route.push(point);
        }

        return route;
    }, []);
}

function buildBridgeRoute(start, end) {
    if (!start || !end) {
        return [];
    }

    if (getPointDistanceSquared(start, end) <= 1e-12) {
        return [start];
    }

    return [start, end];
}

function getPointKey(point) {
    return `${point[0].toFixed(7)},${point[1].toFixed(7)}`;
}

function getNearestGateMarker(point) {
    if (!gateMarkers.length) {
        return null;
    }

    return gateMarkers.reduce((nearestGate, gateMarker) => {
        const gateDistanceSquared = getPointDistanceSquared(point, gateMarker.coords);

        if (!nearestGate || gateDistanceSquared < nearestGate.distanceSquared) {
            return { gateMarker, distanceSquared: gateDistanceSquared };
        }

        return nearestGate;
    }, null)?.gateMarker ?? null;
}

function createStartupTraffic(parkingEntries, runwayEntries, occupancyRatio = startupOccupancyRatio, inboundShare = startupInboundShare) {
    const shuffledParkingEntries = shuffleItems(parkingEntries);
    const uncappedTargetPlaneCount = Math.max(
        1,
        Math.min(shuffledParkingEntries.length, Math.floor(shuffledParkingEntries.length * occupancyRatio))
    );
    const targetPlaneCount = Math.max(
        1,
        Math.min(uncappedTargetPlaneCount, Math.max(shuffledParkingEntries.length - startupOpenStandReserve, 1))
    );
    const inboundPlaneCount = runwayEntries.length && targetPlaneCount > 1 && inboundShare > 0
        ? Math.max(1, Math.min(targetPlaneCount - 1, Math.round(targetPlaneCount * inboundShare)))
        : 0;
    const departurePlaneCount = targetPlaneCount - inboundPlaneCount;
    const departurePlanes = shuffledParkingEntries.slice(0, departurePlaneCount).map((parkingEntry, index) => {
        const standPoint = interpolatePath(getLinePoints(parkingEntry), 0.5);
        const nearestGate = getNearestGateMarker(standPoint);
        const gateLabel = getGateNumber(nearestGate?.name, index + 1);

        return {
            callsign: `FLT${String(index + 1).padStart(3, "0")}`,
            gate: gateLabel,
            gateCoords: nearestGate?.coords ?? standPoint,
            preferredParkingId: parkingEntry.id,
            operationType: "departure",
            speed: 0.0042 + (Math.random() * 0.0018)
        };
    });

    const arrivalPlanes = shuffledParkingEntries
        .slice(departurePlaneCount, departurePlaneCount + inboundPlaneCount)
        .map((parkingEntry, index) => {
            const standPoint = interpolatePath(getLinePoints(parkingEntry), 0.5);
            const nearestGate = getNearestGateMarker(standPoint);
            const gateLabel = getGateNumber(nearestGate?.name, departurePlaneCount + index + 1);
            const runwayEntry = runwayEntries[index % runwayEntries.length];
            const arrivalProgress = index % 2 === 0 ? 0.08 : 0.92;
            const arrivalPoint = interpolatePath(runwayEntry.linePoints, arrivalProgress);

            return {
                callsign: `FLT${String(departurePlaneCount + index + 1).padStart(3, "0")}`,
                gate: gateLabel,
                gateCoords: nearestGate?.coords ?? standPoint,
                preferredParkingId: parkingEntry.id,
                operationType: "arrival",
                arrivalOrigin: [arrivalPoint.lat, arrivalPoint.lng],
                arrivalRunwayName: runwayEntry.name,
                speed: 0.0043 + (Math.random() * 0.0014)
            };
        });

    const basePlanes = [...departurePlanes, ...arrivalPlanes];

    return AssignAircraftModels(basePlanes).map((plane, index) => {
        const numericSuffix = 100 + ((Math.floor(Math.random() * 900) + (index * 37)) % 900);

        return {
            ...plane,
            callsign: `${plane.airlineCode}${numericSuffix}`
        };
    });
}

function connectGraphNodes(graphNodes, start, end) {
    const startKey = getPointKey(start);
    const endKey = getPointKey(end);

    if (startKey === endKey) {
        return;
    }

    const distance = Math.hypot(end[0] - start[0], end[1] - start[1]);

    if (!distance) {
        return;
    }

    const startNode = graphNodes.get(startKey) ?? { point: start, neighbors: new Map() };
    const endNode = graphNodes.get(endKey) ?? { point: end, neighbors: new Map() };
    const existingForward = startNode.neighbors.get(endKey);
    const existingReverse = endNode.neighbors.get(startKey);

    if (existingForward == null || distance < existingForward) {
        startNode.neighbors.set(endKey, distance);
    }

    if (existingReverse == null || distance < existingReverse) {
        endNode.neighbors.set(startKey, distance);
    }

    graphNodes.set(startKey, startNode);
    graphNodes.set(endKey, endNode);
}

function buildPolylineGraph(lineGroups) {
    const graphNodes = new Map();

    lineGroups.forEach((linePoints) => {
        for (let index = 0; index < linePoints.length - 1; index += 1) {
            connectGraphNodes(graphNodes, linePoints[index], linePoints[index + 1]);
        }
    });

    const graphNodeList = [...graphNodes.values()];

    for (let leftIndex = 0; leftIndex < graphNodeList.length; leftIndex += 1) {
        const leftNode = graphNodeList[leftIndex];

        for (let rightIndex = leftIndex + 1; rightIndex < graphNodeList.length; rightIndex += 1) {
            const rightNode = graphNodeList[rightIndex];

            if (getPointDistanceSquared(leftNode.point, rightNode.point) <= 2.5e-10) {
                connectGraphNodes(graphNodes, leftNode.point, rightNode.point);
            }
        }
    }

    return graphNodes;
}

function findShortestGraphPath(graphNodes, startKey, endKey) {
    if (!graphNodes.has(startKey) || !graphNodes.has(endKey)) {
        return null;
    }

    const frontier = [{ key: startKey, distance: 0 }];
    const distances = new Map([[startKey, 0]]);
    const previousKeys = new Map();
    const visited = new Set();

    while (frontier.length) {
        frontier.sort((left, right) => left.distance - right.distance);
        const current = frontier.shift();

        if (!current || visited.has(current.key)) {
            continue;
        }

        if (current.key === endKey) {
            break;
        }

        visited.add(current.key);
        const currentNode = graphNodes.get(current.key);

        currentNode?.neighbors.forEach((weight, neighborKey) => {
            if (visited.has(neighborKey)) {
                return;
            }

            const nextDistance = current.distance + weight;

            if (nextDistance >= (distances.get(neighborKey) ?? Infinity)) {
                return;
            }

            distances.set(neighborKey, nextDistance);
            previousKeys.set(neighborKey, current.key);
            frontier.push({ key: neighborKey, distance: nextDistance });
        });
    }

    if (!distances.has(endKey)) {
        return null;
    }

    const pathKeys = [];
    let currentKey = endKey;

    while (currentKey) {
        pathKeys.push(currentKey);

        if (currentKey === startKey) {
            break;
        }

        currentKey = previousKeys.get(currentKey);
    }

    if (pathKeys.at(-1) !== startKey) {
        return null;
    }

    return pathKeys.reverse().map((key) => graphNodes.get(key)?.point).filter(Boolean);
}

function buildGraphRouteBetweenMatches(graphNodes, startMatch, endMatch) {
    if (!graphNodes || !startMatch || !endMatch) {
        return null;
    }

    const startEndpoints = [
        startMatch.linePoints[startMatch.segmentIndex],
        startMatch.linePoints[startMatch.segmentIndex + 1]
    ];
    const endEndpoints = [
        endMatch.linePoints[endMatch.segmentIndex],
        endMatch.linePoints[endMatch.segmentIndex + 1]
    ];
    let bestRoute = null;

    startEndpoints.forEach((startEndpoint) => {
        endEndpoints.forEach((endEndpoint) => {
            const graphPath = findShortestGraphPath(
                graphNodes,
                getPointKey(startEndpoint),
                getPointKey(endEndpoint)
            );

            if (!graphPath?.length) {
                return;
            }

            const route = dedupeRoutePoints([
                startMatch.projectedPoint,
                startEndpoint,
                ...graphPath,
                endEndpoint,
                endMatch.projectedPoint
            ]);
            const distance = measurePolylineLength(route);

            if (!bestRoute || distance < bestRoute.distance) {
                bestRoute = { route, distance };
            }
        });
    });

    return bestRoute?.route ?? null;
}

function getBestLineMatch(origin, entry) {
    const linePoints = getLinePoints(entry);

    if (!linePoints || linePoints.length < 2) {
        return null;
    }

    let bestMatch = null;

    for (let index = 0; index < linePoints.length - 1; index += 1) {
        const projection = projectPointOnSegment(origin, linePoints[index], linePoints[index + 1]);

        if (!bestMatch || projection.distanceSquared < bestMatch.distanceSquared) {
            bestMatch = {
                entry,
                linePoints,
                segmentIndex: index,
                projectedPoint: projection.point,
                distanceSquared: projection.distanceSquared
            };
        }
    }

    return bestMatch;
}

function findLineMatches(origin, entries) {
    return entries
        .map((entry) => getBestLineMatch(origin, entry))
        .filter(Boolean)
        .sort((left, right) => left.distanceSquared - right.distanceSquared);
}

function findNearestLineMatch(origin, entries) {
    return findLineMatches(origin, entries)[0] ?? null;
}

function getNearestLineDistanceSquared(point, entries) {
    return findNearestLineMatch(point, entries)?.distanceSquared ?? Infinity;
}

function orientParkingPushbackRoute(linePoints, taxiwayLines) {
    if (linePoints.length < 2) {
        return null;
    }

    const firstEndpointDistance = getNearestLineDistanceSquared(linePoints[0], taxiwayLines);
    const lastEndpointDistance = getNearestLineDistanceSquared(linePoints.at(-1), taxiwayLines);

    return firstEndpointDistance <= lastEndpointDistance
        ? [...linePoints].reverse()
        : [...linePoints];
}

function buildRunwayDepartureRoute(runwayMatch) {
    const forwardRoute = [
        runwayMatch.projectedPoint,
        ...runwayMatch.linePoints.slice(runwayMatch.segmentIndex + 1)
    ];
    const reverseRoute = [
        runwayMatch.projectedPoint,
        ...runwayMatch.linePoints.slice(0, runwayMatch.segmentIndex + 1).reverse()
    ];
    const chosenRoute = measurePolylineLength(forwardRoute) >= measurePolylineLength(reverseRoute)
        ? forwardRoute
        : reverseRoute;

    if (chosenRoute.length < 2) {
        return null;
    }

    const runwayEnd = chosenRoute.at(-1);
    const runwayPreEnd = chosenRoute.at(-2) ?? chosenRoute[0];
    const exitPoint = [
        runwayEnd[0] + ((runwayEnd[0] - runwayPreEnd[0]) * 0.45),
        runwayEnd[1] + ((runwayEnd[1] - runwayPreEnd[1]) * 0.45)
    ];

    return {
        route: dedupeRoutePoints([...chosenRoute, exitPoint]),
        runwayName: runwayMatch.entry.name ?? "Departure Runway"
    };
}

function buildTaxiRouteToRunway(origin, taxiwayLines, runwayEntries, surfaceRouteGraph, runwayPreference = 0, preferredRunwayName = null, taxiwayRouteGraph = surfaceRouteGraph) {
    const routeOptions = [];
    const candidateRunwayEntries = preferredRunwayName
        ? runwayEntries.filter((entry) => entry.name === preferredRunwayName)
        : runwayEntries;
    const runwayTargets = candidateRunwayEntries.map((entry) => {
        const threshold = getDepartureRunwayThreshold(entry);
        const runwayMatch = threshold ? getBestLineMatch(threshold.point, entry) : null;
        const runwayEntryCandidate = threshold ? getDepartureRunwayEntryCandidate(entry, threshold.point, taxiwayLines) : null;

        if (!threshold || !runwayMatch) {
            return null;
        }

        return {
            threshold,
            runwayMatch,
            runwayEntryCandidate
        };
    }).filter(Boolean);

    if (!runwayTargets.length) {
        return null;
    }

    findLineMatches(origin, taxiwayLines)
        .slice(0, 8)
        .forEach((taxiMatch) => {
            runwayTargets.forEach(({ runwayMatch, runwayEntryCandidate }) => {
                const runwaySurfaceCandidate = runwayEntryCandidate;
                const taxiwayOnlyRoute = runwaySurfaceCandidate
                    ? buildGraphRouteBetweenMatches(taxiwayRouteGraph, taxiMatch, runwaySurfaceCandidate.taxiwayMatch)
                    : null;
                if (runwaySurfaceCandidate && !taxiwayOnlyRoute?.length) {
                    return;
                }
                const runwayEntryBridge = runwaySurfaceCandidate && taxiwayOnlyRoute?.length
                    ? dedupeRoutePoints([
                        ...buildBridgeRoute(runwaySurfaceCandidate.taxiwayMatch.projectedPoint, runwaySurfaceCandidate.runwayEntryPoint),
                        ...buildBridgeRoute(runwaySurfaceCandidate.runwayEntryPoint, runwayMatch.projectedPoint)
                    ])
                    : [];
                const taxiRoute = taxiwayOnlyRoute?.length
                    ? dedupeRoutePoints([...taxiwayOnlyRoute, ...runwayEntryBridge])
                    : buildGraphRouteBetweenMatches(surfaceRouteGraph, taxiMatch, runwayMatch);
                const runwayDeparture = buildRunwayDepartureRoute(runwayMatch);

                if (!taxiRoute?.length || !runwayDeparture) {
                    return;
                }

                routeOptions.push({
                    score: (taxiMatch.distanceSquared * 3500) + (measurePolylineLength(taxiRoute) * 0.12),
                    taxiMatch,
                    taxiRoute,
                    runwayMatch,
                    runwayRoute: runwayDeparture.route,
                    runwayName: runwayDeparture.runwayName
                });
            });
        });

    if (!routeOptions.length) {
        return null;
    }

    routeOptions.sort((left, right) => left.score - right.score);

    const routePoolSize = Math.max(1, Math.min(routeOptions.length, 2));
    return routeOptions[Math.min(runwayPreference % routePoolSize, routeOptions.length - 1)];
}

function getRouteProgressForPoint(routeProfile, point) {
    if (!routeProfile.totalLength || !routeProfile.segments.length) {
        return { progress: 0, distanceSquared: Infinity };
    }

    let bestMatch = null;

    routeProfile.segments.forEach((segment) => {
        const projection = projectPointOnSegment(point, segment.start, segment.end);
        const distanceAlongSegment = projection.projectionFactor * segment.length;
        const progress = (segment.startDistance + distanceAlongSegment) / routeProfile.totalLength;

        if (!bestMatch || projection.distanceSquared < bestMatch.distanceSquared) {
            bestMatch = {
                progress,
                distanceSquared: projection.distanceSquared
            };
        }
    });

    return bestMatch ?? { progress: 0, distanceSquared: Infinity };
}

function getHoldProgress(routeProfile, holdEntries, runwayStart) {
    const bestHold = holdEntries.reduce((closestHold, holdEntry) => {
        const holdMatch = holdEntry.linePoints.reduce((bestPointMatch, holdPoint) => {
            const pointMatch = getRouteProgressForPoint(routeProfile, holdPoint);
            return !bestPointMatch || pointMatch.distanceSquared < bestPointMatch.distanceSquared
                ? pointMatch
                : bestPointMatch;
        }, null);

        if (!holdMatch) {
            return closestHold;
        }

        if (!closestHold || holdMatch.distanceSquared < closestHold.distanceSquared) {
            return holdMatch;
        }

        return closestHold;
    }, null);

    if (!bestHold || bestHold.distanceSquared > 8e-7) {
        return Math.max(runwayStart - 0.03, 0.05);
    }

    return Math.max(Math.min(bestHold.progress - 0.006, runwayStart - 0.008), 0.05);
}

function getRunwayStartProgress(routeProfile, runwayMatch, fallbackRunwayStart) {
    if (!routeProfile?.totalLength || !runwayMatch) {
        return fallbackRunwayStart;
    }

    const runwayPoints = dedupeRoutePoints([
        runwayMatch.projectedPoint,
        ...runwayMatch.linePoints
    ]);
    const earliestRunwayProgress = runwayPoints.reduce((bestProgress, runwayPoint) => {
        const pointMatch = getRouteProgressForPoint(routeProfile, runwayPoint);

        if (!Number.isFinite(pointMatch.distanceSquared) || pointMatch.distanceSquared > 1e-9) {
            return bestProgress;
        }

        return Math.min(bestProgress, pointMatch.progress);
    }, fallbackRunwayStart);

    return Math.min(Math.max(earliestRunwayProgress, 0), 0.98);
}

function buildDirectDepartureRoute(origin, taxiwayLines, runwayEntries, holdEntries, surfaceRouteGraph, taxiwayRouteGraph, runwayPreference = 0, preferredRunwayName = null) {
    const taxiSelection = buildTaxiRouteToRunway(origin, taxiwayLines, runwayEntries, surfaceRouteGraph, runwayPreference, preferredRunwayName, taxiwayRouteGraph);

    if (!taxiSelection) {
        return null;
    }

    const taxiJoinRoute = buildBridgeRoute(origin, taxiSelection.taxiMatch.projectedPoint);
    const route = dedupeRoutePoints([
        ...taxiJoinRoute,
        ...taxiSelection.taxiRoute,
        ...taxiSelection.runwayRoute
    ]);
    const totalLength = measurePolylineLength(route);

    if (route.length < 2 || !totalLength) {
        return null;
    }

    const routeProfile = createRouteProfile(route);
    const fallbackRunwayStartDistance = measurePolylineLength(taxiJoinRoute)
        + measurePolylineLength(taxiSelection.taxiRoute);
    const fallbackRunwayStart = Math.min(fallbackRunwayStartDistance / totalLength, 0.98);
    const runwayStart = getRunwayStartProgress(routeProfile, taxiSelection.runwayMatch, fallbackRunwayStart);
    const holdProgress = getHoldProgress(routeProfile, holdEntries, runwayStart);

    return {
        route,
        parkingId: null,
        parkingName: "Direct Taxi",
        runwayName: taxiSelection.runwayName,
        pushbackEnd: 0,
        holdProgress,
        runwayStart
    };
}

function resolveParkingStand(origin, parkingEntries, taxiwayLines, reservedParkingIds = new Set(), preferredParkingId = null) {
    const parkingMatches = findLineMatches(origin, parkingEntries);
    const parkingMatch = parkingMatches.find((match) => match.entry.id === preferredParkingId)
        ?? parkingMatches.find((match) => !reservedParkingIds.has(match.entry.id))
        ?? parkingMatches[0]
        ?? null;

    if (!parkingMatch) {
        return null;
    }

    const parkingRoute = orientParkingPushbackRoute(parkingMatch.linePoints, taxiwayLines);

    if (!parkingRoute?.length) {
        return null;
    }

    const parkingProfile = createRouteProfile(parkingRoute);
    const spawnProgress = parkingProfile.totalLength
        ? Math.min((16 / 111320) / parkingProfile.totalLength, 0.24)
        : 0;
    const spawnLatLng = interpolateRouteProfile(parkingProfile, spawnProgress);
    const spawnHeading = normalizeHeading(
        getPathHeading(parkingProfile, Math.min(spawnProgress + 0.001, 0.2), 1) + 180
    );

    return {
        parkingMatch,
        parkingRoute,
        spawnPoint: [spawnLatLng.lat, spawnLatLng.lng],
        spawnHeading,
        parkingConnector: parkingRoute.at(-1)
    };
}

function buildParkingStandFromEntry(parkingEntry, taxiwayLines) {
    if (!parkingEntry) {
        return null;
    }

    const parkingRoute = orientParkingPushbackRoute(getLinePoints(parkingEntry), taxiwayLines);

    if (!parkingRoute?.length) {
        return null;
    }

    const parkingProfile = createRouteProfile(parkingRoute);
    const spawnProgress = parkingProfile.totalLength
        ? Math.min((16 / 111320) / parkingProfile.totalLength, 0.24)
        : 0;
    const spawnLatLng = interpolateRouteProfile(parkingProfile, spawnProgress);
    const spawnHeading = normalizeHeading(
        getPathHeading(parkingProfile, Math.min(spawnProgress + 0.001, 0.2), 1) + 180
    );

    return {
        parkingMatch: { entry: parkingEntry, linePoints: getLinePoints(parkingEntry) },
        parkingRoute,
        spawnPoint: [spawnLatLng.lat, spawnLatLng.lng],
        spawnHeading,
        parkingConnector: parkingRoute.at(-1)
    };
}

function buildDepartureRoute(origin, parkingEntries, taxiwayLines, runwayEntries, holdEntries, surfaceRouteGraph, taxiwayRouteGraph, runwayPreference = 0, reservedParkingIds = new Set(), options = {}) {
    const preferredParkingId = options.preferredParkingId ?? null;
    const preferredRunwayName = options.preferredRunwayName ?? null;
    const parkingStand = resolveParkingStand(origin, parkingEntries, taxiwayLines, reservedParkingIds, preferredParkingId);

    if (!parkingStand) {
        return null;
    }

    const { parkingMatch, parkingRoute, parkingConnector } = parkingStand;
    const taxiSelection = buildTaxiRouteToRunway(
        parkingConnector,
        taxiwayLines,
        runwayEntries,
        surfaceRouteGraph,
        runwayPreference,
        preferredRunwayName,
        taxiwayRouteGraph
    );

    if (!taxiSelection) {
        return null;
    }

    const taxiJoinRoute = buildBridgeRoute(parkingConnector, taxiSelection.taxiMatch.projectedPoint);
    const route = dedupeRoutePoints([
        ...parkingRoute,
        ...taxiJoinRoute,
        ...taxiSelection.taxiRoute,
        ...taxiSelection.runwayRoute
    ]);
    const totalLength = measurePolylineLength(route);

    if (route.length < 2 || !totalLength) {
        return null;
    }

    const routeProfile = createRouteProfile(route);
    const pushbackDistance = measurePolylineLength(parkingRoute);
    const fallbackRunwayStartDistance = pushbackDistance
        + measurePolylineLength(taxiJoinRoute)
        + measurePolylineLength(taxiSelection.taxiRoute);
    const fallbackRunwayStart = Math.min(fallbackRunwayStartDistance / totalLength, 0.98);
    const runwayStart = getRunwayStartProgress(routeProfile, taxiSelection.runwayMatch, fallbackRunwayStart);
    const holdProgress = getHoldProgress(routeProfile, holdEntries, runwayStart);

    return {
        route,
        parkingId: parkingMatch.entry.id,
        parkingName: parkingMatch.entry.name ?? "Parking Line",
        runwayName: taxiSelection.runwayName,
        pushbackEnd: pushbackDistance / totalLength,
        holdProgress,
        runwayStart
    };
}

function getHeadingBetweenPoints(start, end) {
    const averageLatitude = ((start[0] + end[0]) / 2) * (Math.PI / 180);
    const deltaX = (end[1] - start[1]) * Math.cos(averageLatitude);
    const deltaY = end[0] - start[0];

    return normalizeHeading(Math.atan2(deltaX, deltaY) * (180 / Math.PI));
}

function getHeadingDifference(leftHeading, rightHeading) {
    const rawDifference = Math.abs(normalizeHeading(leftHeading) - normalizeHeading(rightHeading));
    return Math.min(rawDifference, 360 - rawDifference);
}

function getRunwayDesignationHeading(designation) {
    const runwayNumber = Number.parseInt(designation, 10);

    if (!Number.isFinite(runwayNumber) || runwayNumber < 1 || runwayNumber > 36) {
        return null;
    }

    return runwayNumber === 36 ? 360 : runwayNumber * 10;
}

function projectPointByHeading(point, heading, distanceMeters) {
    const headingRadians = heading * (Math.PI / 180);
    const metersPerDegreeLat = 111320;
    const metersPerDegreeLng = metersPerDegreeLat * Math.cos(point[0] * (Math.PI / 180));

    return [
        point[0] + ((Math.cos(headingRadians) * distanceMeters) / metersPerDegreeLat),
        point[1] + ((Math.sin(headingRadians) * distanceMeters) / Math.max(metersPerDegreeLng, 1e-6))
    ];
}

function interpolatePoint(start, end, ratio) {
    return [
        start[0] + ((end[0] - start[0]) * ratio),
        start[1] + ((end[1] - start[1]) * ratio)
    ];
}

function getPointDistanceMeters(start, end) {
    const averageLatitude = ((start[0] + end[0]) / 2) * (Math.PI / 180);
    const deltaLatMeters = (end[0] - start[0]) * 111320;
    const deltaLngMeters = (end[1] - start[1]) * 111320 * Math.cos(averageLatitude);

    return Math.hypot(deltaLatMeters, deltaLngMeters);
}

function getMaxRouteTurnAngle(points) {
    let maxTurnAngle = 0;

    for (let index = 1; index < points.length - 1; index += 1) {
        const inboundHeading = getHeadingBetweenPoints(points[index - 1], points[index]);
        const outboundHeading = getHeadingBetweenPoints(points[index], points[index + 1]);
        maxTurnAngle = Math.max(maxTurnAngle, getHeadingDifference(inboundHeading, outboundHeading));
    }

    return maxTurnAngle;
}

function buildQuadraticCurvePoints(start, control, end, segmentCount) {
    return Array.from({ length: segmentCount }, (_, index) => {
        const progress = (index + 1) / segmentCount;
        const inverseProgress = 1 - progress;

        return [
            ((inverseProgress ** 2) * start[0]) + (2 * inverseProgress * progress * control[0]) + ((progress ** 2) * end[0]),
            ((inverseProgress ** 2) * start[1]) + (2 * inverseProgress * progress * control[1]) + ((progress ** 2) * end[1])
        ];
    });
}

function smoothRouteTurns(points, maxTurnDegrees, trimDistanceMeters = goAroundTurnTrimDistanceMeters, maxPasses = 6) {
    let smoothedPoints = dedupeRoutePoints(points);

    for (let pass = 0; pass < maxPasses; pass += 1) {
        if (smoothedPoints.length < 3) {
            break;
        }

        let changed = false;
        const nextPoints = [smoothedPoints[0]];

        for (let index = 1; index < smoothedPoints.length - 1; index += 1) {
            const previousPoint = smoothedPoints[index - 1];
            const currentPoint = smoothedPoints[index];
            const followingPoint = smoothedPoints[index + 1];
            const inboundHeading = getHeadingBetweenPoints(previousPoint, currentPoint);
            const outboundHeading = getHeadingBetweenPoints(currentPoint, followingPoint);
            const turnAngle = getHeadingDifference(inboundHeading, outboundHeading);

            if (turnAngle <= maxTurnDegrees) {
                nextPoints.push(currentPoint);
                continue;
            }

            const incomingLengthMeters = getPointDistanceMeters(previousPoint, currentPoint);
            const outgoingLengthMeters = getPointDistanceMeters(currentPoint, followingPoint);
            const trimDistance = Math.min(
                trimDistanceMeters,
                incomingLengthMeters * 0.45,
                outgoingLengthMeters * 0.45
            );

            if (trimDistance < 100) {
                nextPoints.push(currentPoint);
                continue;
            }

            const entryPoint = interpolatePoint(previousPoint, currentPoint, 1 - (trimDistance / incomingLengthMeters));
            const exitPoint = interpolatePoint(currentPoint, followingPoint, trimDistance / outgoingLengthMeters);
            const curveSegmentCount = Math.max(3, Math.ceil(turnAngle / Math.max(maxTurnDegrees / 2, 1)));

            if (!arePointsEquivalent(nextPoints.at(-1), entryPoint)) {
                nextPoints.push(entryPoint);
            }

            nextPoints.push(...buildQuadraticCurvePoints(entryPoint, currentPoint, exitPoint, curveSegmentCount));
            changed = true;
        }

        nextPoints.push(smoothedPoints.at(-1));
        smoothedPoints = dedupeRoutePoints(nextPoints);

        if (!changed || getMaxRouteTurnAngle(smoothedPoints) <= maxTurnDegrees + 0.5) {
            break;
        }
    }

    return smoothedPoints;
}

function arePointsEquivalent(leftPoint, rightPoint, toleranceSquared = 1e-12) {
    if (!leftPoint || !rightPoint) {
        return false;
    }

    return getPointDistanceSquared(leftPoint, rightPoint) <= toleranceSquared;
}

function getArrivalRunwayDesignation(runwayEntry) {
    const designations = getRunwayDesignations(runwayEntry?.name ?? "");

    return designations[0] ?? null;
}

function getArrivalRunwayThreshold(runwayEntry) {
    const linePoints = getLinePoints(runwayEntry);

    if (!linePoints || linePoints.length < 2) {
        return null;
    }

    const arrivalDesignation = getArrivalRunwayDesignation(runwayEntry);
    const desiredHeading = getRunwayDesignationHeading(arrivalDesignation ?? "");
    const startPoint = linePoints[0];
    const endPoint = linePoints.at(-1);
    const startHeading = getHeadingBetweenPoints(startPoint, endPoint);
    const endHeading = getHeadingBetweenPoints(endPoint, startPoint);

    if (desiredHeading == null || getHeadingDifference(startHeading, desiredHeading) <= getHeadingDifference(endHeading, desiredHeading)) {
        return {
            designation: arrivalDesignation ?? runwayEntry.name ?? "Runway",
            point: startPoint,
            heading: startHeading
        };
    }

    return {
        designation: arrivalDesignation ?? runwayEntry.name ?? "Runway",
        point: endPoint,
        heading: endHeading
    };
}

function getDepartureRunwayThreshold(runwayEntry) {
    const arrivalThreshold = getArrivalRunwayThreshold(runwayEntry);
    const linePoints = getLinePoints(runwayEntry);
    const designations = getRunwayDesignations(runwayEntry?.name ?? "");

    if (!arrivalThreshold || !linePoints || linePoints.length < 2) {
        return null;
    }

    const startPoint = linePoints[0];
    const endPoint = linePoints.at(-1);
    const departureUsesStartPoint = arePointsEquivalent(arrivalThreshold.point, endPoint);
    const departurePoint = departureUsesStartPoint ? startPoint : endPoint;
    const departureHeading = departureUsesStartPoint
        ? getHeadingBetweenPoints(startPoint, endPoint)
        : getHeadingBetweenPoints(endPoint, startPoint);
    const departureDesignation = departureUsesStartPoint
        ? (designations[0] ?? runwayEntry?.name ?? "Runway")
        : (designations[1] ?? designations[0] ?? runwayEntry?.name ?? "Runway");

    return {
        designation: departureDesignation,
        point: departurePoint,
        heading: departureHeading
    };
}

function getDepartureRunwayEntryCandidate(runwayEntry, thresholdPoint, taxiwayLines) {
    if (!taxiwayLines?.length) {
        return null;
    }

    const orderedRunwayPoints = getOrderedRunwayPoints(runwayEntry, thresholdPoint);

    if (orderedRunwayPoints.length < 2) {
        return null;
    }

    const runwayProfile = createRouteProfile(orderedRunwayPoints);
    const taxiwayCandidates = taxiwayLines.flatMap((taxiwayLine) => {
        return taxiwayLine.map((taxiwayPoint) => {
            const runwayPointMatch = getRouteProgressForPoint(runwayProfile, taxiwayPoint);

            if (runwayPointMatch.distanceSquared > 1.2e-6) {
                return null;
            }

            const runwayEntryPoint = interpolateRouteProfile(runwayProfile, runwayPointMatch.progress);
            const taxiwayMatch = getBestLineMatch(taxiwayPoint, taxiwayLine);

            if (!taxiwayMatch) {
                return null;
            }

            return {
                progress: runwayPointMatch.progress,
                runwayEntryPoint: [runwayEntryPoint.lat, runwayEntryPoint.lng],
                taxiwayMatch,
                taxiwayLineLength: measurePolylineLength(taxiwayLine)
            };
        }).filter(Boolean);
    }).filter(Boolean)
        .sort((left, right) => left.progress - right.progress);

    const clusteredCandidates = taxiwayCandidates.reduce((clusters, candidate) => {
        const currentCluster = clusters.at(-1);

        if (!currentCluster || Math.abs(candidate.progress - currentCluster.at(-1).progress) > 0.015) {
            clusters.push([candidate]);
            return clusters;
        }

        currentCluster.push(candidate);
        return clusters;
    }, []);

    return clusteredCandidates
        .map((cluster) => {
            return cluster.reduce((bestCandidate, candidate) => {
                if (!bestCandidate || candidate.taxiwayLineLength > bestCandidate.taxiwayLineLength) {
                    return candidate;
                }

                return bestCandidate;
            }, null);
        })
        .filter(Boolean)[0] ?? null;
}

function getPreferredArrivalExitProgress(runwayEntry) {
    return getArrivalRunwayDesignation(runwayEntry) === "06R"
        ? extendedArrivalRunwayExitProgress06R
        : preferredArrivalRunwayExitProgress;
}

function getOrderedRunwayPoints(runwayEntry, thresholdPoint) {
    const runwayPoints = [...(getLinePoints(runwayEntry) ?? [])];

    if (!runwayPoints.length) {
        return [];
    }

    if (arePointsEquivalent(runwayPoints[0], thresholdPoint)) {
        return runwayPoints;
    }

    if (arePointsEquivalent(runwayPoints.at(-1), thresholdPoint)) {
        return runwayPoints.reverse();
    }

    return runwayPoints;
}

function getArrivalCurveDirection(runwayName) {
    const [designation] = getRunwayDesignations(runwayName ?? "");
    const runwayNumber = Number.parseInt(designation, 10);

    if (!Number.isFinite(runwayNumber)) {
        return 1;
    }

    return runwayNumber % 2 === 0 ? 1 : -1;
}

function buildArrivalApproachPoint(touchdownPoint, runwayHeading, approachRatio, lateralOffsetMeters = 0, side = 1) {
    const approachHeading = normalizeHeading(runwayHeading + 180);
    const approachBasePoint = projectPointByHeading(
        touchdownPoint,
        approachHeading,
        arrivalSpawnDistanceMeters * approachRatio
    );

    if (!lateralOffsetMeters) {
        return approachBasePoint;
    }

    return projectPointByHeading(
        approachBasePoint,
        normalizeHeading(runwayHeading + (side * 90)),
        lateralOffsetMeters
    );
}

function smoothArrivalApproach(points) {
    return smoothRouteTurns(points, 8, 900, 4);
}

function buildCurvedArrivalApproach(touchdownPoint, runwayHeading, runwayName) {
    const curveDirection = getArrivalCurveDirection(runwayName);
    const isRunway06LPair = (runwayName ?? "").includes("24R / 06L");

    if (isRunway06LPair) {
        const arrivalOrigin = buildArrivalApproachPoint(touchdownPoint, runwayHeading, 0.98, 760, curveDirection);
        const outerLegPoint = buildArrivalApproachPoint(touchdownPoint, runwayHeading, 0.8, 640, curveDirection);
        const baseTurnPoint = buildArrivalApproachPoint(touchdownPoint, runwayHeading, 0.58, 300, curveDirection);
        const centerlineJoinPoint = buildArrivalApproachPoint(touchdownPoint, runwayHeading, 0.34, 0, curveDirection);
        const shortFinalPoint = buildArrivalApproachPoint(touchdownPoint, runwayHeading, 0.18, 0, curveDirection);
        const approachPoints = smoothArrivalApproach([
            arrivalOrigin,
            outerLegPoint,
            baseTurnPoint,
            centerlineJoinPoint,
            shortFinalPoint,
            touchdownPoint
        ]);

        return {
            arrivalOrigin,
            approachPoints
        };
    }

    const shortFinalPoint = buildArrivalApproachPoint(touchdownPoint, runwayHeading, 0.14, 0, curveDirection);
    const centerlineJoinPoint = buildArrivalApproachPoint(touchdownPoint, runwayHeading, 0.32, 0, curveDirection);
    const baseTurnPoint = buildArrivalApproachPoint(touchdownPoint, runwayHeading, 0.52, 240, curveDirection);
    const outerCurvePoint = buildArrivalApproachPoint(touchdownPoint, runwayHeading, 0.76, 520, curveDirection);
    const arrivalOrigin = buildArrivalApproachPoint(touchdownPoint, runwayHeading, 0.96, 520, curveDirection);
    const approachPoints = smoothArrivalApproach([
        arrivalOrigin,
        outerCurvePoint,
        baseTurnPoint,
        centerlineJoinPoint,
        shortFinalPoint,
        touchdownPoint
    ]);

    return {
        arrivalOrigin,
        approachPoints
    };
}

function getRunwayTaxiwayExitCandidate(runwayEntry, thresholdPoint, taxiwayLines) {
    if (!taxiwayLines?.length) {
        return null;
    }

    const orderedRunwayPoints = getOrderedRunwayPoints(runwayEntry, thresholdPoint);

    if (orderedRunwayPoints.length < 2) {
        return null;
    }

    const runwayProfile = createRouteProfile(orderedRunwayPoints);
    const taxiwayCandidates = taxiwayLines.flatMap((taxiwayLine) => {
        return taxiwayLine.map((taxiwayPoint) => {
            const runwayPointMatch = getRouteProgressForPoint(runwayProfile, taxiwayPoint);

            if (
                runwayPointMatch.distanceSquared > 1.2e-6
                || runwayPointMatch.progress <= minimumArrivalRunwayExitProgress
            ) {
                return null;
            }

            const runwayExitPoint = interpolateRouteProfile(runwayProfile, runwayPointMatch.progress);
            const taxiwayMatch = getBestLineMatch(taxiwayPoint, taxiwayLine)
                ?? findNearestLineMatch(taxiwayPoint, taxiwayLines);
            const runwayMatch = getBestLineMatch([runwayExitPoint.lat, runwayExitPoint.lng], runwayEntry);

            if (!taxiwayMatch || !runwayMatch) {
                return null;
            }

            return {
                progress: runwayPointMatch.progress,
                runwayExitPoint: [runwayExitPoint.lat, runwayExitPoint.lng],
                runwayMatch,
                taxiwayMatch,
                taxiwayLineLength: measurePolylineLength(taxiwayMatch.linePoints),
                taxiwayDistanceSquared: taxiwayMatch.distanceSquared
            };
        }).filter(Boolean);
    }).filter(Boolean)
        .sort((left, right) => left.progress - right.progress);

    const clusteredCandidates = taxiwayCandidates.reduce((clusters, candidate) => {
        const currentCluster = clusters.at(-1);

        if (!currentCluster || Math.abs(candidate.progress - currentCluster.at(-1).progress) > 0.015) {
            clusters.push([candidate]);
            return clusters;
        }

        currentCluster.push(candidate);
        return clusters;
    }, []);

    const dedupedCandidates = clusteredCandidates.map((cluster) => {
        return cluster.reduce((bestCandidate, candidate) => {
            if (!bestCandidate) {
                return candidate;
            }

            if (candidate.taxiwayLineLength > bestCandidate.taxiwayLineLength) {
                return candidate;
            }

            if (
                candidate.taxiwayLineLength === bestCandidate.taxiwayLineLength
                && candidate.taxiwayDistanceSquared < bestCandidate.taxiwayDistanceSquared
            ) {
                return candidate;
            }

            return bestCandidate;
        }, null);
    }).filter(Boolean);

    if (getArrivalRunwayDesignation(runwayEntry) !== "06R") {
        return dedupedCandidates.at(-2)
            ?? dedupedCandidates.at(-1)
            ?? null;
    }

    const preferredCandidate = dedupedCandidates.find((candidate) => {
        return candidate.progress >= getPreferredArrivalExitProgress(runwayEntry);
    });

    return preferredCandidate
        ?? dedupedCandidates.at(-1)
        ?? null;
}

function getRunwayHoldExitCandidate(runwayEntry, thresholdPoint, holdEntries, taxiwayLines) {
    if (!holdEntries?.length || !taxiwayLines?.length) {
        return null;
    }

    const orderedRunwayPoints = getOrderedRunwayPoints(runwayEntry, thresholdPoint);

    if (orderedRunwayPoints.length < 2) {
        return null;
    }

    const runwayProfile = createRouteProfile(orderedRunwayPoints);
    const holdCandidates = holdEntries.map((holdEntry) => {
        const bestHoldPoint = holdEntry.linePoints.reduce((closestPoint, holdPoint) => {
            const pointProgress = getRouteProgressForPoint(runwayProfile, holdPoint);

            if (!closestPoint || pointProgress.distanceSquared < closestPoint.distanceSquared) {
                return {
                    holdPoint,
                    progress: pointProgress.progress,
                    distanceSquared: pointProgress.distanceSquared
                };
            }

            return closestPoint;
        }, null);

        if (!bestHoldPoint || bestHoldPoint.distanceSquared > 8e-7) {
            return null;
        }

        const runwayExitPoint = interpolateRouteProfile(runwayProfile, bestHoldPoint.progress);
        const taxiwayMatch = findNearestLineMatch(bestHoldPoint.holdPoint, taxiwayLines);

        if (!taxiwayMatch || taxiwayMatch.distanceSquared > 1.2e-6) {
            return null;
        }

        return {
            holdEntry,
            progress: bestHoldPoint.progress,
            holdPoint: bestHoldPoint.holdPoint,
            runwayExitPoint: [runwayExitPoint.lat, runwayExitPoint.lng],
            taxiwayMatch
        };
    }).filter(Boolean)
        .sort((left, right) => left.progress - right.progress)
        .filter((candidate, index, candidates) => {
            if (candidate.progress <= minimumArrivalRunwayExitProgress) {
                return false;
            }

            if (index === 0) {
                return true;
            }

            return Math.abs(candidate.progress - candidates[index - 1].progress) > 0.015;
        });

    if (!holdCandidates.length) {
        return null;
    }

    if (getArrivalRunwayDesignation(runwayEntry) !== "06R") {
        return holdCandidates[0] ?? null;
    }

    return holdCandidates.find((candidate) => {
        return candidate.progress >= getPreferredArrivalExitProgress(runwayEntry);
    }) ?? holdCandidates.at(-1) ?? null;
}

function buildRunwayRolloutRoute(runwayPoints, runwayProfile, runwayStartPoint, exitProgress) {
    const rolloutPoints = [runwayStartPoint];

    runwayPoints.forEach((point) => {
        const pointProgress = getRouteProgressForPoint(runwayProfile, point).progress;

        if (pointProgress > 0 && pointProgress < exitProgress) {
            rolloutPoints.push(point);
        }
    });

    const exitPoint = interpolateRouteProfile(runwayProfile, exitProgress);
    rolloutPoints.push([exitPoint.lat, exitPoint.lng]);

    return dedupeRoutePoints(rolloutPoints);
}

function getRunwayExitProgress(routeProfile, runwayEntry, touchdownPoint) {
    const routePoints = routeProfile.points ?? [];
    let lastRunwayPoint = touchdownPoint;

    routePoints.forEach((point, index) => {
        if (index === 0) {
            return;
        }

        if (getNearestLineDistanceSquared(point, [runwayEntry]) <= 1e-10) {
            lastRunwayPoint = point;
        }
    });

    return getRouteProgressForPoint(routeProfile, lastRunwayPoint).progress;
}

function buildArrivalRoute(parkingEntries, taxiwayLines, runwayEntries, holdEntries, surfaceRouteGraph, options = {}) {
    const preferredParkingId = options.preferredParkingId ?? null;
    const preferredRunwayName = options.preferredRunwayName ?? null;
    const gateOrigin = options.gateOrigin ?? airportCenter;
    const runwayPreference = options.runwayPreference ?? 0;
    const parkingStand = resolveParkingStand(gateOrigin, parkingEntries, taxiwayLines, new Set(), preferredParkingId);

    if (!parkingStand) {
        return null;
    }

    const candidateRunwayEntries = preferredRunwayName
        ? runwayEntries.filter((entry) => entry.name === preferredRunwayName)
        : runwayEntries;
    const selectedRunwayEntry = candidateRunwayEntries[Math.min(runwayPreference % Math.max(candidateRunwayEntries.length, 1), Math.max(candidateRunwayEntries.length - 1, 0))]
        ?? runwayEntries[0]
        ?? null;

    if (!selectedRunwayEntry) {
        return null;
    }

    const threshold = getArrivalRunwayThreshold(selectedRunwayEntry);
    const runwayMatch = threshold ? getBestLineMatch(threshold.point, selectedRunwayEntry) : null;

    if (!threshold || !runwayMatch) {
        return null;
    }

    const surfaceEntries = [
        ...taxiwayLines,
        ...runwayEntries
    ];
    const parkingSurfaceMatch = findNearestLineMatch(parkingStand.parkingConnector, surfaceEntries);

    if (!parkingSurfaceMatch) {
        return null;
    }

    const orderedRunwayPoints = getOrderedRunwayPoints(selectedRunwayEntry, threshold.point);
    const runwayProfile = createRouteProfile(orderedRunwayPoints);
    const taxiwayExitCandidate = getRunwayTaxiwayExitCandidate(selectedRunwayEntry, threshold.point, taxiwayLines);
    const holdExitCandidate = getRunwayHoldExitCandidate(selectedRunwayEntry, threshold.point, holdEntries, taxiwayLines);
    const fallbackExitIndex = orderedRunwayPoints.length > 2
        ? orderedRunwayPoints.length - 2
        : Math.max(orderedRunwayPoints.length - 1, 0);
    const fallbackExitPoint = orderedRunwayPoints[fallbackExitIndex] ?? runwayMatch.projectedPoint;
    const preferredExitPoint = taxiwayExitCandidate?.runwayExitPoint ?? holdExitCandidate?.runwayExitPoint ?? fallbackExitPoint;
    const preferredExitProgress = taxiwayExitCandidate?.progress ?? holdExitCandidate?.progress ?? getRouteProgressForPoint(runwayProfile, preferredExitPoint).progress;
    const preferredExitSurfaceMatch = taxiwayExitCandidate?.taxiwayMatch
        ?? holdExitCandidate?.taxiwayMatch
        ?? findNearestLineMatch(preferredExitPoint, taxiwayLines)
        ?? taxiwayExitCandidate?.runwayMatch
        ?? getBestLineMatch(preferredExitPoint, selectedRunwayEntry)
        ?? runwayMatch;
    const surfaceRoute = buildGraphRouteBetweenMatches(surfaceRouteGraph, preferredExitSurfaceMatch, parkingSurfaceMatch)
        ?? buildGraphRouteBetweenMatches(surfaceRouteGraph, runwayMatch, parkingSurfaceMatch);

    if (!surfaceRoute?.length) {
        return null;
    }

    const runwayRolloutRoute = buildRunwayRolloutRoute(
        orderedRunwayPoints,
        runwayProfile,
        runwayMatch.projectedPoint,
        preferredExitProgress
    );
    const curvedApproach = buildCurvedArrivalApproach(
        runwayMatch.projectedPoint,
        threshold.heading,
        selectedRunwayEntry.name
    );
    const route = dedupeRoutePoints([
        ...curvedApproach.approachPoints,
        ...runwayRolloutRoute,
        ...buildBridgeRoute(preferredExitPoint, preferredExitSurfaceMatch.projectedPoint),
        ...surfaceRoute,
        ...buildBridgeRoute(parkingSurfaceMatch.projectedPoint, parkingStand.parkingConnector),
        ...[...parkingStand.parkingRoute].reverse()
    ]);

    if (route.length < 2 || !measurePolylineLength(route)) {
        return null;
    }

    const routeProfile = createRouteProfile(route);
    const runwayStart = getRouteProgressForPoint(routeProfile, runwayMatch.projectedPoint).progress;
    const runwayExitProgress = getRouteProgressForPoint(routeProfile, preferredExitPoint).progress;
    const minimumRolloutProgress = runwayStart + ((240 / 111320) / Math.max(routeProfile.totalLength, 1e-6));
    const arrivalRolloutEnd = Math.min(Math.max(runwayExitProgress, minimumRolloutProgress), 0.985);
    const goAroundCutoffPoint = curvedApproach.approachPoints.at(-3) ?? curvedApproach.approachPoints[0];
    const goAroundCutoffProgress = getRouteProgressForPoint(routeProfile, goAroundCutoffPoint).progress;

    return {
        route,
        parkingId: parkingStand.parkingMatch.entry.id,
        parkingName: parkingStand.parkingMatch.entry.name ?? "Parking Line",
        runwayName: selectedRunwayEntry.name ?? null,
        arrivalRunwayDesignation: threshold.designation ?? null,
        pushbackEnd: 0,
        holdProgress: 0,
        runwayStart,
        arrivalRolloutEnd,
        goAroundCutoffProgress,
        arrivalOrigin: curvedApproach.arrivalOrigin,
        approachGuideRoute: curvedApproach.approachPoints
    };
}

function buildReturnToGateRoute(origin, parkingEntries, taxiwayLines, runwayEntries, surfaceRouteGraph, preferredParkingId, gateOrigin = origin) {
    const parkingStand = resolveParkingStand(gateOrigin, parkingEntries, taxiwayLines, new Set(), preferredParkingId);

    if (!parkingStand) {
        return null;
    }

    const surfaceEntries = [
        ...taxiwayLines,
        ...runwayEntries
    ];
    const originSurfaceMatch = findNearestLineMatch(origin, surfaceEntries);
    const parkingSurfaceMatch = findNearestLineMatch(parkingStand.parkingConnector, surfaceEntries);

    if (!originSurfaceMatch || !parkingSurfaceMatch) {
        return null;
    }

    const surfaceRoute = buildGraphRouteBetweenMatches(surfaceRouteGraph, originSurfaceMatch, parkingSurfaceMatch);

    if (!surfaceRoute?.length) {
        return null;
    }

    const route = dedupeRoutePoints([
        ...buildBridgeRoute(origin, originSurfaceMatch.projectedPoint),
        ...surfaceRoute,
        ...buildBridgeRoute(parkingSurfaceMatch.projectedPoint, parkingStand.parkingConnector),
        ...[...parkingStand.parkingRoute].reverse()
    ]);

    if (route.length < 2 || !measurePolylineLength(route)) {
        return null;
    }

    return {
        route,
        parkingId: parkingStand.parkingMatch.entry.id,
        parkingName: parkingStand.parkingMatch.entry.name ?? "Parking Line",
        runwayName: null,
        pushbackEnd: 0,
        holdProgress: 0,
        runwayStart: 1
    };
}

function shouldEnforceArrivalTaxiSpeed(plane) {
    return plane.operationType === "arrival"
        && plane.returningToGate
        && plane.progress >= (plane.arrivalRolloutEnd ?? plane.runwayStart ?? 0);
}

function getDepartureSpeed(plane) {
    const speedMultiplier = plane.speedMultiplier ?? 1;

    if (plane.operationType === "arrival" && plane.returningToGate) {
        const runwayStart = plane.runwayStart ?? 0;
        const rolloutEnd = plane.arrivalRolloutEnd ?? runwayStart;
        const goAroundEndProgress = plane.goAroundEndProgress ?? 0;
        const arrivalDesignation = plane.arrivalRunwayDesignation
            ?? getRunwayDesignations(plane.arrivalRunwayName ?? plane.runwayName ?? "")[0]
            ?? null;
        const isRunway06RArrival = arrivalDesignation === "06R";
        const approachSpeed = plane.arrivalApproachSpeed ?? plane.arrivalLandingSpeed ?? plane.runwaySpeed;
        const approachCruiseSpeed = plane.taxiSpeed + ((approachSpeed - plane.taxiSpeed) * 0.22);

        if (plane.progress < runwayStart) {
            if (plane.goAroundUsed && plane.progress < goAroundEndProgress) {
                const goAroundCruiseSpeed = plane.taxiSpeed + ((approachSpeed - plane.taxiSpeed) * 0.14);
                return Math.min(goAroundCruiseSpeed, approachCruiseSpeed) * speedMultiplier;
            }

            return approachCruiseSpeed * speedMultiplier;
        }

        if (plane.progress < rolloutEnd) {
            const rolloutProgress = rolloutEnd > runwayStart
                ? (plane.progress - runwayStart) / (rolloutEnd - runwayStart)
                : 1;
            const arrivalSpeed = Math.min(plane.arrivalLandingSpeed ?? plane.runwaySpeed, approachCruiseSpeed * 0.97);
            const decelerationProgress = isRunway06RArrival
                ? Math.pow(rolloutProgress, 1.18)
                : Math.min(Math.pow(rolloutProgress / 0.56, 1.12), 1);
            const easedDeceleration = isRunway06RArrival
                ? decelerationProgress
                : 1 - ((1 - decelerationProgress) ** 1.55);
            const rolloutSpeed = arrivalSpeed + ((plane.taxiSpeed - arrivalSpeed) * easedDeceleration);
            return rolloutSpeed * speedMultiplier;
        }

        return plane.taxiSpeed;
    }

    if (plane.returningToGate) {
        return plane.abortSpeed * speedMultiplier;
    }

    if (plane.progress < plane.pushbackEnd) {
        return plane.pushbackSpeed * speedMultiplier;
    }

    if (plane.progress < plane.holdProgress) {
        return plane.taxiSpeed * speedMultiplier;
    }

    if (plane.progress < plane.runwayStart) {
        return plane.lineupSpeed * speedMultiplier;
    }

    const takeoffProgress = (plane.progress - plane.runwayStart) / Math.max(1 - plane.runwayStart, 0.0001);
    return (plane.runwaySpeed + (plane.takeoffAcceleration * takeoffProgress)) * speedMultiplier;
}

const approachDisplayCeilingFeet = 3200;
const departureDisplayCeilingFeet = 3400;
const standardTaxiSpeedKnots = 30;
const approachDisplayMinKnots = 180;
const approachDisplayMaxKnots = 250;

function getPlaneSpeedKnots(plane) {
    if (!plane.hasAssignedRunway || !plane.routeProfile?.totalLength || !plane.taxiSpeed) {
        return 0;
    }

    if (plane.operationType === "arrival" && plane.returningToGate) {
        const runwayStart = plane.runwayStart ?? 0;
        const rolloutEnd = plane.arrivalRolloutEnd ?? runwayStart;
        const goAroundEndProgress = plane.goAroundEndProgress ?? 0;

        if (plane.goAroundUsed && plane.progress < goAroundEndProgress) {
            const goAroundProgress = goAroundEndProgress > 0
                ? Math.min(Math.max(plane.progress / goAroundEndProgress, 0), 1)
                : 1;
            return Math.round(210 + ((approachDisplayMaxKnots - 210) * goAroundProgress));
        }

        if (plane.progress < runwayStart) {
            const approachProgress = runwayStart > 0
                ? Math.min(Math.max(plane.progress / runwayStart, 0), 1)
                : 1;
            const displayedApproachSpeed = approachDisplayMaxKnots
                - ((approachDisplayMaxKnots - approachDisplayMinKnots) * (approachProgress ** 1.08));

            return Math.round(displayedApproachSpeed);
        }

        if (plane.progress < rolloutEnd) {
            const rolloutProgress = rolloutEnd > runwayStart
                ? Math.min(Math.max((plane.progress - runwayStart) / (rolloutEnd - runwayStart), 0), 1)
                : 1;
            const displayedRolloutSpeed = approachDisplayMinKnots
                - ((approachDisplayMinKnots - standardTaxiSpeedKnots) * (rolloutProgress ** 0.92));

            return Math.round(displayedRolloutSpeed);
        }

        return standardTaxiSpeedKnots;
    }

    const internalSpeed = getDepartureSpeed(plane);
    const calibratedSpeed = standardTaxiSpeedKnots * (internalSpeed / plane.taxiSpeed);

    return Math.max(0, Math.round(calibratedSpeed));
}

function getPlaneAltitudeFeet(plane) {
    if (!plane.hasAssignedRunway || !plane.routeProfile?.totalLength) {
        return 0;
    }

    if (plane.operationType === "arrival" && plane.returningToGate) {
        const runwayStart = plane.runwayStart ?? 0;
        const goAroundEndProgress = plane.goAroundEndProgress ?? 0;

        if (plane.goAroundUsed && plane.progress < goAroundEndProgress) {
            const goAroundProgress = goAroundEndProgress > 0
                ? Math.min(Math.max(plane.progress / goAroundEndProgress, 0), 1)
                : 1;
            const climbProfile = Math.sin(goAroundProgress * Math.PI * 0.5);
            return Math.round(900 + (approachDisplayCeilingFeet * climbProfile));
        }

        if (plane.progress >= runwayStart) {
            return 0;
        }

        const descentProgress = runwayStart > 0
            ? Math.min(Math.max(plane.progress / runwayStart, 0), 1)
            : 1;
        const easedDescent = descentProgress ** 1.15;
        return Math.max(0, Math.round(approachDisplayCeilingFeet * (1 - easedDescent)));
    }

    if (plane.returningToGate || plane.progress < (plane.runwayStart ?? 1)) {
        return 0;
    }

    const runwayStart = plane.runwayStart ?? 1;
    const climbProgress = Math.min(
        Math.max((plane.progress - runwayStart) / Math.max(1 - runwayStart, 0.0001), 0),
        1
    );
    const easedClimb = climbProgress ** 1.08;

    return Math.max(0, Math.round(departureDisplayCeilingFeet * easedClimb));
}

function getPlaneTelemetry(plane) {
    const speedKnots = getPlaneSpeedKnots(plane);
    const altitudeFeet = getPlaneAltitudeFeet(plane);

    return {
        speedKnots,
        altitudeFeet,
        speedLabel: `${speedKnots} knts`,
        altitudeLabel: `${altitudeFeet.toLocaleString("en-US")} ft`
    };
}

function canPlaneInitiateGoAround(plane) {
    if (
        plane.operationType !== "arrival"
        || !plane.returningToGate
        || !plane.routeProfile?.totalLength
        || plane.goAroundUsed
    ) {
        return false;
    }

    return plane.progress < (plane.runwayStart ?? 0);
}

function isPlaneOnRunwayAtProgress(plane, progress) {
    if (plane.operationType === "arrival" && plane.returningToGate) {
        return progress >= (plane.runwayStart ?? 0)
            && progress < (plane.arrivalRolloutEnd ?? plane.runwayStart ?? 0);
    }

    return progress >= (plane.runwayStart ?? 1) && progress < 0.995;
}

function isPlaneOnRunway(plane) {
    return isPlaneOnRunwayAtProgress(plane, plane.progress);
}

function convertMetersToDistanceSquared(meters) {
    return (meters / 111320) ** 2;
}

const planeSpacingMetersByPhase = {
    pushback: 68,
    taxi: 92,
    lineup: 135,
    runway: 165
};

function getPlaneSpacingMeters(plane) {
    if (plane.operationType === "arrival" && plane.returningToGate) {
        return plane.progress < (plane.arrivalRolloutEnd ?? 0)
            ? planeSpacingMetersByPhase.runway
            : planeSpacingMetersByPhase.taxi;
    }

    if (plane.progress < plane.pushbackEnd) {
        return planeSpacingMetersByPhase.pushback;
    }

    if (plane.progress < plane.holdProgress) {
        return planeSpacingMetersByPhase.taxi;
    }

    if (plane.progress < plane.runwayStart) {
        return planeSpacingMetersByPhase.lineup;
    }

    return planeSpacingMetersByPhase.runway;
}

function getRunwayHoldProgress(plane) {
    return Math.max(
        Math.min(plane.holdProgress - 0.006, plane.runwayStart - 0.012),
        plane.pushbackEnd + 0.01
    );
}

function getPlaneDepartureClearance(plane) {
    return plane.departureClearance ?? "hold-short";
}

function getRunwayDepartureLeaders(planes) {
    return planes.reduce((leaders, plane) => {
        if (plane.returningToGate) {
            return leaders;
        }

        if (plane.progress < plane.holdProgress || plane.progress >= 1) {
            return leaders;
        }

        const currentLeader = leaders.get(plane.runwayName);

        if (!currentLeader) {
            leaders.set(plane.runwayName, plane);
            return leaders;
        }

        if (isPlaneOnRunway(plane) && !isPlaneOnRunway(currentLeader)) {
            leaders.set(plane.runwayName, plane);
            return leaders;
        }

        if (!isPlaneOnRunway(plane) && isPlaneOnRunway(currentLeader)) {
            return leaders;
        }

        if (plane.progress > currentLeader.progress) {
            leaders.set(plane.runwayName, plane);
        }

        return leaders;
    }, new Map());
}

function getMinimumPlaneSpacingSquared(plane) {
    return convertMetersToDistanceSquared(getPlaneSpacingMeters(plane));
}

const planePredictionLookaheadSeconds = [0, 1.6, 3.4, 5.2];
const arrivalRunwayConflictProbeOffsetsSeconds = [-1.2, 0, 1.2];

function getProjectedPlaneProgress(plane, progress, secondsAhead) {
    const simulatedPlane = {
        ...plane,
        progress
    };
    const projectedProgress = progress + (secondsAhead * getDepartureSpeed(simulatedPlane) * plane.direction);
    let clampedProgress = Math.min(Math.max(projectedProgress, 0), 0.999);

    if (progress < plane.holdProgress && clampedProgress >= plane.holdProgress) {
        clampedProgress = getRunwayHoldProgress(plane);
    }

    return clampedProgress;
}

function buildPlanePrediction(plane, progress) {
    return planePredictionLookaheadSeconds.map((secondsAhead) => {
        const projectedProgress = getProjectedPlaneProgress(plane, progress, secondsAhead);

        return {
            secondsAhead,
            progress: projectedProgress,
            position: interpolateRouteProfile(plane.routeProfile, projectedProgress)
        };
    });
}

function getBlockingPlane(position, minimumSpacingSquared, resolvedPositions) {
    return resolvedPositions.find((entry) => {
        const spacingThreshold = Math.max(minimumSpacingSquared, entry.minimumSpacingSquared);
        return getLatLngDistanceSquared(position, entry.position) < spacingThreshold;
    }) ?? null;
}

function getPredictionBlockingPlane(prediction, minimumSpacingSquared, resolvedPositions) {
    return resolvedPositions.find((entry) => {
        const spacingThreshold = Math.max(minimumSpacingSquared, entry.minimumSpacingSquared);

        return prediction.some((predictedPoint) => {
            return entry.prediction.some((entryPrediction) => {
                return getLatLngDistanceSquared(predictedPoint.position, entryPrediction.position) < spacingThreshold;
            });
        });
    }) ?? null;
}

function getQueueSpacingProgress(plane) {
    const routeLength = Math.max(plane.routeProfile.totalLength, 1e-6);
    return getPlaneSpacingMeters(plane) / 111320 / routeLength;
}

function getSameRunwayQueueBlocker(plane, resolvedPositions) {
    if (plane.progress >= plane.runwayStart) {
        return null;
    }

    return resolvedPositions.find((entry) => {
        return entry.runwayName === plane.runwayName
            && entry.progress >= plane.progress
            && entry.progress < plane.runwayStart;
    }) ?? null;
}

function resolvePlaneSpacing(plane, resolvedPositions, fallbackProgress) {
    const minimumSpacingSquared = getMinimumPlaneSpacingSquared(plane);
    const queueSpacingProgress = getQueueSpacingProgress(plane);
    const queueBlocker = getSameRunwayQueueBlocker(plane, resolvedPositions);
    let resolvedProgress = plane.progress;

    if (queueBlocker) {
        resolvedProgress = Math.min(resolvedProgress, Math.max(queueBlocker.progress - queueSpacingProgress, 0));
    }

    let resolvedPosition = interpolateRouteProfile(plane.routeProfile, resolvedProgress);
    let prediction = buildPlanePrediction(plane, resolvedProgress);
    let blockingPlane = getBlockingPlane(resolvedPosition, minimumSpacingSquared, resolvedPositions)
        ?? getPredictionBlockingPlane(prediction, minimumSpacingSquared, resolvedPositions);

    if (!blockingPlane) {
        return {
            progress: resolvedProgress,
            position: resolvedPosition,
            minimumSpacingSquared,
            prediction,
            blockingPlane: null
        };
    }

    resolvedProgress = Math.max(0, Math.min(fallbackProgress, plane.progress));

    if (queueBlocker) {
        resolvedProgress = Math.min(resolvedProgress, Math.max(queueBlocker.progress - queueSpacingProgress, 0));
    }

    resolvedPosition = interpolateRouteProfile(plane.routeProfile, resolvedProgress);
    prediction = buildPlanePrediction(plane, resolvedProgress);
    blockingPlane = getBlockingPlane(resolvedPosition, minimumSpacingSquared, resolvedPositions)
        ?? getPredictionBlockingPlane(prediction, minimumSpacingSquared, resolvedPositions);

    if (!blockingPlane) {
        return {
            progress: resolvedProgress,
            position: resolvedPosition,
            minimumSpacingSquared,
            prediction,
            blockingPlane: null
        };
    }

    const routeLength = Math.max(plane.routeProfile.totalLength, 1e-6);
    const progressStep = Math.max(18 / 111320 / routeLength, 0.00035);

    for (let attempts = 0; attempts < 24; attempts += 1) {
        const nextProgress = Math.max(
            0,
            Math.min(
                resolvedProgress - progressStep,
                fallbackProgress,
                blockingPlane.progress - (progressStep * 1.5),
                queueBlocker ? queueBlocker.progress - queueSpacingProgress : resolvedProgress - progressStep
            )
        );

        if (nextProgress >= resolvedProgress - 1e-6) {
            break;
        }

        resolvedProgress = nextProgress;
        resolvedPosition = interpolateRouteProfile(plane.routeProfile, resolvedProgress);
        prediction = buildPlanePrediction(plane, resolvedProgress);

        blockingPlane = getBlockingPlane(resolvedPosition, minimumSpacingSquared, resolvedPositions)
            ?? getPredictionBlockingPlane(prediction, minimumSpacingSquared, resolvedPositions);

        if (!blockingPlane) {
            break;
        }
    }

    return {
        progress: resolvedProgress,
        position: resolvedPosition,
        minimumSpacingSquared,
        prediction,
        blockingPlane
    };
}

function buildTaxiwayPlaneRoute(origin, taxiwayLines) {
    let bestMatch = null;

    taxiwayLines.forEach((linePoints) => {
        for (let index = 0; index < linePoints.length - 1; index += 1) {
            const projection = projectPointOnSegment(origin, linePoints[index], linePoints[index + 1]);

            if (!bestMatch || projection.distanceSquared < bestMatch.distanceSquared) {
                bestMatch = {
                    linePoints,
                    segmentIndex: index,
                    projectedPoint: projection.point,
                    distanceSquared: projection.distanceSquared
                };
            }
        }
    });

    if (!bestMatch) {
        return null;
    }

    const forwardRoute = [
        bestMatch.projectedPoint,
        ...bestMatch.linePoints.slice(bestMatch.segmentIndex + 1)
    ];
    const reverseRoute = [
        bestMatch.projectedPoint,
        ...bestMatch.linePoints.slice(0, bestMatch.segmentIndex + 1).reverse()
    ];
    const chosenRoute = measurePolylineLength(forwardRoute) >= measurePolylineLength(reverseRoute)
        ? forwardRoute
        : reverseRoute;

    return chosenRoute.length > 1 ? chosenRoute : null;
}

function getPathHeading(points, progress, direction = 1) {
    const routeProfile = Array.isArray(points) ? createRouteProfile(points) : points;
    const current = interpolateRouteProfile(routeProfile, progress);
    const sampleProgress = direction >= 0
        ? Math.min(progress + 0.02, 0.999)
        : Math.max(progress - 0.02, 0.001);
    const comparisonPoint = interpolateRouteProfile(routeProfile, sampleProgress);
    const averageLatitude = ((current.lat + comparisonPoint.lat) / 2) * (Math.PI / 180);
    const deltaX = (comparisonPoint.lng - current.lng) * Math.cos(averageLatitude);
    const deltaY = comparisonPoint.lat - current.lat;

    return Number((Math.atan2(deltaX, deltaY) * (180 / Math.PI)).toFixed(2));
}

function normalizeHeading(heading) {
    return ((heading % 360) + 360) % 360;
}

const parkedPlaneHeading = 270;

function getPlaneHeading(plane) {
    if (!plane.routeProfile?.totalLength) {
        return plane.standbyHeading ?? parkedPlaneHeading;
    }

    const routeHeading = getPathHeading(plane.routeProfile, plane.progress, plane.direction);

    if (plane.progress < plane.pushbackEnd) {
        return normalizeHeading(routeHeading + 180);
    }

    return routeHeading;
}

function getPlaneIconSize(zoom) {
    const minZoom = 12;
    const maxZoom = 19;
    const zoomRatio = Math.min(Math.max((zoom - minZoom) / (maxZoom - minZoom), 0), 1);
    const scaledSize = 10 + (Math.pow(zoomRatio, 1.05) * 34);

    return Math.round(scaledSize);
}

function createPlaneMarkerIcon(callsign, heading, zoom) {
    const iconSize = getPlaneIconSize(zoom);

    return L.divIcon({
        className: "plane-image-marker-wrapper",
        html: `
            <div class="plane-image-marker" style="transform: rotate(${heading}deg); width: ${iconSize}px; height: ${iconSize}px;" aria-label="${callsign}">
                <img src="${planeLogo}" alt="${callsign}" style="width: ${iconSize}px; height: ${iconSize}px;">
            </div>
        `,
        iconSize: [iconSize, iconSize],
        iconAnchor: [iconSize / 2, iconSize / 2]
    });
}

function getRunwayDesignations(name) {
    return name
        .split("/")
        .map((designation) => designation.trim().toUpperCase())
        .filter(Boolean);
}

function getRunwayLabelRotation(linePoints) {
    if (linePoints.length < 2) {
        return 0;
    }

    const [startLat, startLng] = linePoints[0];
    const [endLat, endLng] = linePoints[linePoints.length - 1];
    const averageLatitude = ((startLat + endLat) / 2) * (Math.PI / 180);
    const deltaX = (endLng - startLng) * Math.cos(averageLatitude);
    const deltaY = endLat - startLat;
    let rotation = Math.atan2(-deltaY, deltaX) * (180 / Math.PI);

    if (rotation > 90) {
        rotation -= 180;
    }

    if (rotation < -90) {
        rotation += 180;
    }

    const perpendicularRotation = rotation + 90;

    return Number(perpendicularRotation.toFixed(2));
}

function offsetPointPerpendicular(point, linePoints, side = 1, offsetMeters = 16) {
    if (linePoints.length < 2) {
        return point;
    }

    const [startLat, startLng] = linePoints[0];
    const [endLat, endLng] = linePoints[linePoints.length - 1];
    const averageLatitude = ((startLat + endLat) / 2) * (Math.PI / 180);
    const deltaX = (endLng - startLng) * Math.cos(averageLatitude);
    const deltaY = endLat - startLat;
    const magnitude = Math.hypot(deltaX, deltaY);

    if (!magnitude) {
        return point;
    }

    const normalX = (-deltaY / magnitude) * side;
    const normalY = (deltaX / magnitude) * side;
    const metersPerDegreeLat = 111320;
    const metersPerDegreeLng = metersPerDegreeLat * Math.cos(point.lat * (Math.PI / 180));

    return {
        lat: point.lat + ((normalY * offsetMeters) / metersPerDegreeLat),
        lng: point.lng + ((normalX * offsetMeters) / metersPerDegreeLng)
    };
}

function createRunwayLabelIcon(label, rotation) {
    return L.divIcon({
        className: "runway-label-icon",
        html: `
            <div class="runway-label" style="--runway-rotation: ${rotation}deg;">
                <span>${label}</span>
            </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
}

function addRunwayLabels(targetLayer, placemark, linePoints) {
    const designations = getRunwayDesignations(placemark.name);

    if (!designations.length) {
        return;
    }

    const rotation = getRunwayLabelRotation(linePoints);
    const positions = designations.length > 1
        ? [
            offsetPointPerpendicular(interpolatePath(linePoints, 0.12), linePoints, -1),
            offsetPointPerpendicular(interpolatePath(linePoints, 0.88), linePoints, 1)
        ]
        : [interpolatePath(linePoints, 0.5)];

    designations.slice(0, 2).forEach((designation, index) => {
        L.marker(positions[index], {
            icon: createRunwayLabelIcon(designation, rotation),
            interactive: false,
            keyboard: false,
            zIndexOffset: 3000
        }).addTo(targetLayer);
    });
}

function setupMap() {
    const map = L.map("airport-map", {
        zoomControl: true,
        minZoom: 12,
        maxZoom: 19,
        zoomSnap: 0.25,
        zoomAnimation: true,
        fadeAnimation: true,
        markerZoomAnimation: true,
        preferCanvas: true
    }).setView(airportCenter, 14);

    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
        attribution: "Tiles &copy; Esri",
        keepBuffer: 3,
        updateWhenZooming: true,
        className: "atc-dark-basemap"
    }).addTo(map);

    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}", {
        attribution: "Tiles &copy; Esri",
        keepBuffer: 3,
        updateWhenZooming: true,
        pane: "overlayPane",
        className: "atc-dark-reference"
    }).addTo(map);

    const kmlGroups = {
        runways: L.featureGroup().addTo(map),
        taxiways: L.featureGroup().addTo(map),
        holds: L.featureGroup().addTo(map),
        roads: L.featureGroup().addTo(map),
        centerlines: L.featureGroup().addTo(map),
        other: L.featureGroup().addTo(map)
    };
    const arrivalGuideLayer = L.featureGroup().addTo(map);
    const kmlCounts = {
        runways: 0,
        taxiways: 0,
        holds: 0,
        roads: 0,
        centerlines: 0,
        other: 0
    };
    const scalableKmlLayers = [];
    const taxiwayLineSets = [];
    const parkingLineSets = [];
    const runwayLineSets = [];
    const holdLineSets = [];
    const movingPlaneLayer = L.featureGroup().addTo(map);

    function registerScalableLayer(layer, baseWeight, scaleOptions = {}) {
        scalableKmlLayers.push({ layer, baseWeight, scaleOptions });
        return layer;
    }

    function addOutlinedPolyline(targetLayer, linePoints, presentation, popupHtml) {
        const renderLinePoints = presentation.label === "Center Lines"
            ? extendPolylineEndpoints(linePoints, 0.8)
            : linePoints;

        if (presentation.label === "Parking Lines") {
            return registerScalableLayer(L.polyline(renderLinePoints, {
                color: presentation.color,
                opacity: 0.88,
                weight: presentation.lineWeight,
                className: "kml-overlay-line",
                lineCap: presentation.lineCap,
                lineJoin: presentation.lineJoin
            }).addTo(targetLayer), presentation.lineWeight).bindPopup(popupHtml);
        }

        const outlineWeight = presentation.lineWeight + (presentation.label === "Runways" ? 3 : 1.6);

        registerScalableLayer(L.polyline(renderLinePoints, {
            color: "#111111",
            opacity: 0.92,
            weight: outlineWeight,
            className: "kml-overlay-line",
            lineCap: presentation.lineCap,
            lineJoin: presentation.lineJoin
        }).addTo(targetLayer), outlineWeight, presentation.label === "Runways"
            ? { minScale: 0.16, minWeight: 1.15 }
            : undefined);

        return registerScalableLayer(L.polyline(renderLinePoints, {
            color: presentation.color,
            opacity: Math.max(presentation.label === "Center Lines" ? 0.92 : 0.7, 0.7),
            weight: presentation.lineWeight,
            className: "kml-overlay-line",
            lineCap: presentation.lineCap,
            lineJoin: presentation.lineJoin
        }).addTo(targetLayer), presentation.lineWeight, presentation.label === "Runways"
            ? { minScale: 0.14, minWeight: 0.82 }
            : undefined).bindPopup(popupHtml);
    }

    function applyKmlLineWeights() {
        const zoom = map.getZoom();

        scalableKmlLayers.forEach(({ layer, baseWeight, scaleOptions }) => {
            layer.setStyle({
                weight: getZoomScaledLineWeight(
                    baseWeight,
                    zoom,
                    scaleOptions?.minScale,
                    scaleOptions?.minWeight
                )
            });
        });
    }

    function getSecondsUntilPlaneProgress(plane, targetProgress, maximumLookaheadSeconds = 45) {
        if (!plane.routeProfile?.totalLength || targetProgress <= plane.progress) {
            return 0;
        }

        let lowerBoundSeconds = 0;
        let upperBoundSeconds = 1;

        while (
            upperBoundSeconds < maximumLookaheadSeconds
            && getProjectedPlaneProgress(plane, plane.progress, upperBoundSeconds) < targetProgress
        ) {
            lowerBoundSeconds = upperBoundSeconds;
            upperBoundSeconds *= 2;
        }

        const cappedUpperBoundSeconds = Math.min(upperBoundSeconds, maximumLookaheadSeconds);

        if (getProjectedPlaneProgress(plane, plane.progress, cappedUpperBoundSeconds) < targetProgress) {
            return null;
        }

        let lowSeconds = lowerBoundSeconds;
        let highSeconds = cappedUpperBoundSeconds;

        for (let iteration = 0; iteration < 14; iteration += 1) {
            const midpointSeconds = (lowSeconds + highSeconds) * 0.5;
            const projectedProgress = getProjectedPlaneProgress(plane, plane.progress, midpointSeconds);

            if (projectedProgress >= targetProgress) {
                highSeconds = midpointSeconds;
            } else {
                lowSeconds = midpointSeconds;
            }
        }

        return highSeconds;
    }

    function getArrivalTouchdownPredictionSeconds(plane) {
        const runwayStart = plane.runwayStart ?? 1;
        return getSecondsUntilPlaneProgress(plane, runwayStart);
    }

    function isPlanePredictedToOccupyRunwayAtSeconds(plane, secondsAhead) {
        if (!plane.routeProfile?.totalLength) {
            return false;
        }

        const projectedProgress = getProjectedPlaneProgress(plane, plane.progress, secondsAhead);
        return isPlaneOnRunwayAtProgress(plane, projectedProgress);
    }

    function shouldTriggerPredictedRunwayGoAround(plane, activePlanes) {
        if (!canPlaneInitiateGoAround(plane)) {
            return false;
        }

        const touchdownSeconds = getArrivalTouchdownPredictionSeconds(plane);

        if (touchdownSeconds == null) {
            return false;
        }

        return activePlanes.some((otherPlane) => {
            if (
                otherPlane === plane
                || otherPlane.runwayName !== plane.runwayName
                || !otherPlane.routeProfile?.totalLength
            ) {
                return false;
            }

            return arrivalRunwayConflictProbeOffsetsSeconds.some((offsetSeconds) => {
                const probeSeconds = Math.max(touchdownSeconds + offsetSeconds, 0);
                return isPlanePredictedToOccupyRunwayAtSeconds(otherPlane, probeSeconds);
            });
        });
    }

    function extendPolylineEndpoints(linePoints, extensionRatio = 0.8) {
        if (linePoints.length < 2) {
            return linePoints;
        }

        const [firstLat, firstLng] = linePoints[0];
        const [secondLat, secondLng] = linePoints[1];
        const [lastLat, lastLng] = linePoints.at(-1);
        const [preLastLat, preLastLng] = linePoints.at(-2);
        const startExtension = [
            firstLat + ((firstLat - secondLat) * extensionRatio),
            firstLng + ((firstLng - secondLng) * extensionRatio)
        ];
        const endExtension = [
            lastLat + ((lastLat - preLastLat) * extensionRatio),
            lastLng + ((lastLng - preLastLng) * extensionRatio)
        ];

        return [startExtension, ...linePoints.slice(1, -1), endExtension];
    }

    yulKmlOverlay.placemarks.forEach((placemark) => {
        const category = classifyKmlPlacemark(placemark.name);
        const targetLayer = kmlGroups[category];
        const presentation = getCategoryPresentation(category, placemark.style);

        placemark.lines.forEach((linePoints) => {
            if (category === "taxiways") {
                taxiwayLineSets.push(linePoints);
            } else {
                if (category === "runways") {
                    runwayLineSets.push({ id: `${placemark.id}-runway-${kmlCounts[category]}`, name: placemark.name, linePoints });
                }

                if (category === "holds") {
                    holdLineSets.push({ id: `${placemark.id}-hold-${kmlCounts[category]}`, name: placemark.name, linePoints });
                }

                if (category === "other") {
                    parkingLineSets.push({ id: `${placemark.id}-parking-${kmlCounts[category]}`, name: placemark.name, linePoints });
                }

                addOutlinedPolyline(
                    targetLayer,
                    linePoints,
                    presentation,
                    `<strong>${placemark.name}</strong><br>${presentation.label} from Montreal YUL.kml`
                );

                if (category === "runways") {
                    addRunwayLabels(targetLayer, placemark, linePoints);
                }
            }

            kmlCounts[category] += 1;
        });

        placemark.polygons.forEach((polygonPoints) => {
            registerScalableLayer(L.polygon(polygonPoints, {
                color: "#163726",
                opacity: 0.9,
                weight: Math.max(presentation.lineWeight - 1, 1.5),
                fillColor: "#234d35",
                fillOpacity: 0.72,
                className: "kml-overlay-area"
            }).addTo(targetLayer), Math.max(presentation.lineWeight - 1, 1.5)).bindPopup(`<strong>${placemark.name}</strong><br>${presentation.label} area from Montreal YUL.kml`);

            kmlCounts[category] += 1;
        });

        placemark.points.forEach((point) => {
            L.circleMarker(point, {
                radius: presentation.pointRadius,
                color: presentation.label === "Center Lines" ? "#111111" : presentation.color,
                weight: 1.5,
                fillColor: presentation.fillColor,
                fillOpacity: 0.9,
                className: "kml-overlay-point"
            }).addTo(targetLayer).bindPopup(`<strong>${placemark.name}</strong><br>${presentation.label} point from Montreal YUL.kml`);

            kmlCounts[category] += 1;
        });
    });

    if (taxiwayLineSets.length) {
        const taxiwayRouteGraph = buildPolylineGraph(taxiwayLineSets);
        const surfaceRouteGraph = buildPolylineGraph([
            ...taxiwayLineSets,
            ...runwayLineSets.map((entry) => entry.linePoints)
        ]);
        const runwayChoices = [...new Set(runwayLineSets.map((entry) => entry.name).filter(Boolean))];
        const planeControlList = document.getElementById("plane-control-list");
        const planeSearchInput = document.getElementById("plane-search-input");
        const manualArrivalSpawnButton = document.getElementById("manual-arrival-spawn");
        let lastPlaneControlPanelMarkup = "";
        let lastPlaneControlPanelRenderAt = 0;
        let planeSearchQuery = "";
        const planeControlPanelRefreshMs = 450;

        function canPlaneReceiveDepartureClearance(plane) {
            return plane.operationType !== "arrival"
                && !plane.returningToGate
                && Boolean(plane.runwayName || plane.hasAssignedRunway || plane.routeProfile?.totalLength);
        }

        function createPlaneActionMarkup(plane) {
            const isArrival = plane.operationType === "arrival" && plane.returningToGate;
            const enforceArrivalTaxiSpeed = shouldEnforceArrivalTaxiSpeed(plane);
            const hasRunwayAssignment = plane.hasAssignedRunway && !plane.returningToGate && !isArrival;
            const canChangeDepartureClearance = canPlaneReceiveDepartureClearance(plane);
            const canGoAround = isArrival && canPlaneGoAround(plane);
            const effectiveLandingSuccessRate = isArrival
                ? rateLanding(plane)
                : plane.landingSuccessRate ?? weatherState.landingSuccessRate;
            plane.landingSuccessRate = effectiveLandingSuccessRate;
            const landingSuccessLabel = isArrival
                ? formatPercent(effectiveLandingSuccessRate)
                : null;
            const runwayButtons = isArrival
                ? ""
                : runwayChoices.map((runwayName) => {
                const isActive = runwayName === plane.runwayName;
                return `
                    <button type="button" class="plane-runway-button${isActive ? " active" : ""}" data-runway="${runwayName}">
                        ${runwayName}
                    </button>
                `;
            }).join("");
            const departureClearance = getPlaneDepartureClearance(plane);
            const speedPercent = enforceArrivalTaxiSpeed ? 100 : Math.round((plane.speedMultiplier ?? 1) * 100);
            const clearanceControls = !isArrival
                ? `
                    <div class="plane-clearance-row">
                        <button type="button" class="plane-action-button clearance${canChangeDepartureClearance && departureClearance === "hold-short" ? " active-clearance" : ""}" data-clearance="hold-short" ${canChangeDepartureClearance ? "" : "disabled"}>
                            Hold short
                        </button>
                        <button type="button" class="plane-action-button clearance${canChangeDepartureClearance && departureClearance === "line-up" ? " active-clearance" : ""}" data-clearance="line-up" ${canChangeDepartureClearance ? "" : "disabled"}>
                            Line up & wait
                        </button>
                        <button type="button" class="plane-action-button clearance${canChangeDepartureClearance && departureClearance === "immediate" ? " active-clearance" : ""}" data-clearance="immediate" ${canChangeDepartureClearance ? "" : "disabled"}>
                            Immediate takeoff
                        </button>
                    </div>
                `
                : "";
            const speedControls = `
                <div class="plane-action-row">
                    <button type="button" class="plane-action-button" data-speed-change="-1" ${enforceArrivalTaxiSpeed ? "disabled" : ""}>
                        Slower
                    </button>
                    <button type="button" class="plane-action-button" data-speed-change="1" ${enforceArrivalTaxiSpeed ? "disabled" : ""}>
                        Faster
                    </button>
                </div>
            `;
            const goAroundAction = isArrival
                ? `
                    <button type="button" class="plane-action-button" data-go-around="true" ${canGoAround ? "" : "disabled"}>
                        Go around
                    </button>
                `
                : "";
            const abortAction = plane.hasAssignedRunway && plane.progress >= plane.runwayStart && !plane.returningToGate && !isArrival
                ? `
                    <button type="button" class="plane-action-button abort" data-abort-takeoff="true">
                        Abort take off
                    </button>
                `
                : "";

            return {
                runwayButtons,
                clearanceControls,
                speedPercent,
                speedControls,
                goAroundAction,
                abortAction,
                landingStatus: isArrival
                    ? `<small>Landing success ${landingSuccessLabel} · Go-around ${formatPercent(1 - effectiveLandingSuccessRate)}</small>`
                    : "",
                hint: hasRunwayAssignment
                    ? isArrival
                        ? canGoAround
                            ? `Inbound via ${plane.arrivalRunwayName ?? "arrival runway"}. Go-around available before the black centerline segment.`
                            : plane.goAroundUsed
                                ? plane.goAroundReason ?? `Inbound via ${plane.arrivalRunwayName ?? "arrival runway"}. Go-around already used for this approach.`
                            : `Inbound via ${plane.arrivalRunwayName ?? "arrival runway"}. Past the black centerline segment, landing continues.`
                        : {
                        "hold-short": "Hold short before the purple hold line.",
                        "line-up": "Line up on the runway and wait.",
                        "immediate": "Line up and depart without stopping on the runway."
                    }[departureClearance]
                    : !isArrival
                        ? "Assign a runway first, then issue hold short, line up, or immediate takeoff."
                    : "Click a runway to start pushback and taxi."
            };
        }

        function getAirlineBranding(plane) {
            const airline = airlineDetailsByCode.get(plane.airlineCode);
            const logoUrl = airline?.logoFile ? airlineLogoUrlByFile[airline.logoFile] : null;

            return {
                airlineName: plane.airlineName,
                airlineCode: plane.airlineCode,
                logoUrl,
                logoScale: airline?.logoScale ?? 1.12
            };
        }

        function createAirlineBadgeMarkup(plane) {
            const branding = getAirlineBranding(plane);

            if (branding.logoUrl) {
                return `
                    <span class="airline-badge" aria-label="${branding.airlineName} logo" style="--airline-logo-scale: ${branding.logoScale};">
                        <img src="${branding.logoUrl}" alt="${branding.airlineName} logo" loading="lazy">
                    </span>
                `;
            }

            return `
                <span class="airline-badge airline-badge-fallback" aria-label="${branding.airlineName}">
                    <span>${branding.airlineCode}</span>
                </span>
            `;
        }

        function createPlaneControlPopupContent(plane) {
            const controls = createPlaneActionMarkup(plane);
            const airlineBadge = createAirlineBadgeMarkup(plane);
            const telemetry = getPlaneTelemetry(plane);
            const runwaySelectorMarkup = controls.runwayButtons
                ? `
                    <div class="plane-runway-selector">
                        ${controls.runwayButtons}
                    </div>
                `
                : "";

            return `
                <div class="plane-control-popup" data-plane="${plane.callsign}">
                    <strong>${plane.callsign}</strong>
                    <div class="plane-airline-row">
                        ${airlineBadge}
                        <div class="plane-airline-meta">
                            <small>${plane.airlineName}</small>
                            <small>${plane.aircraftModel}</small>
                        </div>
                    </div>
                    <small>Gate ${plane.gate} · ${plane.parkingName}</small>
                    <small>${telemetry.speedLabel} · Altitude ${telemetry.altitudeLabel}</small>
                    ${controls.landingStatus}
                    ${runwaySelectorMarkup}
                    ${controls.clearanceControls}
                    ${controls.goAroundAction}
                    ${controls.speedControls}
                    <small>Speed control ${controls.speedPercent}%</small>
                    ${controls.abortAction}
                    <small class="plane-control-hint">${controls.hint}</small>
                </div>
            `;
        }

        function createPlaneControlCardContent(plane) {
            const controls = createPlaneActionMarkup(plane);
            const airlineBadge = createAirlineBadgeMarkup(plane);
            const telemetry = getPlaneTelemetry(plane);
            const runwaySelectorMarkup = controls.runwayButtons
                ? `
                    <div class="plane-runway-selector">
                        ${controls.runwayButtons}
                    </div>
                `
                : "";
            const statusLabel = plane.operationType === "arrival" && plane.returningToGate
                ? plane.progress < (plane.arrivalRolloutEnd ?? 0)
                    ? `Landing ${plane.arrivalRunwayName ?? "Inbound"}`
                    : `Inbound ${plane.gate}`
                : plane.returningToGate
                ? "Returning to stand"
                : plane.hasAssignedRunway
                    ? (plane.progress >= plane.runwayStart ? "On runway" : `Assigned ${plane.runwayName}`)
                    : "Awaiting runway";

            return `
                <article class="plane-control-card" data-plane="${plane.callsign}">
                    <div class="plane-control-card-head">
                        <div>
                            <span class="status-label">Flight ${plane.callsign}</span>
                            <strong>${plane.callsign}</strong>
                        </div>
                        <span class="plane-control-status">${statusLabel}</span>
                    </div>
                    <div class="plane-airline-row">
                        ${airlineBadge}
                        <div class="plane-airline-meta">
                            <small>${plane.airlineName}</small>
                            <small>${plane.aircraftModel}</small>
                        </div>
                    </div>
                    <small>Gate ${plane.gate} · ${plane.parkingName}</small>
                    <small>${telemetry.speedLabel} · Altitude ${telemetry.altitudeLabel}</small>
                    ${controls.landingStatus}
                    ${runwaySelectorMarkup}
                    ${controls.clearanceControls}
                    ${controls.goAroundAction}
                    ${controls.speedControls}
                    <small>Speed control ${controls.speedPercent}%</small>
                    ${controls.abortAction}
                    <small class="plane-control-hint">${controls.hint}</small>
                </article>
            `;
        }

        function renderPlaneControlPanel(planes, options = {}) {
            if (!planeControlList) {
                return;
            }

            const forceRender = options.force ?? true;
            const renderTimestamp = options.timestamp ?? performance.now();

            if (!forceRender && (renderTimestamp - lastPlaneControlPanelRenderAt) < planeControlPanelRefreshMs) {
                return;
            }

            const normalizedQuery = planeSearchQuery.trim().toUpperCase();
            const visiblePlanes = normalizedQuery
                ? planes.filter((plane) => plane.callsign.includes(normalizedQuery))
                : planes;
            const inboundPlanes = visiblePlanes.filter((plane) => plane.operationType === "arrival" && plane.returningToGate);
            const takeoffBoundPlanes = visiblePlanes.filter((plane) => {
                return plane.operationType !== "arrival"
                    && plane.hasAssignedRunway
                    && !plane.returningToGate;
            });
            const groundPlanes = visiblePlanes.filter((plane) => {
                return !inboundPlanes.includes(plane) && !takeoffBoundPlanes.includes(plane);
            });
            const buildSectionMarkup = (title, subtitle, sectionPlanes) => {
                return `
                    <section class="plane-control-section">
                        <div class="plane-control-section-heading">
                            <strong>${title}</strong>
                            <span class="plane-control-section-count">${sectionPlanes.length}</span>
                            <small>${subtitle}</small>
                        </div>
                        <div class="plane-control-section-list">
                            ${sectionPlanes.length
                                ? sectionPlanes.map((plane) => createPlaneControlCardContent(plane)).join("")
                                : `<div class="plane-control-section-empty">No aircraft in this group.</div>`}
                        </div>
                    </section>
                `;
            };
            const nextMarkup = visiblePlanes.length
                ? [
                    buildSectionMarkup("Inbound Aircraft", "Landing rollout and taxi-in traffic.", inboundPlanes),
                    buildSectionMarkup("Departure Traffic", "Aircraft taxiing out, holding short, or lined up for departure.", takeoffBoundPlanes),
                    buildSectionMarkup("Aircraft On Ground", "Parked, turnaround, and return-to-gate traffic.", groundPlanes)
                ].join("")
                : `<div class="plane-control-empty">No flights match “${planeSearchQuery.trim()}”.</div>`;

            if (nextMarkup === lastPlaneControlPanelMarkup) {
                return;
            }

            lastPlaneControlPanelRenderAt = renderTimestamp;
            lastPlaneControlPanelMarkup = nextMarkup;
            planeControlList.innerHTML = nextMarkup;
        }

        function handlePlaneControlAction(plane, button) {
            if (button.disabled) {
                return;
            }

            const selectedRunway = button.getAttribute("data-runway");

            if (selectedRunway) {
                reroutePlaneToRunway(plane, selectedRunway);
                return;
            }

            const selectedClearance = button.getAttribute("data-clearance");

            if (selectedClearance) {
                if (!canPlaneReceiveDepartureClearance(plane)) {
                    return;
                }

                setPlaneDepartureClearance(plane, selectedClearance);
                return;
            }

            if (button.hasAttribute("data-abort-takeoff")) {
                abortPlaneTakeoff(plane);
                return;
            }

            if (button.hasAttribute("data-go-around")) {
                triggerPlaneGoAround(plane);
                return;
            }

            const delta = Number(button.getAttribute("data-speed-change"));

            if (Number.isFinite(delta) && delta !== 0) {
                adjustPlaneSpeed(plane, delta);
            }
        }

        function bindPlanePopupActions(plane, popupElement) {
            if (!popupElement) {
                return;
            }

            const popupInteractionElement = popupElement;

            if (plane.popupActionElement && plane.popupActionPressHandler) {
                plane.popupActionElement.removeEventListener("mousedown", plane.popupActionPressHandler);
                plane.popupActionElement.removeEventListener("pointerdown", plane.popupActionPressHandler);
            }

            if (plane.popupActionElement && plane.popupActionHandler) {
                plane.popupActionElement.removeEventListener("click", plane.popupActionHandler);
            }

            plane.popupActionPressHandler = (event) => {
                const button = event.target instanceof Element
                    ? event.target.closest("button")
                    : null;

                if (!button) {
                    return;
                }

                event.preventDefault();
                event.stopPropagation();
                clearPlanePopupCloseTimer(plane);
            };

            plane.popupActionHandler = (event) => {
                const button = event.target instanceof Element
                    ? event.target.closest("button")
                    : null;

                if (!button) {
                    return;
                }

                event.preventDefault();
                event.stopPropagation();
                clearPlanePopupCloseTimer(plane);
                handlePlaneControlAction(plane, button);
            };

            plane.popupActionElement = popupInteractionElement;
            popupInteractionElement.addEventListener("pointerdown", plane.popupActionPressHandler);
            popupInteractionElement.addEventListener("mousedown", plane.popupActionPressHandler);
            popupInteractionElement.addEventListener("click", plane.popupActionHandler);
        }

        function clearPlanePopupCloseTimer(plane) {
            if (plane.popupCloseTimeoutId == null) {
                return;
            }

            window.clearTimeout(plane.popupCloseTimeoutId);
            plane.popupCloseTimeoutId = null;
        }

        function schedulePlanePopupClose(plane) {
            clearPlanePopupCloseTimer(plane);
            plane.popupCloseTimeoutId = window.setTimeout(() => {
                plane.popupCloseTimeoutId = null;

                if (!plane.isMarkerHovered && !plane.isPopupHovered) {
                    plane.marker.closePopup();
                }
            }, 160);
        }

        function bindPlanePopupHoverHandlers(plane, popupElement) {
            if (!popupElement) {
                return;
            }

            const popupHoverElement = popupElement;

            if (plane.popupHoverElement && plane.popupMouseEnterHandler && plane.popupMouseLeaveHandler) {
                plane.popupHoverElement.removeEventListener("mouseenter", plane.popupMouseEnterHandler);
                plane.popupHoverElement.removeEventListener("mouseleave", plane.popupMouseLeaveHandler);
            }

            plane.popupMouseEnterHandler = () => {
                plane.isPopupHovered = true;
                clearPlanePopupCloseTimer(plane);
            };

            plane.popupMouseLeaveHandler = () => {
                plane.isPopupHovered = false;
                schedulePlanePopupClose(plane);
            };

            plane.popupHoverElement = popupHoverElement;
            popupHoverElement.addEventListener("mouseenter", plane.popupMouseEnterHandler);
            popupHoverElement.addEventListener("mouseleave", plane.popupMouseLeaveHandler);
        }

        function refreshPlanePopupContent(plane, keepOpen = false) {
            const wasOpen = plane.marker.isPopupOpen();
            plane.marker.setPopupContent(createPlaneControlPopupContent(plane));

            if (keepOpen || wasOpen) {
                plane.marker.openPopup();
                const popupElement = plane.marker.getPopup()?.getElement();
                bindPlanePopupActions(plane, popupElement);
                bindPlanePopupHoverHandlers(plane, popupElement);
            }
        }

        function updatePlanePopup(plane, keepOpen = false) {
            refreshPlanePopupContent(plane, keepOpen);

            if (plane.allPlanes) {
                renderPlaneControlPanel(plane.allPlanes);
            }
        }

        const {
            rateLanding,
            setLanding,
            autoAround,
            triggerPlaneGoAround
        } = createPlaneArrivalOperations({
            weatherState,
            clampNumber,
            canPlaneGoAround: canPlaneInitiateGoAround,
            interpolatePoint,
            getHeadingBetweenPoints,
            projectPointByHeading,
            normalizeHeading,
            getArrivalCurveDirection,
            smoothRouteTurns,
            dedupeRoutePoints,
            goAroundPatternOuterRadiusMeters,
            goAroundPatternRadiusVarianceMeters,
            goAroundOrbitSamples,
            goAroundPatternStraightAheadMeters,
            goAroundPatternRejoinLeadMeters,
            goAroundMaximumTurnDegrees,
            interpolateRouteProfile,
            measurePolylineLength,
            createRouteProfile,
            getRouteProgressForPoint,
            createPlaneMarkerIcon,
            getPlaneHeading,
            map,
            syncArrivalGuideLine,
            updatePlanePopup
        });

        const {
            setPlaneDepartureClearance,
            setPlaneParked,
            abortPlaneTakeoff,
            reroutePlaneToRunway
        } = createPlaneDepartureOperations({
            getRunwayHoldProgress,
            clearPlaneApproachGuide,
            baseLandingSuccessRate,
            createPlaneMarkerIcon,
            getPlaneHeading,
            map,
            updatePlanePopup,
            createRouteProfile,
            interpolateRouteProfile,
            buildReturnToGateRoute,
            parkingLineSets,
            taxiwayLineSets,
            runwayLineSets,
            surfaceRouteGraph,
            buildDepartureRoute,
            holdLineSets,
            taxiwayRouteGraph,
            buildDirectDepartureRoute
        });

        function canPlaneGoAround(plane) {
            return canPlaneInitiateGoAround(plane);
        }

        function adjustPlaneSpeed(plane, delta) {
            if (shouldEnforceArrivalTaxiSpeed(plane)) {
                plane.speedMultiplier = 1;
                updatePlanePopup(plane, true);
                return;
            }

            const nextMultiplier = Math.min(Math.max((plane.speedMultiplier ?? 1) + (delta * 0.2), 0.4), 2.2);
            plane.speedMultiplier = Number(nextMultiplier.toFixed(2));
            updatePlanePopup(plane, true);
        }

        function attachPlanePopupHandlers(plane) {
            plane.marker.bindPopup(createPlaneControlPopupContent(plane), {
                autoClose: false,
                autoPan: false,
                closeButton: false,
                closeOnClick: false,
                interactive: true,
                className: "plane-control-popup-shell",
                offset: [0, -10]
            });

            plane.marker.on("mouseover", () => {
                plane.isMarkerHovered = true;
                clearPlanePopupCloseTimer(plane);
                map.closePopup();
                plane.marker.openPopup();
            });

            plane.marker.on("mouseout", () => {
                plane.isMarkerHovered = false;
                schedulePlanePopupClose(plane);
            });

            plane.marker.on("popupopen", (event) => {
                const popupElement = event.popup.getElement();

                if (popupElement) {
                    L.DomEvent.disableClickPropagation(popupElement);
                    L.DomEvent.disableScrollPropagation(popupElement);
                }

                bindPlanePopupActions(plane, popupElement);
                bindPlanePopupHoverHandlers(plane, popupElement);
            });

            plane.marker.on("popupclose", () => {
                plane.isPopupHovered = false;

                if (plane.popupActionElement && plane.popupActionPressHandler) {
                    plane.popupActionElement.removeEventListener("pointerdown", plane.popupActionPressHandler);
                    plane.popupActionElement.removeEventListener("mousedown", plane.popupActionPressHandler);
                }

                if (plane.popupActionElement && plane.popupActionHandler) {
                    plane.popupActionElement.removeEventListener("click", plane.popupActionHandler);
                }

                plane.popupActionElement = null;
                plane.popupActionPressHandler = null;
                plane.popupActionHandler = null;

                if (plane.popupHoverElement && plane.popupMouseEnterHandler && plane.popupMouseLeaveHandler) {
                    plane.popupHoverElement.removeEventListener("mouseenter", plane.popupMouseEnterHandler);
                    plane.popupHoverElement.removeEventListener("mouseleave", plane.popupMouseLeaveHandler);
                }

                plane.popupHoverElement = null;
            });
        }

        function clearPlaneApproachGuide(plane) {
            if (!plane.approachGuideLine) {
                return;
            }

            plane.approachGuideLine.remove();
            plane.approachGuideLine = null;
        }

        function getArrivalGuideLinePoints(plane) {
            if (
                plane.operationType !== "arrival"
                || !plane.returningToGate
                || !plane.routeProfile?.totalLength
                || plane.progress >= (plane.arrivalRolloutEnd ?? 0)
            ) {
                return [];
            }

            const startProgress = 0;
            const endProgress = Math.max(plane.arrivalRolloutEnd ?? 0, startProgress);
            const sampleCount = Math.max(18, Math.ceil((endProgress - startProgress) * 42));

            return Array.from({ length: sampleCount + 1 }, (_, index) => {
                const progress = startProgress + ((endProgress - startProgress) * (index / sampleCount));
                const point = interpolateRouteProfile(plane.routeProfile, progress);
                return [point.lat, point.lng];
            });
        }

        function syncArrivalGuideLine(plane) {
            const guidePoints = getArrivalGuideLinePoints(plane);

            if (!guidePoints.length) {
                clearPlaneApproachGuide(plane);
                return;
            }

            if (!plane.approachGuideLine) {
                plane.approachGuideLine = L.polyline(guidePoints, {
                    color: arrivalApproachLineColor,
                    opacity: 0.9,
                    weight: 2.2,
                    dashArray: "10 10",
                    lineCap: "round",
                    lineJoin: "round",
                    interactive: false
                }).addTo(arrivalGuideLayer);

                return;
            }

            plane.approachGuideLine.setLatLngs(guidePoints);
        }

        registerScalableLayer(L.polyline(taxiwayLineSets, {
            color: "#111111",
            opacity: 0.84,
            weight: 3.7,
            className: "kml-overlay-line",
            lineCap: "round",
            lineJoin: "round"
        }).addTo(kmlGroups.taxiways), 3.7);

        registerScalableLayer(L.polyline(taxiwayLineSets, {
            color: "#dcbf19",
            opacity: 1,
            weight: 2.6,
            className: "kml-overlay-line",
            lineCap: "round",
            lineJoin: "round"
        }).addTo(kmlGroups.taxiways), 2.6).bindPopup("<strong>Taxiways</strong><br>Taxiway network from Montreal YUL.kml");

        const reservedParkingIds = new Set();
        const startupPlaneFeed = createStartupTraffic(parkingLineSets, runwayLineSets, startupOccupancyRatio, 0);
        const parkingEntryById = new Map(parkingLineSets.map((entry) => [entry.id, entry]));
        const animatedPlanes = startupPlaneFeed.map((plane, index) => {
            const gateCoords = plane.gateCoords ?? airportCenter;
            const preferredParkingEntry = parkingEntryById.get(plane.preferredParkingId);
            const parkingStand = buildParkingStandFromEntry(preferredParkingEntry, taxiwayLineSets)
                ?? resolveParkingStand(gateCoords, parkingLineSets, taxiwayLineSets, reservedParkingIds, plane.preferredParkingId);

            if (!parkingStand) {
                return null;
            }

            reservedParkingIds.add(parkingStand.parkingMatch.entry.id);

            const isArrival = plane.operationType === "arrival";
            const initialProgress = 0;
            const initialDirection = 1;
            const arrivalOrigin = plane.arrivalOrigin ?? parkingStand.spawnPoint;
            const marker = L.marker({ lat: arrivalOrigin[0], lng: arrivalOrigin[1] }, {
                icon: createPlaneMarkerIcon(plane.callsign, parkingStand.spawnHeading, map.getZoom()),
                zIndexOffset: 6000,
                keyboard: false
            }).addTo(movingPlaneLayer);

            const animatedPlane = {
                ...plane,
                marker,
                gateCoords,
                standbyCoords: parkingStand.spawnPoint,
                standbyHeading: parkingStand.spawnHeading,
                route: null,
                routeProfile: null,
                parkingId: parkingStand.parkingMatch.entry.id,
                parkingName: parkingStand.parkingMatch.entry.name ?? "Parking Line",
                standbyParkingId: parkingStand.parkingMatch.entry.id,
                standbyParkingName: parkingStand.parkingMatch.entry.name ?? "Parking Line",
                runwayName: null,
                pushbackEnd: 0,
                holdProgress: 0,
                runwayStart: 1,
                pushbackSpeed: Math.max(plane.speed * 0.42, 0.0016),
                taxiSpeed: Math.max(plane.speed * 0.58, 0.0022),
                lineupSpeed: Math.max(plane.speed * 0.34, 0.0014),
                runwaySpeed: Math.max(plane.speed * 5.2, 0.031),
                takeoffAcceleration: Math.max(plane.speed * 9.5, 0.13),
                abortSpeed: Math.max(plane.speed * 0.26, 0.0012),
                arrivalApproachSpeed: Math.max(plane.speed * 10.2, 0.044),
                arrivalLandingSpeed: Math.max(plane.speed * 7.6, 0.028),
                arrivalRolloutEnd: 0,
                goAroundCutoffProgress: 0,
                goAroundUsed: false,
                goAroundEndProgress: 0,
                arrivalOrigin: plane.arrivalOrigin ?? null,
                arrivalRunwayName: plane.arrivalRunwayName ?? null,
                arrivalRunwayDesignation: plane.arrivalRunwayDesignation ?? null,
                approachGuideLine: null,
                holdDelayMs: 350 + (index * 40),
                holdStartedAt: null,
                progress: initialProgress,
                direction: initialDirection,
                hasAssignedRunway: isArrival,
                returningToGate: isArrival,
                departureClearance: "hold-short",
                speedMultiplier: 1,
                landingStabilityFactor: 0.92,
                landingSuccessRate: baseLandingSuccessRate,
                goAroundReason: null,
                autoGoAroundTriggered: false
            };

            if (isArrival) {
                const arrivalRoute = buildArrivalRoute(
                    parkingLineSets,
                    taxiwayLineSets,
                    runwayLineSets,
                    holdLineSets,
                    surfaceRouteGraph,
                    {
                        preferredParkingId: plane.preferredParkingId,
                        preferredRunwayName: plane.arrivalRunwayName,
                        gateOrigin: gateCoords
                    }
                );

                if (!arrivalRoute) {
                    marker.remove();
                    return null;
                }

                animatedPlane.route = arrivalRoute.route;
                animatedPlane.routeProfile = createRouteProfile(arrivalRoute.route);
                animatedPlane.parkingId = arrivalRoute.parkingId;
                animatedPlane.parkingName = arrivalRoute.parkingName;
                animatedPlane.runwayName = arrivalRoute.runwayName;
                animatedPlane.runwayStart = arrivalRoute.runwayStart;
                animatedPlane.arrivalRolloutEnd = arrivalRoute.arrivalRolloutEnd;
                animatedPlane.goAroundCutoffProgress = arrivalRoute.goAroundCutoffProgress;
                animatedPlane.arrivalOrigin = arrivalRoute.arrivalOrigin;
                animatedPlane.arrivalRunwayDesignation = arrivalRoute.arrivalRunwayDesignation;
                setLanding(animatedPlane);
                animatedPlane.progress = 0;
                const initialArrivalPosition = interpolateRouteProfile(animatedPlane.routeProfile, 0);
                animatedPlane.marker.setLatLng(initialArrivalPosition);
                syncArrivalGuideLine(animatedPlane);
            }

            animatedPlane.marker.setIcon(createPlaneMarkerIcon(animatedPlane.callsign, getPlaneHeading(animatedPlane), map.getZoom()));

            attachPlanePopupHandlers(animatedPlane);

            return animatedPlane;
        }).filter(Boolean);
        const planeByCallsign = new Map(animatedPlanes.map((plane) => [plane.callsign, plane]));
        const { spawnArrivalPlane } = createPlaneArrivalSpawner({
            animatedPlanes,
            planeByCallsign,
            parkingLineSets,
            runwayLineSets,
            shuffleItems,
            getLinePoints,
            interpolatePath,
            getNearestGateMarker,
            getGateNumber,
            gateNumberByLabel,
            airportCenter,
            AssignAircraftModels,
            parkingEntryById,
            buildParkingStandFromEntry,
            taxiwayLineSets,
            reservedParkingIds,
            resolveParkingStand,
            buildArrivalRoute,
            holdLineSets,
            surfaceRouteGraph,
            createPlaneMarkerIcon,
            map,
            movingPlaneLayer,
            baseLandingSuccessRate,
            createRouteProfile,
            interpolateRouteProfile,
            getPlaneHeading,
            attachPlanePopupHandlers,
            syncArrivalGuideLine,
            renderPlaneControlPanel,
            setLanding
        });

        if (planeControlList) {
            let hoveredPlane = null;
            let hoveredPlaneCard = null;

            function clearHoveredPlaneIndicator() {
                if (!hoveredPlane) {
                    return;
                }

                hoveredPlaneCard?.classList.remove("plane-control-card-linked");
                hoveredPlane.marker.getElement()?.classList.remove("plane-marker-linked");
                hoveredPlane.marker.setZIndexOffset(6000);
                hoveredPlane.marker.closePopup();
                hoveredPlane = null;
                hoveredPlaneCard = null;
            }

            function highlightPlaneFromCard(plane, card) {
                if (hoveredPlane === plane && hoveredPlaneCard === card) {
                    return;
                }

                clearHoveredPlaneIndicator();
                hoveredPlane = plane;
                hoveredPlaneCard = card;
                card.classList.add("plane-control-card-linked");
                plane.marker.getElement()?.classList.add("plane-marker-linked");
                plane.marker.setZIndexOffset(8500);
                map.closePopup();
                plane.marker.openPopup();
            }

            planeControlList.addEventListener("mouseover", (event) => {
                if (!(event.target instanceof Element)) {
                    return;
                }

                const card = event.target.closest("[data-plane]");

                if (!card || !(card instanceof HTMLElement)) {
                    return;
                }

                if (event.relatedTarget instanceof Node && card.contains(event.relatedTarget)) {
                    return;
                }

                const plane = planeByCallsign.get(card.getAttribute("data-plane"));

                if (plane) {
                    highlightPlaneFromCard(plane, card);
                }
            });

            planeControlList.addEventListener("mouseout", (event) => {
                if (!(event.target instanceof Element)) {
                    return;
                }

                const card = event.target.closest("[data-plane]");

                if (!card) {
                    return;
                }

                if (event.relatedTarget instanceof Node && card.contains(event.relatedTarget)) {
                    return;
                }

                if (hoveredPlaneCard === card) {
                    clearHoveredPlaneIndicator();
                }
            });

            planeControlList.addEventListener("click", (event) => {
                const button = event.target instanceof Element
                    ? event.target.closest("button")
                    : null;
                const card = event.target instanceof Element
                    ? event.target.closest("[data-plane]")
                    : null;

                if (!button || !card) {
                    return;
                }

                const plane = planeByCallsign.get(card.getAttribute("data-plane"));

                if (!plane) {
                    return;
                }

                handlePlaneControlAction(plane, button);
            });
        }

        if (planeSearchInput) {
            planeSearchInput.addEventListener("input", (event) => {
                planeSearchQuery = event.target.value ?? "";
                lastPlaneControlPanelMarkup = "";
                renderPlaneControlPanel(animatedPlanes);
            });
        }

        animatedPlanes.forEach((plane) => {
            plane.allPlanes = animatedPlanes;
        });
        renderPlaneControlPanel(animatedPlanes);

        if (manualArrivalSpawnButton) {
            manualArrivalSpawnButton.addEventListener("click", () => {
                spawnArrivalPlane();
            });
        }

        window.setTimeout(() => {
            spawnArrivalPlane();
            window.setInterval(spawnArrivalPlane, arrivalSpawnIntervalMs);
        }, arrivalSpawnIntervalMs);

        if (animatedPlanes.length) {
            const refreshPlaneIcons = () => {
                const zoom = map.getZoom();

                animatedPlanes.forEach((plane) => {
                    const heading = getPlaneHeading(plane);
                    plane.marker.setIcon(createPlaneMarkerIcon(plane.callsign, heading, zoom));
                    syncArrivalGuideLine(plane);
                });

                renderPlaneControlPanel(animatedPlanes);
            };

            let lastTimestamp = 0;

            const tick = (timestamp) => {
                if (!lastTimestamp) {
                    lastTimestamp = timestamp;
                }

                const deltaSeconds = (timestamp - lastTimestamp) / 1000;
                lastTimestamp = timestamp;
                const activePlanes = animatedPlanes.filter((plane) => plane.hasAssignedRunway && plane.routeProfile?.totalLength);
                const runwayDepartureLeaders = getRunwayDepartureLeaders(activePlanes);

                const occupiedRunways = new Set(
                    activePlanes
                        .filter((plane) => isPlaneOnRunway(plane))
                        .map((plane) => plane.runwayName)
                );
                const resolvedPositions = [];

                [...activePlanes]
                    .sort((left, right) => right.progress - left.progress)
                    .forEach((plane) => {
                    if (shouldEnforceArrivalTaxiSpeed(plane) && plane.speedMultiplier !== 1) {
                        plane.speedMultiplier = 1;
                    }

                    const previousProgress = plane.progress;
                    const runwayDepartureLeader = runwayDepartureLeaders.get(plane.runwayName);
                    let didWrapToRouteStart = false;
                    let nextProgress = plane.progress + (deltaSeconds * getDepartureSpeed(plane) * plane.direction);

                    if (
                        plane.progress < plane.holdProgress
                        && nextProgress >= plane.holdProgress
                    ) {
                        if (plane.holdStartedAt == null) {
                            plane.holdStartedAt = timestamp;
                        }

                        plane.progress = plane.holdProgress;
                    } else {
                        plane.progress = nextProgress;
                    }

                    if (
                        !plane.returningToGate
                        && plane.progress >= plane.holdProgress
                        && plane.progress < plane.runwayStart
                    ) {
                        const canLineUp = getPlaneDepartureClearance(plane) !== "hold-short";
                        const isWaitingForClearance = (runwayDepartureLeader && runwayDepartureLeader !== plane)
                            || occupiedRunways.has(plane.runwayName)
                            || plane.holdStartedAt == null
                            || !canLineUp;

                        if (isWaitingForClearance) {
                            plane.progress = getRunwayHoldProgress(plane);
                        }
                    }

                    if (
                        plane.progress >= plane.runwayStart
                        && plane.progress < 0.995
                        && !plane.returningToGate
                        && getPlaneDepartureClearance(plane) !== "immediate"
                    ) {
                        plane.progress = plane.runwayStart;
                    }

                    if (plane.progress >= 1) {
                        setPlaneParked(plane);
                        didWrapToRouteStart = true;
                    }

                    if (didWrapToRouteStart) {
                        return;
                    }

                    if (autoAround(plane, previousProgress, plane.progress)) {
                        triggerPlaneGoAround(plane);

                        const goAroundPosition = interpolateRouteProfile(plane.routeProfile, plane.progress);
                        resolvedPositions.push({
                            position: goAroundPosition,
                            progress: plane.progress,
                            runwayName: plane.runwayName,
                            minimumSpacingSquared: getMinimumPlaneSpacingSquared(plane),
                            prediction: buildPlanePrediction(plane, plane.progress),
                            isOnRunway: isPlaneOnRunway(plane)
                        });
                        return;
                    }

                    const shouldGoAroundForOccupiedRunwayNow = plane.operationType === "arrival"
                        && plane.returningToGate
                        && plane.progress < (plane.runwayStart ?? 0)
                        && occupiedRunways.has(plane.runwayName)
                        && canPlaneGoAround(plane);

                    if (shouldGoAroundForOccupiedRunwayNow) {
                        triggerPlaneGoAround(plane);

                        const goAroundPosition = interpolateRouteProfile(plane.routeProfile, plane.progress);
                        resolvedPositions.push({
                            position: goAroundPosition,
                            progress: plane.progress,
                            runwayName: plane.runwayName,
                            minimumSpacingSquared: getMinimumPlaneSpacingSquared(plane),
                            prediction: buildPlanePrediction(plane, plane.progress),
                            isOnRunway: isPlaneOnRunway(plane)
                        });
                        return;
                    }

                    if (shouldTriggerPredictedRunwayGoAround(plane, activePlanes)) {
                        triggerPlaneGoAround(plane);

                        const goAroundPosition = interpolateRouteProfile(plane.routeProfile, plane.progress);
                        resolvedPositions.push({
                            position: goAroundPosition,
                            progress: plane.progress,
                            runwayName: plane.runwayName,
                            minimumSpacingSquared: getMinimumPlaneSpacingSquared(plane),
                            prediction: buildPlanePrediction(plane, plane.progress),
                            isOnRunway: isPlaneOnRunway(plane)
                        });
                        return;
                    }

                    const spacingFallbackProgress = didWrapToRouteStart ? plane.progress : previousProgress;
                    const spacingResolution = resolvePlaneSpacing(plane, resolvedPositions, spacingFallbackProgress);
                    const shouldGoAroundForRunwayConflict = plane.operationType === "arrival"
                        && plane.returningToGate
                        && plane.progress < plane.runwayStart
                        && spacingResolution.blockingPlane?.runwayName === plane.runwayName
                        && spacingResolution.blockingPlane?.isOnRunway
                        && canPlaneGoAround(plane);

                    if (shouldGoAroundForRunwayConflict) {
                        triggerPlaneGoAround(plane);

                        const goAroundPosition = interpolateRouteProfile(plane.routeProfile, plane.progress);
                        resolvedPositions.push({
                            position: goAroundPosition,
                            progress: plane.progress,
                            runwayName: plane.runwayName,
                            minimumSpacingSquared: spacingResolution.minimumSpacingSquared,
                            prediction: buildPlanePrediction(plane, plane.progress),
                            isOnRunway: isPlaneOnRunway(plane)
                        });
                        return;
                    }

                    const isSpacingBlocked = !didWrapToRouteStart
                        && spacingResolution.progress < (previousProgress - 1e-6);

                    if (isSpacingBlocked) {
                        plane.progress = previousProgress;
                    } else {
                        plane.progress = spacingResolution.progress;
                    }

                    const position = isSpacingBlocked
                        ? interpolateRouteProfile(plane.routeProfile, plane.progress)
                        : spacingResolution.position;

                    if (isPlaneOnRunway(plane)) {
                        occupiedRunways.add(plane.runwayName);
                    }

                    resolvedPositions.push({
                        position,
                        progress: plane.progress,
                        runwayName: plane.runwayName,
                        minimumSpacingSquared: spacingResolution.minimumSpacingSquared,
                        prediction: spacingResolution.prediction,
                        isOnRunway: isPlaneOnRunway(plane)
                    });
                    const heading = getPlaneHeading(plane);
                    plane.marker.setLatLng(position);
                    plane.marker.setIcon(createPlaneMarkerIcon(plane.callsign, heading, map.getZoom()));
                    syncArrivalGuideLine(plane);
                    if (!plane.marker.isPopupOpen()) {
                        refreshPlanePopupContent(plane);
                    }
                });

                renderPlaneControlPanel(animatedPlanes, { force: false, timestamp });

                window.requestAnimationFrame(tick);
            };

            map.on("zoom zoomend viewreset", refreshPlaneIcons);
            refreshPlaneIcons();
            window.requestAnimationFrame(tick);
        }
    }

    [
        kmlGroups.other,
        kmlGroups.roads,
        kmlGroups.taxiways,
        kmlGroups.holds,
        kmlGroups.centerlines,
        kmlGroups.runways,
        arrivalGuideLayer,
        movingPlaneLayer
    ].forEach((group, index) => {
        group.eachLayer((layer) => {
            if (index === 0 && typeof layer.bringToBack === "function") {
                layer.bringToBack();
            } else if (typeof layer.bringToFront === "function") {
                layer.bringToFront();
            }
        });
    });

    L.control.layers({}, {
        "Runways": kmlGroups.runways,
        "Taxiways": kmlGroups.taxiways,
        "Center Lines": kmlGroups.centerlines,
        "Holds": kmlGroups.holds,
        "Roads": kmlGroups.roads,
        "Parking Lines": kmlGroups.other
    }, {
        collapsed: false,
        position: "topright"
    }).addTo(map);

    applyKmlLineWeights();
    map.on("zoom zoomend viewreset", applyKmlLineWeights);

    const kmlSummary = document.getElementById("kml-summary");
    if (kmlSummary) {
        kmlSummary.querySelector("strong").textContent = `${kmlCounts.runways} runway, ${kmlCounts.taxiways} taxiway`;
        kmlSummary.querySelector("small").textContent = `${kmlCounts.centerlines} center line, ${kmlCounts.holds} hold, ${kmlCounts.roads} road, ${kmlCounts.other} parking features`;
    }

    const mapBounds = L.latLngBounds(airportImageryBounds);
    Object.values(kmlGroups).forEach((group) => {
        if (group.getLayers().length) {
            mapBounds.extend(group.getBounds());
        }
    });

    map.fitBounds(mapBounds.pad(0.005), { padding: [2, 2] });
}

function refreshSummary() {
    document.getElementById("departures-count").textContent = String(flightFeed.filter((flight) => flight.route.startsWith("YUL")).length + 11);
    document.getElementById("arrivals-count").textContent = String(flightFeed.filter((flight) => !flight.route.startsWith("YUL")).length + 9);
    document.getElementById("vehicles-count").textContent = String(vehicleFeed.length + 5);
}

renderClock();
renderFlights();
renderGates();
renderVehicles();
renderAdvisories();
renderRunways();
refreshSummary();
syncWeather();
renderWeather();
setupMap();

window.setInterval(renderClock, 1000);
window.setInterval(() => {
    syncWeather();
    renderWeather();
}, weatherUpdateIntervalMs);