/**
 * AquaGen: The Water Black Box
 * Demo Dataset & Scenarios
 *
 * Provides realistic utility operational datasets for North Hill, Central Metro, and Riverside Industrial zones.
 * Clearly identified as demonstration simulation data.
 */

export const INITIAL_ZONES = [
  {
    id: 'Z-NORTH',
    name: 'North Hill Distribution Zone',
    code: 'DMA-01-NH',
    supplySource: 'Clearview Mountain Reservoir & Booster Station',
    elevationRange: '310m - 440m',
    pipeLengthKm: 48.6,
    activeConnections: 3840,
    isCriticalZone: true,
    storageCapacityL: 450000,
    dailyBaselineLpd: 100000,
    status: 'Inspection Required',
    dataCompleteness: 98,
    description: 'High-elevation residential pressure zone feeding 14,000 residents and Clearview Regional Hospital. Steep terrain causes high static pressures (up to 6.2 bar).'
  },
  {
    id: 'Z-CENTRAL',
    name: 'Central Metro Urban District',
    code: 'DMA-02-CM',
    supplySource: 'East River Water Treatment Plant & Trunk Line A',
    elevationRange: '180m - 225m',
    pipeLengthKm: 72.1,
    activeConnections: 6420,
    isCriticalZone: false,
    storageCapacityL: 800000,
    dailyBaselineLpd: 160000,
    status: 'Under Review',
    dataCompleteness: 94,
    description: 'Dense commercial and medium-density residential grid. Contains legacy cast-iron mains interconnected with smart acoustic loggers.'
  },
  {
    id: 'Z-RIVERSIDE',
    name: 'Riverside Industrial Corridor',
    code: 'DMA-03-RIC',
    supplySource: 'Artesian Aquifer Wellfield #4 & Ground Reservoir',
    elevationRange: '120m - 150m',
    pipeLengthKm: 34.2,
    activeConnections: 910,
    isCriticalZone: false,
    storageCapacityL: 600000,
    dailyBaselineLpd: 75000,
    status: 'Normal',
    dataCompleteness: 82,
    description: 'Industrial manufacturing, food processing, and logistics hubs. Experiences large diurnal step changes and periodic fire suppression system test outflows.'
  }
];

export const INITIAL_READINGS = [
  // --- North Hill History ---
  {
    id: 'RD-NH-20261003',
    zoneId: 'Z-NORTH',
    date: '2026-10-03',
    waterSupplied: 102000,
    recordedConsumption: 98500,
    storageChange: 1200,
    otherDocumentedOutflows: 0,
    unexplainedDifference: 2300,
    discrepancyPercentage: 2.25,
    classification: 'BALANCED',
    severity: 'LOW',
    status: 'NORMAL',
    notes: 'Routine baseline operation.'
  },
  {
    id: 'RD-NH-20261004',
    zoneId: 'Z-NORTH',
    date: '2026-10-04',
    waterSupplied: 101500,
    recordedConsumption: 97800,
    storageChange: 800,
    otherDocumentedOutflows: 0,
    unexplainedDifference: 2900,
    discrepancyPercentage: 2.86,
    classification: 'BALANCED',
    severity: 'LOW',
    status: 'NORMAL',
    notes: 'Normal diurnal consumption pattern.'
  },
  {
    id: 'RD-NH-20261005',
    zoneId: 'Z-NORTH',
    date: '2026-10-05',
    waterSupplied: 104000,
    recordedConsumption: 88000,
    storageChange: 2000,
    otherDocumentedOutflows: 0,
    unexplainedDifference: 14000,
    discrepancyPercentage: 13.46,
    classification: 'MODERATE_DISCREPANCY',
    severity: 'MEDIUM',
    status: 'ANOMALY_DETECTED',
    notes: 'Night minimum flow rate elevated by 28%. First anomaly notification.'
  },
  {
    id: 'RD-NH-20261006',
    zoneId: 'Z-NORTH',
    date: '2026-10-06',
    waterSupplied: 108000,
    recordedConsumption: 81000,
    storageChange: 1500,
    otherDocumentedOutflows: 0,
    unexplainedDifference: 25500,
    discrepancyPercentage: 23.61,
    classification: 'HIGH_DISCREPANCY',
    severity: 'HIGH',
    status: 'INVESTIGATION_OPENED',
    notes: 'Persistent 25,500 L/day shortfall. Investigation INV-2026-0104 triggered.'
  },
  {
    id: 'RD-NH-20261007',
    zoneId: 'Z-NORTH',
    date: '2026-10-07',
    waterSupplied: 110000,
    recordedConsumption: 78000,
    storageChange: 4000,
    otherDocumentedOutflows: 0,
    unexplainedDifference: 28000,
    discrepancyPercentage: 25.45,
    classification: 'HIGH_DISCREPANCY',
    severity: 'HIGH',
    status: 'CREW_DISPATCHED',
    notes: 'Acoustic correlator deployed to Pine Avenue.'
  },
  {
    id: 'RD-NH-20261008',
    zoneId: 'Z-NORTH',
    date: '2026-10-08',
    waterSupplied: 105000,
    recordedConsumption: 79000,
    storageChange: 2500,
    otherDocumentedOutflows: 0,
    unexplainedDifference: 23500,
    discrepancyPercentage: 22.38,
    classification: 'HIGH_DISCREPANCY',
    severity: 'HIGH',
    status: 'REPAIR_SCHEDULED',
    notes: 'Leak pinpointed on 150mm ductile iron line near sub-station.'
  },
  {
    id: 'RD-NH-20261009',
    zoneId: 'Z-NORTH',
    date: '2026-10-09',
    waterSupplied: 101000,
    recordedConsumption: 96800,
    storageChange: 1800,
    otherDocumentedOutflows: 0,
    unexplainedDifference: 2400,
    discrepancyPercentage: 2.38,
    classification: 'BALANCED',
    severity: 'LOW',
    status: 'VERIFIED_POST_REPAIR',
    notes: 'Post-repair verification reading! Discrepancy dropped from 23,500 to 2,400 L/day.'
  },

  // --- Central Metro Urban District History ---
  {
    id: 'RD-CM-20261005',
    zoneId: 'Z-CENTRAL',
    date: '2026-10-05',
    waterSupplied: 162000,
    recordedConsumption: 156000,
    storageChange: 1500,
    otherDocumentedOutflows: 0,
    unexplainedDifference: 4500,
    discrepancyPercentage: 2.78,
    classification: 'BALANCED',
    severity: 'LOW',
    status: 'NORMAL',
    notes: 'Normal city grid water balance.'
  },
  {
    id: 'RD-CM-20261006',
    zoneId: 'Z-CENTRAL',
    date: '2026-10-06',
    waterSupplied: 160000,
    recordedConsumption: 154500,
    storageChange: 1200,
    otherDocumentedOutflows: 0,
    unexplainedDifference: 4300,
    discrepancyPercentage: 2.69,
    classification: 'BALANCED',
    severity: 'LOW',
    status: 'NORMAL',
    notes: 'Stable consumption.'
  },
  {
    id: 'RD-CM-20261007',
    zoneId: 'Z-CENTRAL',
    date: '2026-10-07',
    waterSupplied: 163000,
    recordedConsumption: 128000,
    storageChange: 2000,
    otherDocumentedOutflows: 0,
    unexplainedDifference: 33000,
    discrepancyPercentage: 20.25,
    classification: 'HIGH_DISCREPANCY',
    severity: 'HIGH',
    status: 'SUSPECTED_METER_FAULT',
    notes: 'Sudden 26,000 L/day drop in billing telemetry with no drop in grid pressure.'
  },
  {
    id: 'RD-CM-20261008',
    zoneId: 'Z-CENTRAL',
    date: '2026-10-08',
    waterSupplied: 161500,
    recordedConsumption: 125000,
    storageChange: 1800,
    otherDocumentedOutflows: 0,
    unexplainedDifference: 34700,
    discrepancyPercentage: 21.49,
    classification: 'HIGH_DISCREPANCY',
    severity: 'HIGH',
    status: 'UNDER_REVIEW',
    notes: 'Investigating whether district concentrator lost 40 AMR radio endpoints.'
  },
  {
    id: 'RD-CM-20261009',
    zoneId: 'Z-CENTRAL',
    date: '2026-10-09',
    waterSupplied: 162000,
    recordedConsumption: 127000,
    storageChange: 1500,
    otherDocumentedOutflows: 0,
    unexplainedDifference: 33500,
    discrepancyPercentage: 20.68,
    classification: 'HIGH_DISCREPANCY',
    severity: 'HIGH',
    status: 'UNDER_REVIEW',
    notes: 'Concentrator logs show battery failure on Commercial Zone repeater.'
  },

  // --- Riverside Industrial Corridor History ---
  {
    id: 'RD-RIC-20261006',
    zoneId: 'Z-RIVERSIDE',
    date: '2026-10-06',
    waterSupplied: 76000,
    recordedConsumption: 71000,
    storageChange: -3000, // Reservoir drained by 3,000 L to support manufacturing peak
    otherDocumentedOutflows: 5000, // Documented fire suppression testing
    unexplainedDifference: 3000, // 76000 - 71000 - (-3000) - 5000 = 3000
    discrepancyPercentage: 3.80,
    classification: 'BALANCED',
    severity: 'LOW',
    status: 'NORMAL',
    notes: 'Negative storage change (-3,000 L/day) correctly handled. Storage supplied extra volume.'
  },
  {
    id: 'RD-RIC-20261007',
    zoneId: 'Z-RIVERSIDE',
    date: '2026-10-07',
    waterSupplied: 74000,
    recordedConsumption: 70500,
    storageChange: 1200,
    otherDocumentedOutflows: 0,
    unexplainedDifference: 2300,
    discrepancyPercentage: 3.11,
    classification: 'BALANCED',
    severity: 'LOW',
    status: 'NORMAL',
    notes: 'Stable industrial day.'
  },
  {
    id: 'RD-RIC-20261008',
    zoneId: 'Z-RIVERSIDE',
    date: '2026-10-08',
    waterSupplied: 78000,
    recordedConsumption: 68000,
    storageChange: null, // MISSING DATA SIMULATION
    otherDocumentedOutflows: 0,
    unexplainedDifference: null,
    discrepancyPercentage: null,
    classification: 'UNCOMPUTABLE',
    severity: 'MEDIUM',
    status: 'TELEMETRY_DROPOUT',
    notes: 'Ultrasonic storage sensor dropped offline due to solar power inverter glitch.'
  },
  {
    id: 'RD-RIC-20261009',
    zoneId: 'Z-RIVERSIDE',
    date: '2026-10-09',
    waterSupplied: 75000,
    recordedConsumption: 71200,
    storageChange: 1500,
    otherDocumentedOutflows: 0,
    unexplainedDifference: 2300,
    discrepancyPercentage: 3.07,
    classification: 'BALANCED',
    severity: 'LOW',
    status: 'NORMAL',
    notes: 'Sensor restored after battery replacement.'
  }
];

export const INITIAL_INVESTIGATIONS = [
  {
    id: 'INV-2026-0104',
    zoneId: 'Z-NORTH',
    readingDate: '2026-10-07',
    readingId: 'RD-NH-20261007',
    title: 'Severe Acoustic Anomaly - Pine Avenue Main Distribution Pipe',
    unexplainedDifference: 28000,
    discrepancyPercentage: 25.45,
    priority: 'Critical',
    priorityReason: 'Discrepancy magnitude is severe (25.5% / 28,000 L/day); Persisted across 3 consecutive observation cycles; Zone classified as critical infrastructure corridor (Hospital feeder).',
    priorityScore: 95,
    status: 'Resolved',
    hypotheses: [
      { id: 'PHYSICAL_LEAK', name: 'Physical Network Leakage', status: 'CONFIRMED_CAUSE', notes: 'Ground penetrating radar & acoustic correlator detected shear crack on 150mm ductile iron joint.' },
      { id: 'METER_FAULT', name: 'Bulk Inlet Meter Under-registration', status: 'RULED_OUT', notes: 'Ultrasonic strap-on verification meter matched electromagnetic meter within 0.8%.' },
      { id: 'STORAGE_MEASUREMENT_ERROR', name: 'Clearview Tank Level Sensor Inaccuracy', status: 'RULED_OUT', notes: 'Manual dip tape calibration confirmed level within 5mm.' }
    ],
    evidenceNotes: 'Rapid rise in nocturnal minimum flow between 02:00 and 04:00 (from 8 m³/h baseline to 21 m³/h). No reported burst on surface. Suspected underground sandy soil sink.',
    recommendedNextAction: 'Excavate Pine Ave between 4th and 5th Street and install full-circle repair sleeve.',
    assignedOperator: 'Marco Torres (Senior Distribution Engineer)',
    inspections: [
      {
        id: 'INSP-01',
        timestamp: '2026-10-07T14:30:00Z',
        inspector: 'Marco Torres',
        type: 'Acoustic Leak Detection',
        findings: 'High-frequency vibration detected on hydrant H-142 and valve V-88. Peak correlation peak at 42m from H-142.',
        recommendation: 'Mark asphalt for vacuum excavation.'
      },
      {
        id: 'INSP-02',
        timestamp: '2026-10-08T10:15:00Z',
        inspector: 'Excavation Crew Beta (Lead: Dave Patel)',
        type: 'Physical Excavation & Joint Repair',
        findings: 'Longitudinal hairline crack along pipe bell. Water escaping into porous gravel bed directly into storm culvert without surfacing.',
        recommendation: 'Installed 150mm stainless steel wrap clamp. Backfilled and paved.'
      }
    ],
    beforeAfterComparison: {
      actionTaken: 'Repaired 150mm longitudinal bell fracture on Pine Avenue distribution main.',
      datePerformed: '2026-10-08',
      technician: 'Dave Patel & Crew Beta',
      beforeReadingId: 'RD-NH-20261008',
      afterReadingId: 'RD-NH-20261009',
      beforeDiff: 23500,
      afterDiff: 2400,
      beforePercent: 22.38,
      afterPercent: 2.38,
      volumetricDeltaLpd: -21100,
      relativeImprovementPercent: 89.8,
      outcomeCategory: 'IMPROVED',
      summary: 'Significant improvement: Discrepancy dropped from 23,500 L/day down to 2,400 L/day (89.8% reduction).'
    },
    outcome: 'Successful repair verified. Normal balance restored below 3% threshold.',
    resolutionNotes: 'Network returned to stable pressure. Before/after water balance confirmed 21,100 L/day recovered.',
    createdAt: '2026-10-06T09:12:00Z',
    updatedAt: '2026-10-09T16:45:00Z'
  },
  {
    id: 'INV-2026-0108',
    zoneId: 'Z-CENTRAL',
    readingDate: '2026-10-08',
    readingId: 'RD-CM-20261008',
    title: 'Discrepancy Investigation - Commercial District AMR Telemetry Dropout',
    unexplainedDifference: 34700,
    discrepancyPercentage: 21.49,
    priority: 'High',
    priorityReason: 'Discrepancy exceeds standard 15% operational threshold (21.5%); Volumetric difference exceeds 15,000 L/day (34,700 L/day); Multi-day continuous deviation observed (2 days).',
    priorityScore: 78,
    status: 'Inspection Required',
    hypotheses: [
      { id: 'METER_FAULT', name: 'Inlet or Customer Meter Fault / Telemetry Loss', status: 'LEADING_HYPOTHESIS', notes: 'AMR radio telemetry gateway on Plaza Tower is missing 40 commercial smart meters.' },
      { id: 'PHYSICAL_LEAK', name: 'Physical Leakage', status: 'UNVERIFIED', notes: 'No acoustic anomaly detected at district PRV stations.' },
      { id: 'UNRECORDED_CONSUMPTION', name: 'Unrecorded Consumption', status: 'HYPOTHESIS', notes: 'Check nearby construction site for unmetered hydrant connection.' }
    ],
    evidenceNotes: 'Recorded customer consumption dropped by 30,000 L/day abruptly on 2026-10-07. Inlet flow remained completely steady at 160k L/day. Step test showed no pressure drop.',
    recommendedNextAction: 'Dispatch metering electronics technician to inspect Plaza Tower AMR collector gateway antenna.',
    assignedOperator: 'Elena Rostova (Telemetry Specialist)',
    inspections: [
      {
        id: 'INSP-10',
        timestamp: '2026-10-08T15:00:00Z',
        inspector: 'Elena Rostova',
        type: 'Telemetry Gateway Diagnostics',
        findings: 'Gateway #CM-G04 battery dropped to 10.2V after solar charge regulator failure. 42 smart meters queued packets without transmitting.',
        recommendation: 'Replace charge controller and force packet re-transmission.'
      }
    ],
    beforeAfterComparison: null,
    outcome: null,
    resolutionNotes: null,
    createdAt: '2026-10-07T11:20:00Z',
    updatedAt: '2026-10-08T16:10:00Z'
  },
  {
    id: 'INV-2026-0112',
    zoneId: 'Z-RIVERSIDE',
    readingDate: '2026-10-08',
    readingId: 'RD-RIC-20261008',
    title: 'Data Quality Hold - Missing Storage Gauge Readings',
    unexplainedDifference: 0,
    discrepancyPercentage: 0,
    priority: 'Medium',
    priorityReason: 'Data completeness is only 82%. Priority is held at Medium until telemetry dropouts and sensor communication issues are resolved.',
    priorityScore: 45,
    status: 'Under Review',
    hypotheses: [
      { id: 'MISSING_DATA', name: 'Missing or Delayed Telemetry', status: 'CONFIRMED_CAUSE', notes: 'Ultrasonic tank transducer failed to transmit daily delta.' },
      { id: 'STORAGE_MEASUREMENT_ERROR', name: 'Reservoir Level Inaccuracy', status: 'HYPOTHESIS', notes: 'Check physical tank gauge.' }
    ],
    evidenceNotes: 'Water balance engine could not compute definitive balance for 2026-10-08 because storage change was absent.',
    recommendedNextAction: 'Enter manual dip reading from physical level sight gauge.',
    assignedOperator: 'Kavita Singh (Operations Lead)',
    inspections: [],
    beforeAfterComparison: null,
    outcome: null,
    resolutionNotes: null,
    createdAt: '2026-10-08T18:00:00Z',
    updatedAt: '2026-10-09T08:30:00Z'
  }
];

export const DEMO_SCENARIOS = {
  NORMAL: {
    id: 'NORMAL',
    name: 'Normal Water Balance',
    badge: 'Balanced Baseline',
    color: 'emerald',
    description: 'All 3 zones operate within expected acoustic tolerance (< 3.5% discrepancy). Normal diurnal consumption and steady reservoir operation.',
    focusZoneId: 'Z-NORTH',
    activeFilter: 'ALL',
    summaryMessage: 'System is healthy. Total utility balance reflects 2.4% discrepancy, well below the 5% investigation threshold.'
  },
  LARGE_DISCREPANCY: {
    id: 'LARGE_DISCREPANCY',
    name: 'Large Unexplained Discrepancy',
    badge: 'Severe Discrepancy (25.5%)',
    color: 'red',
    description: 'North Hill shows an acute 28,000 L/day (25.5%) discrepancy. High night-flow signature suggests a major distribution main failure.',
    focusZoneId: 'Z-NORTH',
    activeFilter: 'Z-NORTH',
    summaryMessage: 'Critical alert: 28,000 L/day unaccounted for in North Hill. Investigation INV-2026-0104 prioritized for emergency field acoustic sweep.'
  },
  METER_FAULT: {
    id: 'METER_FAULT',
    name: 'Possible District Meter Fault',
    badge: 'Suspected Meter Anomaly',
    color: 'amber',
    description: 'Central Metro shows an abrupt 34,700 L/day discrepancy caused by telemetry packet loss at an AMR commercial concentrator rather than a physical burst.',
    focusZoneId: 'Z-CENTRAL',
    activeFilter: 'Z-CENTRAL',
    summaryMessage: 'Telemetry diagnosis: Grid pressure is stable, but 42 commercial meters failed to report. Suspected instrumentation issue rather than physical loss.'
  },
  MISSING_DATA: {
    id: 'MISSING_DATA',
    name: 'Missing & Incomplete Data',
    badge: 'Data Completeness Gap',
    color: 'indigo',
    description: 'Riverside Industrial reservoir sensor experienced an offline communication dropout. Calculation engine holds definitive computation to prevent phantom dispatch.',
    focusZoneId: 'Z-RIVERSIDE',
    activeFilter: 'Z-RIVERSIDE',
    summaryMessage: 'Data quality guardrail active: Storage reading missing for Oct 8. AquaGen flagged data gap rather than fabricating a discrepancy.'
  },
  PERSISTENT_LOSS: {
    id: 'PERSISTENT_LOSS',
    name: 'Repeated Multi-Day Discrepancy',
    badge: 'Persistent Deviation',
    color: 'orange',
    description: 'North Hill zone exhibits elevated unexplained difference across 4 consecutive days (Oct 5 - Oct 8), escalating priority from High to Critical.',
    focusZoneId: 'Z-NORTH',
    activeFilter: 'Z-NORTH',
    summaryMessage: 'Persistence engine: Discrepancy sustained for 4 straight days. Cumulative volume lost exceeds 90,000 Litres.'
  },
  BEFORE_AFTER: {
    id: 'BEFORE_AFTER',
    name: 'Before-and-After Verification',
    badge: 'Post-Repair Audit',
    color: 'cyan',
    description: 'Verification of repair on Pine Avenue: Pre-repair discrepancy of 23,500 L/day dropped to 2,400 L/day post-repair (89.8% verified reduction).',
    focusZoneId: 'Z-NORTH',
    activeFilter: 'Z-NORTH',
    summaryMessage: 'Verification successful: Repair of 150mm main joint recovered 21,100 L/day. Discrepancy returned to normal baseline.'
  }
};
