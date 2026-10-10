/**
 * AquaGen: The Water Black Box
 * Before-and-After Verification Engine
 *
 * Implements rigorous comparative analytics between pre-intervention and post-intervention
 * water balance readings.
 *
 * Scientific disclaimer:
 * "Improvement (reduced discrepancy) after a repair is evidence of an operational change,
 * but not necessarily definitive proof that the repaired asset was the sole cause of
 * the historical discrepancy. Network pressure shifts, seasonal demand changes, and
 * secondary leaks may also contribute."
 */

/**
 * Compares water balance readings before and after a corrective action.
 *
 * @param {Object} beforeReading - Pre-intervention reading
 * @param {Object} afterReading - Post-intervention reading
 * @param {Object} [interventionMeta] - Details of the inspection/repair performed
 * @returns {Object} Comprehensive before-and-after comparison result
 */
export function compareBeforeAndAfter(beforeReading, afterReading, interventionMeta = {}) {
  if (!beforeReading || !afterReading) {
    return {
      isValid: false,
      error: 'Both before and after readings must be provided for verification.'
    };
  }

  const beforeDiff = Number(beforeReading.unexplainedDifference ?? 0);
  const afterDiff = Number(afterReading.unexplainedDifference ?? 0);

  const beforePercent = Number(beforeReading.discrepancyPercentage ?? 0);
  const afterPercent = Number(afterReading.discrepancyPercentage ?? 0);

  // Absolute volumetric change in discrepancy (L/day)
  // Negative deltaDiff means the discrepancy shrunk (improved!)
  const deltaDiff = afterDiff - beforeDiff;

  // Percentage point change
  const deltaPercentagePoints = Number((afterPercent - beforePercent).toFixed(2));

  // Relative percentage reduction in discrepancy
  // e.g. from 20,000 L/day down to 2,000 L/day => ((20000 - 2000) / 20000) * 100 = 90% reduction
  let relativeImprovementPercent = 0;
  if (Math.abs(beforeDiff) > 0) {
    relativeImprovementPercent = Number((((beforeDiff - afterDiff) / beforeDiff) * 100).toFixed(1));
  }

  // Classify outcome
  let outcomeCategory = 'SIMILAR';
  let badgeColor = 'amber';
  let summary = '';

  // We consider a +/- 5% relative variance as "Similar"
  if (relativeImprovementPercent >= 20 || (beforeDiff > 5000 && deltaDiff < -3000)) {
    outcomeCategory = 'IMPROVED';
    badgeColor = 'green';
    summary = `Significant improvement observed: Unexplained discrepancy dropped by ${Math.abs(deltaDiff).toLocaleString()} L/day (${Math.abs(relativeImprovementPercent)}% reduction).`;
  } else if (relativeImprovementPercent <= -20 || (deltaDiff > 3000)) {
    outcomeCategory = 'WORSENED';
    badgeColor = 'red';
    summary = `Discrepancy increased by ${deltaDiff.toLocaleString()} L/day (${Math.abs(deltaPercentagePoints)} percentage points higher). Requires further investigation.`;
  } else {
    outcomeCategory = 'SIMILAR';
    badgeColor = 'blue';
    summary = `Discrepancy remained similar (within normal variation, Δ ${deltaDiff.toLocaleString()} L/day). The corrective action may not have addressed the primary discrepancy source.`;
  }

  const scientificCaveat = 'Caveat: A reduction in discrepancy provides strong empirical evidence of system improvement following the intervention, but does not constitute sole physical proof. Other concurrent network variables (pressure fluctuations, domestic demand shifts) must also be considered.';

  return {
    isValid: true,
    zoneId: beforeReading.zoneId || afterReading.zoneId,
    intervention: {
      actionTaken: interventionMeta.actionTaken || 'Field inspection / asset maintenance',
      datePerformed: interventionMeta.datePerformed || beforeReading.date,
      technician: interventionMeta.technician || 'Utility Field Crew',
      notes: interventionMeta.notes || ''
    },
    before: {
      date: beforeReading.date,
      readingId: beforeReading.id || 'N/A',
      waterSupplied: beforeReading.waterSupplied,
      recordedConsumption: beforeReading.recordedConsumption,
      storageChange: beforeReading.storageChange,
      otherDocumentedOutflows: beforeReading.otherDocumentedOutflows || 0,
      unexplainedDifference: beforeDiff,
      discrepancyPercentage: beforePercent
    },
    after: {
      date: afterReading.date,
      readingId: afterReading.id || 'N/A',
      waterSupplied: afterReading.waterSupplied,
      recordedConsumption: afterReading.recordedConsumption,
      storageChange: afterReading.storageChange,
      otherDocumentedOutflows: afterReading.otherDocumentedOutflows || 0,
      unexplainedDifference: afterDiff,
      discrepancyPercentage: afterPercent
    },
    metrics: {
      volumetricDeltaLpd: deltaDiff, // negative is good (reduced loss)
      absoluteReductionLpd: -deltaDiff,
      deltaPercentagePoints,
      relativeImprovementPercent,
      outcomeCategory,
      badgeColor,
      summary,
      scientificCaveat
    },
    chartData: [
      {
        phase: 'Before Intervention',
        date: beforeReading.date,
        'Water Supplied': beforeReading.waterSupplied,
        'Recorded Consumption': beforeReading.recordedConsumption,
        'Unexplained Discrepancy': Math.max(0, beforeDiff)
      },
      {
        phase: 'After Intervention',
        date: afterReading.date,
        'Water Supplied': afterReading.waterSupplied,
        'Recorded Consumption': afterReading.recordedConsumption,
        'Unexplained Discrepancy': Math.max(0, afterDiff)
      }
    ]
  };
}
