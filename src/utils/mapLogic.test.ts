import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateAdminKey,
  validatePlannerKey,
  calculateRouteDistance,
  calculateFlightTimeMin,
  calculateHeading,
} from './mapLogic';
import { RouteWaypoint } from '../types';

test('validateAdminKey allows only key-lap', () => {
  assert.equal(validateAdminKey('key-lap'), true);
  assert.equal(validateAdminKey('  key-lap  '), true);
  assert.equal(validateAdminKey('key-plan'), false);
  assert.equal(validateAdminKey('admin'), false);
  assert.equal(validateAdminKey(''), false);
});

test('validatePlannerKey allows only key-plan', () => {
  assert.equal(validatePlannerKey('key-plan'), true);
  assert.equal(validatePlannerKey(' key-plan '), true);
  assert.equal(validatePlannerKey('key-lap'), false);
  assert.equal(validatePlannerKey('wrong'), false);
  assert.equal(validatePlannerKey(''), false);
});

test('calculateRouteDistance handles empty, single point, and multi-points', () => {
  assert.equal(calculateRouteDistance([]), 0);
  const p1: RouteWaypoint = { id: '1', code: 'A', name: 'A', type: 'FIX', x: 0, y: 0 };
  assert.equal(calculateRouteDistance([p1]), 0);

  const p2: RouteWaypoint = { id: '2', code: 'B', name: 'B', type: 'FIX', x: 100, y: 0 };
  const d = calculateRouteDistance([p1, p2]);
  assert.equal(d, 115); // 100 * 1.15
});

test('calculateFlightTimeMin calculates time with buffer', () => {
  assert.equal(calculateFlightTimeMin(0), 0);
  // 450 NM at 450 kts = 60 mins + 15 buffer = 75
  assert.equal(calculateFlightTimeMin(450), 75);
});

test('calculateHeading returns degrees from 0 to 360', () => {
  assert.equal(calculateHeading({ x: 0, y: 0 }, { x: 0, y: -100 }), 0); // North
  assert.equal(calculateHeading({ x: 0, y: 0 }, { x: 100, y: 0 }), 90); // East
  assert.equal(calculateHeading({ x: 0, y: 0 }, { x: 0, y: 100 }), 180); // South
  assert.equal(calculateHeading({ x: 0, y: 0 }, { x: -100, y: 0 }), 270); // West
});
