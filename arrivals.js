import L from "leaflet";

export function createPlaneArrivalOperations(dependencies) {
    const {
        weatherState,
        clampNumber,
        canPlaneGoAround,
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
    } = dependencies;

    function rateLanding(plane) {
        const speedDelta = Math.max((plane.arrivalApproachSpeed ?? plane.runwaySpeed ?? 0) - (plane.arrivalLandingSpeed ?? plane.taxiSpeed ?? 0), 0);
        const approachPenalty = clampNumber(speedDelta / 0.22, 0, 1) * 0.03;
        const stabilityPenalty = (1 - (plane.landingStabilityFactor ?? 0.92)) * 0.12;

        return clampNumber(weatherState.landingSuccessRate - approachPenalty - stabilityPenalty, 0.58, 0.99);
    }

    function setLanding(plane) {
        plane.landingStabilityFactor = 0.86 + (Math.random() * 0.14);
        plane.landingSuccessRate = rateLanding(plane);
        plane.goAroundReason = null;
        plane.autoGoAroundTriggered = false;
    }

    function failReason() {
        const reasons = [
            {
                active: weatherState.windSpeedKnots >= 25 || (weatherState.gustKnots - weatherState.windSpeedKnots) >= 10,
                reason: "Unstable in gusty winds, going around"
            },
            {
                active: weatherState.precipitationRate >= 0.7,
                reason: "Rainy touchdown risk, going around"
            },
            {
                active: weatherState.visibilityKm <= 4,
                reason: "Approach too unstable in low visibility, going around"
            }
        ];
        const weatherReason = reasons.find((entry) => entry.active);

        if (weatherReason) {
            return weatherReason.reason;
        }

        return Math.random() < 0.5
            ? "Approach came in high, going around"
            : "Bounced on touchdown, power set for go-around";
    }

    function autoAround(plane, previousProgress, nextProgress) {
        if (!canPlaneGoAround(plane) || plane.autoGoAroundTriggered) {
            return false;
        }

        const runwayStart = plane.runwayStart ?? 0;
        const triggerProgress = Math.max(runwayStart - 0.012, plane.goAroundCutoffProgress ?? 0);

        if (previousProgress < triggerProgress && nextProgress < triggerProgress) {
            return false;
        }

        plane.landingSuccessRate = rateLanding(plane);

        const didFailLanding = Math.random() > (plane.landingSuccessRate ?? weatherState.landingSuccessRate);

        if (!didFailLanding) {
            plane.autoGoAroundTriggered = true;
            plane.goAroundReason = null;
            return false;
        }

        plane.autoGoAroundTriggered = true;
        plane.goAroundReason = failReason();
        return true;
    }

    function getGoAroundLoopRadius(progress) {
        return goAroundPatternOuterRadiusMeters
            + (Math.sin(progress * Math.PI) * goAroundPatternRadiusVarianceMeters)
            + (Math.sin(progress * Math.PI * 2) * (goAroundPatternRadiusVarianceMeters * 0.32));
    }

    function buildGoAroundPatternCenter(entryPoint, rejoinLeadPoint, heading, patternSide) {
        const midpoint = interpolatePoint(entryPoint, rejoinLeadPoint, 0.5);
        const loopAxisHeading = getHeadingBetweenPoints(entryPoint, rejoinLeadPoint);
        const lateralOffsetPoint = projectPointByHeading(
            midpoint,
            normalizeHeading(loopAxisHeading + (patternSide * 90)),
            goAroundPatternOuterRadiusMeters * 0.38
        );

        return projectPointByHeading(
            lateralOffsetPoint,
            heading,
            goAroundPatternOuterRadiusMeters * 0.12
        );
    }

    function buildGoAroundOrbitPoints(centerPoint, startBearing, endBearing, clockwise) {
        const orbitSweep = clockwise
            ? normalizeHeading(endBearing - startBearing) + 360
            : -(normalizeHeading(startBearing - endBearing) + 360);

        return Array.from({ length: goAroundOrbitSamples }, (_, index) => {
            const progress = (index + 1) / goAroundOrbitSamples;
            const bearing = normalizeHeading(startBearing + (orbitSweep * progress));
            return projectPointByHeading(centerPoint, bearing, getGoAroundLoopRadius(progress));
        });
    }

    function buildGoAroundPattern(startPoint, heading, runwayName, rejoinRoute) {
        const patternSide = getArrivalCurveDirection(runwayName ?? "");
        const rejoinPoint = rejoinRoute[0] ?? startPoint;
        const rejoinHeading = rejoinRoute.length > 1
            ? getHeadingBetweenPoints(rejoinRoute[0], rejoinRoute[1])
            : normalizeHeading(heading + 180);
        const straightAheadPoint = projectPointByHeading(startPoint, heading, goAroundPatternStraightAheadMeters);
        const turnOutPoint = projectPointByHeading(
            straightAheadPoint,
            normalizeHeading(heading + (patternSide * 24)),
            goAroundPatternOuterRadiusMeters * 0.28
        );
        const rejoinLeadPoint = projectPointByHeading(
            rejoinPoint,
            normalizeHeading(rejoinHeading + 180),
            goAroundPatternRejoinLeadMeters
        );
        const rejoinBlendPoint = projectPointByHeading(
            rejoinLeadPoint,
            normalizeHeading(rejoinHeading + (patternSide * -22)),
            goAroundPatternOuterRadiusMeters * 0.2
        );
        const loopCenter = buildGoAroundPatternCenter(turnOutPoint, rejoinBlendPoint, heading, patternSide);
        const orbitEntryBearing = getHeadingBetweenPoints(loopCenter, turnOutPoint);
        const orbitExitBearing = getHeadingBetweenPoints(loopCenter, rejoinBlendPoint);
        const orbitEntryPoint = projectPointByHeading(loopCenter, orbitEntryBearing, getGoAroundLoopRadius(0));
        const orbitPoints = buildGoAroundOrbitPoints(loopCenter, orbitEntryBearing, orbitExitBearing, patternSide > 0);

        return smoothRouteTurns(dedupeRoutePoints([
            startPoint,
            straightAheadPoint,
            turnOutPoint,
            orbitEntryPoint,
            ...orbitPoints,
            rejoinBlendPoint,
            rejoinLeadPoint,
            rejoinPoint
        ]), goAroundMaximumTurnDegrees);
    }

    function triggerPlaneGoAround(plane) {
        if (!canPlaneGoAround(plane)) {
            return;
        }

        const previousRouteProfile = plane.routeProfile;
        const currentPointLatLng = interpolateRouteProfile(plane.routeProfile, plane.progress);
        const currentPoint = [currentPointLatLng.lat, currentPointLatLng.lng];
        const rejoinRoute = [...(previousRouteProfile?.points ?? [])];

        if (rejoinRoute.length < 2) {
            return;
        }

        const patternRoute = buildGoAroundPattern(
            currentPoint,
            getPlaneHeading(plane),
            plane.arrivalRunwayName ?? plane.runwayName,
            rejoinRoute
        );
        const runwayStartPoint = interpolateRouteProfile(previousRouteProfile, plane.runwayStart ?? 1);
        const rolloutEndPoint = interpolateRouteProfile(previousRouteProfile, plane.arrivalRolloutEnd ?? 1);
        const goAroundCutoffPoint = interpolateRouteProfile(
            previousRouteProfile,
            Math.min(plane.goAroundCutoffProgress ?? plane.runwayStart ?? 0, plane.runwayStart ?? 0)
        );
        const route = dedupeRoutePoints([
            ...patternRoute,
            ...rejoinRoute
        ]);

        if (route.length < 2 || !measurePolylineLength(route)) {
            return;
        }

        plane.route = route;
        plane.routeProfile = createRouteProfile(route);
        plane.progress = 0;
        plane.direction = 1;
        plane.goAroundUsed = true;
        plane.goAroundEndProgress = getRouteProgressForPoint(plane.routeProfile, rejoinRoute[0]).progress;
        plane.arrivalOrigin = rejoinRoute[0] ?? currentPoint;
        plane.runwayStart = getRouteProgressForPoint(plane.routeProfile, [runwayStartPoint.lat, runwayStartPoint.lng]).progress;
        plane.arrivalRolloutEnd = getRouteProgressForPoint(plane.routeProfile, [rolloutEndPoint.lat, rolloutEndPoint.lng]).progress;
        plane.goAroundCutoffProgress = getRouteProgressForPoint(
            plane.routeProfile,
            [goAroundCutoffPoint.lat, goAroundCutoffPoint.lng]
        ).progress;
        plane.marker.setLatLng({ lat: currentPoint[0], lng: currentPoint[1] });
        plane.marker.setIcon(createPlaneMarkerIcon(plane.callsign, getPlaneHeading(plane), map.getZoom()));
        syncArrivalGuideLine(plane);
        updatePlanePopup(plane, true);
    }

    return {
        rateLanding,
        setLanding,
        autoAround,
        triggerPlaneGoAround
    };
}

export function createPlaneArrivalSpawner(dependencies) {
    const {
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
        setLanding,
        minimumAssignmentsByAirlineCode,
        maximumAssignmentsByAirlineCode
    } = dependencies;
    let nextArrivalRunwayIndex = 0;

    function isParkingStandOccupied(plane) {
        if (!plane.standbyParkingId) {
            return false;
        }

        if (plane.operationType === "arrival" && plane.returningToGate) {
            return true;
        }

        if (!plane.routeProfile?.totalLength || !plane.hasAssignedRunway) {
            return true;
        }

        return plane.progress < Math.max(plane.pushbackEnd + 0.01, 0.02);
    }

    function createUniqueAirlineCallsign(airlineCode) {
        for (let attempt = 0; attempt < 32; attempt += 1) {
            const numericSuffix = 100 + Math.floor(Math.random() * 900);
            const callsign = `${airlineCode}${numericSuffix}`;

            if (!planeByCallsign.has(callsign)) {
                return callsign;
            }
        }

        return `${airlineCode}${Date.now().toString().slice(-4)}`;
    }

    function selectArrivalSpawn(runwayCandidates, availableParkingEntries) {
        const existingAssignmentsByAirlineCode = animatedPlanes.reduce((assignmentCounts, plane) => {
            if (plane.airlineCode) {
                assignmentCounts.set(plane.airlineCode, (assignmentCounts.get(plane.airlineCode) ?? 0) + 1);
            }

            return assignmentCounts;
        }, new Map());

        for (const runwayEntry of runwayCandidates) {
            for (const parkingEntry of availableParkingEntries) {
                const standPoint = interpolatePath(getLinePoints(parkingEntry), 0.5);
                const nearestGate = getNearestGateMarker(standPoint);
                const gateLabel = getGateNumber(nearestGate?.name, gateNumberByLabel.size + 1);
                const [arrivalTemplate] = AssignAircraftModels([
                    {
                        callsign: "ARRIVAL",
                        gate: gateLabel,
                        gateCoords: nearestGate?.coords ?? standPoint,
                        preferredParkingId: parkingEntry.id,
                        operationType: "arrival",
                        arrivalRunwayName: runwayEntry.name,
                        speed: 0.0042 + (Math.random() * 0.001)
                    }
                ], undefined, {
                    minimumAssignmentsByAirlineCode,
                    maximumAssignmentsByAirlineCode,
                    existingAssignmentsByAirlineCode,
                    returnNullWhenUnassigned: true
                });

                if (!arrivalTemplate) {
                    continue;
                }

                const arrivalPlane = {
                    ...arrivalTemplate,
                    callsign: createUniqueAirlineCallsign(arrivalTemplate.airlineCode ?? "FLT")
                };
                const gateCoords = arrivalPlane.gateCoords ?? airportCenter;
                const preferredParkingEntry = parkingEntryById.get(arrivalPlane.preferredParkingId);
                const parkingStand = buildParkingStandFromEntry(preferredParkingEntry, taxiwayLineSets)
                    ?? resolveParkingStand(gateCoords, parkingLineSets, taxiwayLineSets, reservedParkingIds, arrivalPlane.preferredParkingId);

                if (!parkingStand) {
                    continue;
                }

                const arrivalRoute = buildArrivalRoute(
                    parkingLineSets,
                    taxiwayLineSets,
                    runwayLineSets,
                    holdLineSets,
                    surfaceRouteGraph,
                    {
                        preferredParkingId: arrivalPlane.preferredParkingId,
                        preferredRunwayName: arrivalPlane.arrivalRunwayName,
                        gateOrigin: gateCoords
                    }
                );

                if (!arrivalRoute) {
                    continue;
                }

                return {
                    arrivalPlane,
                    gateCoords,
                    parkingStand,
                    arrivalRoute
                };
            }
        }

        return null;
    }

    function spawnArrivalPlane() {
        const occupiedParkingIds = new Set(
            animatedPlanes
                .filter((plane) => isParkingStandOccupied(plane))
                .map((plane) => plane.standbyParkingId)
                .filter(Boolean)
        );
        const availableParkingEntries = shuffleItems(
            parkingLineSets.filter((entry) => !occupiedParkingIds.has(entry.id))
        );

        if (!availableParkingEntries.length || !runwayLineSets.length) {
            return;
        }

        const activeArrivalRunways = new Set(
            animatedPlanes
                .filter((plane) => {
                    return plane.operationType === "arrival"
                        && plane.returningToGate
                        && plane.progress < (plane.arrivalRolloutEnd ?? 1);
                })
                .map((plane) => plane.runwayName)
                .filter(Boolean)
        );
        const runwayCandidates = runwayLineSets.map((_, offset) => {
            return runwayLineSets[(nextArrivalRunwayIndex + offset) % runwayLineSets.length];
        });
        const candidateRunway = runwayCandidates.find((entry) => !activeArrivalRunways.has(entry.name))
            ?? null;

        if (!candidateRunway) {
            return;
        }

        nextArrivalRunwayIndex = (runwayLineSets.indexOf(candidateRunway) + 1) % runwayLineSets.length;
        const spawnSelection = selectArrivalSpawn(runwayCandidates, availableParkingEntries);

        if (!spawnSelection) {
            return;
        }

        const {
            arrivalPlane,
            gateCoords,
            parkingStand,
            arrivalRoute
        } = spawnSelection;

        const marker = L.marker({ lat: gateCoords[0], lng: gateCoords[1] }, {
            icon: createPlaneMarkerIcon(arrivalPlane.callsign, parkingStand.spawnHeading, map.getZoom()),
            zIndexOffset: 6000,
            keyboard: false
        }).addTo(movingPlaneLayer);
        const animatedPlane = {
            ...arrivalPlane,
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
            pushbackSpeed: Math.max(arrivalPlane.speed * 0.42, 0.0016),
            taxiSpeed: Math.max(arrivalPlane.speed * 0.58, 0.0022),
            lineupSpeed: Math.max(arrivalPlane.speed * 0.34, 0.0014),
            runwaySpeed: Math.max(arrivalPlane.speed * 5.2, 0.031),
            takeoffAcceleration: Math.max(arrivalPlane.speed * 9.5, 0.13),
            abortSpeed: Math.max(arrivalPlane.speed * 0.26, 0.0012),
            arrivalApproachSpeed: Math.max(arrivalPlane.speed * 10.2, 0.044),
            arrivalLandingSpeed: Math.max(arrivalPlane.speed * 7.6, 0.028),
            arrivalRolloutEnd: 0,
            goAroundCutoffProgress: arrivalRoute.goAroundCutoffProgress,
            goAroundUsed: false,
            goAroundEndProgress: 0,
            arrivalOrigin: null,
            arrivalRunwayName: arrivalPlane.arrivalRunwayName,
            arrivalRunwayDesignation: arrivalRoute.arrivalRunwayDesignation,
            approachGuideLine: null,
            holdDelayMs: 350 + (animatedPlanes.length * 40),
            holdStartedAt: null,
            progress: 0,
            direction: 1,
            hasAssignedRunway: true,
            returningToGate: true,
            departureClearance: "hold-short",
            speedMultiplier: 1,
            landingStabilityFactor: 0.92,
            landingSuccessRate: baseLandingSuccessRate,
            goAroundReason: null,
            autoGoAroundTriggered: false
        };

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
        animatedPlane.marker.setLatLng(interpolateRouteProfile(animatedPlane.routeProfile, 0));
        animatedPlane.marker.setIcon(createPlaneMarkerIcon(animatedPlane.callsign, getPlaneHeading(animatedPlane), map.getZoom()));

        attachPlanePopupHandlers(animatedPlane);
        syncArrivalGuideLine(animatedPlane);

        animatedPlanes.push(animatedPlane);
        planeByCallsign.set(animatedPlane.callsign, animatedPlane);
        animatedPlane.allPlanes = animatedPlanes;
        renderPlaneControlPanel(animatedPlanes);
    }

    return {
        spawnArrivalPlane
    };
}