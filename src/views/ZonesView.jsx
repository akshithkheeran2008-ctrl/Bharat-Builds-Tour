import React, { useState } from 'react';
import {
  Layers,
  ArrowLeft,
  FileSearch,
  Droplets,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Database,
  ArrowUpRight,
  ShieldCheck,
  Calculator
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { FormulaBreakdownModal } from '../components/FormulaBreakdownModal.jsx';

export function ZonesView({
  zones = [],
  readings = [],
  investigations = [],
  initialSelectedZoneId = null,
  onNavigate
}) {
  const [selectedZoneId, setSelectedZoneId] = useState(initialSelectedZoneId || null);
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [activeReadingForModal, setActiveReadingForModal] = useState(null);

  const selectedZone = zones.find((z) => z.id === selectedZoneId) || null;

  // Filter readings for the selected zone
  const zoneReadings = selectedZoneId
    ? readings.filter((r) => r.zoneId === selectedZoneId).sort((a, b) => new Date(a.date) - new Date(b.date))
    : [];

  const zoneInvestigations = selectedZoneId
    ? investigations.filter((i) => i.zoneId === selectedZoneId)
    : [];

  // Chart data for zone
  const chartData = zoneReadings.map((r) => ({
    date: r.date.slice(5),
    'Water Supplied': r.waterSupplied,
    'Recorded Consumption': r.recordedConsumption,
    'Storage Change': r.storageChange,
    'Unexplained Discrepancy': Math.max(0, r.unexplainedDifference || 0)
  }));

  // If a zone is selected, render Zone Detail View
  if (selectedZone) {
    const latestReading = zoneReadings[zoneReadings.length - 1] || null;

    return (
      <div className="page-wrapper">
        {/* Back navigation & Zone Title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => setSelectedZoneId(null)}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.4rem 0.6rem' }}
            >
              <ArrowLeft size={16} /> All Zones
            </button>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#ffffff' }}>{selectedZone.name}</h1>
                <span className="badge badge-cyan">{selectedZone.id}</span>
                <StatusBadge status={selectedZone.status} />
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                {selectedZone.code} • Source: {selectedZone.supplySource}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('add-reading', { prefillZoneId: selectedZone.id })}
            className="btn btn-primary btn-sm"
          >
            + Log Reading for {selectedZone.id}
          </button>
        </div>

        {/* Zone Metadata Cards */}
        <div className="grid-cols-4" style={{ marginBottom: '1.25rem' }}>
          <div className="card">
            <div className="card-subtitle">Active Connections</div>
            <div className="num-metric" style={{ fontSize: '1.375rem', fontWeight: 700, color: '#ffffff', margin: '0.2rem 0' }}>
              {selectedZone.activeConnections.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Piped distribution network</div>
          </div>

          <div className="card">
            <div className="card-subtitle">Pipe Network Length</div>
            <div className="num-metric" style={{ fontSize: '1.375rem', fontWeight: 700, color: '#38bdf8', margin: '0.2rem 0' }}>
              {selectedZone.pipeLengthKm} km
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Elevation: {selectedZone.elevationRange}</div>
          </div>

          <div className="card">
            <div className="card-subtitle">Storage Reservoir Capacity</div>
            <div className="num-metric" style={{ fontSize: '1.375rem', fontWeight: 700, color: '#ffffff', margin: '0.2rem 0' }}>
              {selectedZone.storageCapacityL.toLocaleString()} L
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Tracked storage tank</div>
          </div>

          <div className="card">
            <div className="card-subtitle">Data Completeness</div>
            <div className="num-metric" style={{ fontSize: '1.375rem', fontWeight: 700, color: selectedZone.dataCompleteness >= 90 ? '#34d399' : '#fbbf24', margin: '0.2rem 0' }}>
              {selectedZone.dataCompleteness}%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Telemetry reliability score</div>
          </div>
        </div>

        {/* Zone Trend Chart */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <div>
              <div className="card-title">Historical Water Balance & Discrepancy (L/day)</div>
              <div className="card-subtitle">Full time-series record for {selectedZone.name}</div>
            </div>
            <span className="badge badge-indigo">Daily Time-Series</span>
          </div>

          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--text-subtle)" fontSize={11} />
                <YAxis stroke="var(--text-subtle)" fontSize={11} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px'
                  }}
                  formatter={(val) => [`${Number(val).toLocaleString()} L/day`]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="Water Supplied" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.15} />
                <Area type="monotone" dataKey="Recorded Consumption" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
                <Area type="monotone" dataKey="Unexplained Discrepancy" stroke="#ef4444" strokeWidth={2} fill="#ef4444" fillOpacity={0.25} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Zone Readings Table & Investigations for this Zone */}
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1.25rem' }}>
          {/* Readings */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Zone Water Balance Readings</div>
              <span className="badge badge-cyan">{zoneReadings.length} Logged Cycles</span>
            </div>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th style={{ textAlign: 'right' }}>Supplied (L)</th>
                    <th style={{ textAlign: 'right' }}>Consumed (L)</th>
                    <th style={{ textAlign: 'right' }}>ΔS (L)</th>
                    <th style={{ textAlign: 'right' }}>Discrepancy</th>
                    <th>Audit</th>
                  </tr>
                </thead>
                <tbody>
                  {[...zoneReadings].reverse().map((r) => (
                    <tr key={r.id}>
                      <td className="font-mono">{r.date}</td>
                      <td className="num-metric" style={{ textAlign: 'right', color: '#38bdf8' }}>{r.waterSupplied?.toLocaleString() ?? '-'}</td>
                      <td className="num-metric" style={{ textAlign: 'right' }}>{r.recordedConsumption?.toLocaleString() ?? '-'}</td>
                      <td className="num-metric" style={{ textAlign: 'right', color: r.storageChange > 0 ? '#f87171' : r.storageChange < 0 ? '#34d399' : 'inherit' }}>
                        {r.storageChange !== null ? (r.storageChange > 0 ? `+${r.storageChange.toLocaleString()}` : r.storageChange.toLocaleString()) : 'Missing'}
                      </td>
                      <td className="num-metric" style={{ textAlign: 'right', fontWeight: 600, color: (r.discrepancyPercentage || 0) > 15 ? '#f87171' : (r.discrepancyPercentage || 0) > 5 ? '#fbbf24' : '#34d399' }}>
                        {r.unexplainedDifference !== null ? `${r.unexplainedDifference.toLocaleString()} (${r.discrepancyPercentage}%)` : 'Uncomputable'}
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            setActiveReadingForModal(r);
                            setShowFormulaModal(true);
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.2rem 0.45rem', fontSize: '0.7rem' }}
                        >
                          Audit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Investigations in Zone */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Zone Investigations</div>
              <span className="badge badge-rose">{zoneInvestigations.length} Cases</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {zoneInvestigations.length === 0 ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-subtle)', fontSize: '0.8125rem' }}>
                  No investigation cases registered for this zone.
                </div>
              ) : (
                zoneInvestigations.map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => onNavigate('investigations', { investigationId: inv.id })}
                    className="card-interactive"
                    style={{
                      backgroundColor: 'var(--bg-dark)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.75rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--cyan-bright)' }}>{inv.id}</span>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <StatusBadge status={inv.priority} type="priority" />
                        <StatusBadge status={inv.status} />
                      </div>
                    </div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.25rem' }}>
                      {inv.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                      Assigned: {inv.assignedOperator}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <FormulaBreakdownModal
          isOpen={showFormulaModal}
          onClose={() => setShowFormulaModal(false)}
          reading={activeReadingForModal}
        />
      </div>
    );
  }

  // Otherwise, render Zones Overview List
  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            District Metered Areas (Water Supply Zones)
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Configured supply networks, storage reservoirs, and operational telemetry channels
          </p>
        </div>

        <button
          onClick={() => onNavigate('add-reading')}
          className="btn btn-primary btn-sm"
        >
          + Add New Daily Reading
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {zones.map((zone) => {
          const zReadings = readings.filter((r) => r.zoneId === zone.id);
          const latestReading = zReadings[0] || null;
          const zInvs = investigations.filter((i) => i.zoneId === zone.id);
          const activeInvs = zInvs.filter((i) => i.status !== 'Resolved');

          return (
            <div key={zone.id} className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>{zone.name}</h2>
                    <span className="badge badge-cyan">{zone.id}</span>
                    <span className="badge badge-indigo">{zone.code}</span>
                    <StatusBadge status={zone.status} />
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {zone.description}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedZoneId(zone.id)}
                  className="btn btn-secondary btn-sm"
                >
                  Inspect Zone History <ArrowUpRight size={14} />
                </button>
              </div>

              {/* Zone Telemetry Metrics */}
              <div className="grid-cols-4" style={{ gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ background: 'var(--bg-dark)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>Supply Source</div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#ffffff', marginTop: '0.15rem' }}>
                    {zone.supplySource}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-dark)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>Baseline Daily Supply</div>
                  <div className="num-metric" style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#38bdf8', marginTop: '0.15rem' }}>
                    {zone.dailyBaselineLpd.toLocaleString()} L/day
                  </div>
                </div>

                <div style={{ background: 'var(--bg-dark)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>Latest Discrepancy</div>
                  <div className="num-metric" style={{ fontSize: '0.9375rem', fontWeight: 600, color: (latestReading?.discrepancyPercentage || 0) > 15 ? '#f87171' : '#34d399', marginTop: '0.15rem' }}>
                    {latestReading?.unexplainedDifference !== null && latestReading?.unexplainedDifference !== undefined
                      ? `${latestReading.unexplainedDifference.toLocaleString()} L/d (${latestReading.discrepancyPercentage}%)`
                      : 'Missing Reading'}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-dark)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>Active Investigations</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: activeInvs.length > 0 ? '#f87171' : 'var(--text-muted)', marginTop: '0.15rem' }}>
                    {activeInvs.length} open cases
                  </div>
                </div>
              </div>

              {/* Bottom footer tags */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-subtle)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '1.25rem' }}>
                  <span>Network: <strong>{zone.pipeLengthKm} km</strong></span>
                  <span>Connections: <strong>{zone.activeConnections.toLocaleString()}</strong></span>
                  <span>Storage: <strong>{zone.storageCapacityL.toLocaleString()} L</strong></span>
                </div>
                <span>Data Completeness: <strong style={{ color: zone.dataCompleteness >= 90 ? '#34d399' : '#fbbf24' }}>{zone.dataCompleteness}%</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
