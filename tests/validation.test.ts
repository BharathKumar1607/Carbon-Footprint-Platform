import { describe, it, expect } from 'vitest';
import { validateInputs } from '../server';

describe('Forms & Payload Validation Engine tests', () => {
  it('should accept valid standard inputs', () => {
    const check = validateInputs({
      userId: 'u_user',
      km: 3000,
      kwh: 350,
      diet: 'mixed',
      lifestyle: 3
    });

    expect(check.valid).toBe(true);
    expect(check.error).toBeUndefined();
  });

  it('should invalidate missing userId', () => {
    const check = validateInputs({
      km: 3000,
      kwh: 350,
      diet: 'mixed',
      lifestyle: 3
    });

    expect(check.valid).toBe(false);
    expect(check.error).toContain("Missing userId");
  });

  it('should invalidate negative travel distances', () => {
    const check = validateInputs({
      userId: 'u_user',
      km: -250,
      kwh: 350,
      diet: 'mixed',
      lifestyle: 3
    });

    expect(check.valid).toBe(false);
    expect(check.error).toContain("Travel distance must be a positive number");
  });

  it('should invalidate blank travel input strings', () => {
    const check = validateInputs({
      userId: 'u_user',
      km: "",
      kwh: 350,
      diet: 'mixed',
      lifestyle: 3
    });

    expect(check.valid).toBe(false);
    expect(check.error).toContain("Travel distance must be a positive number");
  });

  it('should invalidate extremely high travel overflows', () => {
    const check = validateInputs({
      userId: 'u_user',
      km: 9999999, // exceeds 100,000
      kwh: 350,
      diet: 'mixed',
      lifestyle: 3
    });

    expect(check.valid).toBe(false);
    expect(check.error).toContain("Travel distance must be a positive number");
  });

  it('should invalidate negative electricity drawing values', () => {
    const check = validateInputs({
      userId: 'u_user',
      km: 1500,
      kwh: -5,
      diet: 'mixed',
      lifestyle: 3
    });

    expect(check.valid).toBe(false);
    expect(check.error).toContain("Electricity draw must be a positive number");
  });

  it('should invalidate extremely high electricity drawing value overflows', () => {
    const check = validateInputs({
      userId: 'u_user',
      km: 1500,
      kwh: 999999, // exceeds 50,000
      diet: 'mixed',
      lifestyle: 3
    });

    expect(check.valid).toBe(false);
    expect(check.error).toContain("Electricity draw must be a positive number");
  });

  it('should invalidate float/non-integer style lifestyle scores outer boundaries', () => {
    const check = validateInputs({
      userId: 'u_user',
      km: 1200,
      kwh: 300,
      diet: 'veg',
      lifestyle: 6 // exceeds 5
    });

    expect(check.valid).toBe(false);
    expect(check.error).toContain("Lifestyle index must be an integer");
  });

  it('should invalidate lifestyle scores below 1', () => {
    const check = validateInputs({
      userId: 'u_user',
      km: 1200,
      kwh: 300,
      diet: 'veg',
      lifestyle: 0 // below 1
    });

    expect(check.valid).toBe(false);
    expect(check.error).toContain("Lifestyle index must be an integer");
  });

  it('should defend against non-numeric payloads gracefully', () => {
    const check = validateInputs({
      userId: 'u_user',
      km: "thousand_km",
      kwh: 200,
      diet: 'mixed',
      lifestyle: 3
    });

    expect(check.valid).toBe(false);
    expect(check.error).toContain("Travel distance must be a positive number");
  });

  it('should fallback to mixed diet if diet is omitted or undefined', () => {
    const check = validateInputs({
      userId: 'u_user',
      km: 1200,
      kwh: 200,
      lifestyle: 3
    });

    expect(check.valid).toBe(true);
    expect(check.data?.diet).toBe('mixed');
  });
});
