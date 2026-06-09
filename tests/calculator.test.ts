import { describe, it, expect } from 'vitest';
import { calculateCarbon } from '../server';

describe('Carbon Calculator Engine tests', () => {
  it('should correctly calculate expected footprint for an average mixed dietary consumer', () => {
    // Average values: 3000km travel, 350kWh electricity, mixed diet, lifestyle tier 3
    const result = calculateCarbon({
      km: 3000,
      kwh: 350,
      diet: 'mixed',
      lifestyle: 3
    });

    expect(result.transport_co2).toBe(0.51); // 3000 * 0.00017 = 0.51
    expect(result.energy_co2).toBe(0.14);   // 350 * 0.0004 = 0.14
    expect(result.food_co2).toBe(2.20);     // mixed diet = 2.2
    expect(result.lifestyle_co2).toBe(0.60); // 3 * 0.2 = 0.6
    expect(result.total_co2).toBe(3.45);     // 0.51 + 0.14 + 2.2 + 0.6 = 3.45
  });

  it('should properly calibrate a vegan low-consumption footprint', () => {
    const result = calculateCarbon({
      km: 0,
      kwh: 0,
      diet: 'veg',
      lifestyle: 1
    });

    expect(result.transport_co2).toBe(0);
    expect(result.energy_co2).toBe(0);
    expect(result.food_co2).toBe(1.5);
    expect(result.lifestyle_co2).toBe(0.2);
    expect(result.total_co2).toBe(1.7); // 0 + 0 + 1.5 + 0.2 = 1.7
  });

  it('should handle heavy consumers with meat lifestyle tier 5', () => {
    const result = calculateCarbon({
      km: 12000,
      kwh: 1500,
      diet: 'meat',
      lifestyle: 5
    });

    expect(result.transport_co2).toBe(2.04); // 12000 * 0.00017
    expect(result.energy_co2).toBe(0.6);   // 1500 * 0.0004
    expect(result.food_co2).toBe(3.3);     // meat = 3.3
    expect(result.lifestyle_co2).toBe(1);   // 5 * 0.2
    expect(result.total_co2).toBe(6.94);   // 2.04 + 0.6 + 3.3 + 1 = 6.94
  });

  it('should default invalid diet strings to mixed diet profile factor', () => {
    const result = calculateCarbon({
      km: 1000,
      kwh: 100,
      diet: 'invalid-diet-string',
      lifestyle: 2
    });

    expect(result.food_co2).toBe(2.2); // fallback
  });
});
