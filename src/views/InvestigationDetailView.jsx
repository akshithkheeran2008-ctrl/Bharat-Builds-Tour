import React, { useState } from 'react';
import {
  ArrowLeft,
  FileSearch,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Calendar,
  Layers,
  HelpCircle,
  FileText,
  Activity,
  Plus,
  ArrowRight,
  TrendingDown,
  Info,
  ShieldCheck
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { INVESTIGATION_STATUSES } from '../core/prioritization.js';
import { compareBeforeAndAfter } from '../core/beforeAfterEngine.js';
import { apiService } from '../services/api.js';

export function InvestigationDetailView({
  investigationId,
  investigations = [],
  readings = [],
  zones = [],
  onBack,
  onInvestigationUpdated
}) {
  const investigation = investigations.find((i) => i.id === investigationId) || null;

  // New Inspection note modal/form state
  const [showAddInspectionModal, setShowAddInspectionModal] = useState(false);
  const [newInspection, setNewInspection] = useState({
    inspector: 'Marco Torres (Senior Distribution Engineer)',
    type: 'Acoustic Correlator & Step Test',
    findings: 'Leak noise correlated on joint between hydrant H-142 and valve V-88.',
    recommendation: 'Mark asphalt for vacuum excavation and sleeve installation.'
  });

  // Before & After Verification form state
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyForm, setVerifyForm] = useState({
    actionTaken: 'Repaired 150mm ductile iron joint fracture on Pine Avenue',
    technician: 'Dave Patel & Field Crew Beta',
    beforeReadingId: investigation?.readingId || readings.find((r) => r.zoneId === investigation?.zoneId)?.id || '',
    afterReadingId: readings.find((r) => r.zoneId === investigation?.zoneId && r.unexplainedDifference !== null && r.id !== investigation?.readingId)?.id || ''
  });

  if (!investigation) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h2>Investigation not found</h2>
        <button onClick={onBack} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          <ArrowLeft size={16} /> Back to Investigations
        </button>
      </div>
    );
  }

  const zone = zones.find((z) => z.id === investigation.zoneId);
  const zoneReadings = readings.filter((r) => r.zoneId === investigation.zoneId);

  // Status update handler
  const handleStatusChange = async (newStatus) => {
    try {
      await apiService.updateInvestigation(investigation.id, { status: newStatus });
      if (onInvestigationUpdated) onInvestigationUpdated();
    } catch (err) {
      alert(`Error updating status: ${err.message}`);
    }
  };

  // Add Inspection Note
  const handleAddInspection = async (e) => {
    e.preventDefault();
    try {
      await apiService.addInspection(investigation.id, newInspection);
      setShowAddInspectionModal(false);
      if (onInvestigationUpdated) onInvestigationUpdated();
    } catch (err) {
      alert(`Error logging inspection: ${err.message}`);
    }
  };

  // Run Before & After Verification
  const handleRunVerification = async (e) => {
    e.preventDefault();
    try {
      await apiService.recordBeforeAfterComparison(investigation.id, verifyForm);
      setShowVerifyModal(false);
      if (onInvestigationUpdated) onInvestigationUpdated();
    } catch (err) {
      alert(`Error recording verification: ${err.message}`);
    }
  };

  const comparison = investigation.beforeAfterComparison;

  return (
    <div className="page-wrapper">
      {/* Top Navigation & Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
          <button onClick={onBack} className="btn btn-secondary btn-sm" style={{ marginTop: '0.2rem' }}>
            <ArrowLeft size={15} /> All Cases
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="font-mono" style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--cyan-bright)' }}>
                {investigation.id}
              </span>
              <span className="badge badge-cyan">{investigation.zoneId}</span>
              <StatusBadge status={investigation.priority} type="priority" />
              <StatusBadge status={investigation.status} />
            </div>
            <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#ffffff', marginTop: '0.25rem' }}>
              {investigation.title}
            </h1>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Registered on {investigation.readingDate} • Assigned to <strong>{investigation.assignedOperator}</strong>
            </div>
          </div>
        </div>

        {/* Status Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Case Status:</span>
          <select
            value={investigation.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="form-select"
            style={{ width: '170px', padding: '0.35rem 0.65rem', fontSize: '0.8125rem' }}
          >
            {INVESTIGATION_STATUSES.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Triage Rationale Alert Banner */}
      <div className="alert-banner alert-amber" style={{ marginBottom: '1.25rem' }}>
        <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>
            Triage Prioritization Reason ({investigation.priority} Priority):
          </div>
          <div style={{ fontSize: '0.8125rem', marginTop: '0.15rem' }}>
            {investigation.priorityReason}
          </div>
          <div style={{ fontSize: '0.75rem', marginTop: '0.35rem', color: '#fef3c7' }}>
            <strong>Recommended Next Action:</strong> {investigation.recommendedNextAction}
          </div>
        </div>
      </div>

      {/* Grid: Case Details & Hypotheses */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Left: Observations & Evidence */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <FileText size={16} color="var(--cyan-primary)" /> Evidence & Observations
            </div>
            <span className="badge badge-cyan">Discrepancy: {investigation.discrepancyPercentage}%</span>
          </div>

          <div style={{ background: 'var(--bg-dark)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>Observed Volumetric Difference</div>
                <div className="num-metric" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f87171' }}>
                  {investigation.unexplainedDifference?.toLocaleString()} L/day
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>Discrepancy Relative to Supply</div>
                <div className="num-metric" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f87171' }}>
                  {investigation.discrepancyPercentage}%
                </div>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.8125rem', color: 'var(--text-main)', lineHeight: 1.6, marginBottom: '1rem' }}>
            <strong>Telemetry & Grid Notes:</strong>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {investigation.evidenceNotes}
            </p>
          </div>

          {investigation.outcome && (
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
              <strong style={{ fontSize: '0.8125rem', color: 'var(--emerald-success)' }}>Investigation Outcome & Resolution:</strong>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {investigation.outcome}
              </p>
            </div>
          )}
        </div>

        {/* Right: Working Hypotheses Catalog */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <HelpCircle size={16} color="var(--cyan-primary)" /> Working Hypotheses
              </div>
              <div className="card-subtitle">Hypotheses remain unverified until physical inspection</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {investigation.hypotheses?.map((h) => (
              <div
                key={h.id}
                style={{
                  background: 'var(--bg-dark)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#ffffff' }}>{h.name}</span>
                  <StatusBadge status={h.status} type="hypothesis" />
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                  {h.notes}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 8: BEFORE-AND-AFTER VERIFICATION (The Differentiating Feature) */}
      <div className="card" style={{ marginBottom: '1.5rem', borderColor: comparison ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-medium)' }}>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              padding: '0.45rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: comparison ? 'var(--emerald-bg)' : 'var(--cyan-glow)',
              color: comparison ? 'var(--emerald-success)' : 'var(--cyan-bright)'
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="card-title" style={{ fontSize: '1.125rem' }}>
                Before-and-After Verification
              </div>
              <div className="card-subtitle">
                Compare pre-intervention water balance with post-repair readings to audit volumetric recovery
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowVerifyModal(true)}
            className="btn btn-primary btn-sm"
          >
            {comparison ? 'Re-audit Comparison' : '+ Run Before/After Comparison'}
          </button>
        </div>

        {comparison ? (
          <div>
            {/* Outcome Banner */}
            <div className={`alert-banner ${comparison.outcomeCategory === 'IMPROVED' ? 'alert-emerald' : comparison.outcomeCategory === 'WORSENED' ? 'alert-rose' : 'alert-cyan'}`} style={{ marginBottom: '1.25rem' }}>
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <div>
                <strong>Outcome: {comparison.outcomeCategory}</strong> — {comparison.summary}
                <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', opacity: 0.9 }}>
                  Corrective Action: <strong>{comparison.actionTaken}</strong> by {comparison.technician}
                </div>
              </div>
            </div>

            {/* Comparison Metrics Grid & Chart */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem', alignItems: 'center' }}>
              {/* Metrics Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ background: 'var(--bg-dark)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-subtle)' }}>Pre-Intervention Discrepancy</div>
                  <div className="num-metric" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f87171' }}>
                    {comparison.beforeDiff?.toLocaleString()} L/day ({comparison.beforePercent}%)
                  </div>
                </div>

                <div style={{ background: 'var(--bg-dark)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-subtle)' }}>Post-Intervention Discrepancy</div>
                  <div className="num-metric" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#34d399' }}>
                    {comparison.afterDiff?.toLocaleString()} L/day ({comparison.afterPercent}%)
                  </div>
                </div>

                <div style={{ background: 'var(--bg-dark)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-subtle)' }}>Net Volumetric Reduction (Water Saved)</div>
                  <div className="num-metric" style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--cyan-bright)' }}>
                    {Math.abs(comparison.volumetricDeltaLpd || 0).toLocaleString()} L/day
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--emerald-success)' }}>
                    {comparison.relativeImprovementPercent}% relative discrepancy reduction
                  </div>
                </div>
              </div>

              {/* Comparative Bar Chart */}
              <div style={{ height: '240px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { stage: 'Pre-Repair', Discrepancy: Math.max(0, comparison.beforeDiff || 0) },
                      { stage: 'Post-Repair', Discrepancy: Math.max(0, comparison.afterDiff || 0) }
                    ]}
                    margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                    <XAxis dataKey="stage" stroke="var(--text-subtle)" />
                    <YAxis stroke="var(--text-subtle)" tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: '4px' }}
                      formatter={(val) => [`${Number(val).toLocaleString()} L/day`, 'Discrepancy']}
                    />
                    <Bar dataKey="Discrepancy" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Scientific Caveat */}
            <div style={{
              backgroundColor: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.75rem 1rem',
              fontSize: '0.75rem',
              color: '#c7d2fe',
              marginTop: '1.25rem'
            }}>
              <strong>Scientific Qualification:</strong> A measured reduction in discrepancy following physical repair is empirical evidence of operational system change. However, it does not constitute sole mathematical proof that the repaired component was the only source of the original discrepancy, as network pressure shifts and seasonal demand factors also interact.
            </div>
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-subtle)', background: 'var(--bg-dark)', borderRadius: 'var(--radius-sm)' }}>
            <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
              No before-and-after verification has been logged for this case yet.
            </p>
            <button onClick={() => setShowVerifyModal(true)} className="btn btn-secondary btn-sm">
              Link Post-Intervention Water Reading
            </button>
          </div>
        )}
      </div>

      {/* Field Inspections & Maintenance Log */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <Wrench size={16} color="var(--cyan-primary)" /> Field Inspection & Maintenance Logs
            </div>
            <div className="card-subtitle">Chronological record of acoustic surveys, excavations, and meter audits</div>
          </div>
          <button
            onClick={() => setShowAddInspectionModal(true)}
            className="btn btn-secondary btn-sm"
          >
            <Plus size={14} /> Log Inspection Entry
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {investigation.inspections?.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-subtle)', fontSize: '0.8125rem' }}>
              No physical inspections logged. Click "Log Inspection Entry" above to add findings.
            </div>
          ) : (
            investigation.inspections?.map((insp, idx) => (
              <div
                key={insp.id || idx}
                style={{
                  background: 'var(--bg-dark)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#ffffff' }}>{insp.type}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>by {insp.inspector}</span>
                  </div>
                  <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                    {new Date(insp.timestamp).toLocaleString()}
                  </span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  <strong>Findings:</strong> {insp.findings}
                </div>
                {insp.recommendation && (
                  <div style={{ fontSize: '0.775rem', color: 'var(--cyan-bright)' }}>
                    <strong>Action:</strong> {insp.recommendation}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Log Inspection Modal */}
      {showAddInspectionModal && (
        <div className="modal-overlay" onClick={() => setShowAddInspectionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', color: '#ffffff' }}>
              Log Field Inspection Finding
            </h3>
            <form onSubmit={handleAddInspection}>
              <div className="form-group">
                <label className="form-label">Inspector Name & Crew</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={newInspection.inspector}
                  onChange={(e) => setNewInspection({ ...newInspection, inspector: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Inspection Type</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={newInspection.type}
                  onChange={(e) => setNewInspection({ ...newInspection, type: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Field Findings & Acoustic Evidence</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  required
                  value={newInspection.findings}
                  onChange={(e) => setNewInspection({ ...newInspection, findings: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Recommendation / Corrective Plan</label>
                <input
                  type="text"
                  className="form-input"
                  value={newInspection.recommendation}
                  onChange={(e) => setNewInspection({ ...newInspection, recommendation: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setShowAddInspectionModal(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Inspection Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Run Before/After Verification Modal */}
      {showVerifyModal && (
        <div className="modal-overlay" onClick={() => setShowVerifyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', color: '#ffffff' }}>
              Associate Before-and-After Water Reading
            </h3>
            <form onSubmit={handleRunVerification}>
              <div className="form-group">
                <label className="form-label">Action / Repair Taken</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={verifyForm.actionTaken}
                  onChange={(e) => setVerifyForm({ ...verifyForm, actionTaken: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Technician / Lead Engineer</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={verifyForm.technician}
                  onChange={(e) => setVerifyForm({ ...verifyForm, technician: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Pre-Intervention Baseline Reading</label>
                <select
                  className="form-select"
                  value={verifyForm.beforeReadingId}
                  onChange={(e) => setVerifyForm({ ...verifyForm, beforeReadingId: e.target.value })}
                >
                  {zoneReadings.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.date} — Supplied: {r.waterSupplied?.toLocaleString()} L | Discrepancy: {r.unexplainedDifference?.toLocaleString()} L ({r.discrepancyPercentage}%)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Post-Intervention Verification Reading</label>
                <select
                  className="form-select"
                  value={verifyForm.afterReadingId}
                  onChange={(e) => setVerifyForm({ ...verifyForm, afterReadingId: e.target.value })}
                >
                  {zoneReadings.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.date} — Supplied: {r.waterSupplied?.toLocaleString()} L | Discrepancy: {r.unexplainedDifference?.toLocaleString()} L ({r.discrepancyPercentage}%)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setShowVerifyModal(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Compute Verification Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
