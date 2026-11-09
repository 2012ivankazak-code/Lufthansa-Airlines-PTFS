import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validatePilotForm,
  validateAttendantForm,
  validateGroundForm,
  validateDispatcherForm,
  validateCheckIn,
  sanitizeTelegram,
} from './validation';

test('sanitizeTelegram adds @ when missing', () => {
  assert.equal(sanitizeTelegram('pilot_ptfs'), '@pilot_ptfs');
  assert.equal(sanitizeTelegram('@pilot_ptfs'), '@pilot_ptfs');
  assert.equal(sanitizeTelegram('  @pilot_ptfs  '), '@pilot_ptfs');
  assert.equal(sanitizeTelegram(''), '');
});

test('validatePilotForm catches invalid score and missing fields', () => {
  const invalid = validatePilotForm({
    name: 'A',
    minutesInPtfs: -5,
    referralSource: '',
    flightSkill: 15, // Out of range 1-10
    readyForCheck: 'yes',
    telegram: '',
  });

  assert.equal(invalid.isValid, false);
  assert.ok(invalid.errors.name);
  assert.ok(invalid.errors.minutesInPtfs);
  assert.ok(invalid.errors.referralSource);
  assert.ok(invalid.errors.flightSkill);
  assert.ok(invalid.errors.telegram);

  const valid = validatePilotForm({
    name: 'Alex_Roblox',
    minutesInPtfs: 450,
    referralSource: 'Discord PTFS Server',
    flightSkill: 8,
    readyForCheck: 'yes',
    telegram: '@alex_ptfs',
  });

  assert.equal(valid.isValid, true);
  assert.equal(Object.keys(valid.errors).length, 0);
});

test('validateAttendantForm checks serviceSkill 1-10', () => {
  const low = validateAttendantForm({
    name: 'Elena',
    serviceSkill: 0,
    readyForCheck: 'yes',
    telegram: '@elena_cabin',
  });
  assert.equal(low.isValid, false);
  assert.ok(low.errors.serviceSkill);

  const high = validateAttendantForm({
    name: 'Elena',
    serviceSkill: 10,
    readyForCheck: 'yes',
    telegram: '@elena_cabin',
  });
  assert.equal(high.isValid, true);
});

test('validateGroundForm and validateDispatcherForm validate minimum text', () => {
  const groundInvalid = validateGroundForm({ name: '', maintenanceKnowledge: 'no', telegram: '' });
  assert.equal(groundInvalid.isValid, false);

  const atcValid = validateDispatcherForm({
    name: 'Oleg_ATC',
    froKnowledge: 'Полное знание ФРО PTFS / ИКАО и эшелонирования',
    telegram: '@oleg_atc',
  });
  assert.equal(atcValid.isValid, true);
});

test('validateCheckIn checks Roblox nickname and flight id', () => {
  assert.equal(validateCheckIn('', '').isValid, false);
  assert.equal(validateCheckIn('Roblox_Pilot_99', 'LH-1042').isValid, true);
  assert.equal(validateCheckIn('Bad nick!#$', 'LH-1042').isValid, false);
});
