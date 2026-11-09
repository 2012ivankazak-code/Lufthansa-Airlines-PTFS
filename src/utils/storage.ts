import {
  Application,
  BoardingPass,
  ApplicationStatus,
  SavedRoute,
  Flight,
  FlightStatus,
  FlightAlertSubscription,
  ActiveFlightNotification,
} from '../types';
import { FLIGHTS_DATA } from '../data/flights';
import { PTFS_WAYPOINTS } from '../data/ptfsWaypoints';

const APPLICATIONS_KEY = 'lh_ptfs_applications_v1';
const BOARDING_PASSES_KEY = 'lh_ptfs_boarding_passes_v1';
const SAVED_ROUTES_KEY = 'lh_ptfs_saved_routes_v1';
const FLIGHT_ROUTES_KEY = 'lh_ptfs_flight_routes_v1';
const FLIGHTS_KEY = 'lh_ptfs_flights_v1';
const PLANNER_KEY = 'lh_ptfs_planner_unlocked_v1';
const COOKIES_KEY = 'lh_ptfs_cookies_v1';
const ALERTS_KEY = 'lh_ptfs_flight_alerts_v1';

export const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 'app-lh-101',
    roleId: 'pilot',
    roleTitle: 'Пилот (First Officer)',
    applicantName: 'Maxim_Aviator',
    telegram: '@maxim_ptfs',
    status: 'PENDING',
    createdAt: '2026-11-09T08:30:00.000Z',
    data: {
      name: 'Maxim_Aviator',
      minutesInPtfs: 1420,
      referralSource: 'PTFS Aviation Discord Community',
      flightSkill: 9,
      readyForCheck: 'yes',
      telegram: '@maxim_ptfs',
    },
  },
  {
    id: 'app-lh-102',
    roleId: 'attendant',
    roleTitle: 'Бортпроводник',
    applicantName: 'Anna_Sky',
    telegram: '@anna_crew',
    status: 'APPROVED',
    createdAt: '2026-11-08T14:15:00.000Z',
    adminNote: 'Проверка пройдена успешно. Добавлена в состав экипажа MUC.',
    data: {
      name: 'Anna_Sky',
      serviceSkill: 10,
      readyForCheck: 'yes',
      telegram: '@anna_crew',
    },
  },
  {
    id: 'app-lh-103',
    roleId: 'dispatcher',
    roleTitle: 'Диспетчер (PTFS Tower / Radar)',
    applicantName: 'Viktor_Radar',
    telegram: '@viktor_atc',
    status: 'PENDING',
    createdAt: '2026-11-09T09:45:00.000Z',
    data: {
      name: 'Viktor_Radar',
      froKnowledge: 'Отличное знание правил эшелонирования и стандартной радиофразеологии ИКАО/PTFS.',
      telegram: '@viktor_atc',
    },
  },
  {
    id: 'app-lh-104',
    roleId: 'ground',
    roleTitle: 'Наземная служба (Ground Ops)',
    applicantName: 'Dmitry_Tech',
    telegram: '@dmitry_ground',
    status: 'REJECTED',
    createdAt: '2026-11-07T11:00:00.000Z',
    adminNote: 'Недостаточно подробный ответ по протоколам буксировки и заправки.',
    data: {
      name: 'Dmitry_Tech',
      maintenanceKnowledge: 'Базовые знания pushback tug.',
      telegram: '@dmitry_ground',
    },
  },
];

export function getApplications(): Application[] {
  if (typeof window === 'undefined') return INITIAL_APPLICATIONS;
  try {
    const raw = localStorage.getItem(APPLICATIONS_KEY);
    if (!raw) {
      localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(INITIAL_APPLICATIONS));
      return INITIAL_APPLICATIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_APPLICATIONS;
  } catch {
    return INITIAL_APPLICATIONS;
  }
}

export function saveApplication(app: Application): void {
  const current = getApplications();
  const updated = [app, ...current];
  try {
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('lh_storage_updated'));
  } catch (e) {
    console.error('Failed to save application to localStorage', e);
  }
}

export function updateApplicationStatus(id: string, status: ApplicationStatus, adminNote?: string): Application[] {
  const current = getApplications();
  const updated = current.map((item) => {
    if (item.id === id) {
      return {
        ...item,
        status,
        ...(adminNote ? { adminNote } : {}),
      };
    }
    return item;
  });

  try {
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('lh_storage_updated'));
  } catch (e) {
    console.error('Failed to update application status', e);
  }
  return updated;
}

export function deleteApplication(id: string): Application[] {
  const current = getApplications();
  const updated = current.filter((item) => item.id !== id);
  try {
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('lh_storage_updated'));
  } catch (e) {
    console.error('Failed to delete application', e);
  }
  return updated;
}

// ------------------------------------
// Boarding Passes
// ------------------------------------
export function getBoardingPasses(): BoardingPass[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BOARDING_PASSES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveBoardingPass(pass: BoardingPass): void {
  const current = getBoardingPasses();
  const updated = [pass, ...current.filter((p) => p.id !== pass.id)].slice(0, 10);
  try {
    localStorage.setItem(BOARDING_PASSES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('lh_boarding_pass_updated'));
  } catch (e) {
    console.error('Failed to save boarding pass', e);
  }
}

// ------------------------------------
// Flights & Dispatch Board
// ------------------------------------
export function getFlights(): Flight[] {
  if (typeof window === 'undefined') return FLIGHTS_DATA;
  try {
    const raw = localStorage.getItem(FLIGHTS_KEY);
    if (!raw) {
      localStorage.setItem(FLIGHTS_KEY, JSON.stringify(FLIGHTS_DATA));
      return FLIGHTS_DATA;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : FLIGHTS_DATA;
  } catch {
    return FLIGHTS_DATA;
  }
}

export function updateFlightStatus(flightNumber: string, status: FlightStatus, gate?: string): Flight[] {
  const current = getFlights();
  const updated = current.map((f) => {
    if (f.flightNumber === flightNumber) {
      return {
        ...f,
        status,
        ...(gate ? { gate } : {}),
      };
    }
    return f;
  });

  try {
    localStorage.setItem(FLIGHTS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('lh_flights_updated'));
  } catch (e) {
    console.error('Failed to update flight status', e);
  }
  return updated;
}

export function addFlight(flight: Flight): Flight[] {
  const current = getFlights();
  const updated = [...current, flight];
  try {
    localStorage.setItem(FLIGHTS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('lh_flights_updated'));
  } catch (e) {
    console.error('Failed to add flight', e);
  }
  return updated;
}

export function updateFlight(flight: Flight): Flight[] {
  const current = getFlights();
  const updated = current.map((f) => (f.flightNumber === flight.flightNumber || f.id === flight.id ? flight : f));
  try {
    localStorage.setItem(FLIGHTS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('lh_flights_updated'));
  } catch (e) {
    console.error('Failed to update flight', e);
  }
  return updated;
}

export function deleteFlight(flightNumber: string): Flight[] {
  const current = getFlights();
  const updated = current.filter((f) => f.flightNumber !== flightNumber && f.id !== flightNumber);
  try {
    localStorage.setItem(FLIGHTS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('lh_flights_updated'));
  } catch (e) {
    console.error('Failed to delete flight', e);
  }
  return updated;
}

// ------------------------------------
// Pre-seeded Initial Routes
// ------------------------------------
const pPer = PTFS_WAYPOINTS.find((w) => w.code === 'PER') || PTFS_WAYPOINTS[0];
const pShv = PTFS_WAYPOINTS.find((w) => w.code === 'SHV') || PTFS_WAYPOINTS[1];
const pIlkl = PTFS_WAYPOINTS.find((w) => w.code === 'ILKL') || PTFS_WAYPOINTS[2];
const pAtalis = PTFS_WAYPOINTS.find((w) => w.code === 'ATALIS') || PTFS_WAYPOINTS[3];
const pHme = PTFS_WAYPOINTS.find((w) => w.code === 'HME') || PTFS_WAYPOINTS[4];
const pRom = PTFS_WAYPOINTS.find((w) => w.code === 'ROM') || PTFS_WAYPOINTS[5];
const pStrax = PTFS_WAYPOINTS.find((w) => w.code === 'STRAX') || PTFS_WAYPOINTS[6];
const pRfd = PTFS_WAYPOINTS.find((w) => w.code === 'RFD') || PTFS_WAYPOINTS[7];
const pMlr = PTFS_WAYPOINTS.find((w) => w.code === 'MLR') || PTFS_WAYPOINTS[8];
const pClr = PTFS_WAYPOINTS.find((w) => w.code === 'CLR') || PTFS_WAYPOINTS[9];
const pIpph = PTFS_WAYPOINTS.find((w) => w.code === 'IPPH') || PTFS_WAYPOINTS[10];

export const INITIAL_ROUTES: SavedRoute[] = [
  {
    id: 'route-perth-express',
    name: 'PTFS: Perth Oceanic Departure',
    flightNumber: 'LH 1042',
    waypoints: [pPer, pShv, pIlkl, pAtalis],
    totalDistanceNm: 245,
    estFlightTimeMin: 48,
    createdAt: '2026-11-09T08:00:00.000Z',
  },
  {
    id: 'route-haneda-perth',
    name: 'PTFS: Haneda to Perth Express',
    flightNumber: 'LH 2210',
    waypoints: [pHme, pRom, pStrax, pPer],
    totalDistanceNm: 310,
    estFlightTimeMin: 56,
    createdAt: '2026-11-09T08:30:00.000Z',
  },
  {
    id: 'route-rockford-clearance',
    name: 'PTFS: Rockford Corridor RNAV',
    flightNumber: 'LH 3054',
    waypoints: [pRfd, pMlr, pClr, pIpph],
    totalDistanceNm: 420,
    estFlightTimeMin: 71,
    createdAt: '2026-11-09T09:00:00.000Z',
  },
];

export function getSavedRoutes(): SavedRoute[] {
  if (typeof window === 'undefined') return INITIAL_ROUTES;
  try {
    const raw = localStorage.getItem(SAVED_ROUTES_KEY);
    if (!raw) {
      localStorage.setItem(SAVED_ROUTES_KEY, JSON.stringify(INITIAL_ROUTES));
      return INITIAL_ROUTES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_ROUTES;
  } catch {
    return INITIAL_ROUTES;
  }
}

export function saveRoute(route: SavedRoute): void {
  const current = getSavedRoutes();
  const updated = [route, ...current.filter((r) => r.id !== route.id)].slice(0, 30);
  try {
    localStorage.setItem(SAVED_ROUTES_KEY, JSON.stringify(updated));
    // If bound to a flight, also sync with flight routes map
    if (route.flightNumber) {
      saveRouteForFlight(route.flightNumber, route);
    }
    window.dispatchEvent(new Event('lh_routes_updated'));
  } catch (e) {
    console.error('Failed to save route', e);
  }
}

export function deleteSavedRoute(id: string): SavedRoute[] {
  const current = getSavedRoutes();
  const updated = current.filter((r) => r.id !== id);
  try {
    localStorage.setItem(SAVED_ROUTES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('lh_routes_updated'));
  } catch (e) {
    console.error('Failed to delete route', e);
  }
  return updated;
}

// ------------------------------------
// Flight-bound Routes (Отдел вылетов)
// ------------------------------------
export function getFlightRoutes(): Record<string, SavedRoute> {
  if (typeof window === 'undefined') {
    return {
      'LH 1042': INITIAL_ROUTES[0],
      'LH 2210': INITIAL_ROUTES[1],
      'LH 3054': INITIAL_ROUTES[2],
    };
  }
  try {
    const raw = localStorage.getItem(FLIGHT_ROUTES_KEY);
    if (!raw) {
      const initialMap: Record<string, SavedRoute> = {
        'LH 1042': INITIAL_ROUTES[0],
        'LH 2210': INITIAL_ROUTES[1],
        'LH 3054': INITIAL_ROUTES[2],
      };
      localStorage.setItem(FLIGHT_ROUTES_KEY, JSON.stringify(initialMap));
      return initialMap;
    }
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveRouteForFlight(flightNumber: string, route: SavedRoute): void {
  const current = getFlightRoutes();
  const updated = {
    ...current,
    [flightNumber]: {
      ...route,
      flightNumber,
      updatedAt: new Date().toISOString(),
    },
  };
  try {
    localStorage.setItem(FLIGHT_ROUTES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('lh_flight_routes_updated'));
  } catch (e) {
    console.error('Failed to save flight route', e);
  }
}

export function getFlightRoute(flightNumber: string): SavedRoute | undefined {
  const routes = getFlightRoutes();
  return routes[flightNumber];
}

// ------------------------------------
// Planner Security Unlock (key-plan)
// ------------------------------------
export function isPlannerUnlocked(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(PLANNER_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setPlannerUnlocked(val: boolean): void {
  try {
    localStorage.setItem(PLANNER_KEY, val ? 'true' : 'false');
    window.dispatchEvent(new Event('lh_planner_auth_changed'));
  } catch (e) {
    console.error('Failed to set planner unlock status', e);
  }
}

// ------------------------------------
// Cookie Policy Acceptance
// ------------------------------------
export function areCookiesAccepted(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(COOKIES_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setCookiesAccepted(val: boolean): void {
  try {
    localStorage.setItem(COOKIES_KEY, val ? 'true' : 'false');
    window.dispatchEvent(new Event('lh_cookies_changed'));
  } catch (e) {
    console.error('Failed to set cookie acceptance', e);
  }
}

// ------------------------------------
// Flight Alert Subscriptions
// ------------------------------------
export const INITIAL_ALERTS: ActiveFlightNotification[] = [
  {
    id: 'notif-1',
    flightNumber: 'LH 1042',
    title: 'Посадка на рейс открыта',
    message: 'Рейс LH 1042 (Франкфурт — Лондон): Посадка пассажиров через выход A14 началась.',
    timestamp: '18:15 МСК',
    type: 'BOARDING',
  },
  {
    id: 'notif-2',
    flightNumber: 'LH 1830',
    title: 'Задержка рейса',
    message: 'Рейс LH 1830 (Мюнхен — Барселона): Задержка вылета до 21:30 МСК в связи с поздним прибытием борта.',
    timestamp: '18:05 МСК',
    type: 'DELAY',
  },
];

export function getAlertSubscriptions(): FlightAlertSubscription[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ALERTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveAlertSubscription(sub: FlightAlertSubscription): void {
  const current = getAlertSubscriptions();
  const updated = [sub, ...current.filter((s) => s.id !== sub.id)];
  try {
    localStorage.setItem(ALERTS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('lh_alerts_updated'));
  } catch (e) {
    console.error('Failed to save alert subscription', e);
  }
}

export function removeAlertSubscription(id: string): void {
  const current = getAlertSubscriptions();
  const updated = current.filter((s) => s.id !== id);
  try {
    localStorage.setItem(ALERTS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('lh_alerts_updated'));
  } catch (e) {
    console.error('Failed to remove alert subscription', e);
  }
}
