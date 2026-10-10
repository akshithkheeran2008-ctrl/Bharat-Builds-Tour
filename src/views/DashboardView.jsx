import React, { useState, useMemo } from 'react';
import {
  Droplets,
  TrendingDown,
  TrendingUp,
  AlertOctagon,
  FileSearch,
  Database,
  Filter,
  ArrowUpRight,
  Calculator,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Layers
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { MetricCard } from '../components/MetricCard.jsx';
import { FormulaBreakdownModal } from '../components/FormulaBreakdownModal.jsx';
import { ScenarioBanner } from '../components/ScenarioBanner.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';

export function DashboardView({
  zones = [],
  readings = [],
  investigations = [],
  activeScenario,
  onSelectScenario,
  onNavigate,
  selectedZoneFilter,
  onChangeZoneFilter
}) {
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '2026-10-03', end: '2026-10-09' });
  const [activeReadingForModal, setActiveReadingForModal] = useState(null);

  // Filtered readings based on selected zone and date range
  const filteredReadings = useMemo(() => {
    return readings.filter((r) => {
      const matchZone = selectedZoneFilter === 'ALL' || r.zoneId === selectedZoneFilter;
      const matchDate = (!dateRange.start || r.date >= dateRange.start) && (!dateRange.end || r.date <= dateRange.end);
      return matchZone && matchDate;
    });
  }, [readings, selectedZoneFilter, dateRange]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const totalSupplied = filteredReadings.reduce((sum, r) => sum + (r.waterSupplied || 0), 0);
    const totalConsumed = filteredReadings.reduce((sum, r) => sum + (r.recordedConsumption || 0), 0);
    const totalStorage = filteredReadings.reduce((sum, r) => sum + (r.storageChange || 0), 0);
    const totalOutflows = filteredReadings.reduce((sum, r) => sum + (r.otherDocumentedOutflows || 0), 0);
    const totalDiscrepancy = filteredReadings.reduce((sum, r) => sum + (r.unexplainedDifference || 0), 0);

    const validReadings = filteredReadings.filter((r) => r.unexplainedDifference !== null);
    const avgDiscrepancyPercent = validReadings.length > 0
      ? Number((validReadings.reduce((sum, r) => sum + (r.discrepancyPercentage || 0), 0) / validReadings.length).toFixed(1))
      : 0;

    const filteredInvestigations = investigations.filter(
      (inv) => selectedZoneFilter === 'ALL' || inv.zoneId === selectedZoneFilter
    );

    const activeInvs = filteredInvestigations.filter((i) =>
      ['Open', 'Under Review', 'Inspection Required'].includes(i.status)
    ).length;

    const highPriorityInvs = filteredInvestigations.filter(
      (i) => ['Critical', 'High'].includes(i.priority) && i.status !== 'Resolved'
    ).length;

    return {
      totalSupplied,
      totalConsumed,
      totalStorage,
      totalOutflows,
      totalDiscrepancy,
      avgDiscrepancyPercent,
      activeInvs,
      highPriorityInvs,
      validCount: validReadings.length
    };
  }, [filteredReadings, investigations, selectedZoneFilter]);

  // Chart data sorted chronologically
  const trendChartData = useMemo(() => {
    const sorted = [...filteredReadings].sort((a, b) => new Date(a.date) - new Date(b.date));
    return sorted.map((r) => ({
      date: r.date.slice(5), // MM-DD
      'Water Supplied': r.waterSupplied,
      'Recorded Consumption': r.recordedConsumption,
      'Storage Change': r.storageChange,
      'Unexplained Discrepancy': Math.max(0, r.unexplainedDifference || 0),
      raw: r
    }));
  }, [filteredReadings]);

  // Zone by zone summary
  const zoneSummaries = useMemo(() => {
    return zones.map((z) => {
      const zReadings = readings.filter((r) => r.zoneId === z.id);
      const latestReading = zReadings[0] || null;
      const latestDiff = latestReading?.unexplainedDifference ?? 0;
      const latestPercent = latestReading?.discrepancyPercentage ?? 0;

      const zInvs = investigations.filter((i) => i.zoneId === z.id);
      const activeInv = zInvs.find((i) => i.status !== 'Resolved');

      return {
        ...z,
        latestReading,
        latestDiff,
        latestPercent,
        activeInv
      };
    });
  }, [zones, readings, investigations]);

  return (
    <div className="page-wrapper">
      {/* Top Scenario Banner */}
      <ScenarioBanner
        activeScenarioId={activeScenario}
        onSelectScenario={onSelectScenario}
        onNavigate={onNavigate}
      />

      {/* Page Title & Filter Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Utility Water-Balance Intelligence
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Real-time mass-conservation audit, discrepancy detection, and investigation triage
          </p>
        </div>

        {/* Global Filter Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Layers size={13} /> Zone:
            </span>
            <select
              value={selectedZoneFilter}
              onChange={(e) => onChangeZoneFilter(e.target.value)}
              className="form-select"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.8125rem', minWidth: '160px' }}
              id="dashboard-zone-filter"
            >
              <option value="ALL">All Supply Zones (3)</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name} ({z.id})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Calendar size={13} /> Range:
            </span>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="form-input"
              style={{ padding: '0.35rem 0.5rem', fontSize: '0.8125rem', width: '135px' }}
            />
            <span style={{ color: 'var(--text-subtle)', fontSize: '0.75rem' }}>to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="form-input"
              style={{ padding: '0.35rem 0.5rem', fontSize: '0.8125rem', width: '135px' }}
            />
          </div>

          <button
            onClick={() => {
              setActiveReadingForModal(filteredReadings[0] || null);
              setShowFormulaModal(true);
            }}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem' }}
          >
            <Calculator size={14} /> Audit Arithmetic
          </button>
        </div>
      </div>

      {/* KPI Cards Row 1: The Core Water Balance Terms */}
      <div className="grid-cols-4" style={{ marginBottom: '1.25rem' }}>
        <MetricCard
          title="Total Water Supplied"
          value={metrics.totalSupplied}
          unit="L/period"
          subtitle="Bulk intake & booster pumping"
          type="Measured"
          icon={Droplets}
          trend={{ direction: 'neutral', text: 'Baseline' }}
        />
        <MetricCard
          title="Recorded Consumption"
          value={metrics.totalConsumed}
          unit="L/period"
          subtitle="Billed smart meter & AMR telemetry"
          type="Measured"
          icon={TrendingDown}
          trend={{ direction: 'down', text: 'Diurnal' }}
        />
        <MetricCard
          title="Net Storage Change (ΔS)"
          value={metrics.totalStorage >= 0 ? `+${metrics.totalStorage.toLocaleString()}` : metrics.totalStorage.toLocaleString()}
          unit="L/period"
          subtitle={metrics.totalStorage < 0 ? 'Reservoir released volume' : 'Water captured in tanks'}
          type="Measured"
          icon={Database}
        />
        <MetricCard
          title="Documented Outflows"
          value={metrics.totalOutflows}
          unit="L/period"
          subtitle="Authorized flushing & testing"
          type="Measured"
          icon={Droplets}
        />
      </div>

      {/* KPI Cards Row 2: Discrepancy & Investigation Priorities */}
      <div className="grid-cols-4" style={{ marginBottom: '1.5rem' }}>
        <MetricCard
          title="Unexplained Discrepancy"
          value={metrics.totalDiscrepancy}
          unit="L/period"
          subtitle="Supplied - Consumed - ΔS - Outflows"
          type="Calculated"
          icon={AlertOctagon}
          severity={metrics.totalDiscrepancy > 20000 ? 'critical' : metrics.totalDiscrepancy > 10000 ? 'high' : 'low'}
          trend={{ direction: metrics.totalDiscrepancy > 20000 ? 'up' : 'down', text: 'Signal' }}
          onClickInfo={() => {
            setActiveReadingForModal(filteredReadings[0] || null);
            setShowFormulaModal(true);
          }}
        />
        <MetricCard
          title="Discrepancy Percentage"
          value={`${metrics.avgDiscrepancyPercent}%`}
          subtitle="Average % of available supply"
          type="Calculated"
          icon={Calculator}
          severity={metrics.avgDiscrepancyPercent > 15 ? 'critical' : metrics.avgDiscrepancyPercent > 5 ? 'high' : 'low'}
          onClickInfo={() => setShowFormulaModal(true)}
        />
        <MetricCard
          title="Active Investigations"
          value={metrics.activeInvs}
          unit="Cases"
          subtitle="Triage & inspection ledger"
          type="Workflow"
          icon={FileSearch}
          severity={metrics.activeInvs > 0 ? 'high' : 'normal'}
        />
        <MetricCard
          title="High-Priority Inspections"
          value={metrics.highPriorityInvs}
          unit="Pending"
          subtitle="Critical & High triage queue"
          type="Workflow"
          icon={ShieldCheck}
          severity={metrics.highPriorityInvs > 0 ? 'critical' : 'normal'}
        />
      </div>

      {/* Trend Chart and Water Balance Mass Conservation Flow */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Main Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <Droplets size={16} color="var(--cyan-primary)" /> Daily Water Balance & Discrepancy Trend
              </div>
              <div className="card-subtitle">
                Supplied inflow, customer consumption, and unexplained difference (L/day)
              </div>
            </div>
            <span className="badge badge-indigo">Mass Conservation</span>
          </div>

          <div style={{ height: '320px', width: '100%' }}>
            {trendChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSupplied" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorConsumed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorDiff" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--text-subtle)" fontSize={11} />
                  <YAxis
                    stroke="var(--text-subtle)"
                    fontSize={11}
                    tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                  />
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
                  <Area
                    type="monotone"
                    dataKey="Water Supplied"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorSupplied)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Recorded Consumption"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorConsumed)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Unexplained Discrepancy"
                    stroke="#ef4444"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorDiff)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-subtle)' }}>
                No readings match the current filter criteria.
              </div>
            )}
          </div>
        </div>

        {/* Current Balance Distribution Summary */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-header">
              <div className="card-title">
                <Calculator size={16} color="var(--cyan-primary)" /> Volume Accounting
              </div>
              <span className="badge badge-cyan">Aggregated</span>
            </div>

            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Breakdown of accounted vs unexplained water across active filters:
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--emerald-success)' }}>Billed & Documented Usage</span>
                  <span className="num-metric" style={{ fontWeight: 600 }}>
                    {metrics.totalSupplied > 0 ? ((metrics.totalConsumed / metrics.totalSupplied) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div style={{ height: '6px', background: 'var(--border-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.min(100, metrics.totalSupplied > 0 ? (metrics.totalConsumed / metrics.totalSupplied) * 100 : 0)}%`,
                      height: '100%',
                      background: 'var(--emerald-success)'
                    }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: '#38bdf8' }}>Storage Change Adjustment</span>
                  <span className="num-metric" style={{ fontWeight: 600 }}>
                    {metrics.totalStorage >= 0 ? `+${metrics.totalStorage.toLocaleString()}` : metrics.totalStorage.toLocaleString()} L
                  </span>
                </div>
                <div style={{ height: '6px', background: 'var(--border-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.min(100, Math.abs(metrics.totalStorage) / (metrics.totalSupplied || 1) * 100)}%`,
                      height: '100%',
                      background: '#38bdf8'
                    }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: '#f87171' }}>Unexplained Difference (Loss/Drift)</span>
                  <span className="num-metric" style={{ fontWeight: 600 }}>
                    {metrics.totalSupplied > 0 ? ((metrics.totalDiscrepancy / metrics.totalSupplied) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div style={{ height: '6px', background: 'var(--border-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.min(100, metrics.totalSupplied > 0 ? (metrics.totalDiscrepancy / metrics.totalSupplied) * 100 : 0)}%`,
                      height: '100%',
                      background: '#f87171'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'var(--bg-dark)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.75rem',
            marginTop: '1rem'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
              Operational Guidance
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', lineHeight: 1.4 }}>
              Discrepancies above 15% automatically flag high-priority investigation. Before crew dispatch, confirm data completeness & reservoir gauge telemetry.
            </p>
          </div>
        </div>
      </div>

      {/* Zone Comparison Cards */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff' }}>Water Supply Zones Overview</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Comparison of District Metered Areas (DMAs), latest balances, and investigation statuses</p>
          </div>
          <button
            onClick={() => onNavigate('zones')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem' }}
          >
            Manage Zones <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid-cols-3">
          {zoneSummaries.map((z) => (
            <div
              key={z.id}
              className="card card-interactive"
              onClick={() => onNavigate('zones', { selectedZoneId: z.id })}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>{z.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>{z.code} • {z.supplySource}</div>
                </div>
                <StatusBadge status={z.status} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', margin: '0.75rem 0', padding: '0.75rem', background: 'var(--bg-dark)', borderRadius: 'var(--radius-sm)' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>Supplied Volume</div>
                  <div className="num-metric" style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#38bdf8' }}>
                    {z.latestReading?.waterSupplied ? `${z.latestReading.waterSupplied.toLocaleString()} L/d` : 'No data'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>Latest Discrepancy</div>
                  <div className="num-metric" style={{ fontSize: '0.9375rem', fontWeight: 600, color: z.latestPercent > 15 ? '#f87171' : z.latestPercent > 5 ? '#fbbf24' : '#34d399' }}>
                    {z.latestReading?.unexplainedDifference !== null
                      ? `${z.latestDiff.toLocaleString()} L/d (${z.latestPercent}%)`
                      : 'Missing Data'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                <span>Data Completeness: <strong style={{ color: z.dataCompleteness >= 90 ? '#34d399' : '#fbbf24' }}>{z.dataCompleteness}%</strong></span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--cyan-bright)' }}>
                  View Zone Details <ArrowUpRight size={13} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Readings Table & Recent Investigation Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1.25rem' }}>
        {/* Recent Readings Table */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Recent Water Balance Readings</div>
              <div className="card-subtitle">Daily meter logs and calculated discrepancy signals</div>
            </div>
            <button onClick={() => onNavigate('add-reading')} className="btn btn-primary btn-sm" style={{ fontSize: '0.75rem' }}>
              + Add Reading
            </button>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Zone</th>
                  <th style={{ textAlign: 'right' }}>Supplied (L)</th>
                  <th style={{ textAlign: 'right' }}>Consumed (L)</th>
                  <th style={{ textAlign: 'right' }}>ΔS (L)</th>
                  <th style={{ textAlign: 'right' }}>Discrepancy</th>
                  <th>Audit</th>
                </tr>
              </thead>
              <tbody>
                {filteredReadings.slice(0, 6).map((r) => (
                  <tr key={r.id}>
                    <td className="font-mono" style={{ fontSize: '0.8125rem' }}>{r.date}</td>
                    <td>
                      <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                        {r.zoneId}
                      </span>
                    </td>
                    <td className="num-metric" style={{ textAlign: 'right', color: '#38bdf8' }}>
                      {r.waterSupplied?.toLocaleString() ?? '-'}
                    </td>
                    <td className="num-metric" style={{ textAlign: 'right' }}>
                      {r.recordedConsumption?.toLocaleString() ?? '-'}
                    </td>
                    <td className="num-metric" style={{ textAlign: 'right', color: r.storageChange > 0 ? '#f87171' : r.storageChange < 0 ? '#34d399' : 'var(--text-subtle)' }}>
                      {r.storageChange !== null ? (r.storageChange > 0 ? `+${r.storageChange.toLocaleString()}` : r.storageChange.toLocaleString()) : 'Missing'}
                    </td>
                    <td className="num-metric" style={{ textAlign: 'right', fontWeight: 600, color: (r.discrepancyPercentage || 0) > 15 ? '#f87171' : (r.discrepancyPercentage || 0) > 5 ? '#fbbf24' : '#34d399' }}>
                      {r.unexplainedDifference !== null
                        ? `${r.unexplainedDifference.toLocaleString()} (${r.discrepancyPercentage}%)`
                        : 'Uncomputable'}
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          setActiveReadingForModal(r);
                          setShowFormulaModal(true);
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.2rem 0.45rem', fontSize: '0.7rem' }}
                        title="Audit arithmetic breakdown"
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

        {/* Recent Investigation Activity */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Investigation Activity</div>
              <div className="card-subtitle">Active alerts, field inspections, and verifications</div>
            </div>
            <button onClick={() => onNavigate('investigations')} className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }}>
              View All
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {investigations.slice(0, 4).map((inv) => (
              <div
                key={inv.id}
                onClick={() => onNavigate('investigations', { investigationId: inv.id })}
                style={{
                  backgroundColor: 'var(--bg-dark)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s ease'
                }}
                className="card-interactive"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--cyan-bright)' }}>{inv.id}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>• Zone {inv.zoneId}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <StatusBadge status={inv.priority} type="priority" />
                    <StatusBadge status={inv.status} />
                  </div>
                </div>

                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                  {inv.title}
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Discrepancy: <strong style={{ color: '#f87171' }}>{inv.discrepancyPercentage}%</strong> ({inv.unexplainedDifference?.toLocaleString()} L/d)</span>
                  <span>{inv.assignedOperator}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Arithmetic Formula Breakdown Modal */}
      <FormulaBreakdownModal
        isOpen={showFormulaModal}
        onClose={() => setShowFormulaModal(false)}
        reading={activeReadingForModal}
      />
    </div>
  );
}
