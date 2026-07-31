export function createPlaneDepartureOperations(dependencies) {
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
        parkingLineSets,
        taxiwayLineSets,
        runwayLineSets,
        surfaceRouteGraph,
        buildDepartureRoute,
        holdLineSets,
        taxiwayRouteGraph,
        buildDirectDepartureRoute
    } = dependencies;

    function setPlaneDepartureClearance(plane, clearance) {
        plane.departureClearance = clearance;

        if (clearance === "hold-short" && plane.progress >= plane.holdProgress && plane.progress < plane.runwayStart) {
            plane.progress = getRunwayHoldProgress(plane);
        }

        if (clearance === "immediate" && plane.progress >= getRunwayHoldProgress(plane)) {
            plane.progress = Math.min(Math.max(plane.progress, plane.runwayStart + 0.0005), 0.994);
        }

        if (clearance !== "immediate" && plane.progress >= plane.runwayStart && plane.progress < 0.995) {
            plane.progress = plane.runwayStart;
        }

        updatePlanePopup(plane, true);
    }

    function setPlaneParked(plane) {
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

    function applyDepartureRouteToPlane(plane, departureRoute, nextProgress = 0) {
        clearPlaneApproachGuide(plane);
        plane.route = departureRoute.route;
        plane.routeProfile = createRouteProfile(departureRoute.route);
        plane.parkingId = departureRoute.parkingId;
        plane.parkingName = departureRoute.parkingName;
        plane.runwayName = departureRoute.runwayName;
        plane.pushbackEnd = departureRoute.pushbackEnd;
        plane.holdProgress = departureRoute.holdProgress;
        plane.runwayStart = departureRoute.runwayStart;
        plane.holdStartedAt = null;
        plane.progress = Math.min(Math.max(nextProgress, 0), 0.999);
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

    function abortPlaneTakeoff(plane) {
        const currentLatLng = plane.marker.getLatLng();
        const returnRoute = buildReturnToGateRoute(
            [currentLatLng.lat, currentLatLng.lng],
            parkingLineSets,
            taxiwayLineSets,
            runwayLineSets,
            surfaceRouteGraph,
            plane.standbyParkingId,
            plane.gateCoords
        );

        if (!returnRoute) {
            return;
        }

        plane.route = returnRoute.route;
        plane.routeProfile = createRouteProfile(returnRoute.route);
        plane.parkingId = returnRoute.parkingId;
        plane.parkingName = returnRoute.parkingName;
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

    function reroutePlaneToRunway(plane, runwayName) {
        const isNearGate = !plane.hasAssignedRunway || plane.progress <= Math.max(plane.pushbackEnd + 0.04, 0.12);
        const currentLatLng = plane.marker.getLatLng();
        const departureRoute = isNearGate
            ? buildDepartureRoute(
                plane.gateCoords,
                parkingLineSets,
                taxiwayLineSets,
                runwayLineSets,
                holdLineSets,
                surfaceRouteGraph,
                taxiwayRouteGraph,
                0,
                new Set(),
                {
                    preferredParkingId: plane.standbyParkingId,
                    preferredRunwayName: runwayName
                }
            )
            : buildDirectDepartureRoute(
                [currentLatLng.lat, currentLatLng.lng],
                taxiwayLineSets,
                runwayLineSets,
                holdLineSets,
                surfaceRouteGraph,
                taxiwayRouteGraph,
                0,
                runwayName
            );

        if (!departureRoute) {
            return;
        }

        applyDepartureRouteToPlane(plane, departureRoute, isNearGate ? Math.min(plane.progress, departureRoute.pushbackEnd) : 0);
        plane.marker.openPopup();
    }

    return {
        setPlaneDepartureClearance,
        setPlaneParked,
        abortPlaneTakeoff,
        reroutePlaneToRunway
    };
}