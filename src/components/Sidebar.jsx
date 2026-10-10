import React from 'react';
import {
  LayoutDashboard,
  Layers,
  PlusCircle,
  FileSearch,
  LineChart,
  ShieldCheck,
  Info,
  ChevronRight,
  HelpCircle
} from 'lucide-react';

export function Sidebar({ currentView, onNavigate, mobileOpen, onCloseMobile, unreadAlerts = 2 }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'zones', label: 'Water Zones', icon: Layers, badge: '3 Zones' },
    { id: 'add-reading', label: 'Add Reading', icon: PlusCircle, badge: 'Balance' },
    { id: 'investigations', label: 'Investigations', icon: FileSearch, badge: unreadAlerts > 0 ? `${unreadAlerts} Open` : null, badgeColor: 'badge-rose' },
    { id: 'trends', label: 'Trends & Analytics', icon: LineChart, badge: null },
    { id: 'data-quality', label: 'Data Quality Audit', icon: ShieldCheck, badge: 'Health' },
    { id: 'about', label: 'About AquaGen', icon: Info, badge: null }
  ];

  return (
    <aside
      className={`sidebar-container ${mobileOpen ? 'mobile-open' : ''}`}
      style={{
        width: 'var(--sidebar-width)',
        backgroundColor: 'var(--bg-card)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: 'calc(100vh - 61px)',
        position: 'sticky',
        top: '61px',
        zIndex: 40
      }}
    >
      {/* Navigation List */}
      <div style={{ padding: '1.25rem 0.85rem' }}>
        <div style={{
          fontSize: '0.6875rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--text-subtle)',
          padding: '0 0.75rem 0.65rem 0.75rem'
        }}>
          Operations & Intelligence
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isActive ? 'rgba(14, 165, 233, 0.12)' : 'transparent',
                  color: isActive ? 'var(--cyan-bright)' : 'var(--text-muted)',
                  border: isActive ? '1px solid rgba(14, 165, 233, 0.3)' : '1px solid transparent',
                  cursor: 'pointer',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.875rem',
                  transition: 'all 0.15s ease',
                  textAlign: 'left'
                }}
                className="sidebar-link"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Icon size={18} color={isActive ? 'var(--cyan-bright)' : 'var(--text-subtle)'} />
                  <span>{item.label}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {item.badge && (
                    <span
                      className={`badge ${item.badgeColor || 'badge-cyan'}`}
                      style={{ fontSize: '0.6875rem', padding: '0.1rem 0.45rem' }}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight size={14} color="var(--cyan-bright)" />}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info Card */}
      <div style={{ padding: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{
          backgroundColor: 'var(--bg-dark)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.85rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--emerald-success)',
              boxShadow: '0 0 6px var(--emerald-success)'
            }}></span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>Water-Balance Engine</span>
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', lineHeight: 1.4 }}>
            Unexplained discrepancy is a signal for field investigation, not automatic proof of leakage.
          </p>
        </div>
      </div>
    </aside>
  );
}
