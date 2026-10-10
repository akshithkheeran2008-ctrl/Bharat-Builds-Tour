import React from 'react';
import { X, Calculator, ShieldAlert, ArrowRight, HelpCircle } from 'lucide-react';

export function FormulaBreakdownModal({ isOpen, onClose, reading }) {
  if (!isOpen) return null;

  // Defaults if no specific reading passed
  const waterSupplied = reading?.waterSupplied ?? 100000;
  const recordedConsumption = reading?.recordedConsumption ?? 72000;
  const storageChange = reading?.storageChange ?? 8000;
  const otherDocumentedOutflows = reading?.otherDocumentedOutflows ?? 0;

  // Exact arithmetic
  const unexplainedDifference = waterSupplied - recordedConsumption - storageChange - otherDocumentedOutflows;
  const totalWaterAvailable = waterSupplied + (storageChange < 0 ? Math.abs(storageChange) : 0);
  const discrepancyPercent = totalWaterAvailable > 0
    ? Number(((unexplainedDifference / totalWaterAvailable) * 100).toFixed(2))
    : 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px', padding: '1.75rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              padding: '0.45rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--cyan-glow)',
              color: 'var(--cyan-bright)'
            }}>
              <Calculator size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Transparent Water-Balance Arithmetic</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mass-conservation audit trail and arithmetic evaluation</p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.5rem' }}>
            <X size={16} />
          </button>
        </div>

        {/* The Fundamental Equation Box */}
        <div style={{
          backgroundColor: 'var(--bg-dark)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-md)',
          padding: '1.1rem',
          marginBottom: '1.25rem'
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            Governing Water-Balance Formula
          </div>
          <div className="font-mono" style={{ fontSize: '0.9375rem', color: 'var(--cyan-bright)', fontWeight: 600, lineHeight: 1.5 }}>
            Unexplained Difference = Water Supplied - Recorded Consumption - Increase in Storage - Other Documented Outflows
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            Consistent Units: Litres per Day (L/day) across all mass conservation terms.
          </div>
        </div>

        {/* Step-by-Step Breakdown Table */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            Arithmetic Breakdown for {reading?.zoneId ? `Zone ${reading.zoneId} (${reading.date || 'Active Cycle'})` : 'Current Observation'}
          </div>

          <table className="table" style={{ fontSize: '0.8125rem' }}>
            <tbody>
              <tr>
                <td style={{ color: 'var(--text-muted)' }}>1. Water Supplied (Bulk Transmission Inflow)</td>
                <td className="num-metric font-mono" style={{ textAlign: 'right', fontWeight: 600, color: '#38bdf8' }}>
                  +{waterSupplied.toLocaleString()} L/day
                </td>
              </tr>
              <tr>
                <td style={{ color: 'var(--text-muted)' }}>2. Recorded Consumption (Customer Billing & AMR)</td>
                <td className="num-metric font-mono" style={{ textAlign: 'right', fontWeight: 600, color: '#f87171' }}>
                  -{recordedConsumption.toLocaleString()} L/day
                </td>
              </tr>
              <tr>
                <td style={{ color: 'var(--text-muted)' }}>
                  3. Storage Change (Reservoir Level Δ)
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                    {storageChange > 0
                      ? `Storage increased by ${storageChange.toLocaleString()} L (water stored in reservoir, subtracted from delivery)`
                      : storageChange < 0
                      ? `Storage decreased by ${Math.abs(storageChange).toLocaleString()} L (tank drained into network: -(-ΔS) = +${Math.abs(storageChange).toLocaleString()} L added to supply)`
                      : 'Storage held constant (0 L change)'}
                  </div>
                </td>
                <td className="num-metric font-mono" style={{ textAlign: 'right', fontWeight: 600, color: storageChange > 0 ? '#f87171' : storageChange < 0 ? '#34d399' : 'var(--text-muted)' }}>
                  {storageChange > 0 ? `-${storageChange.toLocaleString()}` : storageChange < 0 ? `+${Math.abs(storageChange).toLocaleString()}` : '0'} L/day
                </td>
              </tr>
              <tr>
                <td style={{ color: 'var(--text-muted)' }}>4. Other Documented Outflows (Hydrant flushing, main scouring)</td>
                <td className="num-metric font-mono" style={{ textAlign: 'right', fontWeight: 600, color: otherDocumentedOutflows > 0 ? '#f87171' : 'var(--text-muted)' }}>
                  -{otherDocumentedOutflows.toLocaleString()} L/day
                </td>
              </tr>
              <tr style={{ backgroundColor: 'rgba(14, 165, 233, 0.08)', fontWeight: 700 }}>
                <td style={{ color: 'var(--cyan-bright)' }}>= Unexplained Difference (Remaining Discrepancy)</td>
                <td className="num-metric font-mono" style={{ textAlign: 'right', fontSize: '1rem', color: unexplainedDifference > 15000 ? '#f87171' : 'var(--cyan-bright)' }}>
                  {unexplainedDifference.toLocaleString()} L/day
                </td>
              </tr>
              <tr style={{ backgroundColor: 'rgba(14, 165, 233, 0.04)' }}>
                <td style={{ color: 'var(--text-muted)' }}>Discrepancy Percentage (% of available supply)</td>
                <td className="num-metric font-mono" style={{ textAlign: 'right', fontWeight: 700, color: discrepancyPercent > 15 ? '#f87171' : discrepancyPercent > 5 ? '#fbbf24' : '#34d399' }}>
                  {discrepancyPercent}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Scientific Principle & Operational Disclaimer */}
        <div style={{
          backgroundColor: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1rem',
          display: 'flex',
          gap: '0.75rem',
          fontSize: '0.775rem',
          color: '#c7d2fe',
          lineHeight: 1.5
        }}>
          <ShieldAlert size={20} color="#818cf8" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Operational Principle:</strong> An unexplained discrepancy is a signal for field investigation, not automatic proof of physical leakage. Differences may arise from:
            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.25rem' }}>
              <li>Customer or bulk meter calibration drift / under-registration</li>
              <li>Unauthorized unmetered connections or unbilled municipal fire draws</li>
              <li>Reservoir ultrasonic level gauge turbulence or transducer drift</li>
              <li>Delayed telemetry transmission packets or meter communication dropouts</li>
              <li>Physical distribution network bursts or joint fissures</li>
            </ul>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
          <button onClick={onClose} className="btn btn-primary btn-sm">
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
}
