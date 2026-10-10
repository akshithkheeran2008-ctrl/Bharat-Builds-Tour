import React from 'react';
import {
  Droplets,
  Calculator,
  ShieldCheck,
  Server,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  Award
} from 'lucide-react';

export function AboutView() {
  return (
    <div className="page-wrapper" style={{ maxWidth: '1100px' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(2, 132, 199, 0.05) 100%)',
        border: '1px solid rgba(14, 165, 233, 0.3)',
        borderRadius: 'var(--radius-lg)',
        padding: '2.5rem 2rem',
        marginBottom: '2rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-sm)',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(14, 165, 233, 0.5)'
          }}>
            <Droplets size={24} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
              AquaGen: The Water Black Box
            </h1>
            <div style={{ fontSize: '0.875rem', color: 'var(--cyan-bright)', fontWeight: 600 }}>
              Trace every drop. Investigate every discrepancy.
            </div>
          </div>
        </div>

        <p style={{ fontSize: '0.9375rem', color: 'var(--text-main)', maxWidth: '820px', lineHeight: 1.6, marginTop: '1rem' }}>
          Water utilities frequently struggle to account for treated water entering distribution networks. Water supplied, customer consumption, reservoir storage changes, and authorized outflows are logged by separate systems. AquaGen functions as the flight recorder ("Black Box") for municipal water grids—auditing mass conservation, flagging unexplained discrepancies, prioritizing field investigations without unsupported claims, and scientifically verifying corrective action.
        </p>
      </div>

      {/* Core Principle Callout */}
      <div style={{
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        border: '1px solid rgba(99, 102, 241, 0.4)',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem 1.5rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem'
      }}>
        <ShieldCheck size={24} color="#818cf8" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
            Foundational Scientific Principle
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#c7d2fe', lineHeight: 1.6, marginTop: '0.35rem' }}>
            <strong>An unexplained discrepancy is a signal for investigation, not automatic proof of physical leakage.</strong>
            <br />
            Prematurely declaring every unbilled litre a "leaking pipe" causes expensive excavations for meter calibration drifts or telemetry communication dropouts. AquaGen treats discrepancy causes as <em>hypotheses</em> until substantiated by acoustic, pressure, or physical inspection evidence.
          </p>
        </div>
      </div>

      {/* The Governing Water Balance Formula */}
      <div className="card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
        <div className="card-header">
          <div className="card-title" style={{ fontSize: '1.125rem' }}>
            <Calculator size={18} color="var(--cyan-primary)" /> The Conservation of Mass Engine
          </div>
          <span className="badge badge-cyan">Physical Conservation Law</span>
        </div>

        <div style={{
          background: 'var(--bg-dark)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-sm)',
          padding: '1rem 1.25rem',
          margin: '1rem 0'
        }}>
          <div className="font-mono" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--cyan-bright)', lineHeight: 1.5 }}>
            Unexplained Difference = Water Supplied - Recorded Consumption - Increase in Storage - Other Documented Outflows
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          <div>
            <strong style={{ color: '#ffffff' }}>Handling Storage Decreases (-ΔS):</strong>
            <p style={{ marginTop: '0.25rem', lineHeight: 1.5 }}>
              If a reservoir level drops by 5,000 L, the tank drained into the distribution network. Substituting <code>-5,000</code> yields <code>-(-5,000) = +5,000 L</code>, which physically increases available water. AquaGen never silently coerces negative changes to positive.
            </p>
          </div>
          <div>
            <strong style={{ color: '#ffffff' }}>Data Completeness Guardrail:</strong>
            <p style={{ marginTop: '0.25rem', lineHeight: 1.5 }}>
              When required readings (such as reservoir level or inlet flow) are missing, AquaGen marks the record as <em>Uncomputable</em> rather than fabricating a false zero-discrepancy or ghost leak.
            </p>
          </div>
        </div>
      </div>

      {/* Architecture Overview */}
      <div className="card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
        <div className="card-header">
          <div className="card-title" style={{ fontSize: '1.125rem' }}>
            <Server size={18} color="var(--cyan-primary)" /> Serverless AWS Architecture & Cloud Design
          </div>
          <span className="badge badge-indigo">Serverless Stack</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', margin: '1rem 0' }}>
          <div style={{ background: 'var(--bg-dark)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontWeight: 700, color: '#38bdf8', fontSize: '0.875rem' }}>Amazon API Gateway</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.35rem' }}>
              REST API with payload validation, CORS policies, and staged routing.
            </div>
          </div>

          <div style={{ background: 'var(--bg-dark)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontWeight: 700, color: '#38bdf8', fontSize: '0.875rem' }}>AWS Lambda Functions</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.35rem' }}>
              Stateless Node.js microservices executing pure mass balance logic and deterministic triage rules.
            </div>
          </div>

          <div style={{ background: 'var(--bg-dark)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontWeight: 700, color: '#38bdf8', fontSize: '0.875rem' }}>Amazon DynamoDB</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.35rem' }}>
              NoSQL tables for Zones, Readings, and Investigations with pay-per-request billing.
            </div>
          </div>
        </div>

        <div style={{ fontSize: '0.8125rem', color: 'var(--text-subtle)', lineHeight: 1.5 }}>
          <strong>Cost & Security Awareness:</strong> Zero always-on compute instances, zero expensive paid AI APIs, zero NAT gateways. Fully deployable on AWS Free Tier through the provided AWS SAM template.
        </div>
      </div>

      {/* Intended Users & Limitations */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="card">
          <div className="card-title" style={{ marginBottom: '0.75rem' }}>
            <CheckCircle2 size={16} color="var(--emerald-success)" /> Intended Users
          </div>
          <ul style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.7, paddingLeft: '1.25rem' }}>
            <li><strong>District Metered Area (DMA) Managers:</strong> Track daily inflows and night-flow baselines.</li>
            <li><strong>Leakage Detection Field Crews:</strong> Receive prioritized cases with explicit reasons and acoustic clues.</li>
            <li><strong>Utility Auditors & Executives:</strong> Verify water recovery before and after capital repairs.</li>
          </ul>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: '0.75rem' }}>
            <AlertTriangle size={16} color="#fbbf24" /> Operational Limitations
          </div>
          <ul style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.7, paddingLeft: '1.25rem' }}>
            <li><strong>Daily Granularity:</strong> Computes daily averages; sub-hourly hydraulic surges require high-rate SCADA loggers.</li>
            <li><strong>Acoustic Correlation:</strong> Pinpoints DMA zones; final excavation requires on-site acoustic listening rods.</li>
            <li><strong>Simulated Demo Data:</strong> Sample readings are realistic simulations for demonstration.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
