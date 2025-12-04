'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { coachApi, analyticsApi, programsApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function ClientDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;

  const [client, setClient] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [availablePrograms, setAvailablePrograms] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [trends, setTrends] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'COACH' && !user.isAdmin))) {
      router.push('/');
      return;
    }

    if (user && clientId) {
      loadClientData();
    }
  }, [user, authLoading, clientId]);

  const loadClientData = async () => {
    try {
      setLoading(true);
      const [assignmentsData, programsData, statsData, trendsData] = await Promise.all([
        coachApi.getClientAssignments(clientId).catch(() => []),
        programsApi.getAll().catch(() => []),
        analyticsApi.getClientStats(clientId).catch(() => null),
        analyticsApi.getClientTrends(clientId, 30).catch(() => null),
      ]);

      setAssignments(assignmentsData);
      setAvailablePrograms(programsData);
      setStats(statsData);
      setTrends(trendsData);

      // Get client info - try to get from coach clients list
      try {
        const clients = await coachApi.getClients();
        const clientData = clients.find((c: any) => c.clientId === clientId);
        if (clientData) {
          setClient(clientData.client);
        }
      } catch (error) {
        console.error('Failed to load client info:', error);
      }
    } catch (error) {
      console.error('Failed to load client data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignProgram = async () => {
    if (!selectedProgramId) return;

    try {
      await coachApi.assignProgram(clientId, selectedProgramId);
      await loadClientData();
      setShowAssignModal(false);
      setSelectedProgramId('');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to assign program');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-deep-asphalt flex items-center justify-center">
        <div className="text-muted-text">Loading...</div>
      </div>
    );
  }

  if (!user || (user.role !== 'COACH' && !user.isAdmin)) {
    return null;
  }

  const trendsChartData = trends?.dailyStats
    ? trends.dailyStats.map((day: any) => ({
        date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sessions: day.sessions,
        avgRPE: Math.round(day.avgRPE * 10) / 10,
      }))
    : [];

  return (
    <div className="min-h-screen bg-deep-asphalt">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <Link
              href="/coach/clients"
              className="text-muted-text hover:text-text-white transition-colors text-sm mb-2 inline-block"
            >
              ← Back to Clients
            </Link>
            <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              {client?.name || client?.email || 'Client'}
            </h1>
            <p className="text-muted-text">Client overview and metrics</p>
          </div>
          <button
            onClick={() => setShowAssignModal(true)}
            className="bg-node-volt text-deep-asphalt font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Assign Program
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-concrete-grey border border-border-dark rounded-lg p-6">
              <div className="text-muted-text text-sm mb-2">Total Sessions</div>
              <div className="text-3xl font-bold text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                {stats.totalSessions || 0}
              </div>
            </div>
            <div className="bg-concrete-grey border border-border-dark rounded-lg p-6">
              <div className="text-muted-text text-sm mb-2">Avg RPE</div>
              <div className="text-3xl font-bold text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                {stats.avgRPE || 0}
              </div>
            </div>
            <div className="bg-concrete-grey border border-border-dark rounded-lg p-6">
              <div className="text-muted-text text-sm mb-2">Total Hours</div>
              <div className="text-3xl font-bold text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                {stats.totalDurationSec ? Math.round((stats.totalDurationSec / 3600) * 10) / 10 : 0}
              </div>
            </div>
            <div className="bg-concrete-grey border border-border-dark rounded-lg p-6">
              <div className="text-muted-text text-sm mb-2">Completion Rate</div>
              <div className="text-3xl font-bold text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                {stats.completionRate || 0}%
              </div>
            </div>
          </div>
        )}

        {/* Trends Chart */}
        {trendsChartData.length > 0 && (
          <div className="bg-concrete-grey border border-border-dark rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              30-Day Activity
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendsChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#b0b0b0" />
                <YAxis stroke="#b0b0b0" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e1e1e',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sessions"
                  stroke="#ccff00"
                  strokeWidth={2}
                  name="Sessions"
                />
                <Line
                  type="monotone"
                  dataKey="avgRPE"
                  stroke="#4a9eff"
                  strokeWidth={2}
                  name="Avg RPE"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Program Assignments */}
        <div className="bg-concrete-grey border border-border-dark rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Assigned Programs
          </h2>
          {assignments.length > 0 ? (
            <div className="space-y-3">
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="bg-tech-grey border border-border-dark rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-text-white text-lg">
                        {assignment.program.name}
                      </h3>
                      <div className="text-sm text-muted-text mt-1">
                        Assigned: {new Date(assignment.assignedAt).toLocaleDateString()} •{' '}
                        Status: {assignment.status}
                      </div>
                    </div>
                    <Link
                      href={`/programs/${assignment.program.slug}`}
                      className="text-node-volt hover:underline text-sm"
                    >
                      View Program →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-text">
              <p className="mb-4">No programs assigned yet.</p>
              <button
                onClick={() => setShowAssignModal(true)}
                className="text-node-volt hover:underline"
              >
                Assign a program →
              </button>
            </div>
          )}
        </div>

        {/* Assign Program Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-concrete-grey border border-border-dark rounded-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Assign Program
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-muted-text">
                    Select Program
                  </label>
                  <select
                    value={selectedProgramId}
                    onChange={(e) => setSelectedProgramId(e.target.value)}
                    className="w-full bg-tech-grey border border-border-dark rounded-lg px-4 py-3 text-text-white focus:outline-none focus:border-node-volt"
                  >
                    <option value="">Choose a program...</option>
                    {availablePrograms.map((program) => (
                      <option key={program.id} value={program.id}>
                        {program.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedProgramId('');
                  }}
                  className="flex-1 bg-tech-grey border border-border-dark text-text-white px-6 py-3 rounded-lg hover:bg-concrete-grey transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignProgram}
                  disabled={!selectedProgramId}
                  className="flex-1 bg-node-volt text-deep-asphalt font-bold px-6 py-3 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  Assign Program
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

