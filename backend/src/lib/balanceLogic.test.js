import { describe, it, expect } from 'vitest';
import { calculateWaterBalance } from './balanceLogic.js';

describe('Serverless Backend Balance Logic', () => {
  it('correctly calculates discrepancy on AWS Lambda', () => {
    const input = {
      zoneId: 'Z-NORTH',
      date: '2026-10-09',
      waterSupplied: 100000,
      recordedConsumption: 72000,
      storageChange: 8000,
      otherDocumentedOutflows: 0
    };

    const res = calculateWaterBalance(input);
    expect(res.success).toBe(true);
    expect(res.unexplainedDifference).toBe(20000);
    expect(res.discrepancyPercentage).toBe(20.0);
    expect(res.severity).toBe('HIGH');
  });

  it('rejects invalid inputs on serverless API', () => {
    const res = calculateWaterBalance({});
    expect(res.success).toBe(false);
    expect(res.isComputable).toBe(false);
    expect(res.validationErrors.length).toBeGreaterThan(0);
  });
});
