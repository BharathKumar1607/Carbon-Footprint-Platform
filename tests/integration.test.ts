import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app, db } from '../server';

describe('EcoTrack AI Complete Integration & E2E API Test Suite', () => {
  // We use a random suffix for emails to avoid collisions across test runs
  const testEmail = `dev.qa.${Math.random().toString(36).substring(7)}@ecotrack.ai`;
  let createdUserId: string;
  let sampleGoalId: string;

  describe('Authentication Endpoints', () => {
    it('should prevent registration when fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'QA Tester' }); // Missing email and password
      
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Missing required fields');
    });

    it('should successfully register a new eco user profile', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'QA Tester',
          email: testEmail,
          password: 'secure_password_123'
        });

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.username).toBe('QA Tester');
      expect(res.body.points).toBe(0);
      createdUserId = res.body.id;
    });

    it('should prevent duplicate email registration', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'QA Clone',
          email: testEmail,
          password: 'another_password'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Email already registered');
    });

    it('should validate logins and reject incorrect criteria', async () => {
      // 1. Missing fields
      let res = await request(app)
        .post('/api/auth/login')
        .send({ email: testEmail });
      expect(res.status).toBe(400);

      // 2. Unregistered email
      res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'fake@wrong.org', password: 'some_password' });
      expect(res.status).toBe(401);

      // 3. Incorrect password
      res = await request(app)
        .post('/api/auth/login')
        .send({ email: testEmail, password: 'wrong_password' });
      expect(res.status).toBe(401);
    });

    it('should successfully authenticate user with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: 'secure_password_123'
        });

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(createdUserId);
      expect(res.body.username).toBe('QA Tester');
    });
  });

  describe('Carbon Footprint Management & Calculator API', () => {
    it('should retrieve historical footprints for a user', async () => {
      const res = await request(app)
        .get(`/api/footprints?userId=${createdUserId}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1); // 1 preseeded footprint for visual consistency is created on register
    });

    it('should validate incoming request parameters for footprints logging', async () => {
      // 1. Missing userId
      let res = await request(app).post('/api/footprints').send({ km: 50 });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Missing userId');

      // 2. Non-existent userId
      res = await request(app).post('/api/footprints').send({ userId: 'u_ghost', km: 20, kwh: 10, diet: 'veg', lifestyle: 3 });
      expect(res.status).toBe(404);

      // 3. Invalid travel (negative distance)
      res = await request(app).post('/api/footprints').send({ userId: createdUserId, km: -100, kwh: 10, diet: 'veg', lifestyle: 3 });
      expect(res.status).toBe(400);

      // 4. Invalid electricity draw (non-numeric overflow)
      res = await request(app).post('/api/footprints').send({ userId: createdUserId, km: 50, kwh: 9999999, diet: 'veg', lifestyle: 3 });
      expect(res.status).toBe(400);

      // 5. Invalid lifestyle spectrum bounds
      res = await request(app).post('/api/footprints').send({ userId: createdUserId, km: 50, kwh: 100, diet: 'mixed', lifestyle: 10 });
      expect(res.status).toBe(400);
    });

    it('should log carbon footprint, assign points, and recalculate tiers', async () => {
      const res = await request(app)
        .post('/api/footprints')
        .send({
          userId: createdUserId,
          km: 1200,      // 1200 * 0.00017 = 0.204
          kwh: 350,      // 350 * 0.0004  = 0.14
          diet: 'veg',   // veg diet = 1.5
          lifestyle: 2   // 2 * 0.2       = 0.4
                         // Total expected = 2.24
        });

      expect(res.status).toBe(201);
      expect(res.body.entry).toBeDefined();
      expect(res.body.entry.total_co2).toBe(2.24);
      expect(res.body.entry.transport_co2).toBe(0.2);
      expect(res.body.entry.energy_co2).toBe(0.14);
      expect(res.body.entry.food_co2).toBe(1.5);
      expect(res.body.entry.lifestyle_co2).toBe(0.4);
      expect(res.body.pointsGained).toBe(25);
      expect(res.body.user.points).toBe(25);
    });

    it('should list computed footprints sorted by timestamp', async () => {
      // Create a second entry
      await request(app)
        .post('/api/footprints')
        .send({
          userId: createdUserId,
          km: 4000,
          kwh: 800,
          diet: 'meat',
          lifestyle: 4
        });

      const res = await request(app).get(`/api/footprints?userId=${createdUserId}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(3); // 1 preseeded + 2 newly added
      expect(res.body[2].total_co2).toBeGreaterThan(res.body[1].total_co2); // second logged entry with higher CO2
    });
  });

  describe('Gamification & Sustainability Challenges API', () => {
    it('should fetch standard onboarding environmental challenges', async () => {
      const res = await request(app).get(`/api/challenges?userId=${createdUserId}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('completed');
      expect(res.body[0].completed).toBe(false);
    });

    it('should validate challenge completion parameters', async () => {
      let res = await request(app).post('/api/challenges/complete').send({ userId: createdUserId });
      expect(res.status).toBe(400);

      res = await request(app).post('/api/challenges/complete').send({ userId: createdUserId, challengeId: 'c_ghost' });
      expect(res.status).toBe(404);
    });

    it('should successfully complete an active challenge, earn points, and enforce single-clearing rule', async () => {
      // Fetch available challenge ID
      const listRes = await request(app).get(`/api/challenges?userId=${createdUserId}`);
      const challengeToComplete = listRes.body[0];

      // 1. Complete it
      let res = await request(app)
        .post('/api/challenges/complete')
        .send({
          userId: createdUserId,
          challengeId: challengeToComplete.id
        });

      expect(res.status).toBe(201); // Server returns 201 Created on completion
      expect(res.body.completion).toBeDefined();
      expect(res.body.completion.challengeId).toBe(challengeToComplete.id);
      expect(res.body.user.points).toBeGreaterThan(50); // logged footprint points + challenge reward

      // 2. Attempt double completion
      res = await request(app)
        .post('/api/challenges/complete')
        .send({
          userId: createdUserId,
          challengeId: challengeToComplete.id
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('already completed');

      // 3. Verify status mapping with completed challenges
      const postListRes = await request(app).get(`/api/challenges?userId=${createdUserId}`);
      expect(postListRes.status).toBe(200);
      const updatedChallenge = postListRes.body.find((t: any) => t.id === challengeToComplete.id);
      expect(updatedChallenge.completed).toBe(true);
    });

    it('should correctly tier up user levels upon point increases', async () => {
      const tierEmail = `tier.${Math.random().toString(36).substring(7)}@ecotrack.ai`;
      const regRes = await request(app)
        .post('/api/auth/register')
        .send({ username: 'Tier User', email: tierEmail, password: 'password' });

      const userId = regRes.body.id;
      const dbUser = db.users.find(u => u.id === userId)!;

      // 1. Set points to 190, complete challenge -> should tier up to Sustainability Explorer (>200)
      dbUser.points = 190;
      let res = await request(app)
        .post('/api/challenges/complete')
        .send({ userId, challengeId: 'c1' });
      
      expect(res.status).toBe(201);
      expect(res.body.user.level).toBe('Sustainability Explorer');

      // 2. Set points to 490, complete challenge -> should tier up to Eco Champion (>500)
      dbUser.points = 490;
      res = await request(app)
        .post('/api/challenges/complete')
        .send({ userId, challengeId: 'c2' });

      expect(res.status).toBe(201);
      expect(res.body.user.level).toBe('Eco Champion');
    });
  });

  describe('Goals Planning & Milestones API', () => {
    it('should return empty list when no milestones exist for the user', async () => {
      const res = await request(app).get(`/api/goals?userId=${createdUserId}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(0);
    });

    it('should decline writing goals with missing fields', async () => {
      const res = await request(app)
        .post('/api/goals')
        .send({ userId: createdUserId, targetValue: 3.5 }); // missing category and targetDate
      expect(res.status).toBe(400);
    });

    it('should successfully schedule and list a sustainability target goal across all categories', async () => {
      const categories = ['Transport', 'Energy', 'Food', 'Lifestyle', 'Overall'];
      const goalIds: string[] = [];

      for (const cat of categories) {
        const res = await request(app)
          .post('/api/goals')
          .send({
            userId: createdUserId,
            category: cat,
            targetValue: cat === 'Overall' ? 10.0 : 2.0,
            targetDate: '2026-12-31'
          });

        expect(res.status).toBe(201);
        expect(res.body.id).toBeDefined();
        expect(res.body.category).toBe(cat);
        goalIds.push(res.body.id);
      }

      sampleGoalId = goalIds[0];

      // Assert lists match and contain all categories with updated status values
      const listRes = await request(app).get(`/api/goals?userId=${createdUserId}`);
      expect(listRes.status).toBe(200);
      expect(listRes.body.length).toBeGreaterThanOrEqual(categories.length);

      // Verify categories are represented in the fetched list
      const retrievedCats = listRes.body.map((g: any) => g.category);
      for (const cat of categories) {
        expect(retrievedCats).toContain(cat);
      }
    });

    it('should delete a customized goal cleanly', async () => {
      const delRes = await request(app).delete(`/api/goals/${sampleGoalId}`);
      expect(delRes.status).toBe(200);
      expect(delRes.body.success).toBe(true);

      const listRes = await request(app).get(`/api/goals?userId=${createdUserId}`);
      expect(listRes.body).toHaveLength(4);
    });
  });

  describe('Advanced heuristic & fallback AI engine pathways', () => {
    it('should generate curated expert tips and serve from cache on second call', async () => {
      // Clear cache from previous runs if any by using a random fresh user
      const cacheUserEmail = `cache.${Math.random().toString(36).substring(7)}@ecotrack.ai`;
      const regRes = await request(app)
        .post('/api/auth/register')
        .send({ username: 'Cache User', email: cacheUserEmail, password: 'password' });
      const userId = regRes.body.id;

      // First call (populates cache)
      const res1 = await request(app)
        .post('/api/ai/tips')
        .send({ userId });

      expect(res1.status).toBe(200);
      expect(res1.body.tips).toBeDefined();

      // Second call (serves from cache)
      const res2 = await request(app)
        .post('/api/ai/tips')
        .send({ userId });

      expect(res2.status).toBe(200);
      expect(res2.body.modelUsed).toContain('Cached');
    });

    it('should decline generating tips when userId is missing', async () => {
      const res = await request(app)
        .post('/api/ai/tips')
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Missing userId');
    });

    it('should generate custom tailored tips when user has high transport/energy footprint', async () => {
      const heavyEmail = `heavy.${Math.random().toString(36).substring(7)}@ecotrack.ai`;
      const regRes = await request(app)
        .post('/api/auth/register')
        .send({ username: 'Heavy User', email: heavyEmail, password: 'password' });
      
      const userId = regRes.body.id;

      // Log highly emission-heavy footprint: km = 15000, kwh = 5000
      await request(app)
        .post('/api/footprints')
        .send({
          userId,
          km: 15000,
          kwh: 5000,
          diet: 'meat',
          lifestyle: 4
        });

      const res = await request(app)
        .post('/api/ai/tips')
        .send({ userId });

      expect(res.status).toBe(200);
      expect(res.body.tips).toBeDefined();
      expect(res.body.tips[0].text).toContain('premium');
      expect(res.body.tips[1].text).toContain('energy emissions');
    });

    it('should process user conversational chats cleanly across different advice categories', async () => {
      // 1. Driving/travel keyword advice query
      let res = await request(app)
        .post('/api/ai/chat')
        .send({ userId: createdUserId, message: 'How to reduce driving emissions?' });
      expect(res.status).toBe(200);
      expect(res.body.response).toContain('bicycle');

      // 2. Electricity/energy/kwh keyword advice query
      res = await request(app)
        .post('/api/ai/chat')
        .send({ userId: createdUserId, message: 'My electricity draw is huge!' });
      expect(res.status).toBe(200);
      expect(res.body.response).toContain('standby');

      // 3. Diet/food/eating keyword advice query
      res = await request(app)
        .post('/api/ai/chat')
        .send({ userId: createdUserId, message: 'Tell me about diet impact' });
      expect(res.status).toBe(200);
      expect(res.body.response).toContain('chickpea');

      // 4. Default generic greeting/motivation query
      res = await request(app)
        .post('/api/ai/chat')
        .send({ userId: createdUserId, message: 'Give me some motivative words' });
      expect(res.status).toBe(200);
      expect(res.body.response).toContain('counts');

      // 5. Scientist persona - Travel
      res = await request(app)
        .post('/api/ai/chat')
        .send({ userId: createdUserId, message: 'Analyze travel carbon', persona: 'scientist' });
      expect(res.status).toBe(200);
      expect(res.body.response).toContain('Vance');

      // 6. Scientist persona - Diet
      res = await request(app)
        .post('/api/ai/chat')
        .send({ userId: createdUserId, message: 'Give food indicators', persona: 'scientist' });
      expect(res.status).toBe(200);
      expect(res.body.response).toContain('Vance');

      // 7. Scientist persona - Electricity
      res = await request(app)
        .post('/api/ai/chat')
        .send({ userId: createdUserId, message: 'Standard electricity weights', persona: 'scientist' });
      expect(res.status).toBe(200);
      expect(res.body.response).toContain('Vance');

      // 8. Scientist persona - Generic
      res = await request(app)
        .post('/api/ai/chat')
        .send({ userId: createdUserId, message: 'Explain ppm particles', persona: 'scientist' });
      expect(res.status).toBe(200);
      expect(res.body.response).toContain('Vance');

      // 9. Minimalist persona - Travel
      res = await request(app)
        .post('/api/ai/chat')
        .send({ userId: createdUserId, message: ' mindful travel tips', persona: 'minimalist' });
      expect(res.status).toBe(200);
      expect(res.body.response).toContain('Sera');

      // 10. Minimalist persona - Diet
      res = await request(app)
        .post('/api/ai/chat')
        .send({ userId: createdUserId, message: ' mindful diet options', persona: 'minimalist' });
      expect(res.status).toBe(200);
      expect(res.body.response).toContain('Sera');

      // 11. Minimalist persona - Electricity
      res = await request(app)
        .post('/api/ai/chat')
        .send({ userId: createdUserId, message: ' household electricity uses', persona: 'minimalist' });
      expect(res.status).toBe(200);
      expect(res.body.response).toContain('Sera');

      // 12. Minimalist persona - Generic
      res = await request(app)
        .post('/api/ai/chat')
        .send({ userId: createdUserId, message: ' generic minimalists words', persona: 'minimalist' });
      expect(res.status).toBe(200);
      expect(res.body.response).toContain('Sera');
      expect(res.body.response).toContain('Simplicity');
    });

    it('should build detailed sustainability audits and reporting sheets', async () => {
      const res = await request(app)
        .post('/api/ai/report')
        .send({ userId: createdUserId });

      expect(res.status).toBe(200);
      expect(res.body.report).toBeDefined();
    });

    it('should output dynamic seasonal co2 forecasting models', async () => {
      const res = await request(app)
        .post('/api/ai/forecast')
        .send({ userId: createdUserId });

      expect(res.status).toBe(200);
      expect(res.body.historical).toBeDefined();
      expect(res.body.forecast).toBeDefined();
      expect(res.body.commentary).toBeDefined();
    });

    it('should return 404 when attempting to delete a non-existent goal', async () => {
      const res = await request(app).delete('/api/goals/goal_ghost');
      expect(res.status).toBe(404);
      expect(res.body.error).toContain('Goal not found');
    });

    it('should return a placeholder prompt when requesting forecast before any footprint is logged', async () => {
      const freshEmail = `fresh.${Math.random().toString(36).substring(7)}@ecotrack.ai`;
      const regRes = await request(app)
        .post('/api/auth/register')
        .send({ username: 'Fresh User', email: freshEmail, password: 'password' });
      
      const freshUserId = regRes.body.id;
      
      // Manually remove pre-seeded footprints for this user
      const userFoots = db.footprints.filter(f => f.userId === freshUserId);
      userFoots.forEach(f => {
        const idx = db.footprints.indexOf(f);
        if (idx !== -1) db.footprints.splice(idx, 1);
      });

      const res = await request(app)
        .post('/api/ai/forecast')
        .send({ userId: freshUserId });

      expect(res.status).toBe(200);
      expect(res.body.historical).toHaveLength(0);
      expect(res.body.commentary).toContain('Record your first footprints');
    });

    it('should generate stable commentary when carbon trends remain unchanged', async () => {
      const stableEmail = `stable.${Math.random().toString(36).substring(7)}@ecotrack.ai`;
      const regRes = await request(app)
        .post('/api/auth/register')
        .send({ username: 'Stable User', email: stableEmail, password: 'password' });
      
      const userId = regRes.body.id;
      
      // Clear pre-seeded
      const preseededIdx = db.footprints.findIndex(f => f.userId === userId && f.id === 'f_init');
      if (preseededIdx !== -1) db.footprints.splice(preseededIdx, 1);

      db.footprints.push({
        id: 'st1',
        userId,
        transport_co2: 1.0,
        energy_co2: 1.0,
        food_co2: 1.0,
        lifestyle_co2: 0.5,
        total_co2: 3.5,
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        inputs: { km: 1000, kwh: 100, diet: 'veg', lifestyle: 1 }
      });

      db.footprints.push({
        id: 'st2',
        userId,
        transport_co2: 1.0,
        energy_co2: 1.0,
        food_co2: 1.0,
        lifestyle_co2: 0.5,
        total_co2: 3.5, // exactly identical, slope is 0
        timestamp: new Date().toISOString(),
        inputs: { km: 1000, kwh: 100, diet: 'veg', lifestyle: 1 }
      });

      const res = await request(app)
        .post('/api/ai/forecast')
        .send({ userId });

      expect(res.status).toBe(200);
      expect(res.body.commentary).toContain('holding stable');
    });

    it('should generate warning commentary when carbon trends increase', async () => {
      const risingEmail = `rising.${Math.random().toString(36).substring(7)}@ecotrack.ai`;
      const regRes = await request(app)
        .post('/api/auth/register')
        .send({ username: 'Rising User', email: risingEmail, password: 'password' });
      
      const userId = regRes.body.id;
      
      // Clear pre-seeded
      const preseededIdx = db.footprints.findIndex(f => f.userId === userId && f.id === 'f_init');
      if (preseededIdx !== -1) db.footprints.splice(preseededIdx, 1);

      db.footprints.push({
        id: 'rs1',
        userId,
        transport_co2: 1.0,
        energy_co2: 1.0,
        food_co2: 1.5,
        lifestyle_co2: 0.5,
        total_co2: 4.0,
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        inputs: { km: 1000, kwh: 100, diet: 'veg', lifestyle: 1 }
      });

      db.footprints.push({
        id: 'rs2',
        userId,
        transport_co2: 4.0,
        energy_co2: 4.0,
        food_co2: 3.3,
        lifestyle_co2: 1.0,
        total_co2: 12.3, // trend going up
        timestamp: new Date().toISOString(),
        inputs: { km: 10000, kwh: 1000, diet: 'meat', lifestyle: 5 }
      });

      const res = await request(app)
        .post('/api/ai/forecast')
        .send({ userId });

      expect(res.status).toBe(200);
      expect(res.body.commentary).toContain('upward trajectory');
    });

    it('should handle slight upward trends when carbon slope is within boundary bounds (<= 1.0)', async () => {
      const slightEmail = `slight.${Math.random().toString(36).substring(7)}@ecotrack.ai`;
      const regRes = await request(app)
        .post('/api/auth/register')
        .send({ username: 'Slight User', email: slightEmail, password: 'password' });
      
      const userId = regRes.body.id;
      
      // Clear pre-seeded
      const preseededIdx = db.footprints.findIndex(f => f.userId === userId && f.id === 'f_init');
      if (preseededIdx !== -1) db.footprints.splice(preseededIdx, 1);

      db.footprints.push({
        id: 'sl1',
        userId,
        transport_co2: 1.0,
        energy_co2: 1.0,
        food_co2: 1.5,
        lifestyle_co2: 0.5,
        total_co2: 4.0,
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        inputs: { km: 1000, kwh: 100, diet: 'veg', lifestyle: 1 }
      });

      db.footprints.push({
        id: 'sl2',
        userId,
        transport_co2: 1.2,
        energy_co2: 1.1,
        food_co2: 1.5,
        lifestyle_co2: 0.7,
        total_co2: 4.5, // diff = 0.5 (normal rise slope)
        timestamp: new Date().toISOString(),
        inputs: { km: 1100, kwh: 110, diet: 'veg', lifestyle: 2 }
      });

      const res = await request(app)
        .post('/api/ai/forecast')
        .send({ userId });

      expect(res.status).toBe(200);
      expect(res.body.commentary).toContain('upward trajectory');
    });

    it('should generate declining commentary and handle extreme slope bounds when carbon trends decrease', async () => {
      const decliningEmail = `declining.${Math.random().toString(36).substring(7)}@ecotrack.ai`;
      const regRes = await request(app)
        .post('/api/auth/register')
        .send({ username: 'Declining User', email: decliningEmail, password: 'password' });
      
      const userId = regRes.body.id;
      
      // Clear pre-seeded
      const preseededIdx = db.footprints.findIndex(f => f.userId === userId && f.id === 'f_init');
      if (preseededIdx !== -1) db.footprints.splice(preseededIdx, 1);

      db.footprints.push({
        id: 'dc1',
        userId,
        transport_co2: 12.0,
        energy_co2: 10.0,
        food_co2: 3.3,
        lifestyle_co2: 1.0,
        total_co2: 26.3, // very high initial footprint
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        inputs: { km: 100000, kwh: 10000, diet: 'meat', lifestyle: 5 }
      });

      db.footprints.push({
        id: 'dc2',
        userId,
        transport_co2: 0.1,
        energy_co2: 0.1,
        food_co2: 1.5,
        lifestyle_co2: 0.2,
        total_co2: 1.9, // extreme drop
        timestamp: new Date().toISOString(),
        inputs: { km: 10, kwh: 10, diet: 'veg', lifestyle: 1 }
      });

      const res = await request(app)
        .post('/api/ai/forecast')
        .send({ userId });

      expect(res.status).toBe(200);
      expect(res.body.commentary).toContain('projected to decline');
    });

    it('should calculate default slope when user has exactly one footprint logged', async () => {
      const oneEmail = `one.${Math.random().toString(36).substring(7)}@ecotrack.ai`;
      const regRes = await request(app)
        .post('/api/auth/register')
        .send({ username: 'One Footprint User', email: oneEmail, password: 'password' });
      
      const userId = regRes.body.id;

      // Note: registration pre-seeds exactly 1 footprint, so we have exactly fList.length === 1
      const res = await request(app)
        .post('/api/ai/forecast')
        .send({ userId });

      expect(res.status).toBe(200);
      expect(res.body.forecast).toHaveLength(4); // 4 forecasting periods
      expect(res.body.commentary).toContain('projected to decline'); // because slope defaults to -0.05 (decline)
    });

    it('should cover additional missing fields and edge cases for high branch coverage', async () => {
      // 1. GET /api/footprints with missing userId
      let res = await request(app).get('/api/footprints');
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Missing userId');

      // 2. GET /api/challenges with missing userId
      res = await request(app).get('/api/challenges');
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);

      // 3. POST /api/challenges/complete with missing userId
      res = await request(app).post('/api/challenges/complete').send({ challengeId: 'c1' });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Missing userId');

      // 4. PATCH /api/users/:userId/points with non-existent user
      res = await request(app).patch('/api/users/not_existing_user/points').send({ points: 100 });
      expect(res.status).toBe(404);

      // 5. PATCH /api/users/:userId/points with invalid type
      res = await request(app).patch(`/api/users/${createdUserId}/points`).send({ points: 'not_a_number' });
      expect(res.status).toBe(200);

      // 6. PATCH /api/users/:userId/points setting to Green Beginner
      res = await request(app).patch(`/api/users/${createdUserId}/points`).send({ points: 50 });
      expect(res.status).toBe(200);
      expect(res.body.level).toBe('Green Beginner');

      // 6a. PATCH /api/users/:userId/points setting to Sustainability Explorer
      res = await request(app).patch(`/api/users/${createdUserId}/points`).send({ points: 250 });
      expect(res.status).toBe(200);
      expect(res.body.level).toBe('Sustainability Explorer');

      // 6b. PATCH /api/users/:userId/points setting to Eco Champion
      res = await request(app).patch(`/api/users/${createdUserId}/points`).send({ points: 600 });
      expect(res.status).toBe(200);
      expect(res.body.level).toBe('Eco Champion');

      // 6c. POST /api/footprints that lands points in Sustainability Explorer (>200)
      const specialUserEmail = `special.${Math.random().toString(36).substring(7)}@ecotrack.ai`;
      const sRegRes = await request(app)
        .post('/api/auth/register')
        .send({ username: 'Special User', email: specialUserEmail, password: 'password' });
      const specialUserId = sRegRes.body.id;
      // Seed details
      const specialUserInDb = db.users.find(u => u.id === specialUserId)!;
      specialUserInDb.points = 190;
      // Complete footprint
      res = await request(app)
        .post('/api/footprints')
        .send({
          userId: specialUserId,
          km: 10,
          kwh: 10,
          diet: 'veg',
          lifestyle: 1
        });
      expect(res.status).toBe(201);
      expect(res.body.user.level).toBe('Sustainability Explorer');

      // 7. POST /api/ai/chat with missing userId or message
      res = await request(app).post('/api/ai/chat').send({ message: 'hello' });
      expect(res.status).toBe(400);

      // 8. GET /api/goals with missing userId
      res = await request(app).get('/api/goals');
      expect(res.status).toBe(400);

      // 9. POST /api/ai/report with missing userId
      res = await request(app).post('/api/ai/report').send({});
      expect(res.status).toBe(400);

      // 10. POST /api/ai/forecast with missing userId
      res = await request(app).post('/api/ai/forecast').send({});
      expect(res.status).toBe(400);
    });
  });
});
