import React, { useState, useMemo } from 'react';
import {
  PlusCircle,
  Calculator,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Info,
  ArrowRight,
  Database,
  Calendar,
  Layers
} from 'lucide-react';
import { calculateWaterBalance } from '../core/waterBalanceEngine.js';
import { apiService } from '../services/api.js';

export function AddReadingView({ zones = [], readings = [], prefillZoneId, onReadingAdded, onNavigate }) {
  const [formData, setFormData] = useState({
    zoneId: prefillZoneId || (zones[0]?.id ?? 'Z-NORTH'),
    date: new Date().toISOString().slice(0, 10),
    waterSupplied: '100000',
    recordedConsumption: '78000',
    storageChange: '2000',
    otherDocumentedOutflows: '0',
    notes: 'Daily district balance intake.'
  });

  const [submissionStatus, setSubmissionStatus] = useState({ loading: false, error: null, success: null });

  // Live calculation preview
  const liveCalculation = useMemo(() => {
    return calculateWaterBalance(formData);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionStatus({ loading: true, error: null, success: null });

    try {
      const res = await apiService.addReading(formData);
      setSubmissionStatus({
        loading: false,
        error: null,
        success: {
          reading: res.reading,
          balance: res.balance,
          investigation: res.createdInvestigation
        }
      });
      if (onReadingAdded) {
        onReadingAdded();
      }
    } catch (err) {
      setSubmissionStatus({ loading: false, error: err.message, success: null });
    }
  };

  return (
    <div className="page-wrapper" style={{ maxWidth: '1100px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
          Record Daily Water Reading
        </h1>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          Enter bulk supply, customer consumption, storage changes, and documented outflows with live balance validation
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Form Container */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <form onSubmit={handleSubmit}>
            {/* Zone & Date */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="reading-zone">
                  <Layers size={13} style={{ display: 'inline', marginRight: '4px' }} />
                  Supply Zone (DMA) *
                </label>
                <select
                  id="reading-zone"
                  name="zoneId"
                  value={formData.zoneId}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name} ({z.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reading-date">
                  <Calendar size={13} style={{ display: 'inline', marginRight: '4px' }} />
                  Reading Date *
                </label>
                <input
                  id="reading-date"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            {/* Water Supplied */}
            <div className="form-group">
              <label className="form-label" htmlFor="reading-supplied">
                Water Supplied (L/day) *
              </label>
              <input
                id="reading-supplied"
                type="number"
                name="waterSupplied"
                value={formData.waterSupplied}
                onChange={handleChange}
                placeholder="e.g. 100000"
                min="0"
                step="1"
                className="form-input font-mono"
                required
              />
              <div className="form-hint">
                Total volumetric inflow measured by bulk electromagnetic/ultrasonic district meter.
              </div>
            </div>

            {/* Recorded Consumption */}
            <div className="form-group">
              <label className="form-label" htmlFor="reading-consumption">
                Recorded Customer Consumption (L/day) *
              </label>
              <input
                id="reading-consumption"
                type="number"
                name="recordedConsumption"
                value={formData.recordedConsumption}
                onChange={handleChange}
                placeholder="e.g. 78000"
                min="0"
                step="1"
                className="form-input font-mono"
                required
              />
              <div className="form-hint">
                Aggregated smart meter and billed automatic meter reading (AMR) telemetry.
              </div>
            </div>

            {/* Storage Change (Reservoir Level) */}
            <div className="form-group">
              <label className="form-label" htmlFor="reading-storage">
                Storage Change ΔS (L/day) *
              </label>
              <input
                id="reading-storage"
                type="number"
                name="storageChange"
                value={formData.storageChange}
                onChange={handleChange}
                placeholder="e.g. 2000 (positive for tank fill, negative for tank drain)"
                step="1"
                className="form-input font-mono"
                required
              />
              <div className="form-hint" style={{ color: 'var(--text-muted)' }}>
                <strong>Important:</strong> Enter <span style={{ color: 'var(--emerald-success)' }}>positive</span> if storage increased (+ΔS). Enter <span style={{ color: 'var(--cyan-bright)' }}>negative</span> if storage decreased (-ΔS, releasing water into the network). Enter 0 if no net change.
              </div>
            </div>

            {/* Other Documented Outflows */}
            <div className="form-group">
              <label className="form-label" htmlFor="reading-outflows">
                Other Documented Outflows (L/day)
              </label>
              <input
                id="reading-outflows"
                type="number"
                name="otherDocumentedOutflows"
                value={formData.otherDocumentedOutflows}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="1"
                className="form-input font-mono"
              />
              <div className="form-hint">
                Authorized unbilled usage: fire hydrant flow tests, main scouring, or construction water.
              </div>
            </div>

            {/* Operational Notes */}
            <div className="form-group">
              <label className="form-label" htmlFor="reading-notes">
                Operator Notes
              </label>
              <textarea
                id="reading-notes"
                name="notes"
                rows="2"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any operational conditions, weather events, or telemetry anomalies..."
                className="form-textarea"
              />
            </div>

            {/* Validation / Error alerts */}
            {submissionStatus.error && (
              <div className="alert-banner alert-rose">
                <AlertTriangle size={16} /> {submissionStatus.error}
              </div>
            )}

            {submissionStatus.success && (
              <div className="alert-banner alert-emerald">
                <CheckCircle2 size={16} /> Reading recorded successfully!
                {submissionStatus.success.investigation && (
                  <span style={{ marginLeft: '0.5rem', fontWeight: 600 }}>
                    High discrepancy detected: Investigation {submissionStatus.success.investigation.id} created.
                  </span>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button
                type="button"
                onClick={() => setFormData({
                  zoneId: zones[0]?.id || 'Z-NORTH',
                  date: new Date().toISOString().slice(0, 10),
                  waterSupplied: '100000',
                  recordedConsumption: '72000',
                  storageChange: '8000',
                  otherDocumentedOutflows: '0',
                  notes: 'Standard sample benchmark reading.'
                })}
                className="btn btn-secondary btn-sm"
              >
                Load Benchmark Values
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submissionStatus.loading || !liveCalculation.isComputable}
              >
                {submissionStatus.loading ? 'Recording...' : 'Commit Water Reading'}
              </button>
            </div>
          </form>
        </div>

        {/* Live Calculation Preview & Transparency Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-card-subtle)', borderColor: liveCalculation.isComputable ? 'var(--border-medium)' : 'rgba(239, 68, 68, 0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calculator size={18} color="var(--cyan-primary)" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Live Arithmetic Preview</h3>
              </div>
              <span className={`badge ${liveCalculation.isComputable ? 'badge-cyan' : 'badge-rose'}`}>
                {liveCalculation.isComputable ? 'Computable' : 'Incomplete Data'}
              </span>
            </div>

            {liveCalculation.isComputable ? (
              <div>
                <div style={{ background: 'var(--bg-dark)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Calculated Unexplained Difference</div>
                  <div className="num-metric" style={{ fontSize: '1.75rem', fontWeight: 800, color: liveCalculation.severity === 'HIGH' ? '#f87171' : liveCalculation.severity === 'MEDIUM' ? '#fbbf24' : '#34d399' }}>
                    {liveCalculation.unexplainedDifference?.toLocaleString()} L/day
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Discrepancy Percentage: <strong style={{ color: '#ffffff' }}>{liveCalculation.discrepancyPercentage}%</strong> of available supply
                  </div>
                </div>

                <div style={{ fontSize: '0.8125rem', marginBottom: '0.75rem' }}>
                  <strong>Arithmetic Evaluation:</strong>
                  <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--cyan-bright)', background: 'var(--bg-dark)', padding: '0.5rem', borderRadius: '4px', marginTop: '0.25rem' }}>
                    {liveCalculation.breakdown?.steps[4]?.calculationText} = {liveCalculation.unexplainedDifference?.toLocaleString()} L/d
                  </div>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', lineHeight: 1.4 }}>
                  {liveCalculation.message}
                </div>
              </div>
            ) : (
              <div style={{ color: '#f87171', fontSize: '0.8125rem' }}>
                <strong>Calculation suspended:</strong>
                <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
                  {liveCalculation.validationErrors?.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Transparent Storage Explanation Card */}
          <div className="card" style={{ padding: '1.25rem', fontSize: '0.775rem', color: 'var(--text-muted)' }}>
            <div style={{ fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Info size={14} color="var(--cyan-primary)" /> Understanding Storage Change (ΔS)
            </div>
            <p style={{ marginBottom: '0.5rem' }}>
              When a reservoir level decreases by 5,000 L/day, enter <code>-5000</code>. In the formula:
            </p>
            <div className="font-mono" style={{ background: 'var(--bg-dark)', padding: '0.4rem 0.6rem', borderRadius: '4px', color: 'var(--cyan-bright)', marginBottom: '0.5rem' }}>
              Supplied - Consumed - (-5,000) - Outflows
            </div>
            <p>
              The double negative mathematically adds 5,000 L to the supply pool, correctly reflecting that water stored on previous days was released into customer taps.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
