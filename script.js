import L from "leaflet";
import "leaflet/dist/leaflet.css";
import montrealYulKml from "./Media/Montreal YUL.kml?raw";
import planeLogo from "./Media/Plane Logo.png";

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

const gateMarkers = [
    { name: "Gate 52", coords: [45.4697, -73.7415], detail: "Domestic pier" },
    { name: "Gate 54", coords: [45.4692, -73.7431], detail: "Air Canada narrowbody stand" },
    { name: "Gate 57", coords: [45.4686, -73.7447], detail: "Regional swing gate" },
    { name: "Gate 63", coords: [45.4680, -73.7466], detail: "International contact stand" },
    { name: "Cargo North", coords: [45.4761, -73.7487], detail: "Freight apron" },
    { name: "South Pad", coords: [45.4623, -73.7319], detail: "De-ice and remote stand area" }
];

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

const taxiPlaneFeed = [
    { callsign: "ACA430", gate: "52", speed: 0.0065 },
    { callsign: "ACA311", gate: "54", speed: 0.0055 },
    { callsign: "PAL201", gate: "57", speed: 0.006 },
    { callsign: "AFR344", gate: "63", speed: 0.0048 },
    { callsign: "UPS721", gate: "Cargo North", speed: 0.0044 },
    { callsign: "DLH473", gate: "South Pad", speed: 0.0042 },
    { callsign: "WJA602", gate: "52", speed: 0.0051 },
    { callsign: "QTR763", gate: "54", speed: 0.0049 }
];

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
            color: "#c62828",
            fillColor: "#c62828",
            pointRadius: 4,
            lineWeight: 7,
            lineCap: "butt",
            lineJoin: "miter"
        },
        taxiways: {
            label: "Taxiways",
            color: "#dcbf19",
            fillColor: "#dcbf19",
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
            color: "#f57c00",
            fillColor: "#f57c00",
            pointRadius: 4,
            lineWeight: 3,
            lineCap: "round",
            lineJoin: "round"
        },
        centerlines: {
            label: "Center Lines",
            color: "#111111",
            fillColor: "#111111",
            pointRadius: 3,
            lineWeight: 2.5,
            lineCap: "round",
            lineJoin: "round"
        },
        other: {
            label: "Parking Lines",
            color: "#1e88e5",
            fillColor: "#1e88e5",
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
    const easedZoomRatio = Math.pow(zoomRatio, 2.1);
    const scale = minScale + (easedZoomRatio * (1 - minScale));

    return Math.max(baseWeight * scale, minWeight);
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

function renderFlights() {
    const flightTable = document.getElementById("flight-table");
    flightTable.innerHTML = flightFeed.map((flight) => `
        <article class="table-row">
            <div>
                <span class="table-head">Callsign</span>
                <strong>${flight.callsign}</strong>
            </div>
            <div>
                <span class="table-head">Route</span>
                <span>${flight.route}</span>
            </div>
            <div>
                <span class="table-head">Status</span>
                <small>${flight.status}</small>
            </div>
            <div>
                <span class="table-head">Gate / ETA</span>
                <strong>${flight.gate}</strong>
                <small class="mono">${flight.eta}</small>
            </div>
        </article>
    `).join("");
}

function renderGates() {
    const gateGrid = document.getElementById("gate-grid");
    gateGrid.innerHTML = gateFeed.map((gate) => `
        <article class="gate-card">
            <span class="status-label">Gate ${gate.gate}</span>
            <strong>${gate.carrier} · ${gate.aircraft}</strong>
            <small>${gate.state}</small>
            <p class="mono">${gate.notes}</p>
        </article>
    `).join("");
}

function renderVehicles() {
    const vehicleList = document.getElementById("vehicle-list");
    vehicleList.innerHTML = vehicleFeed.map((vehicle) => `
        <article class="vehicle-card">
            <div>
                <span class="status-label">${vehicle.id}</span>
                <strong>${vehicle.role}</strong>
                <small>${vehicle.task}</small>
            </div>
            <div class="vehicle-meta">
                <strong>${vehicle.zone}</strong>
                <small class="mono">${vehicle.eta}</small>
            </div>
        </article>
    `).join("");
}

function renderAdvisories() {
    const advisoryStack = document.getElementById("advisory-stack");
    advisoryStack.innerHTML = advisoryFeed.map((advisory) => `
        <article class="advisory-card">
            <div>
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
        markerZoomAnimation: true
    }).setView(airportCenter, 14);

    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
        attribution: "Tiles &copy; Esri",
        keepBuffer: 3,
        updateWhenZooming: true
    }).addTo(map);

    map.createPane("airportImagery");
    const airportImageryPane = map.getPane("airportImagery");
    airportImageryPane.style.zIndex = "260";
    airportImageryPane.style.pointerEvents = "none";

    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        attribution: "Tiles &copy; Esri",
        pane: "airportImagery",
        bounds: airportImageryBounds,
        maxNativeZoom: 18,
        maxZoom: 19,
        keepBuffer: 3,
        updateWhenZooming: true
    }).addTo(map);

    function updateAirportImageryClip() {
        const northWest = map.latLngToLayerPoint(airportImageryBounds[0]);
        const southEast = map.latLngToLayerPoint(airportImageryBounds[1]);
        const centerX = (northWest.x + southEast.x) / 2;
        const centerY = (northWest.y + southEast.y) / 2;
        const sideLength = Math.max(
            Math.abs(southEast.x - northWest.x),
            Math.abs(southEast.y - northWest.y)
        );
        const halfSide = sideLength / 2;
        const heightScale = 1.12;
        const rightExtension = sideLength * 0.5;
        const leftExtension = sideLength * 0.22;
        const left = centerX - halfSide - leftExtension;
        const top = centerY - (halfSide * heightScale);
        const right = centerX + halfSide + rightExtension;
        const bottom = centerY + (halfSide * heightScale);

        airportImageryPane.style.clipPath = `polygon(${left}px ${top}px, ${right}px ${top}px, ${right}px ${bottom}px, ${left}px ${bottom}px)`;
    }

    let clipFrame = 0;

    function scheduleAirportImageryClip() {
        if (clipFrame) {
            return;
        }

        clipFrame = window.requestAnimationFrame(() => {
            clipFrame = 0;
            updateAirportImageryClip();
        });
    }

    map.on("move zoom resize viewreset", scheduleAirportImageryClip);
    map.on("moveend zoomend", updateAirportImageryClip);
    updateAirportImageryClip();

    const kmlGroups = {
        runways: L.featureGroup().addTo(map),
        taxiways: L.featureGroup().addTo(map),
        holds: L.featureGroup().addTo(map),
        roads: L.featureGroup().addTo(map),
        centerlines: L.featureGroup().addTo(map),
        other: L.featureGroup().addTo(map)
    };
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
    const movingPlaneLayer = L.featureGroup().addTo(map);

    function registerScalableLayer(layer, baseWeight, scaleOptions = {}) {
        scalableKmlLayers.push({ layer, baseWeight, scaleOptions });
        return layer;
    }

    function addOutlinedPolyline(targetLayer, linePoints, presentation, popupHtml) {
        if (presentation.label === "Parking Lines") {
            return registerScalableLayer(L.polyline(linePoints, {
                color: presentation.color,
                opacity: 0.88,
                weight: presentation.lineWeight,
                className: "kml-overlay-line",
                lineCap: presentation.lineCap,
                lineJoin: presentation.lineJoin
            }).addTo(targetLayer), presentation.lineWeight).bindPopup(popupHtml);
        }

        const outlineWeight = presentation.lineWeight + (presentation.label === "Runways" ? 3 : 1.6);

        registerScalableLayer(L.polyline(linePoints, {
            color: "#111111",
            opacity: 0.92,
            weight: outlineWeight,
            className: "kml-overlay-line",
            lineCap: presentation.lineCap,
            lineJoin: presentation.lineJoin
        }).addTo(targetLayer), outlineWeight, presentation.label === "Runways"
            ? { minScale: 0.16, minWeight: 1.15 }
            : undefined);

        return registerScalableLayer(L.polyline(linePoints, {
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

    yulKmlOverlay.placemarks.forEach((placemark) => {
        const category = classifyKmlPlacemark(placemark.name);
        const targetLayer = kmlGroups[category];
        const presentation = getCategoryPresentation(category, placemark.style);

        placemark.lines.forEach((linePoints) => {
            if (category === "taxiways") {
                taxiwayLineSets.push(linePoints);
            } else {
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

        const animatedPlanes = taxiPlaneFeed.map((plane, index) => {
            const gate = gateMarkers.find((gateMarker) => gateMarker.name.endsWith(plane.gate));
            const route = gate ? buildTaxiwayPlaneRoute(gate.coords, taxiwayLineSets) : null;
            const routeProfile = route ? createRouteProfile(route) : null;

            if (!route || !routeProfile?.totalLength) {
                return null;
            }

            const initialProgress = (index / taxiPlaneFeed.length) * 0.38;
            const initialDirection = 1;
            const marker = L.marker(interpolateRouteProfile(routeProfile, initialProgress), {
                icon: createPlaneMarkerIcon(plane.callsign, getPathHeading(routeProfile, initialProgress, initialDirection), map.getZoom()),
                zIndexOffset: 6000,
                keyboard: false
            }).addTo(movingPlaneLayer).bindPopup(`<strong>${plane.callsign}</strong><br>Taxiing outbound from Gate ${plane.gate} on the taxiway network`);

            return {
                ...plane,
                marker,
                route,
                routeProfile,
                progress: initialProgress,
                direction: initialDirection
            };
        }).filter(Boolean);

        if (animatedPlanes.length) {
            const refreshPlaneIcons = () => {
                const zoom = map.getZoom();

                animatedPlanes.forEach((plane) => {
                    const heading = getPathHeading(plane.routeProfile, plane.progress, plane.direction);
                    plane.marker.setIcon(createPlaneMarkerIcon(plane.callsign, heading, zoom));
                });
            };

            let lastTimestamp = 0;

            const tick = (timestamp) => {
                if (!lastTimestamp) {
                    lastTimestamp = timestamp;
                }

                const deltaSeconds = (timestamp - lastTimestamp) / 1000;
                lastTimestamp = timestamp;

                animatedPlanes.forEach((plane) => {
                    plane.progress += deltaSeconds * plane.speed * plane.direction;

                    if (plane.progress >= 0.995) {
                        plane.progress = 0.01;
                    }

                    const position = interpolateRouteProfile(plane.routeProfile, plane.progress);
                    const heading = getPathHeading(plane.routeProfile, plane.progress, plane.direction);
                    plane.marker.setLatLng(position);
                    plane.marker.setIcon(createPlaneMarkerIcon(plane.callsign, heading, map.getZoom()));
                });

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
        movingPlaneLayer
    ].forEach((group, index) => {
        group.eachLayer((layer) => {
            if (index === 0) {
                layer.bringToBack();
            } else {
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
setupMap();

window.setInterval(renderClock, 1000);