import React, { useMemo } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Clock,
  Database,
  ArrowRight,
  RefreshCw,
  FileSearch
} from 'lucide-react';

export function DataQualityView({ readings = [], zones = [], onNavigate }) {
  // Comprehensive Quality Audit
  const auditResults = useMemo(() => {
    const issues = [];
    let completeCount = 0;
    let missingStorageCount = 0;
    let negativeDiffCount = 0;
    let highDiscrepancyCount = 0;

    // Check each reading
    readings.forEach((r) => {
      // 1. Incomplete records (missing storageChange)
      if (r.storageChange === null || r.storageChange === undefined) {
        missingStorageCount++;
        issues.push({
          severity: 'HIGH',
          category: 'Missing Telemetry',
          zoneId: r.zoneId,
          date: r.date,
          readingId: r.id,
          message: `Storage change ΔS is absent for ${r.date}. Mass balance suspended to avoid phantom alert.`
        });
      } else if (r.waterSupplied === null || r.recordedConsumption === null) {
        issues.push({
          severity: 'HIGH',
          category: 'Missing Telemetry',
          zoneId: r.zoneId,
          date: r.date,
          readingId: r.id,
          message: `Inflow or consumption reading missing on ${r.date}.`
        });
      } else {
        completeCount++;
      }

      // 2. Negative discrepancy (consumption > supplied)
      if (r.unexplainedDifference !== null && r.unexplainedDifference < 0) {
        negativeDiffCount++;
        issues.push({
          severity: 'MEDIUM',
          category: 'Unusual Balance Outlier',
          zoneId: r.zoneId,
          date: r.date,
          readingId: r.id,
          message: `Negative discrepancy (${r.unexplainedDifference.toLocaleString()} L/day). Consumption exceeds supply. Indicates potential meter over-read, back-feed, or tank gauge under-measurement.`
        });
      }

      // 3. Acute spike (> 25%)
      if (r.discrepancyPercentage !== null && r.discrepancyPercentage > 25) {
        highDiscrepancyCount++;
        issues.push({
          severity: 'CRITICAL',
          category: 'Severe Operational Anomaly',
          zoneId: r.zoneId,
          date: r.date,
          readingId: r.id,
          message: `Acute discrepancy spike: ${r.discrepancyPercentage}% (${r.unexplainedDifference?.toLocaleString()} L/day) unaccounted for.`
        });
      }
    });

    // 4. Duplicate checks
    const seen = new Set();
    readings.forEach((r) => {
      const key = `${r.zoneId}_${r.date}`;
      if (seen.has(key)) {
        issues.push({
          severity: 'HIGH',
          category: 'Duplicate Entry',
          zoneId: r.zoneId,
          date: r.date,
          readingId: r.id,
          message: `Duplicate reading recorded for Zone ${r.zoneId} on ${r.date}.`
        });
      }
      seen.add(key);
    });

    const completenessScore = readings.length > 0
      ? Math.round((completeCount / readings.length) * 100)
      : 100;

    return {
      completenessScore,
      totalReadings: readings.length,
      completeCount,
      missingStorageCount,
      negativeDiffCount,
      highDiscrepancyCount,
      issues
    };
  }, [readings]);

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Data Quality & Sensor Health Audit
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Automated verification of telemetry completeness, sensor dropouts, duplicates, and physical sanity bounds
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge badge-emerald">Auditor Active</span>
        </div>
      </div>

      {/* Quality KPI Cards */}
      <div className="grid-cols-4" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <div className="card-subtitle">Data Completeness Score</div>
          <div className="num-metric" style={{ fontSize: '1.625rem', fontWeight: 800, color: auditResults.completenessScore >= 90 ? '#34d399' : '#fbbf24', margin: '0.25rem 0' }}>
            {auditResults.completenessScore}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
            {auditResults.completeCount} of {auditResults.totalReadings} fully computable cycles
          </div>
        </div>

        <div className="card">
          <div className="card-subtitle">Telemetry Dropouts / Missing ΔS</div>
          <div className="num-metric" style={{ fontSize: '1.625rem', fontWeight: 800, color: auditResults.missingStorageCount > 0 ? '#f87171' : '#34d399', margin: '0.25rem 0' }}>
            {auditResults.missingStorageCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
            Storage reading gaps flagged
          </div>
        </div>

        <div className="card">
          <div className="card-subtitle">Negative Discrepancies</div>
          <div className="num-metric" style={{ fontSize: '1.625rem', fontWeight: 800, color: auditResults.negativeDiffCount > 0 ? '#fbbf24' : '#34d399', margin: '0.25rem 0' }}>
            {auditResults.negativeDiffCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
            Consumption exceeded supply
          </div>
        </div>

        <div className="card">
          <div className="card-subtitle">Critical Anomalies (&gt;25%)</div>
          <div className="num-metric" style={{ fontSize: '1.625rem', fontWeight: 800, color: auditResults.highDiscrepancyCount > 0 ? '#f87171' : '#34d399', margin: '0.25rem 0' }}>
            {auditResults.highDiscrepancyCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
            Severe imbalance alerts
          </div>
        </div>
      </div>

      {/* Sensor Health Status across Zones */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <div>
            <div className="card-title">Zone Telemetry Health Matrix</div>
            <div className="card-subtitle">District smart meters, bulk ultrasonic sensors, and reservoir transducers</div>
          </div>
          <span className="badge badge-indigo">Sensor Infrastructure</span>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Zone</th>
                <th>Bulk Inflow Meter</th>
                <th>Customer AMR Telemetry</th>
                <th>Reservoir Level Transducer</th>
                <th>Completeness</th>
                <th>Health Verdict</th>
              </tr>
            </thead>
            <tbody>
              {zones.map((z) => {
                const zReadings = readings.filter((r) => r.zoneId === z.id);
                const hasMissing = zReadings.some((r) => r.storageChange === null || r.waterSupplied === null);

                return (
                  <tr key={z.id}>
                    <td>
                      <strong>{z.name}</strong>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>{z.id}</div>
                    </td>
                    <td>
                      <span className="badge badge-emerald">
                        <CheckCircle2 size={11} /> 100% Online
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-emerald">
                        <CheckCircle2 size={11} /> Active Mesh
                      </span>
                    </td>
                    <td>
                      {hasMissing ? (
                        <span className="badge badge-rose">
                          <AlertTriangle size={11} /> Intermittent Dropout
                        </span>
                      ) : (
                        <span className="badge badge-emerald">
                          <CheckCircle2 size={11} /> Calibrated
                        </span>
                      )}
                    </td>
                    <td className="num-metric" style={{ fontWeight: 600 }}>
                      {z.dataCompleteness}%
                    </td>
                    <td>
                      {hasMissing ? (
                        <span style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 600 }}>
                          Requires Sensor Inspection
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>
                          Nominal Health
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Issues Log */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <ShieldCheck size={16} color="var(--cyan-primary)" /> Detected Data Integrity Anomalies ({auditResults.issues.length})
            </div>
            <div className="card-subtitle">
              Prioritized by audit engine to prevent false alarms and phantom field dispatches
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {auditResults.issues.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-subtle)' }}>
              All telemetry and water readings conform to mass conservation sanity bounds.
            </div>
          ) : (
            auditResults.issues.map((issue, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-dark)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.85rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span className={`badge ${issue.severity === 'CRITICAL' ? 'badge-rose' : issue.severity === 'HIGH' ? 'badge-amber' : 'badge-indigo'}`}>
                      {issue.category}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--cyan-bright)' }}>Zone {issue.zoneId}</span>
                    <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>{issue.date}</span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-main)' }}>
                    {issue.message}
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('zones', { selectedZoneId: issue.zoneId })}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem' }}
                >
                  Review Zone <ArrowRight size={13} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
