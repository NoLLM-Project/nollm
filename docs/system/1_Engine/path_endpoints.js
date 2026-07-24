// system/engine/path_endpoints.js

export function deriveEndpoints(metadata, structural) {
  const { coordinates, type, category } = metadata || {};

  // START NODE: routing node name (no coord_ prefix)
  let startNode = "hotel_lobby";   // or whatever your routing graph uses

  // END NODE: routing node name (no coord_ prefix)
  let endNode = null;

  if (category === "hotel_front_desk") {
    endNode = "hotel_front_desk";
  } else if (category === "service_room") {
    endNode = "service_room";
  } else {
    // fallback: use coordinates mapping if you have one
    endNode = mapCoordinatesToNode(coordinates);
  }

  return { startNode, endNode };
}

function mapCoordinatesToNode(coordinates) {
  // stub: you can wire this to your coordinate registry
  // e.g. lookup by floor/zone/room
  return null;
}
