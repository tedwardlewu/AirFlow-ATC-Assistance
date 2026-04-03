CREATE TABLE airports (
    airport_id INTEGER PRIMARY KEY,
    icao_code TEXT NOT NULL UNIQUE,
    iata_code TEXT NOT NULL UNIQUE,
    airport_name TEXT NOT NULL
);

CREATE TABLE surface_features (
    feature_id INTEGER PRIMARY KEY,
    airport_id INTEGER NOT NULL,
    feature_name TEXT NOT NULL,
    feature_type TEXT NOT NULL,
    source_name TEXT,
    stroke_color TEXT,
    fill_color TEXT,
    is_closed INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (airport_id) REFERENCES airports (airport_id),
    CHECK (feature_type IN ('runway', 'taxiway', 'hold', 'road', 'centerline', 'parking', 'building', 'other')),
    CHECK (is_closed IN (0, 1))
);

CREATE TABLE surface_feature_points (
    point_id INTEGER PRIMARY KEY,
    feature_id INTEGER NOT NULL,
    point_order INTEGER NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    altitude_m DECIMAL(10, 2),
    FOREIGN KEY (feature_id) REFERENCES surface_features (feature_id) ON DELETE CASCADE,
    UNIQUE (feature_id, point_order)
);

CREATE INDEX idx_surface_features_airport_type
ON surface_features (airport_id, feature_type);

CREATE INDEX idx_surface_feature_points_feature_order
ON surface_feature_points (feature_id, point_order);

INSERT INTO airports (airport_id, icao_code, iata_code, airport_name)
VALUES (1, 'CYUL', 'YUL', 'Montreal-Trudeau International Airport');

CREATE VIEW runway_features AS
SELECT feature_id, airport_id, feature_name, source_name, stroke_color, fill_color, is_closed
FROM surface_features
WHERE feature_type = 'runway';

CREATE VIEW taxiway_features AS
SELECT feature_id, airport_id, feature_name, source_name, stroke_color, fill_color, is_closed
FROM surface_features
WHERE feature_type = 'taxiway';