
import { WeightedMajorAirlines } from "./AirlineCatalog.js";

export const CommercialJetModels = [
    "Airbus A220-100",
    "Airbus A220-300",
    "Airbus A318-100",
    "Airbus A319-100",
    "Airbus A319neo",
    "Airbus A320-200",
    "Airbus A320neo",
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
    "Boeing 777-8",
    "Boeing 777-9",
    "Boeing 787-8",
    "Boeing 787-9",
    "Boeing 787-10",
    "De Havilland Dash 8-400",
    "Embraer E145",
    "Embraer E170",
    "Embraer E175",
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

function GetConfiguredAirlinePools(models) {
    const availableModels = new Set(models);

    return ShuffleModelOrder(WeightedMajorAirlines).map((airline) => {
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
}

export function AssignAircraftModels(planes, models = CommercialJetModels) {
    const availableModels = models.length > 0 ? models : CommercialJetModels;
    const airlinePools = GetConfiguredAirlinePools(availableModels);
    const assignmentCountByAirlineCode = new Map();

    return planes.map((plane, index) => {
        const airlinePool = airlinePools[index % airlinePools.length];
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