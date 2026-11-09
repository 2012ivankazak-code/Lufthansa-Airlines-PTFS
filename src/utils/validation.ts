import { PilotData, AttendantData, GroundData, DispatcherData } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function sanitizeTelegram(tg: string): string {
  const clean = tg.trim();
  if (!clean) return '';
  return clean.startsWith('@') ? clean : `@${clean}`;
}

export function validatePilotForm(data: Partial<PilotData>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Укажите ваше имя или никнейм в Roblox (минимум 2 символа)';
  }

  if (data.minutesInPtfs === undefined || data.minutesInPtfs === null || isNaN(Number(data.minutesInPtfs)) || Number(data.minutesInPtfs) < 0) {
    errors.minutesInPtfs = 'Укажите корректное количество минут в PTFS (число от 0)';
  }

  if (!data.referralSource || data.referralSource.trim().length < 3) {
    errors.referralSource = 'Укажите, как вы узнали о нашей а/к';
  }

  const skill = Number(data.flightSkill);
  if (isNaN(skill) || skill < 1 || skill > 10 || !Number.isInteger(skill)) {
    errors.flightSkill = 'Оценка навыка управления должна быть целым числом от 1 до 10';
  }

  if (data.readyForCheck !== 'yes' && data.readyForCheck !== 'no') {
    errors.readyForCheck = 'Выберите, готовы ли пройти проверку';
  }

  const tg = (data.telegram || '').trim();
  if (!tg || tg.replace('@', '').length < 3) {
    errors.telegram = 'Укажите ваш логин в Telegram (минимум 3 символа)';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateAttendantForm(data: Partial<AttendantData>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Укажите имя или никнейм в Roblox (минимум 2 символа)';
  }

  const skill = Number(data.serviceSkill);
  if (isNaN(skill) || skill < 1 || skill > 10 || !Number.isInteger(skill)) {
    errors.serviceSkill = 'Оценка знания сервиса должна быть целым числом от 1 до 10';
  }

  if (data.readyForCheck !== 'yes' && data.readyForCheck !== 'no') {
    errors.readyForCheck = 'Подтвердите готовность пройти проверку в лс';
  }

  const tg = (data.telegram || '').trim();
  if (!tg || tg.replace('@', '').length < 3) {
    errors.telegram = 'Укажите ваш логин в Telegram';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateGroundForm(data: Partial<GroundData>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Укажите имя или никнейм в Roblox';
  }

  if (!data.maintenanceKnowledge || data.maintenanceKnowledge.trim().length < 5) {
    errors.maintenanceKnowledge = 'Опишите ваши знания по обслуживанию ВС (минимум 5 символов)';
  }

  const tg = (data.telegram || '').trim();
  if (!tg || tg.replace('@', '').length < 3) {
    errors.telegram = 'Укажите ваш логин в Telegram';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateDispatcherForm(data: Partial<DispatcherData>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Укажите имя или никнейм в Roblox';
  }

  if (!data.froKnowledge || data.froKnowledge.trim().length < 4) {
    errors.froKnowledge = 'Укажите знание ФРО (Фразеологии радиообмена)';
  }

  const tg = (data.telegram || '').trim();
  if (!tg || tg.replace('@', '').length < 3) {
    errors.telegram = 'Укажите ваш логин в Telegram';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateCheckIn(nickname: string, flightId: string): ValidationResult {
  const errors: Record<string, string> = {};

  if (!nickname || nickname.trim().length < 3) {
    errors.nickname = 'Введите никнейм в Roblox (минимум 3 символа)';
  } else if (!/^[a-zA-Z0-9_]+$/.test(nickname.trim())) {
    errors.nickname = 'Никнейм в Roblox может содержать только латинские буквы, цифры и знак _';
  }

  if (!flightId || flightId.trim() === '') {
    errors.flightId = 'Выберите рейс для регистрации';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
