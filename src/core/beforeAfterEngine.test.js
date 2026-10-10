import { describe, it, expect } from 'vitest';
import { compareBeforeAndAfter } from './beforeAfterEngine.js';

describe('Before-and-After Verification Engine', () => {
  it('correctly calculates reduction in discrepancy after physical repair', () => {
    // Before: Main pipe rupture caused 24,000 L/day discrepancy (24%)
    const beforeReading = {
      id: 'R-BEFORE-1',
      zoneId: 'Z-NORTH',
      date: '2026-10-01',
      waterSupplied: 100000,
      recordedConsumption: 70000,
      storageChange: 6000,
      otherDocumentedOutflows: 0,
      unexplainedDifference: 24000,
      discrepancyPercentage: 24.0
    };

    // After: Clamp installed on 150mm ductile iron pipe; discrepancy drops to 2,000 L/day (2%)
    const afterReading = {
      id: 'R-AFTER-1',
      zoneId: 'Z-NORTH',
      date: '2026-10-04',
      waterSupplied: 100000,
      recordedConsumption: 92000,
      storageChange: 6000,
      otherDocumentedOutflows: 0,
      unexplainedDifference: 2000,
      discrepancyPercentage: 2.0
    };

    const result = compareBeforeAndAfter(beforeReading, afterReading, {
      actionTaken: 'Repaired fractured 150mm ductile iron joint on Pine Avenue',
      technician: 'Crew Alpha - Field Lead Torres'
    });

    expect(result.isValid).toBe(true);
    expect(result.metrics.volumetricDeltaLpd).toBe(-22000); // 24000 down to 2000 => -22000 L/day
    expect(result.metrics.absoluteReductionLpd).toBe(22000);
    expect(result.metrics.relativeImprovementPercent).toBe(91.7); // (24000 - 2000) / 24000 = 91.66%
    expect(result.metrics.deltaPercentagePoints).toBe(-22.0);
    expect(result.metrics.outcomeCategory).toBe('IMPROVED');
    expect(result.metrics.summary).toContain('Significant improvement observed');
    expect(result.metrics.scientificCaveat).toContain('does not constitute sole physical proof');
    expect(result.chartData).toHaveLength(2);
  });

  it('correctly identifies when discrepancy worsens post-intervention', () => {
    const beforeReading = {
      zoneId: 'Z-EAST',
      date: '2026-10-01',
      waterSupplied: 50000,
      recordedConsumption: 45000,
      storageChange: 0,
      unexplainedDifference: 5000,
      discrepancyPercentage: 10.0
    };

    const afterReading = {
      zoneId: 'Z-EAST',
      date: '2026-10-05',
      waterSupplied: 50000,
      recordedConsumption: 40000,
      storageChange: 0,
      unexplainedDifference: 10000,
      discrepancyPercentage: 20.0
    };

    const result = compareBeforeAndAfter(beforeReading, afterReading, {
      actionTaken: 'Adjusted PRV station setpoint'
    });

    expect(result.isValid).toBe(true);
    expect(result.metrics.outcomeCategory).toBe('WORSENED');
    expect(result.metrics.volumetricDeltaLpd).toBe(5000);
    expect(result.metrics.summary).toContain('Discrepancy increased');
  });

  it('correctly identifies similar status when change is within noise threshold', () => {
    const beforeReading = {
      zoneId: 'Z-SOUTH',
      date: '2026-10-01',
      waterSupplied: 50000,
      recordedConsumption: 46000,
      storageChange: 0,
      unexplainedDifference: 4000,
      discrepancyPercentage: 8.0
    };

    const afterReading = {
      zoneId: 'Z-SOUTH',
      date: '2026-10-03',
      waterSupplied: 50000,
      recordedConsumption: 46200,
      storageChange: 0,
      unexplainedDifference: 3800,
      discrepancyPercentage: 7.6
    };

    const result = compareBeforeAndAfter(beforeReading, afterReading, {
      actionTaken: 'Inspected customer water meters on Block 4'
    });

    expect(result.isValid).toBe(true);
    expect(result.metrics.outcomeCategory).toBe('SIMILAR');
    expect(result.metrics.summary).toContain('remained similar');
  });
});
