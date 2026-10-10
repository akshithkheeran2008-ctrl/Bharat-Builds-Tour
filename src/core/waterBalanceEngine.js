/**
 * AquaGen: The Water Black Box
 * Core Water-Balance Engine
 *
 * Implements standard conservation of mass water-balance accounting:
 * Unexplained Difference = Water Supplied - Recorded Consumption - Increase In Storage - Other Documented Outflows
 *
 * All volumetric units in Litres per Day (L/day).
 *
 * Principle: An unexplained discrepancy is a signal for investigation, not automatic proof of physical leakage.
 */

export const DEFAULT_THRESHOLDS = {
  normalMaxPercent: 5.0,    // Below 5% is within expected acoustic/meter tolerance
  moderateMaxPercent: 15.0, // 5% to 15% warrants operational review
  highMinPercent: 15.0,     // >15% requires immediate inspection
  largeVolumeLpd: 15000     // Absolute difference >= 15,000 L/day triggers elevated flag
};

/**
 * Validates input parameters for a daily water reading.
 *
 * Rules:
 * - waterSupplied must be a non-negative number and is required.
 * - recordedConsumption must be a non-negative number and is required.
 * - storageChange can be positive (storage increase), negative (storage decrease), or zero.
 *   Missing storageChange invalidates calculation if reservoir is tracked.
 * - otherDocumentedOutflows must be non-negative (defaults to 0 if explicitly provided as 0).
 * - Distinguishes 0 from null/undefined/empty string.
 * - Checks for realistic sanity bounds.
 *
 * @param {Object} input
 * @returns {{ isValid: boolean, errors: string[], warnings: string[] }}
 */
export function validateReadingInput(input = {}) {
  const errors = [];
  const warnings = [];

  if (!input || typeof input !== 'object') {
    return { isValid: false, errors: ['Input must be a valid object.'], warnings: [] };
  }

  // 1. Zone ID validation
  if (!input.zoneId || typeof input.zoneId !== 'string' || input.zoneId.trim() === '') {
    errors.push('Zone identifier (zoneId) is required.');
  }

  // 2. Date validation
  if (!input.date) {
    errors.push('Reading date is required.');
  } else {
    const parsedDate = new Date(input.date);
    if (isNaN(parsedDate.getTime())) {
      errors.push('Reading date format is invalid.');
    } else {
      const today = new Date();
      // Allow up to today (ignoring hours)
      today.setHours(23, 59, 59, 999);
      if (parsedDate > today) {
        errors.push('Reading date cannot be in the future.');
      }
    }
  }

  // Helper to test if a value is strictly provided (distinguishing 0 from missing)
  const isPresent = (v) => v !== null && v !== undefined && v !== '' && !Number.isNaN(Number(v));

  // 3. Water Supplied
  if (!isPresent(input.waterSupplied)) {
    errors.push('Water Supplied is missing. A definitive balance cannot be computed without inflow data.');
  } else {
    const ws = Number(input.waterSupplied);
    if (ws < 0) {
      errors.push('Water Supplied cannot be negative.');
    } else if (ws === 0) {
      warnings.push('Water Supplied is recorded as 0 L/day. Check if transmission inlet is shut down or meter is offline.');
    }
  }

  // 4. Recorded Consumption
  if (!isPresent(input.recordedConsumption)) {
    errors.push('Recorded Consumption is missing. Customer billing/smart meter data required.');
  } else {
    const rc = Number(input.recordedConsumption);
    if (rc < 0) {
      errors.push('Recorded Consumption cannot be negative.');
    }
  }

  // 5. Storage Change
  // Storage change CAN be negative (tank draining) or positive (tank filling)
  if (!isPresent(input.storageChange)) {
    // If not provided at all, flagged as missing unless zone has no storage
    errors.push('Storage Change is missing. Specify 0 if the zone has no reservoir or net change is zero.');
  } else {
    const sc = Number(input.storageChange);
    if (Number.isNaN(sc)) {
      errors.push('Storage Change must be a valid number.');
    }
  }

  // 6. Other Documented Outflows
  if (input.otherDocumentedOutflows !== undefined && input.otherDocumentedOutflows !== null && input.otherDocumentedOutflows !== '') {
    const odo = Number(input.otherDocumentedOutflows);
    if (Number.isNaN(odo)) {
      errors.push('Other Documented Outflows must be a valid number.');
    } else if (odo < 0) {
      errors.push('Other Documented Outflows cannot be negative.');
    }
  }

  // 7. Physical mass sanity checks (when numbers are present)
  if (isPresent(input.waterSupplied) && isPresent(input.recordedConsumption) && isPresent(input.storageChange)) {
    const ws = Number(input.waterSupplied);
    const rc = Number(input.recordedConsumption);
    const sc = Number(input.storageChange);
    const odo = isPresent(input.otherDocumentedOutflows) ? Number(input.otherDocumentedOutflows) : 0;

    // Total water available to zone = Water Supplied + (storage drained if sc < 0)
    const effectiveWaterAvailable = ws + (sc < 0 ? Math.abs(sc) : 0);

    // Negative storage increase that exceeds total system capacity
    if (sc > ws) {
      warnings.push(`Storage increase (${sc.toLocaleString()} L/day) exceeds total water supplied (${ws.toLocaleString()} L/day). Check reservoir sensor calibration.`);
    }

    if (rc + odo > effectiveWaterAvailable && effectiveWaterAvailable > 0) {
      const surplus = (rc + odo) - effectiveWaterAvailable;
      warnings.push(`Recorded consumption and outflows (${(rc + odo).toLocaleString()} L/day) exceed available water (${effectiveWaterAvailable.toLocaleString()} L/day) by ${surplus.toLocaleString()} L/day. Negative discrepancy indicates potential meter over-registration, back-feed, or storage measurement error.`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Calculates water balance and unexplained discrepancy.
 *
 * Formula:
 * Unexplained Difference = Water Supplied - Recorded Consumption - Storage Change - Other Documented Outflows
 *
 * Where:
 * - Storage Change:
 *   If positive (+ΔS), storage increased (water was stored in the reservoir, so accounted for).
 *   If negative (-ΔS), storage decreased (reservoir supplied water into the network, effectively adding supply).
 *   Formula cleanly evaluates: Supplied - Consumed - (-ΔS) - Outflows = Supplied + |ΔS| - Consumed - Outflows.
 *
 * @param {Object} reading - Daily reading object
 * @param {Object} customThresholds - Optional threshold overrides
 * @returns {Object} Comprehensive calculation result with arithmetic breakdown
 */
export function calculateWaterBalance(reading = {}, customThresholds = {}) {
  const validation = validateReadingInput(reading);

  if (!validation.isValid) {
    return {
      success: false,
      isComputable: false,
      validationErrors: validation.errors,
      validationWarnings: validation.warnings,
      unexplainedDifference: null,
      discrepancyPercentage: null,
      status: 'INVALID_DATA',
      classification: 'UNCOMPUTABLE',
      breakdown: null
    };
  }

  const thresholds = { ...DEFAULT_THRESHOLDS, ...customThresholds };

  const waterSupplied = Number(reading.waterSupplied);
  const recordedConsumption = Number(reading.recordedConsumption);
  const storageChange = Number(reading.storageChange);
  const otherDocumentedOutflows = reading.otherDocumentedOutflows !== undefined && reading.otherDocumentedOutflows !== null && reading.otherDocumentedOutflows !== ''
    ? Number(reading.otherDocumentedOutflows)
    : 0;

  // Exact arithmetic
  // Unexplained Difference = Supplied - Consumption - StorageChange - OtherOutflows
  const unexplainedDifference = waterSupplied - recordedConsumption - storageChange - otherDocumentedOutflows;

  // Effective net supply for percentage computation (Total inflow into network)
  // If storage drained (storageChange < 0), available water = waterSupplied + Math.abs(storageChange)
  const totalWaterInput = waterSupplied + (storageChange < 0 ? Math.abs(storageChange) : 0);

  // Percentage calculation:
  // Primary benchmark: relative to total water supplied or total available water
  let discrepancyPercentage = 0;
  if (totalWaterInput > 0) {
    discrepancyPercentage = (unexplainedDifference / totalWaterInput) * 100;
  } else if (waterSupplied > 0) {
    discrepancyPercentage = (unexplainedDifference / waterSupplied) * 100;
  }

  // Round values for human-readable consistency
  const roundedDiff = Math.round(unexplainedDifference);
  const roundedPercent = Number(discrepancyPercentage.toFixed(2));

  // Determine classification and severity
  let classification = 'NORMAL';
  let severity = 'LOW';
  let color = 'green';
  let message = 'Water balance is within normal tolerance bounds (< 5%).';

  const absPercent = Math.abs(roundedPercent);

  if (unexplainedDifference < 0 && absPercent > thresholds.normalMaxPercent) {
    // Negative discrepancy: Consumed + stored > supplied
    classification = 'APPARENT_SURPLUS_OR_METER_OVERREAD';
    severity = absPercent > thresholds.moderateMaxPercent ? 'HIGH' : 'MEDIUM';
    color = 'amber';
    message = 'Negative discrepancy detected. Recorded consumption & storage exceed supplied volume. Suspect meter over-registration, unauthorized unmetered back-feed, or reservoir sensor under-reading.';
  } else if (roundedPercent > thresholds.highMinPercent || unexplainedDifference >= thresholds.largeVolumeLpd) {
    classification = 'HIGH_DISCREPANCY';
    severity = 'HIGH';
    color = 'red';
    message = `Critical discrepancy: ${roundedPercent}% (${roundedDiff.toLocaleString()} L/day) unaccounted for. Urgent field inspection recommended.`;
  } else if (roundedPercent > thresholds.normalMaxPercent) {
    classification = 'MODERATE_DISCREPANCY';
    severity = 'MEDIUM';
    color = 'amber';
    message = `Moderate discrepancy: ${roundedPercent}% (${roundedDiff.toLocaleString()} L/day) unaccounted for. Recommend acoustic check or meter verification.`;
  } else {
    classification = 'BALANCED';
    severity = 'LOW';
    color = 'green';
    message = `Within acceptable acoustic and utility measurement margins (${roundedPercent}% difference).`;
  }

  // Transparent step-by-step arithmetic breakdown
  const storageDescription = storageChange > 0
    ? `+${storageChange.toLocaleString()} L/day (Storage Increased - water held in reservoir)`
    : storageChange < 0
    ? `${storageChange.toLocaleString()} L/day (Storage Decreased - ${Math.abs(storageChange).toLocaleString()} L drawn from reservoir into distribution network)`
    : '0 L/day (No net storage change)';

  const breakdown = {
    formula: 'Unexplained Difference = Water Supplied - Recorded Consumption - Storage Change - Other Documented Outflows',
    steps: [
      { label: 'Water Supplied (A)', value: waterSupplied, formatted: `${waterSupplied.toLocaleString()} L/day`, type: 'inflow' },
      { label: 'Recorded Consumption (B)', value: recordedConsumption, formatted: `${recordedConsumption.toLocaleString()} L/day`, type: 'consumption' },
      { label: 'Storage Change (C)', value: storageChange, formatted: storageDescription, type: 'storage' },
      { label: 'Other Documented Outflows (D)', value: otherDocumentedOutflows, formatted: `${otherDocumentedOutflows.toLocaleString()} L/day`, type: 'outflow' },
      {
        label: 'Arithmetic Evaluation',
        calculationText: `${waterSupplied.toLocaleString()} - ${recordedConsumption.toLocaleString()} - (${storageChange.toLocaleString()}) - ${otherDocumentedOutflows.toLocaleString()}`,
        result: roundedDiff,
        formattedResult: `${roundedDiff.toLocaleString()} L/day`
      },
      {
        label: 'Discrepancy Percentage',
        calculationText: `(${roundedDiff.toLocaleString()} / ${totalWaterInput.toLocaleString()}) * 100`,
        result: roundedPercent,
        formattedResult: `${roundedPercent}%`
      }
    ],
    summaryNote: 'Scientific principle: This value represents mathematical discrepancy between metering points. It indicates an operational anomaly for investigation, NOT proof of physical underground leakage until inspected in the field.'
  };

  return {
    success: true,
    isComputable: true,
    validationErrors: [],
    validationWarnings: validation.warnings,
    unexplainedDifference: roundedDiff,
    discrepancyPercentage: roundedPercent,
    waterSupplied,
    recordedConsumption,
    storageChange,
    otherDocumentedOutflows,
    totalWaterInput,
    classification,
    severity,
    color,
    message,
    breakdown,
    timestamp: new Date().toISOString()
  };
}

/**
 * Checks if a reading would be a duplicate in an existing list.
 * @param {Array} existingReadings
 * @param {string} zoneId
 * @param {string} date
 * @param {string} [excludeId] - Optional reading ID to exclude (for updates)
 * @returns {boolean}
 */
export function isDuplicateReading(existingReadings = [], zoneId, date, excludeId = null) {
  if (!Array.isArray(existingReadings) || !zoneId || !date) return false;
  return existingReadings.some(
    r => r.zoneId === zoneId && r.date === date && (!excludeId || r.id !== excludeId)
  );
}
