
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
    "Airbus A330neo",
    "Airbus A330-800neo",
    "Airbus A330-900neo",
    "Airbus A340-200",
    "Airbus A340-300",
    "Airbus A340-500",
    "Airbus A340-600",
    "Airbus A350-900",
    "Airbus A350-1000",
    "Airbus A350-1000ULR",
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
    "Comac C909",
    "Comac C919-100STD",
    "Comac C919-100ER",
    "ATR 72-500",
    "ATR 72-600",
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
    ANA: [
        "Airbus A320neo",
        "Airbus A321-200",
        "Airbus A321neo",
        "Airbus A380-800",
        "Boeing 737-800",
        "Boeing 767-300ER",
        "Boeing 777-200",
        "Boeing 777-200ER",
        "Boeing 777-300",
        "Boeing 777-300ER",
        "Boeing 777F",
        "Boeing 787-8",
        "Boeing 787-9",
        "Boeing 787-10"
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
    CCA: [
        "Airbus A319-100",
        "Airbus A319neo",
        "Airbus A320-200",
        "Airbus A320neo",
        "Airbus A321-200",
        "Airbus A321neo",
        "Airbus A330-200",
        "Airbus A330-300",
        "Airbus A350-900",
        "Boeing 737-700",
        "Boeing 737-800",
        "Boeing 737 MAX 8",
        "Boeing 747-400",
        "Boeing 747-8I",
        "Boeing 777-300ER",
        "Boeing 787-9",
        "Comac C909",
        "Comac C919-100ER"
    ],
    CES: [
        "Airbus A319-100",
        "Airbus A320-200",
        "Airbus A320neo",
        "Airbus A321-200",
        "Airbus A321neo",
        "Airbus A330-200",
        "Airbus A330-300",
        "Airbus A330neo",
        "Airbus A350-900",
        "Boeing 737-700",
        "Boeing 737-800",
        "Boeing 737 MAX 8",
        "Boeing 777-300ER",
        "Boeing 787-9",
        "Comac C909",
        "Comac C919-100STD"
    ],
    CPA: [
        "Airbus A321neo",
        "Airbus A330-300",
        "Airbus A350-900",
        "Airbus A350-1000",
        "Boeing 777-300",
        "Boeing 777-300ER"
    ],
    CSN: [
        "Airbus A319neo",
        "Airbus A320-200",
        "Airbus A320neo",
        "Airbus A321-200",
        "Airbus A321neo",
        "Airbus A330-300",
        "Airbus A350-900",
        "Boeing 737-800",
        "Boeing 737 MAX 8",
        "Boeing 777-300ER",
        "Boeing 777F",
        "Boeing 787-9",
        "Comac C909",
        "Comac C919-100ER"
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
        "Boeing 787-9",
        "Embraer E175"
    ],
    HAL: [
        "Airbus A321neo",
        "Airbus A330-200",
        "Boeing 717-200"
    ],
    JAL: [
        "Airbus A321neo",
        "Airbus A350-900",
        "Airbus A350-1000",
        "Boeing 737-800",
        "Boeing 737 MAX 8",
        "Boeing 767-300ER",
        "Boeing 777-300ER",
        "Boeing 787-8",
        "Boeing 787-9"
    ],
    KAL: [
        "Airbus A220-300",
        "Airbus A321neo",
        "Airbus A330-300",
        "Airbus A350-900",
        "Airbus A350-1000",
        "Airbus A380-800",
        "Boeing 737-800",
        "Boeing 737-900",
        "Boeing 737 MAX 8",
        "Boeing 737 MAX 10",
        "Boeing 747-8I",
        "Boeing 777-300",
        "Boeing 777-300ER",
        "Boeing 777-9",
        "Boeing 777F",
        "Boeing 787-9",
        "Boeing 787-10",
        "Airbus A350F"
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
    ITY: [
        "Airbus A220-100",
        "Airbus A220-300",
        "Airbus A319-100",
        "Airbus A320-200",
        "Airbus A320neo",
        "Airbus A321 LR",
        "Airbus A330-200",
        "Airbus A330-900neo",
        "Airbus A350-900"
    ],
    IBE: [
        "Airbus A319-100",
        "Airbus A320-200",
        "Airbus A320neo",
        "Airbus A321-200",
        "Airbus A321-XLR",
        "Airbus A330-200",
        "Airbus A330-300",
        "Airbus A350-900"
    ],
    EIN: [
        "Airbus A320-200",
        "Airbus A320neo",
        "Airbus A321 LR",
        "Airbus A321-XLR",
        "Airbus A330-200",
        "Airbus A330-300"
    ],
    FIN: [
        "Airbus A319-100",
        "Airbus A320-200",
        "Airbus A321-200",
        "Airbus A330-300",
        "Airbus A350-900",
        "ATR 72-500",
        "ATR 72-600",
        "Embraer E190",
        "Embraer E195-E2"
    ],
    THY: [
        "Airbus A319-100",
        "Airbus A320-200",
        "Airbus A321-200",
        "Airbus A321neo",
        "Airbus A330-200",
        "Airbus A330-300",
        "Airbus A350-900",
        "Boeing 737-800",
        "Boeing 737-900",
        "Boeing 737 MAX 8",
        "Boeing 737 MAX 9",
        "Boeing 777-300ER",
        "Boeing 787-9"
    ],
    UAE: [
        "Airbus A350-900",
        "Airbus A380-800",
        "Boeing 777-200LR",
        "Boeing 777-300ER",
        "Boeing 777-8",
        "Boeing 777-9",
        "Boeing 787-8",
        "Boeing 787-10"
    ],
    ETD: [
        "Airbus A320-200",
        "Airbus A320neo",
        "Airbus A321-200",
        "Airbus A321 LR",
        "Airbus A321neo",
        "Airbus A330-900neo",
        "Airbus A350-1000",
        "Airbus A350F",
        "Airbus A380-800",
        "Boeing 777-300ER",
        "Boeing 777-9",
        "Boeing 777F",
        "Boeing 787-9",
        "Boeing 787-10"
    ],
        QTR: [
            "Airbus A320-200",
            "Airbus A321 LR",
            "Airbus A321neo",
            "Airbus A330-200",
            "Airbus A330-300",
            "Airbus A350-900",
            "Airbus A350-1000",
            "Airbus A380-800",
            "Boeing 777-200LR",
            "Boeing 777-300ER",
            "Boeing 777-8",
            "Boeing 777-9",
            "Boeing 777F",
            "Boeing 787-8",
            "Boeing 787-9",
            "Boeing 787-10"
        ],
        QFA: [
            "Airbus A321-XLR",
            "Airbus A330-200",
            "Airbus A330-300",
            "Airbus A350-1000",
            "Airbus A350-1000ULR",
            "Airbus A380-800",
            "Boeing 737-800",
            "Boeing 787-9",
            "Boeing 787-10"
        ],
        LAN: [
            "Airbus A319-100",
            "Airbus A320-200",
            "Airbus A320neo",
            "Airbus A321-200",
            "Airbus A321neo",
            "Airbus A321-XLR",
            "Boeing 767-300ER",
            "Boeing 777-300ER",
            "Boeing 787-8",
            "Boeing 787-9",
            "Embraer E195-E2"
        ],
        AVA: [
            "Airbus A319-100",
            "Airbus A320-200",
            "Airbus A320neo",
            "Airbus A330-900neo",
            "Boeing 787-8"
        ],
        SAA: [
            "Airbus A319-100",
            "Airbus A320-200",
            "Airbus A330-200",
            "Airbus A340-200",
            "Airbus A340-600",
            "Airbus A350-900",
            "Boeing 737-200",
            "Boeing 737-300",
            "Boeing 737-800",
            "Boeing 747-400",
        ],
        THA: [
            "Airbus A320-200",
            "Airbus A321neo",
            "Airbus A330-300",
            "Airbus A340-500",
            "Airbus A340-600",
            "Airbus A350-900",
            "Boeing 777-200ER",
            "Boeing 777-300ER",
            "Boeing 787-8",
            "Boeing 787-9",
            "Boeing 787-10"
        ],
    SVA: [
        "Airbus A320-200",
        "Airbus A321-200",
        "Airbus A321neo",
        "Airbus A321-XLR",
        "Airbus A330-300",
        "Boeing 777-200ER",
        "Boeing 777-300ER",
        "Boeing 787-9",
        "Boeing 787-10"
    ],
    TAP: [
        "Airbus A319-100",
        "Airbus A320-200",
        "Airbus A320neo",
        "Airbus A321-200",
        "Airbus A321 LR",
        "Airbus A321neo",
        "Airbus A330-200",
        "Airbus A330-900neo"
    ],
    SAS: [
        "Airbus A319-100",
        "Airbus A320-200",
        "Airbus A320neo",
        "Airbus A321 LR",
        "Airbus A330-300",
        "Airbus A350-900"
    ],
    SIA: [
        "Airbus A350-900",
        "Airbus A350F",
        "Airbus A380-800",
        "Boeing 737 MAX 8",
        "Boeing 747-400",
        "Boeing 777-300ER",
        "Boeing 777-9",
        "Boeing 777F",
        "Boeing 787-10"
    ],
    VIR: [
        "Airbus A330-300",
        "Airbus A330-900neo",
        "Airbus A350-1000",
        "Boeing 787-9"
    ],
    SWR: [
        "Airbus A220-100",
        "Airbus A220-300",
        "Airbus A320-200",
        "Airbus A320neo",
        "Airbus A321-100",
        "Airbus A321-200",
        "Airbus A321neo",
        "Airbus A330-300",
        "Airbus A340-300",
        "Airbus A350-900",
        "Boeing 777-300ER"
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
    ANA: {
        "Airbus A320neo": "ANA A320-neo.jpg",
        "Airbus A321-200": "ANA A321-200.jpeg",
        "Airbus A321neo": "ANA A321-neo.jpg",
        "Airbus A380-800": "ANA A380-800.jpg",
        "Boeing 737-800": "ANA 737-800.jpg",
        "Boeing 737 MAX 8": "ANA 737 MAX 8.jpg",
        "Boeing 767-300ER": "ANA 767-300ER.jpg",
        "Boeing 777-200": "ANA 777-200.jpg",
        "Boeing 777-200ER": "ANA 777-200ER.jpeg",
        "Boeing 777-300": "ANA 777-300.jpg",
        "Boeing 777-300ER": "ANA 777-300ER.jpg",
        "Boeing 777F": "ANA 777F.jpeg",
        "Boeing 777-9": "ANA 777-9.jpeg",
        "Boeing 787-8": "ANA 787-8.jpg",
        "Boeing 787-9": "ANA 787-9.jpg",
        "Boeing 787-10": "ANA 787-10.jpg"
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
    CCA: {
        "Airbus A319-100": "CCA A319-100.jpg",
        "Airbus A319neo": "CCA A319-neo.jpg",
        "Airbus A320-200": "CCA A320-200.jpg",
        "Airbus A321-200": "CCA A321-200.jpg",
        "Airbus A321neo": "CCA A321-neo.jpg",
        "Airbus A330-200": "CCA A330-200.jpg",
        "Airbus A330-300": "CCA A330-300.jpg",
        "Airbus A350-900": "CCA A350-900.jpg",
        "Boeing 737-700": "CCA 737-700.jpg",
        "Boeing 737-800": "CCA 737 800.jpg",
        "Boeing 737 MAX 8": "CCA 737 MAX 8.webp",
        "Boeing 747-400": "CCA 747-400.jpg",
        "Boeing 747-8I": "CCA 747-8.webp",
        "Boeing 777-300ER": "CCA 777-300ER.jpg",
        "Boeing 787-9": "CCA 787-9.jpg",
        "Comac C909": "CCA C909.avif",
        "Comac C919-100ER": "CCA C919.jpg"
    },
    CES: {
        "Airbus A319-100": "CES A319-100.jpg",
        "Airbus A320-200": "CES A320-200.jpg",
        "Airbus A320neo": "CES A320-neo.webp",
        "Airbus A321-200": "CES A321-200.jpg",
        "Airbus A321neo": "CES A321-neo.jpeg",
        "Airbus A330-200": "CES A330-200.jpg",
        "Airbus A330-300": "CES A330-300.webp",
        "Airbus A330neo": "CES A330-neo.webp",
        "Airbus A350-900": "CES A350-900.jpg",
        "Boeing 737-700": "CES 737-700.jpg",
        "Boeing 737-800": "CES 737-800.jpg",
        "Boeing 737 MAX 8": "CES 737 MAX 8.jpg",
        "Boeing 777-300ER": "CES 777-300ER.jpg",
        "Boeing 787-9": "CES 787-9.jpg",
        "Comac C909": "CES C909.jpg",
        "Comac C919-100STD": "CES C919.jpg"
    },
    CPA: {
        "Airbus A321neo": "CPA A321-neo.avif",
        "Airbus A330-300": "CPA A330-300.jpg",
        "Airbus A350-900": "CPA A350-900.avif",
        "Airbus A350-1000": "CPA A350-1000.jpg",
        "Boeing 777-300": "CPA 777-300.jpg",
        "Boeing 777-300ER": "CPA 777-300ER.avif"
    },
    CSN: {
        "Airbus A319neo": "CSN A319-neo.jpg",
        "Airbus A320-200": "CSN A320-200.jpg",
        "Airbus A320neo": "CSN A320-neo.jpeg",
        "Airbus A321-200": "CSN A321-200.jpg",
        "Airbus A321neo": "cSN A321-neo.jpg",
        "Airbus A330-300": "CSN A330-300.jpg",
        "Airbus A350-900": "CSN A350-900.avif",
        "Boeing 737-800": "CSN 737-800.webp",
        "Boeing 737 MAX 8": "CSN 737 MAx 8.jpg",
        "Boeing 777-300ER": "CSN 777-300ER.jpeg",
        "Boeing 777F": "CSN 777F.jpg",
        "Boeing 787-9": "CSN 787-9.jpg",
        "Comac C909": "CSN C909.jpg",
        "Comac C919-100ER": "CSN C919.jpg"
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
        "Boeing 787-9": "AL 787-9.jpg",
        "Embraer E175": "AL E175.jpg"
    },
    HAL: {
        "Airbus A321neo": ["AL A321 NEO.webp", "HA A321-neo.jpg"],
        "Airbus A330-200": "AL A330-200.avif",
        "Boeing 717-200": "AL 717 200.jpg"
    },
    JAL: {
        "Airbus A321neo": "JAL A321-neo.jpg",
        "Airbus A350-900": "JAL A350-900.jpg",
        "Airbus A350-1000": "JAL A350-1000.avif",
        "Boeing 737-800": "JAL 737-800.jpg",
        "Boeing 737 MAX 8": "JAL 737 MAX 8.jpg",
        "Boeing 767-300ER": "JAL 767-300ER.avif",
        "Boeing 787-8": "JAL 787-8.jpg",
        "Boeing 787-9": "JAL 787-9.webp"
    },
    KAL: {
        "Airbus A220-300": "KAL A220-300.jpg",
        "Airbus A321neo": "KAL A321-neo.jpeg",
        "Airbus A330-300": "KAL A330-300.jpg",
        "Airbus A350-900": "KAL A350-900.jpeg",
        "Airbus A350-1000": "KAL A350-1000.png",
        "Airbus A350F": "KAL A350F.png",
        "Airbus A380-800": "KAL A380-800.jpg",
        "Boeing 737-800": "KAL 737-800.jpg",
        "Boeing 737-900": "KAL 737-900.jpg",
        "Boeing 737 MAX 8": "KAL 737 MAX 8.jpg",
        "Boeing 737 MAX 10": "KAL 737 MAX 10.webp",
        "Boeing 747-8I": "KAL 747=8.jpg",
        "Boeing 777-300": "KAL 777-300.jpg",
        "Boeing 777-300ER": "KAL 777-300ER.avif",
        "Boeing 777-9": "KAL 777-9.avif",
        "Boeing 777F": "KAL 777F.jpg",
        "Boeing 787-9": "KAL 787-9.jpg",
        "Boeing 787-10": "KAL 787-10.jpg"
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
    ITY: {
        "Airbus A220-100": "ITA A220-100.avif",
        "Airbus A220-300": "ITA A220-300.jpg",
        "Airbus A319-100": "ITA A319-100.jpg",
        "Airbus A320-200": "ITA A320-200.jpg",
        "Airbus A321 LR": "ITA A321-neo.webp",
        "Airbus A330-200": "ITA A330-200.jpeg",
        "Airbus A330-900neo": "ITA A330-900.jpeg",
        "Airbus A350-900": "ITA A350-900.avif"
    },
    IBE: {
        "Airbus A319-100": "IBE A319.jpg",
        "Airbus A320-200": "IBE A320.jpg",
        "Airbus A320neo": "IBE A320 NEO.jpg",
        "Airbus A321-200": "IBE A321.jpg",
        "Airbus A321-XLR": "IBE A321XLR.jpg",
        "Airbus A330-200": "IBE A330-200.jpg",
        "Airbus A330-300": "IBE A330-300.jpg",
        "Airbus A350-900": "IBE A350.jpg"
    },
    EIN: {
        "Airbus A320-200": "EIN A320.jpeg",
        "Airbus A320neo": "EIN A320 NEO.jpg",
        "Airbus A321 LR": "EIN A321LRT.jpg",
        "Airbus A321-XLR": "EIN A321 XLR.avif",
        "Airbus A330-200": "EIN A330-200.jpg",
        "Airbus A330-300": "EIN A330-300.webp"
    },
    FIN: {
        "Airbus A319-100": "FIN A319-100.jpg",
        "Airbus A320-200": "FIN A320-200.jpg",
        "Airbus A321-200": "FIN A321-200.jpg",
        "Airbus A330-300": "FIN A330-300.jpg",
        "Airbus A350-900": "FIN A350-900.jpeg",
        "ATR 72-500": "FIN ATR 72-500.jpg",
        "ATR 72-600": "FIN ATR 72-600.jpg",
        "Embraer E190": "FIN E190.jpg",
        "Embraer E195-E2": "FIN E195 E2.jpeg"
    },
    THY: {
        "Airbus A320-200": "THY A320-200.jpg",
        "Airbus A321-200": "THY A321 200.avif",
        "Airbus A321neo": "THY A321-NEO.webp",
        "Airbus A330-200": "THY A330-200.jpg",
        "Airbus A330-300": "THY A330-300.jpg",
        "Airbus A350-900": "THY A350-900.jpg",
        "Boeing 737-800": "THY 737-800.jpeg",
        "Boeing 737-900": "THY 737-900.jpg",
        "Boeing 737 MAX 8": "THY 737 MAX 8.jpg",
        "Boeing 737 MAX 9": "THY 737 MAX 9.jpg",
        "Boeing 777-300ER": "THY 777-300ER.avif",
        "Boeing 787-9": "THY 787-9.jpg"
    },
    UAE: {
        "Airbus A350-900": "UAE A350-900.jpg",
        "Airbus A380-800": "UAE A380-800.jpg",
        "Boeing 777-200LR": "UAE 777-200LR.jpg",
        "Boeing 777-300ER": "UAE 777-300ER.jpg",
        "Boeing 777-8": "UAE 777-8.jpg",
        "Boeing 777-9": "UAE 777-9.jpg",
        "Boeing 787-8": "UAE 787-8.jpg",
        "Boeing 787-10": "UAE 787-10.jpg"
    },
    ETD: {
        "Airbus A320-200": "ETD A320-200.jpeg",
        "Airbus A320neo": "ETD A320-neo.jpg",
        "Airbus A321-200": "ETD A321-200.jpeg",
        "Airbus A321 LR": "ETD A321-LR.webp",
        "Airbus A321neo": "ETD A321-neo.jpeg",
        "Airbus A330-900neo": "ETD A330-900.webp",
        "Airbus A350-1000": "ETD A350-1000.jpg",
        "Airbus A350F": "ETD A350F.jpg",
        "Airbus A380-800": "ETD A380-800.jpg",
        "Boeing 777-300ER": "ETD 777-300ER.jpg",
        "Boeing 777-9": "ETD 777-9.jpg",
        "Boeing 777F": "ETD 777F.jpg",
        "Boeing 787-9": "ETD 787-9.jpg",
        "Boeing 787-10": "ETD 787-10.jpg"
    },
    QTR: {
        "Airbus A320-200": "QTR A320-200.jpeg",
        "Airbus A321 LR": "QTR A321-LR.avif",
        "Airbus A321neo": "QTR A321-NEO.jpeg",
        "Airbus A330-200": "QTR A330-200.jpg",
        "Airbus A330-300": "QTR A330-300.jpg",
        "Airbus A350-900": "QTR A350-900.jpeg",
        "Airbus A350-1000": "QTR A350-1000.jpeg",
        "Airbus A380-800": "QTR A380-800.jpeg",
        "Boeing 777-200LR": "QTR 777-200LR.jpg",
        "Boeing 777-300ER": "QTR 777-300ER.avif",
        "Boeing 777-8": "QTR 777-8F.jpg",
        "Boeing 777-9": "QTR 777-9.avif",
        "Boeing 777F": "QTR 777F.jpg",
        "Boeing 787-8": "QTR 787-8.jpg",
        "Boeing 787-9": "QTR 787-9.jpg",
        "Boeing 787-10": "QTR 787-10.jpg"
    },
    QFA: {
        "Airbus A321-XLR": "QFA A321XLR.jpg",
        "Airbus A330-200": "QFA A330-200.webp",
        "Airbus A330-300": "QFA A330-300.jpeg",
        "Airbus A350-1000": "QFA A350-1000.png",
        "Airbus A350-1000ULR": "QFA A350-1000LR.jpeg",
        "Airbus A380-800": "QFA A380-800.jpg",
        "Boeing 737-800": "QFA 737-800.jpeg",
        "Boeing 787-9": "QFA 787-9.jpg",
        "Boeing 787-10": "QFA 787-10.jpg"
    },
    LAN: {
        "Airbus A319-100": "LAN A319-100.avif",
        "Airbus A320-200": "LAN A320-200.jpg",
        "Airbus A320neo": "LAN A320-neo.avif",
        "Airbus A321-200": "LAN A321-200.webp",
        "Airbus A321neo": "LAN A321-neo.avif",
        "Airbus A321-XLR": "LAN A321-xlr.avif",
        "Boeing 767-300ER": "LAN 767-300ER.jpeg",
        "Boeing 777-300ER": "LAN 777-300ER.jpg",
        "Boeing 787-8": "LAN 787-8.jpg",
        "Boeing 787-9": "LAN 787-9.jpg",
        "Embraer E195-E2": "LAN 195 E2.jpg"
    },
    AVA: {
        "Airbus A319-100": "AVA A319-100.jpg",
        "Airbus A320-200": "AVA a320-200.jpg",
        "Airbus A320neo": "AVA A320-NEO.webp",
        "Airbus A330-900neo": "AVA A330-900.jpg",
        "Boeing 787-8": "AVA 787-8.jpg"
    },
    SAA: {
        "Airbus A319-100": "SAA A319-100.jpg",
        "Airbus A320-200": "SAA A320-200.jpg",
        "Airbus A330-200": "SAA A330-200.jpg",
        "Airbus A340-200": "SAA A340-200.jpg",
        "Airbus A340-600": "SAA A340-600.jpg",
        "Airbus A350-900": "SAA A350-900.jpeg",
        "Boeing 737-200": "SAA 737-200F.jpg",
        "Boeing 737-300": "SAA 737-300F.jpg",
        "Boeing 737-800": "SAA 737-800.jpg",
        "Boeing 747-400": "SAA 747-400.jpg"
    },
    THA: {
        "Airbus A320-200": "THA A320-200.jpg",
        "Airbus A321neo": "THA A321-NEO.jpg",
        "Airbus A330-300": "THA A330-300.jpg",
        "Airbus A340-500": "THA A340-500.avif",
        "Airbus A340-600": "THA A340-600.jpg",
        "Airbus A350-900": "THA A350-900.jpeg",
        "Boeing 777-200ER": "THA 777-200ER.jpg",
        "Boeing 777-300ER": "THA 777-300ER.jpeg",
        "Boeing 787-8": "THA 787-8.jpg",
        "Boeing 787-9": "THA 787-9.jpg",
        "Boeing 787-10": "THA 787-10.avif"
    },
    SVA: {
        "Airbus A320-200": "SVA A320-200.jpg",
        "Airbus A321-200": "SVA A321-200.jpg",
        "Airbus A321neo": "SVA A321-NEO.jpg",
        "Airbus A321-XLR": "SVA A321 XLR.jpg",
        "Airbus A330-300": "SVA A330-300.jpeg",
        "Boeing 777-200ER": "SVA 777-200ER.jpeg",
        "Boeing 777-300ER": "SVA 777-300ER.jpg",
        "Boeing 787-9": "SVA 787-9.jpg",
        "Boeing 787-10": "SVA 787-10.avif"
    },
    TAP: {
        "Airbus A319-100": "TAP A319-100.jpg",
        "Airbus A320-200": "TAP A320-200.jpg",
        "Airbus A320neo": "TAP A320-NEO.jpeg",
        "Airbus A321 LR": "TAP A321LR.avif",
        "Airbus A321neo": "TAP A321NEO.jpg",
        "Airbus A330-200": "TAP A330-200.jpg",
        "Airbus A330-900neo": "TAP A330-900.jpeg"
    },
    SAS: {
        "Airbus A319-100": "SAS A319-100.jpg",
        "Airbus A320-200": "SAS A320-200.jpg",
        "Airbus A320neo": "SAS A320 NEO.avif",
        "Airbus A321 LR": "SAS A321LR.jpg",
        "Airbus A330-300": "SAS A330-300.jpg",
        "Airbus A350-900": "SAS A350.jpg"
    },
    SIA: {
        "Airbus A350-900": "SIA A350-900ULR.jpg",
        "Airbus A350F": "SIA A350F.jpg",
        "Airbus A380-800": "SIA A80-800.jpg",
        "Boeing 737 MAX 8": "SIA 737 MAX 8.jpg",
        "Boeing 747-400": "SIA 747-400F.avif",
        "Boeing 777-300ER": "SIA 777-300ER.jpg",
        "Boeing 777-9": "SIA 777-9.webp",
        "Boeing 777F": "SIA 777F.jpg",
        "Boeing 787-10": "SIA 787-10.jpg"
    },
    VIR: {
        "Airbus A330-300": "VIR A330-300.jpg",
        "Airbus A330-900neo": "VIR A330-900.jpeg",
        "Airbus A350-1000": "VIR A350-1000.avif",
        "Boeing 787-9": "VIR 787-9.jpg"
    },
    SWR: {
        "Airbus A220-100": "SWR A220-100.webp",
        "Airbus A220-300": "SWR A220-300.jpg",
        "Airbus A320-200": "SWR A320-200.jpg",
        "Airbus A320neo": "SWR A320-NEO.jpg",
        "Airbus A321-100": "SWR A321-100.jpg",
        "Airbus A321-200": "SWR A321-200.jpg",
        "Airbus A321neo": "SWR A321-NEO.jpg",
        "Airbus A330-300": "SWR A330-300.jpeg",
        "Airbus A340-300": "SWR A340-300.jpg",
        "Airbus A350-900": "SWR A350 900.jpg",
        "Boeing 777-300ER": "SWR 777.jpg"
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