
import { WeightedMajorAirlines } from "./AirlineCatalog.js";

const weightedMajorAirlinesByCode = new Map(WeightedMajorAirlines.map((airline) => [airline.code, airline]));

export const CommercialJetModels = [
    "Airbus A220-100",
    "Airbus A220-300",
    "Airbus A318-100",
    "Airbus A319-100",
    "Airbus A319neo",
    "Airbus A320-200",
    "Airbus A320neo",
    "Airbus A321-100",
    "Airbus A321-200",
    "Airbus A321 LR",
    "Airbus A321 Transcon",
    "Airbus A321neo",
    "Airbus A321-XLR",
    "Airbus A300-600",
    "Airbus A310-300",
    "Airbus A330-200",
    "Airbus A330-300",
    "Airbus A330-800neo",
    "Airbus A330-900neo",
    "Airbus A340-200",
    "Airbus A340-300",
    "Airbus A340-500",
    "Airbus A340-600",
    "Airbus A350-900",
    "Airbus A350-1000",
    "Airbus A350F",
    "Airbus A380-800",
    "Boeing 707-320",
    "Boeing 717-200",
    "Boeing 727-200",
    "Boeing 737-200",
    "Boeing 737-300",
    "Boeing 737-400",
    "Boeing 737-500",
    "Boeing 737-600",
    "Boeing 737-700",
    "Boeing 737-800",
    "Boeing 737-900",
    "Boeing 737 MAX 7",
    "Boeing 737 MAX 8",
    "Boeing 737 MAX 9",
    "Boeing 737 MAX 10",
    "Boeing 747-200",
    "Boeing 747-300",
    "Boeing 747-400",
    "Boeing 747-8I",
    "Boeing 757-200",
    "Boeing 757-300",
    "Boeing 767-200ER",
    "Boeing 767-300ER",
    "Boeing 767-400ER",
    "Boeing 777-200",
    "Boeing 777-200LR",
    "Boeing 777-200ER",
    "Boeing 777-300",
    "Boeing 777-300ER",
    "Boeing 777F",
    "Boeing 777-8",
    "Boeing 777-9",
    "Boeing 787-8",
    "Boeing 787-9",
    "Boeing 787-10",
    "De Havilland Dash 8-400",
    "Embraer E145",
    "Embraer E170",
    "Embraer E175",
    "Embraer E190",
    "Embraer E195-E2",
    "Mitsubishi CRJ700",
    "Mitsubishi CRJ900"
];

export const AirlineAircraftAssignments = {
    // Add airline fleets here as you provide them.
    // Once at least one airline is configured, only configured airlines will spawn.
    ACA: [
        "Airbus A220-300",
        "Airbus A320-200",
        "Airbus A321-200",
        "Airbus A321-XLR",
        "Airbus A330-300",
        "Boeing 737 MAX 8",
        "Boeing 777-200LR",
        "Boeing 777-300ER",
        "Boeing 787-8",
        "Boeing 787-9"
    ],
    AAL: [
        "Airbus A319-100",
        "Airbus A320-200",
        "Airbus A321-200",
        "Airbus A321 Transcon",
        "Airbus A321neo",
        "Boeing 737-800",
        "Boeing 737 MAX 8",
        "Boeing 777-200",
        "Boeing 777-300ER",
        "Boeing 787-8",
        "Boeing 787-9",
        "Mitsubishi CRJ700",
        "Mitsubishi CRJ900",
        "Embraer E145",
        "Embraer E170",
        "Embraer E175"
    ],
    AFR: [
        "Airbus A220-300",
        "Airbus A318-100",
        "Airbus A319-100",
        "Airbus A320-200",
        "Airbus A321-100",
        "Airbus A321-200",
        "Airbus A330-200",
        "Airbus A350-900",
        "Airbus A350-1000",
        "Airbus A350F",
        "Boeing 777-200ER",
        "Boeing 777-300ER",
        "Boeing 777F",
        "Boeing 787-9"
    ],
    BAW: [
        "Airbus A319-100",
        "Airbus A320-200",
        "Airbus A320neo",
        "Airbus A321-200",
        "Airbus A321neo",
        "Airbus A350-1000",
        "Airbus A380-800",
        "Boeing 777-200",
        "Boeing 777-300",
        "Boeing 787-8",
        "Boeing 787-9",
        "Boeing 787-10",
        "Embraer E190"
    ],
    DLH: [
        "Airbus A319-100",
        "Airbus A320-200",
        "Airbus A320neo",
        "Airbus A321-100",
        "Airbus A321-200",
        "Airbus A321neo",
        "Airbus A330-300",
        "Airbus A340-300",
        "Airbus A340-600",
        "Airbus A350-900",
        "Airbus A380-800",
        "Boeing 747-400",
        "Boeing 747-8I",
        "Boeing 787-9"
    ],
    DAL: [
        "Airbus A220-100",
        "Airbus A220-300",
        "Airbus A319-100",
        "Airbus A320-200",
        "Airbus A321-200",
        "Airbus A321neo",
        "Airbus A330-200",
        "Airbus A330-300",
        "Airbus A330-900neo",
        "Airbus A350-900",
        "Boeing 717-200",
        "Boeing 737-800",
        "Boeing 737-900",
        "Boeing 757-200",
        "Boeing 757-300",
        "Boeing 767-300ER",
        "Boeing 767-400ER"
    ],
    JBU: [
        "Airbus A220-300",
        "Airbus A321-200",
        "Airbus A321 LR",
        "Airbus A321neo"
    ],
    ASA: [
        "Boeing 737-700",
        "Boeing 737-800",
        "Boeing 737-900",
        "Boeing 737 MAX 8",
        "Boeing 737 MAX 9",
        "Embraer E175"
    ],
    HAL: [
        "Airbus A321neo",
        "Airbus A330-200",
        "Boeing 717-200",
        "Boeing 787-9"
    ],
    KLM: [
        "Airbus A330-200",
        "Airbus A330-300",
        "Airbus A321neo",
        "Boeing 737-700",
        "Boeing 737-800",
        "Boeing 737-900",
        "Boeing 747-200",
        "Boeing 747-300",
        "Boeing 747-400",
        "Boeing 777-200ER",
        "Boeing 777-300ER",
        "Boeing 787-9",
        "Boeing 787-10",
        "Embraer E175",
        "Embraer E190",
        "Embraer E195-E2"
    ],
    SWA: [
        "Boeing 737 MAX 7",
        "Boeing 737 MAX 8",
        "Boeing 737-700",
        "Boeing 737-800"
    ],
    UAL: [
        "Airbus A319-100",
        "Airbus A320-200",
        "Airbus A321neo",
        "Boeing 737-700",
        "Boeing 737-800",
        "Boeing 737-900",
        "Boeing 737 MAX 8",
        "Boeing 737 MAX 9",
        "Boeing 757-200",
        "Boeing 757-300",
        "Boeing 767-300ER",
        "Boeing 767-400ER",
        "Boeing 777-200",
        "Boeing 777-200ER",
        "Boeing 777-300ER",
        "Boeing 787-8",
        "Boeing 787-9",
        "Boeing 787-10",
        "Mitsubishi CRJ700",
        "Embraer E145",
        "Embraer E170",
        "Embraer E175"
    ],
    TSC: [
        "Airbus A321-200",
        "Airbus A321 LR",
        "Airbus A330-200",
        "Airbus A330-300"
    ],
    WJA: [
        "Boeing 737 MAX 8",
        "Boeing 737-800",
        "Boeing 737-700",
        "Boeing 787-9",
        "De Havilland Dash 8-400"
    ]
};

export const AirlineAircraftPhotoFiles = {
    ACA: {
        "Airbus A220-300": "AC A220-300.avif",
        "Airbus A320-200": "AC A320-200.avif",
        "Airbus A321-200": "AC A321-200.avif",
        "Airbus A321-XLR": "AC A321-XLR.jpg",
        "Airbus A330-300": "AC A330-300.jpg",
        "Boeing 737 MAX 8": "AC 737 MAX 8.jpeg",
        "Boeing 777-200LR": "AC 777-200LR.jpg",
        "Boeing 777-300ER": "AC 777-300ER.png",
        "Boeing 787-8": "AC 787-8.jpg",
        "Boeing 787-9": "AC 787-9.jpg"
    },
    AAL: {
        "Airbus A319-100": "AA A319.jpg",
        "Airbus A320-200": "AA A320.jpg",
        "Airbus A321-200": "AA A321.jpg",
        "Airbus A321 Transcon": "AA A321 T.avif",
        "Airbus A321neo": "AA A321 NEO.avif",
        "Boeing 737-800": "AA 737-800.avif",
        "Boeing 737 MAX 8": "AA 737 MAX 8.avif",
        "Boeing 777-200": "AA 777-200.webp",
        "Boeing 777-300ER": "AA 777-300ER.avif",
        "Boeing 787-8": "AA 787-8.jpeg",
        "Boeing 787-9": "AA 787-9.jpg",
        "Mitsubishi CRJ700": "AA CRJ700.jpg",
        "Mitsubishi CRJ900": "AA CRJ900.jpg",
        "Embraer E145": "AA E145.jpg",
        "Embraer E170": "AA E170.avif",
        "Embraer E175": "AA E175.jpg"
    },
    AFR: {
        "Airbus A220-300": "AF A220300.jpg",
        "Airbus A318-100": "AF A318-100.jpg",
        "Airbus A319-100": "AF A319-100.jpg",
        "Airbus A320-200": "AF A320-200.jpg",
        "Airbus A321-100": "AF A321-100.jpg",
        "Airbus A321-200": "AF A321-200.jpg",
        "Airbus A330-200": "AF A330-200.jpg",
        "Airbus A350-900": "AF A350-900.jpg",
        "Boeing 777-200ER": "AF 777-200ER.jpg",
        "Boeing 777-300ER": "AF 777-300ER.jpg",
        "Boeing 787-9": "AF 787-9.avif"
    },
    BAW: {
        "Airbus A319-100": "BA A319.jpg",
        "Airbus A320-200": "BA A320-200.jpg",
        "Airbus A320neo": "BA A320NEO.jpg",
        "Airbus A321-200": "BA A321-200.jpg",
        "Airbus A321neo": "BA A321 NEO.jpeg",
        "Airbus A350-1000": "BA A350-1000.jpg",
        "Airbus A380-800": "BA A380.avif",
        "Boeing 777-200": "BA 777-200.avif",
        "Boeing 777-300": "BA 777-300.webp",
        "Boeing 787-8": "BA 787-8.jpeg",
        "Boeing 787-9": "BA 787-9.jpg",
        "Boeing 787-10": "BA 787-10.jpg",
        "Embraer E190": "BA E190.jpg"
    },
    DLH: {
        "Airbus A319-100": "DLH A319-100.jpg",
        "Airbus A320-200": "DLH A319-200.jpeg",
        "Airbus A320neo": "DLH A320 NEO.jpg",
        "Airbus A321-100": "DLH A321 100.jpg",
        "Airbus A321-200": "DLH A321 200.jpg",
        "Airbus A321neo": "DLH A321 NEO.jpg",
        "Airbus A330-300": "DLH A330.jpg",
        "Airbus A340-300": "DLH A340-300.jpg",
        "Airbus A340-600": "DLH A340-600.avif",
        "Airbus A350-900": "DLH A350-900.jpg",
        "Airbus A380-800": "DLH A380.webp",
        "Boeing 747-400": "DLH 747-400.jpg",
        "Boeing 747-8I": "DLH 747-8.jpg",
        "Boeing 787-9": "DLH 787-9.jpg"
    },
    DAL: {
        "Airbus A220-100": "Delta A220.webp",
        "Airbus A220-300": "Delta A220 300.jpeg",
        "Airbus A319-100": "Delta A319-100.jpg",
        "Airbus A320-200": "Delta A320.jpeg",
        "Airbus A321-200": "Delta A321 200.jpg",
        "Airbus A321neo": "Delta A321 NEO.jpeg",
        "Airbus A330-200": "Delta A330-200.jpg",
        "Airbus A330-300": "Delta A330-300.webp",
        "Airbus A330-900neo": "Delta A330-900 NEO.png",
        "Airbus A350-900": "Delta A350-900.avif",
        "Boeing 717-200": "Delta B717.webp",
        "Boeing 737-800": "Delta B737-800.jpeg",
        "Boeing 737-900": "Delta B737-900ER.avif",
        "Boeing 757-200": "Delta B757-200.jpg",
        "Boeing 757-300": "Delta B757-300.avif",
        "Boeing 767-300ER": "Delta B767-300ER.avif",
        "Boeing 767-400ER": "Delta B767-400ER.png"
    },
    UAL: {
        "Airbus A319-100": "UA A319.jpg",
        "Airbus A320-200": "UA A320.jpg",
        "Airbus A321neo": "UA A321 NEO.jpg",
        "Boeing 737-700": "UA 737-700.jpg",
        "Boeing 737-800": "UA 737-800.jpg",
        "Boeing 737-900": "UA 737-900.jpg",
        "Boeing 737 MAX 8": "UA 737 MAX 8.webp",
        "Boeing 737 MAX 9": "UA 737 MAX 9.jpeg",
        "Boeing 757-200": "UA 757-200.jpg",
        "Boeing 757-300": "UA 757-300.jpg",
        "Boeing 767-300ER": "UA 767-300ER.avif",
        "Boeing 767-400ER": "UA 767-400ER.jpg",
        "Boeing 777-200": "UA 777-200.avif",
        "Boeing 777-200ER": "UA 777-200ER.jpg",
        "Boeing 777-300ER": "UA 777-300ER.webp",
        "Boeing 787-8": "UA 787-8.jpg",
        "Boeing 787-9": "UA 787-9.avif",
        "Boeing 787-10": "UA 787-10.webp",
        "Mitsubishi CRJ700": "UA CRJ700.png",
        "Embraer E145": "UA EMB145.jpg",
        "Embraer E170": "UA ERJ170.jpg",
        "Embraer E175": "UA ERJ175.jpg"
    },
    JBU: {
        "Airbus A220-300": "JB A220.jpg",
        "Airbus A321-200": "JB A321.jpg",
        "Airbus A321 LR": "JB A321 LR.jpeg",
        "Airbus A321neo": "JB A321 NEO.webp"
    },
    ASA: {
        "Boeing 737-700": "AL 737 700.avif",
        "Boeing 737-800": "AL 737 800.jpg",
        "Boeing 737-900": "AL 737 900.jpg",
        "Boeing 737 MAX 8": "AL 737 MAX 8.jpg",
        "Boeing 737 MAX 9": "AL 737 MAX 9.webp",
        "Embraer E175": "AL E175.jpg"
    },
    HAL: {
        "Airbus A321neo": "AL A321 NEO.webp",
        "Airbus A330-200": "AL A330-200.avif",
        "Boeing 717-200": "AL 717 200.jpg",
        "Boeing 787-9": "AL 787-9.jpg"
    },
    KLM: {
        "Airbus A330-200": "KLM A330-200.jpg",
        "Airbus A330-300": "KLM A330-300.jpeg",
        "Airbus A321neo": "KLM A321 NEO.jpg",
        "Boeing 737-700": "KLM 737 700.jpg",
        "Boeing 737-800": "KLM 737 800.avif",
        "Boeing 737-900": "KLM 737 900.webp",
        "Boeing 747-200": "KLM 747-200.jpg",
        "Boeing 747-300": "KLM 747-300.jpg",
        "Boeing 747-400": "KLM 747-400.png",
        "Boeing 777-200ER": "kLM 777-200ER.jpg",
        "Boeing 777-300ER": "KLM 7777-300ER.png",
        "Boeing 787-9": "KLM 787-9.jpg",
        "Boeing 787-10": "KLM 787-10.jpg",
        "Embraer E175": "KLM E175.jpeg",
        "Embraer E190": "KLM E190.jpg",
        "Embraer E195-E2": "KLM E195.jpg"
    },
    SWA: {
        "Boeing 737 MAX 7": "SW 737 MAX 7.jpeg",
        "Boeing 737 MAX 8": "SW 737 MAX 8.webp",
        "Boeing 737-700": "SW 737 7000.jpeg",
        "Boeing 737-800": "SW 737 800.jpg"
    },
    TSC: {
        "Airbus A321-200": "AT A321.webp",
        "Airbus A321 LR": "AT A321 LR.jpeg",
        "Airbus A330-200": "AT A330 200.jpg",
        "Airbus A330-300": "AT A330 300.jpg"
    },
    WJA: {
        "Boeing 737 MAX 8": "WJ 737 MAX 8.avif",
        "Boeing 737-800": "WJ 737 800.jpg",
        "Boeing 737-700": "WJ 737 700.webp",
        "Boeing 787-9": "WJ 787.avif",
        "De Havilland Dash 8-400": "WJ DHC.jpg"
    }
};

export function CreateDeterministicModelOrder(models, seed = 37) {
    const orderedModels = [...models];

    for (let index = orderedModels.length - 1; index > 0; index -= 1) {
        const swapIndex = (index * seed + 11) % (index + 1);
        [orderedModels[index], orderedModels[swapIndex]] = [orderedModels[swapIndex], orderedModels[index]];
    }

    return orderedModels;
}

function ShuffleModelOrder(models) {
    const shuffledModels = [...models];

    for (let index = shuffledModels.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [shuffledModels[index], shuffledModels[swapIndex]] = [shuffledModels[swapIndex], shuffledModels[index]];
    }

    return shuffledModels;
}

function NormalizeAssignmentLimitMap(limitByAirlineCode = {}) {
    return new Map(
        Object.entries(limitByAirlineCode)
            .map(([airlineCode, limit]) => [airlineCode, Math.max(0, Math.floor(limit))])
            .filter(([, limit]) => Number.isFinite(limit))
    );
}

function NormalizeAssignmentCountMap(existingAssignmentsByAirlineCode = {}) {
    if (existingAssignmentsByAirlineCode instanceof Map) {
        return new Map(
            Array.from(existingAssignmentsByAirlineCode.entries())
                .map(([airlineCode, count]) => [airlineCode, Math.max(0, Math.floor(count))])
                .filter(([, count]) => Number.isFinite(count))
        );
    }

    return new Map(
        Object.entries(existingAssignmentsByAirlineCode)
            .map(([airlineCode, count]) => [airlineCode, Math.max(0, Math.floor(count))])
            .filter(([, count]) => Number.isFinite(count))
    );
}

function GetOutstandingMinimumAssignments(assignmentCountByAirlineCode, minimumAssignmentsByAirlineCode) {
    return Array.from(minimumAssignmentsByAirlineCode.entries()).reduce((outstandingAssignments, [airlineCode, minimumAssignments]) => {
        const currentAssignments = assignmentCountByAirlineCode.get(airlineCode) ?? 0;
        return outstandingAssignments + Math.max(minimumAssignments - currentAssignments, 0);
    }, 0);
}

function SelectAirlinePool(airlinePools, assignmentCountByAirlineCode, minimumAssignmentsByAirlineCode, maximumAssignmentsByAirlineCode, assignmentIndex) {
    const eligibleAirlinePools = airlinePools.filter((airlinePool) => {
        const assignmentCount = assignmentCountByAirlineCode.get(airlinePool.airline.code) ?? 0;
        const maximumAssignments = maximumAssignmentsByAirlineCode.get(airlinePool.airline.code) ?? Number.POSITIVE_INFINITY;

        return assignmentCount < maximumAssignments;
    });

    if (!eligibleAirlinePools.length) {
        return null;
    }

    const outstandingMinimumAssignments = GetOutstandingMinimumAssignments(
        assignmentCountByAirlineCode,
        minimumAssignmentsByAirlineCode
    );
    const requiredAirlinePools = eligibleAirlinePools.filter((airlinePool) => {
        const assignmentCount = assignmentCountByAirlineCode.get(airlinePool.airline.code) ?? 0;
        const minimumAssignments = minimumAssignmentsByAirlineCode.get(airlinePool.airline.code) ?? 0;

        return assignmentCount < minimumAssignments;
    });
    const sourceAirlinePools = outstandingMinimumAssignments > 0 && requiredAirlinePools.length
        ? requiredAirlinePools
        : eligibleAirlinePools;

    return sourceAirlinePools[assignmentIndex % sourceAirlinePools.length];
}

function GetConfiguredAirlinePools(models, minimumAssignmentsByAirlineCode = {}, minimumAircraftModels = []) {
    const availableModels = new Set(models);
    const prioritizedModelPools = minimumAircraftModels.flatMap((model) => {
        if (!availableModels.has(model)) {
            return [];
        }

        const airline = Array.from(weightedMajorAirlinesByCode.values()).find((candidateAirline) => (
            AirlineAircraftAssignments[candidateAirline.code]?.includes(model)
        ));

        return airline
            ? [{ airline, models: [model] }]
            : [];
    });
    const prioritizedAirlines = Object.entries(minimumAssignmentsByAirlineCode)
        .flatMap(([airlineCode, minimumAssignments]) => {
            const airline = weightedMajorAirlinesByCode.get(airlineCode);
            const normalizedMinimum = Math.max(0, Math.floor(minimumAssignments));

            return airline && normalizedMinimum > 0
                ? Array.from({ length: normalizedMinimum }, () => airline)
                : [];
        });

    const airlinePools = [...prioritizedAirlines, ...ShuffleModelOrder(WeightedMajorAirlines)].map((airline) => {
        const configuredModels = (AirlineAircraftAssignments[airline.code] ?? [])
            .filter((model, index, airlineModels) => (
                availableModels.has(model)
                && airlineModels.indexOf(model) === index
            ));

        return {
            airline,
            models: ShuffleModelOrder(configuredModels.length > 0 ? configuredModels : models)
        };
    });

    return [...prioritizedModelPools, ...airlinePools];
}

export function AssignAircraftModels(planes, models = CommercialJetModels, options = {}) {
    const availableModels = models.length > 0 ? models : CommercialJetModels;
    const minimumAssignmentsByAirlineCode = NormalizeAssignmentLimitMap(options.minimumAssignmentsByAirlineCode);
    const maximumAssignmentsByAirlineCode = NormalizeAssignmentLimitMap(options.maximumAssignmentsByAirlineCode);
    const airlinePools = GetConfiguredAirlinePools(
        availableModels,
        Object.fromEntries(minimumAssignmentsByAirlineCode),
        options.minimumAircraftModels
    );
    const assignmentCountByAirlineCode = NormalizeAssignmentCountMap(options.existingAssignmentsByAirlineCode);

    return planes.map((plane, index) => {
        const airlinePool = SelectAirlinePool(
            airlinePools,
            assignmentCountByAirlineCode,
            minimumAssignmentsByAirlineCode,
            maximumAssignmentsByAirlineCode,
            index
        );

        if (!airlinePool) {
            return options.returnNullWhenUnassigned ? null : plane;
        }

        const assignmentCount = assignmentCountByAirlineCode.get(airlinePool.airline.code) ?? 0;

        assignmentCountByAirlineCode.set(airlinePool.airline.code, assignmentCount + 1);

        return {
            ...plane,
            aircraftModel: airlinePool.models[assignmentCount % airlinePool.models.length],
            airlineName: airlinePool.airline.name,
            airlineCode: airlinePool.airline.code
        };
    });
}