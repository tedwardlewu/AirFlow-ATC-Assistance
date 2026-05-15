
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
    "Boeing 777-200ER",
    "Boeing 777-300",
    "Boeing 777-300ER",
    "Boeing 777-8",
    "Boeing 777-9",
    "Boeing 787-8",
    "Boeing 787-9",
    "Boeing 787-10"
];

export function CreateDeterministicModelOrder(models, seed = 37) {
    const orderedModels = [...models];

    for (let index = orderedModels.length - 1; index > 0; index -= 1) {
        const swapIndex = (index * seed + 11) % (index + 1);
        [orderedModels[index], orderedModels[swapIndex]] = [orderedModels[swapIndex], orderedModels[index]];
    }

    return orderedModels;
}

export function AssignAircraftModels(planes, models = CommercialJetModels) {
    const orderedModels = CreateDeterministicModelOrder(models);
    const orderedAirlines = CreateDeterministicModelOrder(WeightedMajorAirlines, 53);

    return planes.map((plane, index) => ({
        ...plane,
        aircraftModel: orderedModels[index % orderedModels.length],
        airlineName: orderedAirlines[index % orderedAirlines.length].name,
        airlineCode: orderedAirlines[index % orderedAirlines.length].code
    }));
}