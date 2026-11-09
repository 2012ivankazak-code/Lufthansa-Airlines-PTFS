import { RouteWaypoint } from '../types';

export function validateAdminKey(key: string): boolean {
  return key.trim() === 'key-lap';
}

export function validatePlannerKey(key: string): boolean {
  return key.trim() === 'key-plan';
}

export function calculateRouteDistance(waypoints: RouteWaypoint[]): number {
  if (waypoints.length < 2) return 0;
  let dist = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const p1 = waypoints[i];
    const p2 = waypoints[i + 1];
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    // Calibrated nautical mile scale factor for 1280x960 PTFS chart
    dist += Math.sqrt(dx * dx + dy * dy) * 1.15;
  }
  return Math.round(dist);
}

export function calculateFlightTimeMin(distanceNm: number, cruiseSpeedKts = 450): number {
  if (distanceNm <= 0) return 0;
  return Math.round((distanceNm / cruiseSpeedKts) * 60) + 15; // 15 mins for taxi, climb, descent
}

export function calculateHeading(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  let angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
  if (angle < 0) angle += 360;
  return Math.round(angle);
}
