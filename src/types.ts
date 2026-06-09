export interface User {
  id: string;
  username: string;
  email: string;
  points: number;
  level: string;
}

export interface Footprint {
  id: string;
  userId: string;
  transport_co2: number;
  energy_co2: number;
  food_co2: number;
  lifestyle_co2: number;
  total_co2: number;
  timestamp: string; // ISO date
  inputs: {
    km: number;
    kwh: number;
    diet: string;
    lifestyle?: number;
  };
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  points_reward: number;
  category: 'Transport' | 'Energy' | 'Food' | 'Lifestyle';
}

export interface ChallengeCompletion {
  id: string;
  userId: string;
  challengeId: string;
  completedAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  category: 'Transport' | 'Energy' | 'Food' | 'Lifestyle' | 'Overall';
  targetValue: number;
  currentValue: number;
  deadline: string;
  completed: boolean;
}
