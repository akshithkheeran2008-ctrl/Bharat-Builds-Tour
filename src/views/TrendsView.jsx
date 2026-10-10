import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { TrendingUp, Layers, Calendar, Filter, Database, BarChart3 } from 'lucide-react';

export function TrendsView({ readings = [], zones = [] }) {
  const [selectedZone, setSelectedZone] = useState('ALL');

  // Filtered readings
  const filtered = useMemo(() => {
    let list = [...readings];
    if (selectedZone !== 'ALL') {
      list = list.filter((r) => r.zoneId === selectedZone);
    }
    return list.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [readings, selectedZone]);

  // Aggregate stats
  const stats = useMemo(() => {
    let cumulativeDiscrepancy = 0;
    const timeSeries = filtered.map((r) => {
      const diff = Math.max(0, r.unexplainedDifference || 0);
      cumulativeDiscrepancy += diff;
      return {
        date: r.date.slice(5),
        fullDate: r.date,
        zoneId: r.zoneId,
        'Water Supplied': r.waterSupplied,
        'Recorded Consumption': r.recordedConsumption,
        'Daily Discrepancy': diff,
        'Cumulative Unaccounted': cumulativeDiscrepancy,
        'Discrepancy %': r.discrepancyPercentage || 0
      };
    });

    const totalSupplied = filtered.reduce((s, r) => s + (r.waterSupplied || 0), 0);
    const totalLost = filtered.reduce((s, r) => s + Math.max(0, r.unexplainedDifference || 0), 0);
    const overallPercent = totalSupplied > 0 ? Number(((totalLost / totalSupplied) * 100).toFixed(1)) : 0;

    return { timeSeries, totalSupplied, totalLost, overallPercent };
  }, [filtered]);

  // Zone by zone comparison breakdown
  const zoneComparisonData = useMemo(() => {
    return zones.map((z) => {
      const zReadings = readings.filter((r) => r.zoneId === z.id);
      const totalSup = zReadings.reduce((s, r) => s + (r.waterSupplied || 0), 0);
      const totalDisc = zReadings.reduce((s, r) => s + Math.max(0, r.unexplainedDifference || 0), 0);
      const avgPct = totalSup > 0 ? Number(((totalDisc / totalSup) * 100).toFixed(1)) : 0;
      return {
        zoneName: z.name.split(' ')[0],
        zoneId: z.id,
        Supplied: totalSup,
        Discrepancy: totalDisc,
        'Discrepancy %': avgPct
      };
    });
  }, [zones, readings]);

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Trends & Multi-Zone Longitudinal Analytics
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Historical volumetric trajectory, cumulative losses, and multi-district comparison
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Zone Filter:</span>
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="form-select"
            style={{ width: '160px', padding: '0.35rem 0.65rem', fontSize: '0.8125rem' }}
          >
            <option value="ALL">All Zones Combined</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>{z.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid-cols-3" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <div className="card-subtitle">Cumulative Water Supplied</div>
          <div className="num-metric" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#38bdf8', margin: '0.25rem 0' }}>
            {stats.totalSupplied.toLocaleString()} L
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Across observed cycles</div>
        </div>

        <div className="card">
          <div className="card-subtitle">Cumulative Unexplained Difference</div>
          <div className="num-metric" style={{ fontSize: '1.5rem', fontWeight: 700, color: stats.totalLost > 50000 ? '#f87171' : '#fbbf24', margin: '0.25rem 0' }}>
            {stats.totalLost.toLocaleString()} L
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Volumetric sum of unaccounted balance</div>
        </div>

        <div className="card">
          <div className="card-subtitle">Aggregated Discrepancy Rate</div>
          <div className="num-metric" style={{ fontSize: '1.5rem', fontWeight: 700, color: stats.overallPercent > 10 ? '#f87171' : '#34d399', margin: '0.25rem 0' }}>
            {stats.overallPercent}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Relative to total intake</div>
        </div>
      </div>

      {/* Cumulative Unaccounted Water Trajectory Chart */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <div>
            <div className="card-title">Cumulative Unaccounted Water Trajectory (Litres)</div>
            <div className="card-subtitle">Compounding volumetric difference over the observation window</div>
          </div>
          <span className="badge badge-rose">Loss Ledger</span>
        </div>

        <div style={{ height: '280px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.timeSeries} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis dataKey="date" stroke="var(--text-subtle)" fontSize={11} />
              <YAxis stroke="var(--text-subtle)" fontSize={11} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: '4px' }}
                formatter={(val) => [`${Number(val).toLocaleString()} L`]}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Line type="monotone" dataKey="Cumulative Unaccounted" stroke="#ef4444" strokeWidth={3} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Daily Discrepancy" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Multi-Zone Discrepancy Comparison Bar Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.25rem' }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Zone-by-Zone Volumetric Comparison</div>
              <div className="card-subtitle">Total water supplied vs unaccounted discrepancy per DMA</div>
            </div>
            <span className="badge badge-indigo">DMA Comparison</span>
          </div>

          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zoneComparisonData} margin={{ top: 15, right: 15, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="zoneName" stroke="var(--text-subtle)" fontSize={12} />
                <YAxis stroke="var(--text-subtle)" fontSize={11} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: '4px' }}
                  formatter={(val) => [`${Number(val).toLocaleString()} L`]}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Supplied" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Discrepancy" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Discrepancy Ratio Ranking</div>
            <span className="badge badge-amber">% of Supply</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {zoneComparisonData.map((z) => (
              <div key={z.zoneId} style={{ background: 'var(--bg-dark)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#ffffff' }}>{z.zoneId} — {z.zoneName}</span>
                  <span className="num-metric" style={{ fontSize: '0.8125rem', fontWeight: 700, color: z['Discrepancy %'] > 15 ? '#f87171' : z['Discrepancy %'] > 5 ? '#fbbf24' : '#34d399' }}>
                    {z['Discrepancy %']}%
                  </span>
                </div>
                <div style={{ height: '6px', background: 'var(--border-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.min(100, z['Discrepancy %'] * 3)}%`,
                      height: '100%',
                      background: z['Discrepancy %'] > 15 ? '#ef4444' : z['Discrepancy %'] > 5 ? '#f59e0b' : '#10b981'
                    }}
                  />
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', marginTop: '0.35rem' }}>
                  {z.Discrepancy.toLocaleString()} L unaccounted of {z.Supplied.toLocaleString()} L total
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
