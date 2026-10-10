import React from 'react';
import { HelpCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function MetricCard({
  title,
  value,
  unit,
  subtitle,
  type = 'Measured', // 'Measured' | 'Calculated' | 'Estimate' | 'Workflow'
  icon: Icon,
  trend, // { direction: 'up' | 'down' | 'neutral', text: string }
  severity = 'normal', // 'normal' | 'low' | 'medium' | 'high' | 'critical'
  onClickInfo
}) {
  const typeBadgeColors = {
    Measured: 'badge-cyan',
    Calculated: 'badge-indigo',
    Estimate: 'badge-amber',
    Workflow: 'badge-emerald'
  };

  const severityBorderColors = {
    critical: 'rgba(239, 68, 68, 0.6)',
    high: 'rgba(245, 158, 11, 0.6)',
    medium: 'rgba(99, 102, 241, 0.4)',
    low: 'rgba(16, 185, 129, 0.4)',
    normal: 'var(--border-subtle)'
  };

  return (
    <div
      className="card"
      style={{
        borderColor: severityBorderColors[severity] || 'var(--border-subtle)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>{title}</span>
              {onClickInfo && (
                <button
                  type="button"
                  onClick={onClickInfo}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-subtle)',
                    cursor: 'pointer',
                    padding: 0
                  }}
                  title="View transparent calculation breakdown"
                >
                  <HelpCircle size={13} />
                </button>
              )}
            </div>
            <span
              className={`badge ${typeBadgeColors[type] || 'badge-cyan'}`}
              style={{ fontSize: '0.625rem', padding: '0.05rem 0.4rem', marginTop: '0.2rem' }}
            >
              {type}
            </span>
          </div>

          {Icon && (
            <div style={{
              padding: '0.45rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-card-subtle)',
              color: 'var(--cyan-bright)'
            }}>
              <Icon size={18} />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginTop: '0.25rem' }}>
          <span className="num-metric" style={{ fontSize: '1.625rem', fontWeight: 700, color: '#ffffff' }}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
          {unit && (
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-subtle)', fontWeight: 500 }}>
              {unit}
            </span>
          )}
        </div>
      </div>

      {(subtitle || trend) && (
        <div style={{
          marginTop: '0.75rem',
          paddingTop: '0.65rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: 'var(--text-subtle)'
        }}>
          {subtitle && <span>{subtitle}</span>}
          {trend && (
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem',
              color: trend.direction === 'up' ? '#f87171' : trend.direction === 'down' ? '#34d399' : 'var(--text-muted)'
            }}>
              {trend.direction === 'up' && <TrendingUp size={12} />}
              {trend.direction === 'down' && <TrendingDown size={12} />}
              {trend.direction === 'neutral' && <Minus size={12} />}
              {trend.text}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
