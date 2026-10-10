import React from 'react';
import {
  AlertCircle,
  Clock,
  Wrench,
  CheckCircle,
  HelpCircle,
  Flame,
  AlertTriangle,
  Info
} from 'lucide-react';

export function StatusBadge({ status, type = 'status' }) {
  if (!status) return null;

  if (type === 'priority') {
    switch (status.toLowerCase()) {
      case 'critical':
        return (
          <span className="badge badge-rose">
            <Flame size={11} /> Critical
          </span>
        );
      case 'high':
        return (
          <span className="badge badge-amber">
            <AlertTriangle size={11} /> High
          </span>
        );
      case 'medium':
        return (
          <span className="badge badge-indigo">
            <Clock size={11} /> Medium
          </span>
        );
      case 'low':
        return (
          <span className="badge badge-emerald">
            <Info size={11} /> Low
          </span>
        );
      default:
        return <span className="badge badge-cyan">{status}</span>;
    }
  }

  if (type === 'hypothesis') {
    switch (status) {
      case 'CONFIRMED_CAUSE':
        return <span className="badge badge-emerald"><CheckCircle size={11} /> Confirmed Cause</span>;
      case 'LEADING_HYPOTHESIS':
        return <span className="badge badge-amber"><AlertTriangle size={11} /> Leading Hypothesis</span>;
      case 'RULED_OUT':
        return <span className="badge badge-indigo" style={{ opacity: 0.7 }}>Ruled Out</span>;
      case 'HYPOTHESIS':
      default:
        return <span className="badge badge-cyan"><HelpCircle size={11} /> Unverified Hypothesis</span>;
    }
  }

  // Default: Investigation Status
  switch (status) {
    case 'Open':
      return (
        <span className="badge badge-cyan">
          <AlertCircle size={11} /> Open
        </span>
      );
    case 'Under Review':
      return (
        <span className="badge badge-indigo">
          <Clock size={11} /> Under Review
        </span>
      );
    case 'Inspection Required':
      return (
        <span className="badge badge-amber">
          <Wrench size={11} /> Inspection Required
        </span>
      );
    case 'Resolved':
      return (
        <span className="badge badge-emerald">
          <CheckCircle size={11} /> Resolved
        </span>
      );
    case 'Inconclusive':
      return (
        <span className="badge badge-rose">
          <HelpCircle size={11} /> Inconclusive
        </span>
      );
    default:
      return <span className="badge badge-cyan">{status}</span>;
  }
}
