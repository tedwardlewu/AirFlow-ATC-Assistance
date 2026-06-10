
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
    "Embraer E175",
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