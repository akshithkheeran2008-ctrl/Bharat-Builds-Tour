import { describe, it, expect } from 'vitest';
import {
  determineInvestigationPriority,
  createInvestigationRecord,
  INVESTIGATION_STATUSES,
  HYPOTHESES_CATALOG
} from './prioritization.js';

describe('Investigation Prioritization Engine', () => {
  it('assigns Critical priority to large volumetric discrepancies (>30,000 L/day)', () => {
    const result = determineInvestigationPriority({
      unexplainedDifference: 35000,
      discrepancyPercentage: 28.0,
      consecutiveDays: 1,
      dataCompletenessScore: 100
    });

    expect(result.priority).toBe('Critical');
    expect(result.rationale).toContain('magnitude is severe');
    expect(result.recommendedAction).toContain('Immediate field inspection required');
  });

  it('elevates priority to Critical when discrepancy persists across multiple consecutive days', () => {
    const result = determineInvestigationPriority({
      unexplainedDifference: 16000,
      discrepancyPercentage: 18.0,
      consecutiveDays: 4,
      dataCompletenessScore: 100
    });

    expect(result.priority).toBe('Critical');
    expect(result.rationale).toContain('persisted for 4 days');
    expect(result.recommendedAction).toContain('persistence');
  });

  it('assigns High priority to moderate-high discrepancies (15-25%)', () => {
    const result = determineInvestigationPriority({
      unexplainedDifference: 18000,
      discrepancyPercentage: 18.0,
      consecutiveDays: 1,
      dataCompletenessScore: 100
    });

    expect(result.priority).toBe('High');
    expect(result.rationale).toContain('exceeds standard 15% operational threshold');
  });

  it('holds priority at Medium if data completeness is below 75% to prevent phantom alarms', () => {
    const result = determineInvestigationPriority({
      unexplainedDifference: 40000,
      discrepancyPercentage: 35.0,
      consecutiveDays: 2,
      dataCompletenessScore: 60 // Incomplete data!
    });

    expect(result.priority).toBe('Medium');
    expect(result.rationale).toContain('completeness is only 60%');
    expect(result.recommendedAction).toContain('telemetry');
  });

  it('assigns Low priority to small discrepancies within standard acoustic tolerance (< 5%)', () => {
    const result = determineInvestigationPriority({
      unexplainedDifference: 1200,
      discrepancyPercentage: 2.1,
      consecutiveDays: 1,
      dataCompletenessScore: 100
    });

    expect(result.priority).toBe('Low');
    expect(result.rationale).toContain('within normal metering tolerance');
  });

  it('creates full investigation record with status lifecycle and hypotheses catalog', () => {
    const record = createInvestigationRecord({
      zoneId: 'Z-NORTH',
      readingDate: '2026-10-09',
      unexplainedDifference: 22000,
      discrepancyPercentage: 22.0
    });

    expect(record.id).toMatch(/^INV-\d{4}-\d{4}$/);
    expect(record.zoneId).toBe('Z-NORTH');
    expect(record.priority).toBe('High');
    expect(record.status).toBe('Open');
    expect(INVESTIGATION_STATUSES).toContain(record.status);
    expect(record.hypotheses.length).toBeGreaterThan(0);
    expect(HYPOTHESES_CATALOG.length).toBe(6);
  });
});
