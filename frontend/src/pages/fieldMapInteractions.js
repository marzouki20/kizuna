function clampCoordinate(value) {
  return Math.max(0, Math.min(200, Number(value.toFixed(1))));
}

export function handleFieldMapClick(event, onAddWaypoint) {
  if (event.originalEvent?.target?.closest?.(".leaflet-interactive")) return false;
  const { lat, lng } = event.latlng;
  onAddWaypoint({ x: clampCoordinate(lng), y: clampCoordinate(lat) });
  return true;
}

export function handlePlantMarkerClick(plant, event, onSelectPlant) {
  event.originalEvent?.stopPropagation?.();
  onSelectPlant(plant.id);
}
