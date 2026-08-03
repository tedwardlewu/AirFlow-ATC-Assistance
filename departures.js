export function createDepOps(deps) {
    const {
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
        parkingLineSets: parkingLines,
        taxiwayLineSets: taxiLines,
        runwayLineSets: runwayLines,
        surfaceRouteGraph: surfaceGraph,
        buildDepartureRoute,
        holdLineSets: holdLines,
        taxiwayRouteGraph: taxiGraph,
        buildDirectDepartureRoute
    } = deps;

    function setDepClearance(plane, clr) {
        plane.departureClearance = clr;

        if (clr === "hold-short" && plane.progress >= plane.holdProgress && plane.progress < plane.runwayStart) {
            plane.progress = getRunwayHoldProgress(plane);
        }

        if (clr === "immediate" && plane.progress >= getRunwayHoldProgress(plane)) {
            plane.progress = Math.min(Math.max(plane.progress, plane.runwayStart + 0.0005), 0.994);
        }

        if (clr !== "immediate" && plane.progress >= plane.runwayStart && plane.progress < 0.995) {
            plane.progress = plane.runwayStart;
        }

        updatePlanePopup(plane, true);
    }

    function parkPlane(plane) {
        clearPlaneApproachGuide(plane);
        plane.route = null;
        plane.routeProfile = null;
        plane.parkingId = plane.standbyParkingId;
        plane.parkingName = plane.standbyParkingName;
        plane.runwayName = null;
        plane.pushbackEnd = 0;
        plane.holdProgress = 0;
        plane.runwayStart = 1;
        plane.holdStartedAt = null;
        plane.progress = 0;
        plane.hasAssignedRunway = false;
        plane.returningToGate = false;
        plane.taxiRequestPending = false;
        plane.taxiRequestIssuedAt = null;
        plane.departureClearance = "hold-short";
        plane.operationType = "departure";
        plane.arrivalRolloutEnd = 0;
        plane.goAroundCutoffProgress = 0;
        plane.goAroundUsed = false;
        plane.goAroundEndProgress = 0;
        plane.arrivalRunwayName = null;
        plane.arrivalRunwayDesignation = null;
        plane.goAroundReason = null;
        plane.autoGoAroundTriggered = false;
        plane.landingSuccessRate = baseLandingSuccessRate;

        plane.marker.setLatLng({ lat: plane.standbyCoords[0], lng: plane.standbyCoords[1] });
        plane.marker.setIcon(createPlaneMarkerIcon(plane.callsign, getPlaneHeading(plane), map.getZoom()));
        updatePlanePopup(plane);
    }

    function applyDepRoute(plane, depRoute, nextProg = 0) {
        clearPlaneApproachGuide(plane);
        plane.route = depRoute.route;
        plane.routeProfile = createRouteProfile(depRoute.route);
        plane.parkingId = depRoute.parkingId;
        plane.parkingName = depRoute.parkingName;
        plane.runwayName = depRoute.runwayName;
        plane.pushbackEnd = depRoute.pushbackEnd;
        plane.holdProgress = depRoute.holdProgress;
        plane.runwayStart = depRoute.runwayStart;
        plane.holdStartedAt = null;
        plane.progress = Math.min(Math.max(nextProg, 0), 0.999);
        plane.hasAssignedRunway = true;
        plane.returningToGate = false;
        plane.taxiRequestPending = false;
        plane.taxiRequestIssuedAt = null;
        plane.goAroundCutoffProgress = 0;
        plane.goAroundUsed = false;
        plane.goAroundEndProgress = 0;
        plane.goAroundReason = null;
        plane.autoGoAroundTriggered = false;
        plane.departureClearance = "hold-short";

        const position = interpolateRouteProfile(plane.routeProfile, plane.progress);
        plane.marker.setLatLng(position);
        plane.marker.setIcon(createPlaneMarkerIcon(plane.callsign, getPlaneHeading(plane), map.getZoom()));
        updatePlanePopup(plane);
    }

    function abortTakeoff(plane) {
        const pos = plane.marker.getLatLng();
        const gateRoute = buildReturnToGateRoute(
            [pos.lat, pos.lng],
            parkingLines,
            taxiLines,
            runwayLines,
            surfaceGraph,
            plane.standbyParkingId,
            plane.gateCoords
        );

        if (!gateRoute) {
            return;
        }

        plane.route = gateRoute.route;
        plane.routeProfile = createRouteProfile(gateRoute.route);
        plane.parkingId = gateRoute.parkingId;
        plane.parkingName = gateRoute.parkingName;
        plane.runwayName = null;
        plane.pushbackEnd = 0;
        plane.holdProgress = 0;
        plane.runwayStart = 1;
        plane.holdStartedAt = null;
        plane.progress = 0;
        plane.returningToGate = true;
        plane.hasAssignedRunway = true;
        plane.taxiRequestPending = false;
        plane.taxiRequestIssuedAt = null;
        plane.departureClearance = "hold-short";

        const position = interpolateRouteProfile(plane.routeProfile, plane.progress);
        plane.marker.setLatLng(position);
        plane.marker.setIcon(createPlaneMarkerIcon(plane.callsign, getPlaneHeading(plane), map.getZoom()));
        updatePlanePopup(plane, true);
    }

    function rerouteToRunway(plane, rwy) {
        const nearGate = !plane.hasAssignedRunway || plane.progress <= Math.max(plane.pushbackEnd + 0.04, 0.12);
        const pos = plane.marker.getLatLng();
        const depRoute = nearGate
            ? buildDepartureRoute(
                plane.gateCoords,
                parkingLines,
                taxiLines,
                runwayLines,
                holdLines,
                surfaceGraph,
                taxiGraph,
                0,
                new Set(),
                {
                    preferredParkingId: plane.standbyParkingId,
                    preferredRunwayName: rwy
                }
            )
            : buildDirectDepartureRoute(
                [pos.lat, pos.lng],
                taxiLines,
                runwayLines,
                holdLines,
                surfaceGraph,
                taxiGraph,
                0,
                rwy
            );

        if (!depRoute) {
            return;
        }

        applyDepRoute(plane, depRoute, nearGate ? Math.min(plane.progress, depRoute.pushbackEnd) : 0);
        plane.marker.openPopup();
    }

    return {
        setDepClearance,
        parkPlane,
        abortTakeoff,
        rerouteToRunway
    };
}