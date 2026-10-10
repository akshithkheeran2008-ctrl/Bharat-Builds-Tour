/**
 * AquaGen: The Water Black Box
 * Unified API Client Layer
 *
 * Bridges the frontend to either:
 * 1. Local Demo Mode (default, completely offline/in-browser using localStore)
 * 2. AWS Serverless Mode (when VITE_API_URL or AWS mode toggle is active)
 *
 * Provides clear transparency so operators know whether records are stored
 * locally in the browser or sent to Amazon API Gateway & DynamoDB.
 */

import { localStore } from './localStorageStore.js';
import { calculateWaterBalance } from '../core/waterBalanceEngine.js';

const CONFIG = {
  apiUrl: import.meta.env.VITE_API_URL || '',
  modeKey: 'aquagen_backend_mode'
};

class ApiService {
  constructor() {
    this.useAws = localStorage.getItem(CONFIG.modeKey) === 'AWS' && Boolean(CONFIG.apiUrl);
  }

  isAwsMode() {
    return this.useAws;
  }

  getApiUrl() {
    return CONFIG.apiUrl;
  }

  setMode(mode) {
    if (mode === 'AWS') {
      if (!CONFIG.apiUrl) {
        throw new Error('VITE_API_URL is not configured. Deploy the AWS SAM template and provide an API Gateway endpoint.');
      }
      this.useAws = true;
      localStorage.setItem(CONFIG.modeKey, 'AWS');
    } else {
      this.useAws = false;
      localStorage.setItem(CONFIG.modeKey, 'DEMO');
    }
    return this.useAws;
  }

  async checkAwsBackendHealth() {
    if (!CONFIG.apiUrl) {
      return { online: false, error: 'No VITE_API_URL configured.' };
    }
    try {
      const res = await fetch(`${CONFIG.apiUrl}/health`, { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const data = await res.json();
        return { online: true, data };
      }
      return { online: false, status: res.status };
    } catch (err) {
      return { online: false, error: err.message };
    }
  }

  // --- ZONES ---
  async getZones() {
    if (this.useAws) {
      const res = await fetch(`${CONFIG.apiUrl}/zones`);
      if (!res.ok) throw new Error(`AWS API Error: ${res.statusText}`);
      return await res.json();
    }
    return localStore.getZones();
  }

  async getZoneById(zoneId) {
    if (this.useAws) {
      const res = await fetch(`${CONFIG.apiUrl}/zones/${zoneId}`);
      if (!res.ok) throw new Error(`AWS API Error: ${res.statusText}`);
      return await res.json();
    }
    return localStore.getZoneById(zoneId);
  }

  // --- READINGS ---
  async getReadings(filters = {}) {
    if (this.useAws) {
      const params = new URLSearchParams();
      if (filters.zoneId) params.append('zoneId', filters.zoneId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      const res = await fetch(`${CONFIG.apiUrl}/readings?${params.toString()}`);
      if (!res.ok) throw new Error(`AWS API Error: ${res.statusText}`);
      return await res.json();
    }
    return localStore.getReadings(filters);
  }

  async addReading(readingData) {
    if (this.useAws) {
      const res = await fetch(`${CONFIG.apiUrl}/readings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(readingData)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `AWS API Error: ${res.statusText}`);
      }
      return await res.json();
    }
    return localStore.addReading(readingData);
  }

  async calculateReading(readingData) {
    if (this.useAws) {
      const res = await fetch(`${CONFIG.apiUrl}/readings/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(readingData)
      });
      if (!res.ok) throw new Error(`AWS API Error: ${res.statusText}`);
      return await res.json();
    }
    return calculateWaterBalance(readingData);
  }

  // --- INVESTIGATIONS ---
  async getInvestigations(filters = {}) {
    if (this.useAws) {
      const params = new URLSearchParams();
      if (filters.zoneId) params.append('zoneId', filters.zoneId);
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      const res = await fetch(`${CONFIG.apiUrl}/investigations?${params.toString()}`);
      if (!res.ok) throw new Error(`AWS API Error: ${res.statusText}`);
      return await res.json();
    }
    return localStore.getInvestigations(filters);
  }

  async getInvestigationById(id) {
    if (this.useAws) {
      const res = await fetch(`${CONFIG.apiUrl}/investigations/${id}`);
      if (!res.ok) throw new Error(`AWS API Error: ${res.statusText}`);
      return await res.json();
    }
    return localStore.getInvestigationById(id);
  }

  async createInvestigation(data) {
    if (this.useAws) {
      const res = await fetch(`${CONFIG.apiUrl}/investigations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `AWS API Error: ${res.statusText}`);
      }
      return await res.json();
    }
    return localStore.addInvestigation(data);
  }

  async updateInvestigation(id, updates) {
    if (this.useAws) {
      const res = await fetch(`${CONFIG.apiUrl}/investigations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error(`AWS API Error: ${res.statusText}`);
      return await res.json();
    }
    return localStore.updateInvestigation(id, updates);
  }

  async addInspection(investigationId, inspection) {
    if (this.useAws) {
      const res = await fetch(`${CONFIG.apiUrl}/investigations/${investigationId}/inspections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inspection)
      });
      if (!res.ok) throw new Error(`AWS API Error: ${res.statusText}`);
      return await res.json();
    }
    return localStore.addInspectionToInvestigation(investigationId, inspection);
  }

  async recordBeforeAfterComparison(investigationId, payload) {
    if (this.useAws) {
      const res = await fetch(`${CONFIG.apiUrl}/investigations/${investigationId}/verify-comparison`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`AWS API Error: ${res.statusText}`);
      return await res.json();
    }
    return localStore.recordBeforeAfterComparison(investigationId, payload);
  }

  // --- ANALYTICS ---
  async getAnalyticsSummary(zoneId = 'ALL') {
    if (this.useAws) {
      const res = await fetch(`${CONFIG.apiUrl}/analytics/summary?zoneId=${zoneId}`);
      if (!res.ok) throw new Error(`AWS API Error: ${res.statusText}`);
      return await res.json();
    }
    return localStore.getAnalyticsSummary(zoneId);
  }

  // --- HEALTH & RESET ---
  async getHealth() {
    if (this.useAws) {
      const res = await fetch(`${CONFIG.apiUrl}/health`);
      return await res.json();
    }
    return {
      status: 'HEALTHY',
      backendMode: 'LOCAL_DEMO',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      disclaimer: 'Running locally in client browser with simulated utility dataset.'
    };
  }

  resetDemoData() {
    return localStore.resetToInitial();
  }
}

export const apiService = new ApiService();
