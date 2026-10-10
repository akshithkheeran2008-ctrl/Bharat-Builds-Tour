/**
 * AquaGen Serverless Water-Balance Engine
 * Pure mathematical mass-conservation calculation for AWS Lambda
 */

export function calculateWaterBalance(reading = {}) {
  const errors = [];
  const warnings = [];

  const isPresent = (v) => v !== null && v !== undefined && v !== '' && !Number.isNaN(Number(v));

  if (!reading.zoneId) errors.push('Zone ID is required.');
  if (!reading.date) errors.push('Reading date is required.');
  if (!isPresent(reading.waterSupplied)) errors.push('Water Supplied is missing.');
  if (!isPresent(reading.recordedConsumption)) errors.push('Recorded Consumption is missing.');
  if (!isPresent(reading.storageChange)) errors.push('Storage Change is missing. Enter 0 if no net change.');

  if (isPresent(reading.waterSupplied) && Number(reading.waterSupplied) < 0) {
    errors.push('Water Supplied cannot be negative.');
  }
  if (isPresent(reading.recordedConsumption) && Number(reading.recordedConsumption) < 0) {
    errors.push('Recorded Consumption cannot be negative.');
  }

  if (errors.length > 0) {
    return {
      success: false,
      isComputable: false,
      validationErrors: errors,
      validationWarnings: warnings,
      unexplainedDifference: null,
      discrepancyPercentage: null
    };
  }

  const ws = Number(reading.waterSupplied);
  const rc = Number(reading.recordedConsumption);
  const sc = Number(reading.storageChange);
  const odo = isPresent(reading.otherDocumentedOutflows) ? Number(reading.otherDocumentedOutflows) : 0;

  // Unexplained Difference = Supplied - Consumed - StorageChange - Outflows
  const unexplainedDifference = ws - rc - sc - odo;
  const totalWaterInput = ws + (sc < 0 ? Math.abs(sc) : 0);

  let discrepancyPercentage = 0;
  if (totalWaterInput > 0) {
    discrepancyPercentage = (unexplainedDifference / totalWaterInput) * 100;
  }

  const roundedDiff = Math.round(unexplainedDifference);
  const roundedPercent = Number(discrepancyPercentage.toFixed(2));

  let classification = 'BALANCED';
  let severity = 'LOW';
  if (roundedPercent > 15 || roundedDiff > 15000) {
    classification = 'HIGH_DISCREPANCY';
    severity = 'HIGH';
  } else if (roundedPercent > 5) {
    classification = 'MODERATE_DISCREPANCY';
    severity = 'MEDIUM';
  }

  return {
    success: true,
    isComputable: true,
    unexplainedDifference: roundedDiff,
    discrepancyPercentage: roundedPercent,
    classification,
    severity,
    breakdown: {
      formula: 'Unexplained Difference = Water Supplied - Recorded Consumption - Storage Change - Other Documented Outflows',
      supplied: ws,
      consumed: rc,
      storageChange: sc,
      outflows: odo,
      result: roundedDiff
    }
  };
}
