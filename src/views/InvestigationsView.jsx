import React, { useState, useMemo } from 'react';
import {
  FileSearch,
  Plus,
  Filter,
  Layers,
  Calendar,
  CheckCircle2,
  Clock,
  Wrench,
  HelpCircle,
  Flame,
  ArrowRight,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { INVESTIGATION_STATUSES, HYPOTHESES_CATALOG } from '../core/prioritization.js';
import { apiService } from '../services/api.js';

export function InvestigationsView({
  investigations = [],
  zones = [],
  readings = [],
  onSelectInvestigation,
  onInvestigationCreated
}) {
  const [filterZone, setFilterZone] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Investigation Form state
  const [newInv, setNewInv] = useState({
    zoneId: zones[0]?.id || 'Z-NORTH',
    title: '',
    readingDate: new Date().toISOString().slice(0, 10),
    unexplainedDifference: 20000,
    discrepancyPercentage: 20.0,
    assignedOperator: 'Marco Torres',
    priority: 'High',
    priorityReason: 'Volumetric discrepancy exceeds 15,000 L/day benchmark threshold.',
    status: 'Open',
    evidenceNotes: 'Observed elevated discrepancy during diurnal balance inspection.'
  });

  const filteredInvestigations = useMemo(() => {
    return investigations.filter((inv) => {
      const matchZone = filterZone === 'ALL' || inv.zoneId === filterZone;
      const matchStatus = filterStatus === 'ALL' || inv.status === filterStatus;
      const matchPriority = filterPriority === 'ALL' || inv.priority === filterPriority;
      return matchZone && matchStatus && matchPriority;
    });
  }, [investigations, filterZone, filterStatus, filterPriority]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const created = await apiService.createInvestigation(newInv);
      setShowCreateModal(false);
      if (onInvestigationCreated) onInvestigationCreated();
      if (onSelectInvestigation) onSelectInvestigation(created.id);
    } catch (err) {
      alert(`Error creating investigation: ${err.message}`);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Discrepancy Investigations & Field Triage
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Systematic investigation workflows, hypothesis tracking, and before-and-after repair verification
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary btn-sm"
        >
          <Plus size={15} /> Create Investigation
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Zone:</span>
          <select
            value={filterZone}
            onChange={(e) => setFilterZone(e.target.value)}
            className="form-select"
            style={{ padding: '0.3rem 0.6rem', fontSize: '0.8125rem', width: '150px' }}
          >
            <option value="ALL">All Zones</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>{z.name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="form-select"
            style={{ padding: '0.3rem 0.6rem', fontSize: '0.8125rem', width: '160px' }}
          >
            <option value="ALL">All Statuses</option>
            {INVESTIGATION_STATUSES.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Priority:</span>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="form-select"
            style={{ padding: '0.3rem 0.6rem', fontSize: '0.8125rem', width: '130px' }}
          >
            <option value="ALL">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
          Showing <strong>{filteredInvestigations.length}</strong> of {investigations.length} cases
        </div>
      </div>

      {/* Investigations Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Supply Zone</th>
                <th>Priority & Triage Rationale</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Observed Discrepancy</th>
                <th>Assigned Operator</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvestigations.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-subtle)' }}>
                    No investigations match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredInvestigations.map((inv) => (
                  <tr
                    key={inv.id}
                    className="card-interactive"
                    onClick={() => onSelectInvestigation(inv.id)}
                  >
                    <td>
                      <div className="font-mono" style={{ fontWeight: 700, color: 'var(--cyan-bright)' }}>
                        {inv.id}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>{inv.readingDate}</div>
                    </td>
                    <td>
                      <span className="badge badge-cyan">{inv.zoneId}</span>
                    </td>
                    <td style={{ maxWidth: '340px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                        <StatusBadge status={inv.priority} type="priority" />
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#ffffff' }}>
                          {inv.title}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-subtle)', lineHeight: 1.3 }}>
                        {inv.priorityReason}
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="num-metric" style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: inv.discrepancyPercentage > 15 ? '#f87171' : '#fbbf24' }}>
                        {inv.discrepancyPercentage}%
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                        {inv.unexplainedDifference?.toLocaleString()} L/day
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {inv.assignedOperator}
                    </td>
                    <td>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectInvestigation(inv.id);
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        Inspect <ChevronRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Investigation Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', color: '#ffffff' }}>
              Open New Discrepancy Investigation
            </h3>

            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label className="form-label">Zone</label>
                <select
                  className="form-select"
                  value={newInv.zoneId}
                  onChange={(e) => setNewInv({ ...newInv, zoneId: e.target.value })}
                >
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>{z.name} ({z.id})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Investigation Title</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Unexplained Nocturnal Flow Spike - Pine Ave"
                  value={newInv.title}
                  onChange={(e) => setNewInv({ ...newInv, title: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Unexplained Difference (L/day)</label>
                  <input
                    type="number"
                    className="form-input font-mono"
                    value={newInv.unexplainedDifference}
                    onChange={(e) => setNewInv({ ...newInv, unexplainedDifference: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Discrepancy Percentage (%)</label>
                  <input
                    type="number"
                    className="form-input font-mono"
                    value={newInv.discrepancyPercentage}
                    onChange={(e) => setNewInv({ ...newInv, discrepancyPercentage: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Initial Priority</label>
                  <select
                    className="form-select"
                    value={newInv.priority}
                    onChange={(e) => setNewInv({ ...newInv, priority: e.target.value })}
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Assigned Operator</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newInv.assignedOperator}
                    onChange={(e) => setNewInv({ ...newInv, assignedOperator: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Evidence & Initial Observations</label>
                <textarea
                  className="form-textarea"
                  rows="2"
                  value={newInv.evidenceNotes}
                  onChange={(e) => setNewInv({ ...newInv, evidenceNotes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Create Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
