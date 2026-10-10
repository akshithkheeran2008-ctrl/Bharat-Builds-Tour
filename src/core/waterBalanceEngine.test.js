import { describe, it, expect } from 'vitest';
import {
  calculateWaterBalance,
  validateReadingInput,
  isDuplicateReading,
  DEFAULT_THRESHOLDS
} from './waterBalanceEngine.js';

describe('Water-Balance Engine', () => {
  describe('Standard Water-Balance Calculations', () => {
    it('calculates standard water balance accurately with positive storage increase', () => {
      // Benchmark scenario from specification:
      // Water supplied: 100,000 L/day
      // Recorded consumption: 72,000 L/day
      // Increase in storage: 8,000 L/day
      // Other documented outflows: 0 L/day
      // Unexplained difference: 20,000 L/day (20% discrepancy)
      const input = {
        zoneId: 'Z-NORTH',
        date: '2026-10-09',
        waterSupplied: 100000,
        recordedConsumption: 72000,
        storageChange: 8000,
        otherDocumentedOutflows: 0
      };

      const result = calculateWaterBalance(input);

      expect(result.success).toBe(true);
      expect(result.unexplainedDifference).toBe(20000);
      expect(result.discrepancyPercentage).toBe(20.0);
      expect(result.classification).toBe('HIGH_DISCREPANCY');
      expect(result.severity).toBe('HIGH');
      expect(result.breakdown).toBeDefined();
      expect(result.breakdown.steps[4].result).toBe(20000);
    });

    it('correctly handles balanced water distribution within normal tolerance (< 5%)', () => {
      const input = {
        zoneId: 'Z-CENTRAL',
        date: '2026-10-09',
        waterSupplied: 50000,
        recordedConsumption: 48500,
        storageChange: 500,
        otherDocumentedOutflows: 0
      };

      // Unexplained = 50000 - 48500 - 500 - 0 = 1000 L/day (2.0%)
      const result = calculateWaterBalance(input);

      expect(result.success).toBe(true);
      expect(result.unexplainedDifference).toBe(1000);
      expect(result.discrepancyPercentage).toBe(2.0);
      expect(result.classification).toBe('BALANCED');
      expect(result.severity).toBe('LOW');
    });

    it('correctly accounts for other documented outflows (e.g. fire hydrant flushing)', () => {
      const input = {
        zoneId: 'Z-SOUTH',
        date: '2026-10-09',
        waterSupplied: 60000,
        recordedConsumption: 50000,
        storageChange: 2000,
        otherDocumentedOutflows: 3000
      };

      // Unexplained = 60000 - 50000 - 2000 - 3000 = 5000 L/day (8.33%)
      const result = calculateWaterBalance(input);

      expect(result.success).toBe(true);
      expect(result.unexplainedDifference).toBe(5000);
      expect(result.discrepancyPercentage).toBe(8.33);
      expect(result.classification).toBe('MODERATE_DISCREPANCY');
      expect(result.severity).toBe('MEDIUM');
    });
  });

  describe('Storage Change Handling (Negative and Positive)', () => {
    it('correctly calculates negative storage change (reservoir draining/release into network)', () => {
      // Critical requirement: A negative storage change must NOT be silently converted to a positive increase.
      // If reservoir released 5,000 L into the network (storageChange = -5000):
      // Water supplied: 100,000 L
      // Storage change: -5,000 L
      // Available water = 100,000 + 5,000 = 105,000 L
      // Recorded consumption: 80,000 L
      // Other outflows: 1,000 L
      // Unexplained difference = 100000 - 80000 - (-5000) - 1000 = 24,000 L
      const input = {
        zoneId: 'Z-VALLEY',
        date: '2026-10-09',
        waterSupplied: 100000,
        recordedConsumption: 80000,
        storageChange: -5000,
        otherDocumentedOutflows: 1000
      };

      const result = calculateWaterBalance(input);

      expect(result.success).toBe(true);
      expect(result.storageChange).toBe(-5000);
      expect(result.unexplainedDifference).toBe(24000);
      // Effective input is 105,000 L. 24000 / 105000 * 100 = 22.86%
      expect(result.discrepancyPercentage).toBe(22.86);
      expect(result.classification).toBe('HIGH_DISCREPANCY');
    });

    it('handles negative discrepancy when consumption & storage exceed supplied volume', () => {
      // Possible meter over-registration, unrecorded inlet, or reservoir sensor failure
      const input = {
        zoneId: 'Z-EAST',
        date: '2026-10-09',
        waterSupplied: 50000,
        recordedConsumption: 55000,
        storageChange: 0,
        otherDocumentedOutflows: 0
      };

      // Unexplained = 50000 - 55000 - 0 - 0 = -5000 L/day (-10%)
      const result = calculateWaterBalance(input);

      expect(result.success).toBe(true);
      expect(result.unexplainedDifference).toBe(-5000);
      expect(result.discrepancyPercentage).toBe(-10.0);
      expect(result.classification).toBe('APPARENT_SURPLUS_OR_METER_OVERREAD');
      expect(result.validationWarnings.length).toBeGreaterThan(0);
    });
  });

  describe('Validation and Missing / Corrupt Data', () => {
    it('distinguishes zero from missing data', () => {
      // 0 is valid for otherDocumentedOutflows and storageChange
      const validZeroInput = {
        zoneId: 'Z-TEST',
        date: '2026-10-09',
        waterSupplied: 10000,
        recordedConsumption: 9800,
        storageChange: 0,
        otherDocumentedOutflows: 0
      };
      const validRes = validateReadingInput(validZeroInput);
      expect(validRes.isValid).toBe(true);
      expect(validRes.errors).toHaveLength(0);

      // null or empty string is missing
      const missingInput = {
        zoneId: 'Z-TEST',
        date: '2026-10-09',
        waterSupplied: 10000,
        recordedConsumption: '', // missing!
        storageChange: null     // missing!
      };
      const missingRes = validateReadingInput(missingInput);
      expect(missingRes.isValid).toBe(false);
      expect(missingRes.errors).toContain('Recorded Consumption is missing. Customer billing/smart meter data required.');
      expect(missingRes.errors).toContain('Storage Change is missing. Specify 0 if the zone has no reservoir or net change is zero.');
    });

    it('rejects negative water supplied and negative recorded consumption', () => {
      const negativeInput = {
        zoneId: 'Z-TEST',
        date: '2026-10-09',
        waterSupplied: -1000,
        recordedConsumption: -500,
        storageChange: 0
      };

      const res = validateReadingInput(negativeInput);
      expect(res.isValid).toBe(false);
      expect(res.errors).toContain('Water Supplied cannot be negative.');
      expect(res.errors).toContain('Recorded Consumption cannot be negative.');
    });

    it('rejects invalid or future dates', () => {
      const futureDateInput = {
        zoneId: 'Z-TEST',
        date: '2099-12-31',
        waterSupplied: 10000,
        recordedConsumption: 9000,
        storageChange: 0
      };
      const futureRes = validateReadingInput(futureDateInput);
      expect(futureRes.isValid).toBe(false);
      expect(futureRes.errors).toContain('Reading date cannot be in the future.');

      const invalidDateInput = {
        zoneId: 'Z-TEST',
        date: 'not-a-valid-date',
        waterSupplied: 10000,
        recordedConsumption: 9000,
        storageChange: 0
      };
      const invalidRes = validateReadingInput(invalidDateInput);
      expect(invalidRes.isValid).toBe(false);
      expect(invalidRes.errors).toContain('Reading date format is invalid.');
    });

    it('returns uncomputable status when calculating with invalid inputs', () => {
      const invalidInput = {
        zoneId: '',
        date: 'invalid',
        waterSupplied: null,
        recordedConsumption: null,
        storageChange: null
      };

      const result = calculateWaterBalance(invalidInput);
      expect(result.success).toBe(false);
      expect(result.isComputable).toBe(false);
      expect(result.unexplainedDifference).toBeNull();
      expect(result.validationErrors.length).toBeGreaterThan(0);
    });
  });

  describe('Duplicate Reading Detection', () => {
    const existing = [
      { id: 'R-1', zoneId: 'Z-NORTH', date: '2026-10-08' },
      { id: 'R-2', zoneId: 'Z-NORTH', date: '2026-10-09' },
      { id: 'R-3', zoneId: 'Z-CENTRAL', date: '2026-10-09' }
    ];

    it('detects duplicate readings for same zone and date', () => {
      expect(isDuplicateReading(existing, 'Z-NORTH', '2026-10-09')).toBe(true);
      expect(isDuplicateReading(existing, 'Z-NORTH', '2026-10-10')).toBe(false);
      expect(isDuplicateReading(existing, 'Z-SOUTH', '2026-10-09')).toBe(false);
    });

    it('ignores self-match when updating an existing reading id', () => {
      expect(isDuplicateReading(existing, 'Z-NORTH', '2026-10-09', 'R-2')).toBe(false);
      expect(isDuplicateReading(existing, 'Z-NORTH', '2026-10-08', 'R-2')).toBe(true);
    });
  });

  describe('Transparency & Arithmetic Breakdown', () => {
    it('produces transparent audit breakdown with clear scientific disclaimer', () => {
      const input = {
        zoneId: 'Z-TEST',
        date: '2026-10-09',
        waterSupplied: 80000,
        recordedConsumption: 65000,
        storageChange: 3000,
        otherDocumentedOutflows: 1000
      };

      const result = calculateWaterBalance(input);
      expect(result.breakdown).toBeDefined();
      expect(result.breakdown.steps).toHaveLength(6);
      expect(result.breakdown.summaryNote).toContain('NOT proof of physical underground leakage');
    });
  });
});
