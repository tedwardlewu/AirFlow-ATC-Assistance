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

        if (clr !== "immediate" && plane.progress >= plane.runwayStart && plane.progress < 0.995) {
            plane.progress = plane.runwayStart;
        }

        updatePlanePopup(plane, true);
    }

    function parkPlane(plane) {
        clearPlaneApproachGuide(plane);
        plane.route = null;
        plane.routeProfile = null;
        plane.autoTaxiActive = false;
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

    function applyDepRoute(plane, depRoute, nextProg = 0, options = {}) {
        clearPlaneApproachGuide(plane);
        plane.route = depRoute.route;
        plane.routeProfile = createRouteProfile(depRoute.route);
        plane.autoTaxiActive = options.autoTaxiActive ?? plane.autoTaxiActive ?? false;
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
        plane.departureClearance = options.departureClearance ?? "hold-short";

        const position = interpolateRouteProfile(plane.routeProfile, plane.progress);
        plane.marker.setLatLng(position);
        plane.marker.setIcon(createPlaneMarkerIcon(plane.callsign, getPlaneHeading(plane), map.getZoom()));
        updatePlanePopup(plane);
    }

    function applyReturnRoute(plane, routeData, nextProg = 0) {
        clearPlaneApproachGuide(plane);
        plane.route = routeData.route;
        plane.routeProfile = createRouteProfile(routeData.route);
        plane.autoTaxiActive = false;
        plane.parkingId = routeData.parkingId;
        plane.parkingName = routeData.parkingName;
        plane.runwayName = routeData.runwayName;
        plane.pushbackEnd = routeData.pushbackEnd;
        plane.holdProgress = routeData.holdProgress;
        plane.runwayStart = routeData.runwayStart;
        plane.holdStartedAt = null;
        plane.progress = Math.min(Math.max(nextProg, 0), 0.999);
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

        applyReturnRoute(plane, gateRoute, 0);
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

    function rerouteTaxiConflict(plane, routingOptions = {}) {
        const position = plane.marker.getLatLng();

        if (!position) {
            return false;
        }

        if (plane.returningToGate) {
            const gateRoute = buildReturnToGateRoute(
                [position.lat, position.lng],
                parkingLines,
                taxiLines,
                runwayLines,
                taxiGraph,
                plane.standbyParkingId,
                plane.gateCoords,
                routingOptions
            ) ?? buildReturnToGateRoute(
                [position.lat, position.lng],
                parkingLines,
                taxiLines,
                runwayLines,
                surfaceGraph,
                plane.standbyParkingId,
                plane.gateCoords,
                routingOptions
            );

            if (!gateRoute) {
                return false;
            }

            applyReturnRoute(plane, gateRoute, 0);
            return true;
        }

        if (!plane.runwayName) {
            return false;
        }

        const depRoute = buildDirectDepartureRoute(
            [position.lat, position.lng],
            taxiLines,
            runwayLines,
            holdLines,
            surfaceGraph,
            taxiGraph,
            0,
            plane.runwayName,
            routingOptions
        );

        if (!depRoute) {
            return false;
        }

        applyDepRoute(plane, depRoute, 0, {
            departureClearance: plane.departureClearance ?? "hold-short"
        });
        return true;
    }

    return {
        setDepClearance,
        parkPlane,
        abortTakeoff,
        rerouteToRunway,
        rerouteTaxiConflict
    };
}