import React, { useState } from 'react';
import {
  Droplets,
  Server,
  RotateCcw,
  Sliders,
  HelpCircle,
  Menu,
  X,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { DEMO_SCENARIOS } from '../services/mockData.js';
import { apiService } from '../services/api.js';

export function Navbar({
  activeScenario,
  onSelectScenario,
  onResetData,
  onToggleMobileNav,
  mobileNavOpen,
  backendMode,
  onToggleBackendMode
}) {
  const [showBackendModal, setShowBackendModal] = useState(false);
  const [awsUrlInput, setAwsUrlInput] = useState(apiService.getApiUrl());
  const [connectionStatus, setConnectionStatus] = useState(null);

  const handleTestConnection = async () => {
    setConnectionStatus('TESTING');
    const res = await apiService.checkAwsBackendHealth();
    if (res.online) {
      setConnectionStatus('SUCCESS');
    } else {
      setConnectionStatus('FAILED');
    }
  };

  return (
    <>
      <header style={{
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(8px)'
      }}>
        {/* Left: Brand & Mobile Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={onToggleMobileNav}
            className="btn btn-secondary btn-sm"
            style={{ display: 'none', padding: '0.4rem' }}
            id="mobile-nav-toggle"
            aria-label="Toggle navigation menu"
          >
            {mobileNavOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px rgba(14, 165, 233, 0.4)'
            }}>
              <Droplets size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.125rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>AquaGen</span>
                <span className="badge badge-cyan" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>Black Box</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Trace every drop. Investigate every discrepancy.
              </div>
            </div>
          </div>
        </div>

        {/* Center / Right: Scenario Selector & System Mode */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Demo Scenario Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Sliders size={13} /> Scenario:
            </span>
            <select
              value={activeScenario}
              onChange={(e) => onSelectScenario(e.target.value)}
              className="form-select"
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.8125rem',
                minWidth: '220px',
                borderColor: 'var(--border-medium)',
                backgroundColor: 'var(--bg-dark)'
              }}
              id="scenario-selector"
            >
              {Object.values(DEMO_SCENARIOS).map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.name} ({sc.badge})
                </option>
              ))}
            </select>
          </div>

          {/* Reset Demo Data */}
          <button
            onClick={onResetData}
            title="Reset demonstration data to baseline"
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
          >
            <RotateCcw size={13} /> Reset Demo
          </button>

          {/* Mode Pill (Local Demo vs AWS) */}
          <button
            onClick={() => setShowBackendModal(true)}
            className={`badge ${backendMode === 'AWS' ? 'badge-emerald' : 'badge-indigo'}`}
            style={{
              cursor: 'pointer',
              border: '1px solid',
              padding: '0.35rem 0.75rem',
              fontSize: '0.75rem'
            }}
            title="Inspect backend configuration"
          >
            <Server size={12} />
            {backendMode === 'AWS' ? 'AWS Connected Mode' : 'Local Demo Mode'}
          </button>
        </div>
      </header>

      {/* Backend Mode Configuration Modal */}
      {showBackendModal && (
        <div className="modal-overlay" onClick={() => setShowBackendModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Server size={20} color="var(--cyan-primary)" />
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Backend Architecture & Data Mode</h3>
              </div>
              <button onClick={() => setShowBackendModal(false)} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.5rem' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              AquaGen supports two operational modes: immediate client-side demonstration with sample utility data, and production serverless deployment powered by AWS Lambda, API Gateway, and Amazon DynamoDB.
            </div>

            <div style={{
              backgroundColor: 'var(--bg-dark)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Current Mode</span>
                <span className={`badge ${backendMode === 'AWS' ? 'badge-emerald' : 'badge-indigo'}`}>
                  {backendMode === 'AWS' ? 'AWS Connected' : 'Local In-Browser Demo'}
                </span>
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-subtle)' }}>
                {backendMode === 'AWS'
                  ? 'Active calls query AWS API Gateway and read/write to Amazon DynamoDB tables.'
                  : 'Active data is simulated and saved in browser localStorage. No AWS credentials or cloud infrastructure are required.'}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Amazon API Gateway URL (VITE_API_URL)</label>
              <input
                type="text"
                className="form-input"
                placeholder="https://abc123xyz.execute-api.us-east-1.amazonaws.com/Prod"
                value={awsUrlInput}
                onChange={(e) => setAwsUrlInput(e.target.value)}
              />
              <div className="form-hint">
                Provided via <code style={{ color: 'var(--cyan-bright)' }}>.env</code> file or entered here for testing.
              </div>
            </div>

            {connectionStatus === 'TESTING' && (
              <div className="alert-banner alert-cyan">Testing health endpoint ({awsUrlInput}/health)...</div>
            )}
            {connectionStatus === 'SUCCESS' && (
              <div className="alert-banner alert-emerald">
                <CheckCircle2 size={16} /> AWS API Gateway reached successfully!
              </div>
            )}
            {connectionStatus === 'FAILED' && (
              <div className="alert-banner alert-rose">
                <AlertTriangle size={16} /> Could not reach endpoint. Verify that the SAM stack is deployed and CORS is enabled.
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={handleTestConnection}
                className="btn btn-secondary"
                disabled={!awsUrlInput}
              >
                Test AWS Endpoint
              </button>
              <button
                type="button"
                onClick={() => {
                  onToggleBackendMode(backendMode === 'AWS' ? 'DEMO' : 'AWS');
                  setShowBackendModal(false);
                }}
                className="btn btn-primary"
              >
                Switch to {backendMode === 'AWS' ? 'Local Demo Mode' : 'AWS Connected Mode'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
