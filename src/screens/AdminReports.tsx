import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenHeader, Icon, Avatar, EmptyState } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { fetchProblemReports, updateProblemReportStatus } from '../lib/api';
import type { ProblemReport } from '../lib/types';

export default function AdminReports() {
  const navigate = useNavigate();
  useAuth();
  const [reports, setReports] = useState<ProblemReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchProblemReports()
      .then(data => {
        if (!cancelled) {
          setReports(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  async function setStatus(reportId: string, status: 'open' | 'in_progress' | 'resolved') {
    setResolving(reportId);
    try {
      await updateProblemReportStatus(reportId, status);
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r));
    } catch {
      // keep current status on error
    } finally {
      setResolving(null);
    }
  }

  const open = reports.filter(r => r.status === 'open').length;
  const inProgress = reports.filter(r => r.status === 'in_progress').length;
  const resolved = reports.filter(r => r.status === 'resolved').length;

  return (
    <div className="flex flex-col">
      <ScreenHeader
        title="Reports"
        onBack={() => navigate('/admin')}
        right={
          <span className="rounded-full bg-tertiary-container px-3 py-1 font-label-sm text-label-sm text-on-tertiary-container">
            admin
          </span>
        }
      />

      <main className="space-y-lg px-container-padding pb-8">
        {/* summary cards */}
        <div className="grid grid-cols-3 gap-card-gap">
          <div className="card p-md">
            <div className="flex items-center gap-sm mb-xs">
              <span className="material-symbols-outlined text-error">report_problem</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Open</span>
            </div>
            <p className="font-title-lg-mobile text-title-lg-mobile font-bold text-error">{open}</p>
          </div>
          <div className="card p-md">
            <div className="flex items-center gap-sm mb-xs">
              <span className="material-symbols-outlined text-secondary">update</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">In progress</span>
            </div>
            <p className="font-title-lg-mobile text-title-lg-mobile font-bold text-secondary">{inProgress}</p>
          </div>
          <div className="card p-md">
            <div className="flex items-center gap-sm mb-xs">
              <span className="material-symbols-outlined text-primary">check_circle</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Resolved</span>
            </div>
            <p className="font-title-lg-mobile text-title-lg-mobile font-bold text-primary">{resolved}</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-sm">
            {[1, 2, 3].map(i => <div key={i} className="skeleton h-20 rounded-card" />)}
          </div>
        ) : reports.length === 0 ? (
          <EmptyState
            icon="check_circle"
            title="No reports"
            message="All reports have been resolved."
          />
        ) : (
          <div className="space-y-md">
            {reports.map(report => (
              <div key={report.id} className="card p-lg">
                <div className="flex items-start gap-md">
                  <Avatar name={                    'Student'} size={44} />
                  <div className="flex-1 min-w-0 space-y-xs">
                    <div className="flex items-center justify-between gap-sm">
                      <p className="font-label-md text-label-md font-semibold text-on-surface truncate">
                        Student
                      </p>
                      <span className="font-mono text-[11px] text-on-surface-variant">{report.id}</span>
                    </div>
                    <div className="flex items-center gap-xs">
                      <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">{report.category.replace(/-/g, ' ')}</span>
                      <span className="text-on-surface-variant">·</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant truncate">{report.details}</span>
                    </div>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">
                      {                        'student@example.com'}
                    </p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">
                      {new Date(report.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-sm mt-md pt-sm border-t border-outline-variant/30">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Status:</span>
                  {report.status === 'open' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setStatus(report.id, 'in_progress')}
                        disabled={resolving === report.id || report.status !== 'open'}
                        className="chip"
                      >
                        Mark in progress
                      </button>
                      <span className="text-on-surface-variant">or</span>
                      <button
                        type="button"
                        onClick={() => setStatus(report.id, 'resolved')}
                        disabled={resolving === report.id || report.status !== 'open'}
                        className="chip bg-primary-container text-on-primary-container"
                      >
                        Resolve
                      </button>
                    </>
                  )}
                  {report.status === 'in_progress' && (
                    <button
                      type="button"
                      onClick={() => setStatus(report.id, 'resolved')}
                      disabled={resolving === report.id}
                      className="chip bg-primary-container text-on-primary-container"
                    >
                      Mark resolved
                    </button>
                  )}
                  {report.status === 'resolved' && (
                    <span className="chip bg-primary-container text-on-primary-container">
                      Resolved
                    </span>
                  )}
                </div>

                {report.status === 'resolved' && (
                  <div className="mt-sm rounded-card bg-primary-container/10 border border-primary/5 p-md space-y-xs">
                    <div className="flex items-start gap-sm">
                      <Icon name="info" size={16} className="text-primary shrink-0 mt-0.5" />
                      <p className="font-label-sm text-label-sm text-on-primary-container">
                        The student will see this report marked as resolved the next time they open the app.
                        They can also re-open their report from Settings → My reports.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="rounded-card border border-outline-variant/50 bg-surface-container-low p-md">
          <p className="font-label-sm text-label-sm font-semibold text-on-surface">About reports</p>
          <ul className="mt-sm space-y-xs">
            <li className="flex gap-sm">
              <span className="material-symbols-outlined text-[16px] text-primary shrink-0">person</span>
              <p className="font-label-sm text-label-sm text-on-surface-variant">Students submit reports from Settings → Report a problem.</p>
            </li>
            <li className="flex gap-sm">
              <span className="material-symbols-outlined text-[16px] text-primary shrink-0">monitoring</span>
              <p className="font-label-sm text-label-sm text-on-surface-variant">Each report is tagged with the student's name and email for follow-up.</p>
            </li>
            <li className="flex gap-sm">
              <span className="material-symbols-outlined text-[16px] text-primary shrink-0">check_circle</span>
              <p className="font-label-sm text-label-sm text-on-surface-variant">Resolving a report updates its status. Students see the change on their next app load.</p>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
