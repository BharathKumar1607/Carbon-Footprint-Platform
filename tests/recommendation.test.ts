import { describe, it, expect } from 'vitest';
import { generateFallbackTips } from '../server';

export interface Tip {
  category: string;
  text: string;
  impact: string;
}

describe('AI Recommendation Engine and Fallback Advisor tests', () => {
  it('should deliver standard, polite placeholder tips when no footprint record is provided', () => {
    const tips = generateFallbackTips();
    
    expect(tips).toHaveLength(3);
    expect(tips[0].category).toBe("Transport");
    expect(tips[1].category).toBe("Energy");
    expect(tips[2].category).toBe("Food");
    expect(tips[0].impact).toBe("Saves up to 0.4 tons CO2/yr");
  });

  it('should trigger custom elevated Transport advice when footprint exceeds 1.2 tons', () => {
    const profile = {
      transport_co2: 1.5, // above 1.2
      energy_co2: 0.4,
      diet: "veg"
    };
    
    const tips = generateFallbackTips(profile);
    
    expect(tips[0].text).toContain("transport emissions of 1.5 tons are premium!");
    expect(tips[0].impact).toBe("Saves up to 1.1 tons CO2/yr");
  });

  it('should trigger custom elevated Energy advice when energy footprint is above 1.0 tons', () => {
    const profile = {
      transport_co2: 0.5,
      energy_co2: 1.3, // above 1.0
      diet: "mixed"
    };

    const tips = generateFallbackTips(profile);

    expect(tips[1].text).toContain("energy emissions at 1.3 tons");
    expect(tips[1].impact).toBe("Saves up to 0.6 tons CO2/yr");
  });

  it('should trigger specialized high-meat food advice when user has heavy protein log', () => {
    const profile = {
      transport_co2: 0.8,
      energy_co2: 0.5,
      diet: "meat" // high-meat log
    };

    const tips = generateFallbackTips(profile);

    expect(tips[2].text).toContain("heavy protein agriculture inputs");
    expect(tips[2].impact).toBe("Saves up to 0.9 tons CO2/yr");
  });
});
