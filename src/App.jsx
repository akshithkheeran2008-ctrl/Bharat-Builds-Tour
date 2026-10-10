import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar.jsx';
import { Sidebar } from './components/Sidebar.jsx';
import { DashboardView } from './views/DashboardView.jsx';
import { ZonesView } from './views/ZonesView.jsx';
import { AddReadingView } from './views/AddReadingView.jsx';
import { InvestigationsView } from './views/InvestigationsView.jsx';
import { InvestigationDetailView } from './views/InvestigationDetailView.jsx';
import { TrendsView } from './views/TrendsView.jsx';
import { DataQualityView } from './views/DataQualityView.jsx';
import { AboutView } from './views/AboutView.jsx';
import { DEMO_SCENARIOS } from './services/mockData.js';
import { apiService } from './services/api.js';

export function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [viewParams, setViewParams] = useState({});
  const [zones, setZones] = useState([]);
  const [readings, setReadings] = useState([]);
  const [investigations, setInvestigations] = useState([]);
  const [activeScenario, setActiveScenario] = useState('NORMAL');
  const [selectedZoneFilter, setSelectedZoneFilter] = useState('ALL');
  const [backendMode, setBackendMode] = useState(apiService.isAwsMode() ? 'AWS' : 'DEMO');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load data from apiService
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [zList, rList, iList] = await Promise.all([
        apiService.getZones(),
        apiService.getReadings(),
        apiService.getInvestigations()
      ]);
      setZones(zList);
      setReadings(rList);
      setInvestigations(iList);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Navigate handler supporting query params
  const handleNavigate = (view, params = {}) => {
    setCurrentView(view);
    setViewParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Scenario Selector Handler
  const handleSelectScenario = (scenarioId) => {
    setActiveScenario(scenarioId);
    const sc = DEMO_SCENARIOS[scenarioId];
    if (sc) {
      if (sc.activeFilter) {
        setSelectedZoneFilter(sc.activeFilter);
      }
      if (scenarioId === 'BEFORE_AFTER') {
        handleNavigate('investigations', { investigationId: 'INV-2026-0104' });
      } else if (scenarioId === 'MISSING_DATA') {
        handleNavigate('data-quality');
      } else if (scenarioId === 'METER_FAULT') {
        setSelectedZoneFilter('Z-CENTRAL');
        handleNavigate('dashboard');
      } else if (scenarioId === 'LARGE_DISCREPANCY') {
        setSelectedZoneFilter('Z-NORTH');
        handleNavigate('dashboard');
      } else if (scenarioId === 'PERSISTENT_LOSS') {
        setSelectedZoneFilter('Z-NORTH');
        handleNavigate('trends');
      } else {
        setSelectedZoneFilter('ALL');
        handleNavigate('dashboard');
      }
    }
  };

  // Reset Demo Data Handler
  const handleResetData = () => {
    apiService.resetDemoData();
    setActiveScenario('NORMAL');
    setSelectedZoneFilter('ALL');
    loadData();
    handleNavigate('dashboard');
  };

  // Toggle Backend Mode Handler
  const handleToggleBackendMode = (newMode) => {
    try {
      apiService.setMode(newMode);
      setBackendMode(newMode);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const unreadAlerts = investigations.filter((i) => i.status !== 'Resolved').length;

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onNavigate={(view) => handleNavigate(view)}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
        unreadAlerts={unreadAlerts}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <Navbar
          activeScenario={activeScenario}
          onSelectScenario={handleSelectScenario}
          onResetData={handleResetData}
          onToggleMobileNav={() => setMobileNavOpen(!mobileNavOpen)}
          mobileNavOpen={mobileNavOpen}
          backendMode={backendMode}
          onToggleBackendMode={handleToggleBackendMode}
        />

        <main style={{ minHeight: 'calc(100vh - 61px)' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', color: 'var(--text-muted)' }}>
              Loading AquaGen water balance data...
            </div>
          ) : (
            <>
              {currentView === 'dashboard' && (
                <DashboardView
                  zones={zones}
                  readings={readings}
                  investigations={investigations}
                  activeScenario={activeScenario}
                  onSelectScenario={handleSelectScenario}
                  onNavigate={handleNavigate}
                  selectedZoneFilter={selectedZoneFilter}
                  onChangeZoneFilter={setSelectedZoneFilter}
                />
              )}

              {currentView === 'zones' && (
                <ZonesView
                  zones={zones}
                  readings={readings}
                  investigations={investigations}
                  initialSelectedZoneId={viewParams.selectedZoneId}
                  onNavigate={handleNavigate}
                />
              )}

              {currentView === 'add-reading' && (
                <AddReadingView
                  zones={zones}
                  readings={readings}
                  prefillZoneId={viewParams.prefillZoneId}
                  onReadingAdded={loadData}
                  onNavigate={handleNavigate}
                />
              )}

              {currentView === 'investigations' && (
                viewParams.investigationId ? (
                  <InvestigationDetailView
                    investigationId={viewParams.investigationId}
                    investigations={investigations}
                    readings={readings}
                    zones={zones}
                    onBack={() => handleNavigate('investigations')}
                    onInvestigationUpdated={loadData}
                  />
                ) : (
                  <InvestigationsView
                    investigations={investigations}
                    zones={zones}
                    readings={readings}
                    onSelectInvestigation={(id) => handleNavigate('investigations', { investigationId: id })}
                    onInvestigationCreated={loadData}
                  />
                )
              )}

              {currentView === 'trends' && (
                <TrendsView
                  readings={readings}
                  zones={zones}
                />
              )}

              {currentView === 'data-quality' && (
                <DataQualityView
                  readings={readings}
                  zones={zones}
                  onNavigate={handleNavigate}
                />
              )}

              {currentView === 'about' && (
                <AboutView />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
