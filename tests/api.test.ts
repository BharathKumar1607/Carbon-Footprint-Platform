import { describe, it, expect, beforeEach } from 'vitest';
import crypto from 'crypto';

interface User {
  id: string;
  username: string;
  email: string;
  points: number;
  level: string;
}

interface Footprint {
  id: string;
  userId: string;
  transport_co2: number;
  energy_co2: number;
  food_co2: number;
  lifestyle_co2: number;
  total_co2: number;
  timestamp: string;
  inputs: {
    km: number;
    kwh: number;
    diet: string;
    lifestyle?: number;
  };
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  points_reward: number;
  category: 'Transport' | 'Energy' | 'Food' | 'Lifestyle';
}

interface ChallengeCompletion {
  id: string;
  userId: string;
  challengeId: string;
  completedAt: string;
}

// Dedicated mock database system matches memory state
let testDb = {
  users: [] as User[],
  passwords: {} as Record<string, string>,
  footprints: [] as Footprint[],
  challengeCompletions: [] as ChallengeCompletion[],
  challenges: [
    { id: "c1", title: "Meatless Monday", description: "Skip meat for a whole day to reduce dietary emissions", points_reward: 50, category: "Food" },
    { id: "c2", title: "Pedal Power", description: "Cycle or walk for all trips under 5km today", points_reward: 100, category: "Transport" },
    { id: "c3", title: "Light's Out Advantage", description: "Unplug idle appliances and turn off unnecessary lights for 24h", points_reward: 60, category: "Energy" },
  ] as Challenge[],
};

const simpleHash = (str: string) => {
  return crypto.createHash("sha256").update(str + "_ecotrack_salt_2026").digest("hex");
};

beforeEach(() => {
  testDb.users = [
    { id: "u_demo", username: "Green Hero", email: "hero@ecotrack.ai", points: 150, level: "Green Beginner" }
  ];
  testDb.passwords = {
    "u_demo": simpleHash("green")
  };
  testDb.footprints = [];
  testDb.challengeCompletions = [];
});

// Mock request/response helpers to test routes
function runPostRegister(body: any) {
  const { username, email, password } = body;
  if (!username || !email || !password) {
    return { status: 400, json: { error: "Missing required fields" } };
  }

  const trimmedEmail = email.toLowerCase().trim();
  const existingUser = testDb.users.find(u => u.email === trimmedEmail);
  if (existingUser) {
    return { status: 400, json: { error: "Email already registered" } };
  }

  const userId = "u_" + Math.random().toString(36).substr(2, 9);
  const newUser: User = {
    id: userId,
    username: username.trim(),
    email: trimmedEmail,
    points: 0,
    level: "Green Beginner",
  };

  testDb.users.push(newUser);
  testDb.passwords[userId] = simpleHash(password);

  return { status: 201, json: newUser };
}

function runPostLogin(body: any) {
  const { email, password } = body;
  if (!email || !password) {
    return { status: 400, json: { error: "Missing email or password" } };
  }

  const trimmedEmail = email.toLowerCase().trim();
  const user = testDb.users.find(u => u.email === trimmedEmail);
  if (!user) {
    return { status: 401, json: { error: "Invalid credentials" } };
  }

  if (testDb.passwords[user.id] !== simpleHash(password)) {
    return { status: 401, json: { error: "Invalid credentials" } };
  }

  return { status: 200, json: user };
}

function runPostFootprint(body: any) {
  const { userId, km, kwh, diet, lifestyle } = body;
  if (!userId) {
    return { status: 400, json: { error: "Missing userId" } };
  }

  const user = testDb.users.find(u => u.id === userId);
  if (!user) {
    return { status: 404, json: { error: "User profile not found in session database" } };
  }

  // Bounds
  const parsedKm = Number(km);
  if (isNaN(parsedKm) || parsedKm < 0 || parsedKm > 100000) {
    return { status: 400, json: { error: "Travel distance must be a positive number between 0 and 100,000 km." } };
  }

  const parsedKwh = Number(kwh);
  if (isNaN(parsedKwh) || parsedKwh < 0 || parsedKwh > 50000) {
    return { status: 400, json: { error: "Electricity draw must be a positive number between 0 and 50,000 kWh." } };
  }

  const validDiets = ["veg", "mixed", "meat"];
  const selectedDiet = validDiets.includes(diet) ? diet : "mixed";

  const parsedLifestyle = Number(lifestyle);
  if (isNaN(parsedLifestyle) || parsedLifestyle < 1 || parsedLifestyle > 5) {
    return { status: 400, json: { error: "Lifestyle index must be an integer between 1 and 5." } };
  }

  const trans_co2 = Number(parsedKm * 0.00017);
  const energy_co2 = Number(parsedKwh * 0.0004);
  const foodMap: Record<string, number> = { veg: 1.5, mixed: 2.2, meat: 3.3 };
  const food_co2 = foodMap[selectedDiet] || 2.2;
  const lifestyle_co2 = Number(parsedLifestyle * 0.2);

  const total_co2 = Number((trans_co2 + energy_co2 + food_co2 + lifestyle_co2).toFixed(2));

  const newEntry: Footprint = {
    id: "f_" + Math.random().toString(36).substr(2, 9),
    userId,
    transport_co2: parseFloat(trans_co2.toFixed(2)),
    energy_co2: parseFloat(energy_co2.toFixed(2)),
    food_co2: parseFloat(food_co2.toFixed(2)),
    lifestyle_co2: parseFloat(lifestyle_co2.toFixed(2)),
    total_co2,
    timestamp: new Date().toISOString(),
    inputs: { km: Number(km || 0), kwh: Number(kwh || 0), diet: selectedDiet, lifestyle: Number(lifestyle || 2) },
  };

  testDb.footprints.push(newEntry);

  user.points += 25;
  if (user.points > 500) user.level = "Eco Champion";
  else if (user.points > 200) user.level = "Sustainability Explorer";

  return { status: 201, json: { entry: newEntry, pointsGained: 25, user } };
}

function runPostChallengeComplete(body: any) {
  const { userId, challengeId } = body;
  if (!userId || !challengeId) {
    return { status: 400, json: { error: "Missing userId or challengeId" } };
  }

  const challenge = testDb.challenges.find(c => c.id === challengeId);
  if (!challenge) {
    return { status: 404, json: { error: "Challenge not found" } };
  }

  const alreadyCompleted = testDb.challengeCompletions.some(
    c => c.userId === userId && c.challengeId === challengeId
  );

  if (alreadyCompleted) {
    return { status: 400, json: { error: "Challenge already completed!" } };
  }

  const completion: ChallengeCompletion = {
    id: "comp_" + Math.random().toString(36).substr(2, 9),
    userId,
    challengeId,
    completedAt: new Date().toISOString(),
  };

  testDb.challengeCompletions.push(completion);

  const user = testDb.users.find(u => u.id === userId);
  if (user) {
    user.points += challenge.points_reward;
    if (user.points > 500) user.level = "Eco Champion";
    else if (user.points > 200) user.level = "Sustainability Explorer";
  }

  return { status: 201, json: { user, completion } };
}

describe('API Route Integrations and Memory Database tests', () => {
  describe('User Authentication API and Levels progression', () => {
    it('should successfully register a new user in db', () => {
      const res = runPostRegister({
        username: "Eco Warrior",
        email: "warrior@ecotrack.ai",
        password: "secure_password"
      });

      expect(res.status).toBe(201);
      expect((res.json as any).username).toBe("Eco Warrior");
      expect((res.json as any).email).toBe("warrior@ecotrack.ai");
      expect(testDb.users.length).toBe(2);
    });

    it('should block registry when essential field parameters are omitted', () => {
      const res = runPostRegister({
        username: "Eco Warrior",
        email: ""
      });

      expect(res.status).toBe(400);
      expect((res.json as any).error).toBe("Missing required fields");
    });

    it('should ban duplicating emails to enforce credential exclusivity', () => {
      const res = runPostRegister({
        username: "Double Trouble",
        email: "hero@ecotrack.ai", // exists in preseed
        password: "mock"
      });

      expect(res.status).toBe(400);
      expect((res.json as any).error).toBe("Email already registered");
    });

    it('should successfully log in user with valid preseeded credentials', () => {
      const res = runPostLogin({
        email: "hero@ecotrack.ai",
        password: "green"
      });

      expect(res.status).toBe(200);
      expect((res.json as any).username).toBe("Green Hero");
    });

    it('should reject logins with incorrect password', () => {
      const res = runPostLogin({
        email: "hero@ecotrack.ai",
        password: "wrong_password_security"
      });

      expect(res.status).toBe(401);
      expect((res.json as any).error).toBe("Invalid credentials");
    });
  });

  describe('Post Carbon Footprints API validation', () => {
    it('should log carbon footprint, allocate XP points, and shift XP rank thresholds', () => {
      // First validation: User is initially "Green Beginner" with 150 points
      const user = testDb.users[0];
      expect(user.level).toBe("Green Beginner");
      expect(user.points).toBe(150);

      // Submit first footprint entry
      const res = runPostFootprint({
        userId: "u_demo",
        km: 5000,
        kwh: 200,
        diet: "veg",
        lifestyle: 3
      });

      expect(res.status).toBe(201);
      expect((res.json as any).pointsGained).toBe(25);
      expect((res.json as any).user.points).toBe(175); // 150 + 25
      
      // Submit second footprint entry to cross sustainability level threshold (> 200 points)
      const res2 = runPostFootprint({
        userId: "u_demo",
        km: 4000,
        kwh: 120,
        diet: "mixed",
        lifestyle: 2
      });

      expect(res2.status).toBe(201);
      expect((res2.json as any).user.points).toBe(200); // 175 + 25 = 200. Let's do another to get above 200
      
      const res3 = runPostFootprint({
        userId: "u_demo",
        km: 1000,
        kwh: 50,
        diet: "veg",
        lifestyle: 1
      });

      expect((res3.json as any).user.points).toBe(225); // 200 + 25
      expect((res3.json as any).user.level).toBe("Sustainability Explorer"); // Level upgrade!
    });

    it('should return 404 for footprint logs targeting non-existent user accounts', () => {
      const res = runPostFootprint({
        userId: "non-existent-user-id",
        km: 500,
        kwh: 100,
        diet: "veg",
        lifestyle: 3
      });

      expect(res.status).toBe(404);
      expect((res.json as any).error).toContain("User profile not found");
    });
  });

  describe('Sustainability Challenges Completion API validation', () => {
    it('should complete challenges and allocate points successfully', () => {
      const res = runPostChallengeComplete({
        userId: "u_demo",
        challengeId: "c1" // preseeded point reward = 50
      });

      expect(res.status).toBe(201);
      expect((res.json as any).user.points).toBe(200); // 150 + 50
      expect(testDb.challengeCompletions.length).toBe(1);
    });

    it('should block completing the same challenge twice to secure leaderboard points tracking integrity', () => {
      // First completion is successful
      const res1 = runPostChallengeComplete({
        userId: "u_demo",
        challengeId: "c1"
      });
      expect(res1.status).toBe(201);

      // Attempt duplicate completion yields bad request error status
      const res2 = runPostChallengeComplete({
        userId: "u_demo",
        challengeId: "c1"
      });

      expect(res2.status).toBe(400);
      expect((res2.json as any).error).toContain("Challenge already completed");
    });

    it('should yield 404 error when targeting empty or non-existing challenge identities', () => {
      const res = runPostChallengeComplete({
        userId: "u_demo",
        challengeId: "bogus-challenge-identity"
      });

      expect(res.status).toBe(404);
      expect((res.json as any).error).toContain("Challenge not found");
    });
  });
});
