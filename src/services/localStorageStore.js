/**
 * AquaGen: The Water Black Box
 * In-Browser Local Storage Repository for Local Demo Mode
 *
 * Persists zones, readings, and investigations in localStorage with
 * automatic seed initialization and scenario resetting.
 */

import { INITIAL_ZONES, INITIAL_READINGS, INITIAL_INVESTIGATIONS } from './mockData.js';
import { calculateWaterBalance } from '../core/waterBalanceEngine.js';
import { createInvestigationRecord } from '../core/prioritization.js';
import { compareBeforeAndAfter } from '../core/beforeAfterEngine.js';

const STORAGE_KEYS = {
  ZONES: 'aquagen_zones_v1',
  READINGS: 'aquagen_readings_v1',
  INVESTIGATIONS: 'aquagen_investigations_v1',
  ACTIVE_SCENARIO: 'aquagen_active_scenario_v1'
};

class LocalStorageStore {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.ZONES)) {
      localStorage.setItem(STORAGE_KEYS.ZONES, JSON.stringify(INITIAL_ZONES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.READINGS)) {
      localStorage.setItem(STORAGE_KEYS.READINGS, JSON.stringify(INITIAL_READINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.INVESTIGATIONS)) {
      localStorage.setItem(STORAGE_KEYS.INVESTIGATIONS, JSON.stringify(INITIAL_INVESTIGATIONS));
    }
  }

  resetToInitial() {
    localStorage.setItem(STORAGE_KEYS.ZONES, JSON.stringify(INITIAL_ZONES));
    localStorage.setItem(STORAGE_KEYS.READINGS, JSON.stringify(INITIAL_READINGS));
    localStorage.setItem(STORAGE_KEYS.INVESTIGATIONS, JSON.stringify(INITIAL_INVESTIGATIONS));
    return { success: true, message: 'All demo data reset to default seed.' };
  }

  // --- ZONES ---
  getZones() {
    const raw = localStorage.getItem(STORAGE_KEYS.ZONES);
    return raw ? JSON.parse(raw) : INITIAL_ZONES;
  }

  getZoneById(id) {
    const zones = this.getZones();
    return zones.find(z => z.id === id) || null;
  }

  // --- READINGS ---
  getReadings(filters = {}) {
    const raw = localStorage.getItem(STORAGE_KEYS.READINGS);
    let readings = raw ? JSON.parse(raw) : INITIAL_READINGS;

    if (filters.zoneId && filters.zoneId !== 'ALL') {
      readings = readings.filter(r => r.zoneId === filters.zoneId);
    }
    if (filters.startDate) {
      readings = readings.filter(r => r.date >= filters.startDate);
    }
    if (filters.endDate) {
      readings = readings.filter(r => r.date <= filters.endDate);
    }

    // Sort descending by date
    return readings.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  getReadingById(id) {
    const readings = this.getReadings();
    return readings.find(r => r.id === id) || null;
  }

  addReading(readingData) {
    const readings = this.getReadings();

    // Check duplicate for same zone and date
    const exists = readings.some(r => r.zoneId === readingData.zoneId && r.date === readingData.date);
    if (exists) {
      throw new Error(`A reading for Zone ${readingData.zoneId} on ${readingData.date} already exists.`);
    }

    // Calculate water balance through engine
    const balance = calculateWaterBalance(readingData);

    const newReading = {
      id: `RD-${readingData.zoneId}-${Date.now().toString(36).toUpperCase()}`,
      zoneId: readingData.zoneId,
      date: readingData.date,
      waterSupplied: Number(readingData.waterSupplied),
      recordedConsumption: Number(readingData.recordedConsumption),
      storageChange: Number(readingData.storageChange),
      otherDocumentedOutflows: Number(readingData.otherDocumentedOutflows || 0),
      unexplainedDifference: balance.unexplainedDifference,
      discrepancyPercentage: balance.discrepancyPercentage,
      classification: balance.classification,
      severity: balance.severity,
      status: balance.severity === 'HIGH' ? 'ANOMALY_DETECTED' : 'NORMAL',
      notes: readingData.notes || '',
      createdAt: new Date().toISOString()
    };

    readings.unshift(newReading);
    localStorage.setItem(STORAGE_KEYS.READINGS, JSON.stringify(readings));

    // If discrepancy is high and no investigation exists for this date/zone, auto-suggest or create
    let createdInvestigation = null;
    if (balance.severity === 'HIGH' && balance.discrepancyPercentage > 15) {
      createdInvestigation = this.addInvestigation({
        zoneId: newReading.zoneId,
        readingDate: newReading.date,
        readingId: newReading.id,
        title: `Auto-Detected Discrepancy in ${newReading.zoneId} (${balance.discrepancyPercentage}%)`,
        unexplainedDifference: balance.unexplainedDifference,
        discrepancyPercentage: balance.discrepancyPercentage,
        evidenceNotes: `Automated flag: ${balance.message}`
      });
    }

    return { reading: newReading, balance, createdInvestigation };
  }

  // --- INVESTIGATIONS ---
  getInvestigations(filters = {}) {
    const raw = localStorage.getItem(STORAGE_KEYS.INVESTIGATIONS);
    let invs = raw ? JSON.parse(raw) : INITIAL_INVESTIGATIONS;

    if (filters.zoneId && filters.zoneId !== 'ALL') {
      invs = invs.filter(i => i.zoneId === filters.zoneId);
    }
    if (filters.status && filters.status !== 'ALL') {
      invs = invs.filter(i => i.status === filters.status);
    }
    if (filters.priority && filters.priority !== 'ALL') {
      invs = invs.filter(i => i.priority === filters.priority);
    }

    return invs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getInvestigationById(id) {
    const invs = this.getInvestigations();
    return invs.find(i => i.id === id) || null;
  }

  addInvestigation(invData) {
    const invs = this.getInvestigations();
    const newRecord = createInvestigationRecord(invData);
    invs.unshift(newRecord);
    localStorage.setItem(STORAGE_KEYS.INVESTIGATIONS, JSON.stringify(invs));
    return newRecord;
  }

  updateInvestigation(id, updates = {}) {
    const invs = this.getInvestigations();
    const index = invs.findIndex(i => i.id === id);
    if (index === -1) {
      throw new Error(`Investigation ${id} not found.`);
    }

    invs[index] = {
      ...invs[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEYS.INVESTIGATIONS, JSON.stringify(invs));
    return invs[index];
  }

  addInspectionToInvestigation(investigationId, inspection) {
    const inv = this.getInvestigationById(investigationId);
    if (!inv) throw new Error(`Investigation ${investigationId} not found.`);

    const newInspection = {
      id: `INSP-${Date.now().toString(36).toUpperCase()}`,
      timestamp: inspection.timestamp || new Date().toISOString(),
      inspector: inspection.inspector || 'Utility Operator',
      type: inspection.type || 'Field Inspection',
      findings: inspection.findings || '',
      recommendation: inspection.recommendation || ''
    };

    const updatedInspections = [...(inv.inspections || []), newInspection];
    return this.updateInvestigation(investigationId, {
      inspections: updatedInspections,
      status: inv.status === 'Open' ? 'Inspection Required' : inv.status
    });
  }

  recordBeforeAfterComparison(investigationId, { beforeReadingId, afterReadingId, actionTaken, technician }) {
    const inv = this.getInvestigationById(investigationId);
    if (!inv) throw new Error(`Investigation ${investigationId} not found.`);

    const beforeReading = this.getReadingById(beforeReadingId);
    const afterReading = this.getReadingById(afterReadingId);

    if (!beforeReading || !afterReading) {
      throw new Error('Both before and after readings must be found in the database.');
    }

    const comparison = compareBeforeAndAfter(beforeReading, afterReading, {
      actionTaken,
      technician,
      datePerformed: afterReading.date
    });

    const updated = this.updateInvestigation(investigationId, {
      beforeAfterComparison: {
        actionTaken,
        technician,
        beforeReadingId,
        afterReadingId,
        beforeDiff: beforeReading.unexplainedDifference,
        afterDiff: afterReading.unexplainedDifference,
        beforePercent: beforeReading.discrepancyPercentage,
        afterPercent: afterReading.discrepancyPercentage,
        volumetricDeltaLpd: comparison.metrics.volumetricDeltaLpd,
        relativeImprovementPercent: comparison.metrics.relativeImprovementPercent,
        outcomeCategory: comparison.metrics.outcomeCategory,
        summary: comparison.metrics.summary
      },
      status: comparison.metrics.outcomeCategory === 'IMPROVED' ? 'Resolved' : inv.status,
      outcome: comparison.metrics.summary,
      resolutionNotes: `Post-repair verification completed. Discrepancy change: ${comparison.metrics.volumetricDeltaLpd.toLocaleString()} L/day.`
    });

    return { updatedInvestigation: updated, comparison };
  }

  // --- ANALYTICS SUMMARY ---
  getAnalyticsSummary(zoneId = 'ALL') {
    const readings = this.getReadings({ zoneId });
    const investigations = this.getInvestigations({ zoneId });

    const totalSupplied = readings.reduce((acc, r) => acc + (r.waterSupplied || 0), 0);
    const totalConsumed = readings.reduce((acc, r) => acc + (r.recordedConsumption || 0), 0);
    const totalStorageChange = readings.reduce((acc, r) => acc + (r.storageChange || 0), 0);
    const totalOutflows = readings.reduce((acc, r) => acc + (r.otherDocumentedOutflows || 0), 0);
    const totalDiscrepancy = readings.reduce((acc, r) => acc + (r.unexplainedDifference || 0), 0);

    const computableCount = readings.filter(r => r.unexplainedDifference !== null).length;
    const avgDiscrepancyPercent = computableCount > 0
      ? Number((readings.filter(r => r.discrepancyPercentage !== null).reduce((acc, r) => acc + r.discrepancyPercentage, 0) / computableCount).toFixed(2))
      : 0;

    const activeInvestigations = investigations.filter(i => ['Open', 'Under Review', 'Inspection Required'].includes(i.status)).length;
    const highPriorityInspections = investigations.filter(i => ['Critical', 'High'].includes(i.priority) && i.status !== 'Resolved').length;

    return {
      totalSupplied,
      totalConsumed,
      totalStorageChange,
      totalOutflows,
      totalDiscrepancy,
      avgDiscrepancyPercent,
      activeInvestigations,
      highPriorityInspections,
      readingsCount: readings.length,
      computableCount
    };
  }
}

export const localStore = new LocalStorageStore();
