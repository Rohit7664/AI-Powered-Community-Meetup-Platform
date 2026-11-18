/**
 * Calculate the great circle distance between two points
 * on the earth (specified in decimal degrees) using Haversine formula.
 *
 * @param {number} lat1 Latitude of point 1
 * @param {number} lon1 Longitude of point 1
 * @param {number} lat2 Latitude of point 2
 * @param {number} lon2 Longitude of point 2
 * @returns {number} Distance in kilometers
 */
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    return Infinity;
  }
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Calculate location compatibility score (0 to 100)
 * Inside radius: 100% to 70% decreasing linearly with distance
 * Outside radius: drops towards 0%
 */
function calculateLocationScore(coord1, coord2, radiusKm = 10, isOnline = false) {
  if (isOnline) return 100;
  if (!coord1 || !coord2 || coord1.length < 2 || coord2.length < 2) return 50;

  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;
  const dist = calculateDistanceKm(lat1, lon1, lat2, lon2);

  if (dist <= radiusKm) {
    // Within local radius: 100 at 0km down to 70 at radiusKm
    const score = 100 - (dist / radiusKm) * 30;
    return Math.max(70, Math.round(score));
  } else if (dist <= radiusKm * 2) {
    // Up to 2x radius: 70 down to 30
    const score = 70 - ((dist - radiusKm) / radiusKm) * 40;
    return Math.max(30, Math.round(score));
  } else {
    // Far away
    return Math.max(10, Math.round(30 - (dist / (radiusKm * 5)) * 20));
  }
}

module.exports = {
  calculateDistanceKm,
  calculateLocationScore,
};
