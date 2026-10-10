import React from 'react';
import { Sparkles, Info, ArrowRight } from 'lucide-react';
import { DEMO_SCENARIOS } from '../services/mockData.js';

export function ScenarioBanner({ activeScenarioId, onSelectScenario, onNavigate }) {
  const scenario = DEMO_SCENARIOS[activeScenarioId] || DEMO_SCENARIOS.NORMAL;

  const colorStyles = {
    emerald: { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)', text: '#34d399', badge: 'badge-emerald' },
    red: { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', text: '#f87171', badge: 'badge-rose' },
    amber: { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)', text: '#fbbf24', badge: 'badge-amber' },
    indigo: { bg: 'rgba(99, 102, 241, 0.1)', border: 'rgba(99, 102, 241, 0.3)', text: '#a5b4fc', badge: 'badge-indigo' },
    orange: { bg: 'rgba(249, 115, 22, 0.1)', border: 'rgba(249, 115, 22, 0.3)', text: '#fb923c', badge: 'badge-amber' },
    cyan: { bg: 'rgba(14, 165, 233, 0.1)', border: 'rgba(14, 165, 233, 0.3)', text: '#38bdf8', badge: 'badge-cyan' }
  };

  const currentStyle = colorStyles[scenario.color] || colorStyles.cyan;

  return (
    <div
      style={{
        backgroundColor: currentStyle.bg,
        border: `1px solid ${currentStyle.border}`,
        borderRadius: 'var(--radius-md)',
        padding: '0.85rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '300px' }}>
        <div style={{
          padding: '0.4rem',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--bg-dark)',
          color: currentStyle.text,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Sparkles size={18} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ffffff' }}>
              Demo Scenario: {scenario.name}
            </span>
            <span className={`badge ${currentStyle.badge}`} style={{ fontSize: '0.6875rem' }}>
              {scenario.badge}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
              (Demonstration dataset)
            </span>
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            {scenario.summaryMessage}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {scenario.id === 'BEFORE_AFTER' && onNavigate && (
          <button
            onClick={() => onNavigate('investigations', { investigationId: 'INV-2026-0104' })}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem' }}
          >
            Open Post-Repair Audit <ArrowRight size={13} />
          </button>
        )}
        {scenario.id === 'LARGE_DISCREPANCY' && onNavigate && (
          <button
            onClick={() => onNavigate('investigations', { investigationId: 'INV-2026-0104' })}
            className="btn btn-danger btn-sm"
            style={{ fontSize: '0.75rem' }}
          >
            View Urgent Case <ArrowRight size={13} />
          </button>
        )}
        {scenario.id === 'MISSING_DATA' && onNavigate && (
          <button
            onClick={() => onNavigate('data-quality')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem' }}
          >
            Audit Telemetry Gap <ArrowRight size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
