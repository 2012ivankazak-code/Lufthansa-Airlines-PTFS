export type RoleId = 'pilot' | 'attendant' | 'ground' | 'dispatcher';

export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface PilotData {
  name: string;
  minutesInPtfs: number;
  referralSource: string;
  flightSkill: number; // 1 - 10
  readyForCheck: 'yes' | 'no';
  telegram: string;
}

export interface AttendantData {
  name: string;
  serviceSkill: number; // 1 - 10
  readyForCheck: 'yes' | 'no';
  telegram: string;
}

export interface GroundData {
  name: string;
  maintenanceKnowledge: string;
  telegram: string;
}

export interface DispatcherData {
  name: string;
  froKnowledge: string;
  telegram: string;
}

export type RoleFormData = PilotData | AttendantData | GroundData | DispatcherData;

export interface Application {
  id: string;
  roleId: RoleId;
  roleTitle: string;
  applicantName: string;
  telegram: string;
  data: RoleFormData;
  status: ApplicationStatus;
  createdAt: string;
  adminNote?: string;
}

export type FlightStatus = 'ON_TIME' | 'BOARDING' | 'DELAYED' | 'DEPARTED';

export interface Flight {
  id: string;
  flightNumber: string;
  originCity: string;
  originIata: string;
  destinationCity: string;
  destinationIata: string;
  departureTime: string;
  arrivalTime: string;
  gate: string;
  aircraft: string;
  status: FlightStatus;
  terminal: string;
}

export type CabinClass = 'ECONOMY' | 'BUSINESS' | 'FIRST';

export interface BoardingPass {
  id: string;
  passengerNickname: string;
  flightNumber: string;
  originCity: string;
  originIata: string;
  destinationCity: string;
  destinationIata: string;
  departureTime: string;
  boardingTime: string;
  gate: string;
  terminal: string;
  seat: string;
  cabinClass: CabinClass;
  ticketNumber: string;
  sequence: string;
  issueDate: string;
}

export interface RouteWaypoint {
  id: string;
  name: string;
  code: string;
  type: 'VOR' | 'NDB' | 'FIX' | 'AIRPORT' | 'VORTAC';
  x: number; // 0..1280 coordinate space
  y: number; // 0..960 coordinate space
  freq?: string;
  elevation?: string;
}

export interface SavedRoute {
  id: string;
  name: string;
  flightNumber?: string; // Optional linked flight in schedule (e.g. LH-1402)
  waypoints: RouteWaypoint[];
  totalDistanceNm: number;
  estFlightTimeMin: number;
  createdAt: string;
  updatedAt?: string;
}

export interface FlightAlertSubscription {
  id: string;
  flightNumber: string;
  passengerNickname: string;
  telegram?: string;
  alertTypes: {
    boarding: boolean;
    delay: boolean;
    gateChange: boolean;
    metar: boolean;
  };
  createdAt: string;
}

export interface ActiveFlightNotification {
  id: string;
  flightNumber: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'BOARDING' | 'DELAY' | 'GATE' | 'WEATHER';
}


