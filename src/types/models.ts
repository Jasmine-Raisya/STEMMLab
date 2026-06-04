export type ActivityId =
  | 'parachute'
  | 'sound'
  | 'handFan'
  | 'earthquake'
  | 'humanPerformance'
  | 'reaction'
  | 'breathing';

export interface TeamProfile {
  id: string;
  authUid?: string;
  representativeEmail: string;
  teamName: string;
  members: string[];
  gradeLevel: string;
  createdAt: number;
}

export interface SensorSample {
  id?: number;
  activityId: ActivityId;
  metric: string;
  value: number;
  x?: number;
  y?: number;
  z?: number;
  latitude?: number;
  longitude?: number;
  timestamp: number;
  synced?: boolean;
}

export interface ActivityReflection {
  id?: number;
  activityId: ActivityId;
  teamId: string;
  rating: number;
  answers: Record<string, string>;
  timestamp: number;
  synced?: boolean;
}

export interface ActivityLog {
  id?: number;
  activityId: ActivityId;
  teamId: string;
  payload: Record<string, unknown>;
  timestamp: number;
  synced?: boolean;
}

export interface ExperimentRecord {
  id: string;
  teamId: string;
  activityId: ActivityId;
  score: number;
  timestamp: number;
  authUid?: string;
  representativeEmail?: string;
  teamName?: string;
  details?: Record<string, unknown>;
}

export interface LeaderboardEntry {
  teamId: string;
  teamName: string;
  activityId: ActivityId;
  score: number;
  timestamp: number;
}
