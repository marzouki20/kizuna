import assert from "node:assert/strict";
import test from "node:test";
import { handleFieldMapClick, handlePlantMarkerClick } from "./fieldMapInteractions.js";

test("clicking a plant marker selects it and does not add a waypoint", () => {
  let waypoint;
  let selectedPlantId;
  let propagationStopped = false;
  const event = {
    latlng: { lat: 48, lng: 63 },
    originalEvent: {
      target: { closest: (selector) => selector === ".leaflet-interactive" ? {} : null },
      stopPropagation: () => { propagationStopped = true; },
    },
  };

  const added = handleFieldMapClick(event, (point) => { waypoint = point; });
  handlePlantMarkerClick({ id: "TOM-001" }, event, (id) => { selectedPlantId = id; });

  assert.equal(added, false);
  assert.equal(waypoint, undefined);
  assert.equal(selectedPlantId, "TOM-001");
  assert.equal(propagationStopped, true);
});

test("clicking an empty map area adds a waypoint in centimeters", () => {
  let waypoint;
  const added = handleFieldMapClick({
    latlng: { lat: 127.46, lng: 82.34 },
    originalEvent: { target: { closest: () => null } },
  }, (point) => { waypoint = point; });

  assert.equal(added, true);
  assert.deepEqual(waypoint, { x: 82.3, y: 127.5 });
});
