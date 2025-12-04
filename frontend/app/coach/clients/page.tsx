'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { coachApi, userApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function CoachClientsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [clientNotes, setClientNotes] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'COACH' && !user.isAdmin))) {
      router.push('/');
      return;
    }

    if (user) {
      loadClients();
    }
  }, [user, authLoading]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await coachApi.getClients();
      setClients(data);
    } catch (error) {
      console.error('Failed to load clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async () => {
    if (!selectedUserId) return;

    try {
      await coachApi.addClient({
        clientId: selectedUserId,
        notes: clientNotes,
        status: 'ACTIVE',
      });
      await loadClients();
      setShowAddModal(false);
      setSelectedUserId('');
      setClientNotes('');
      setSearchEmail('');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to add client');
    }
  };

  const handleRemoveClient = async (clientId: string) => {
    if (!confirm('Are you sure you want to remove this client?')) return;

    try {
      await coachApi.removeClient(clientId);
      await loadClients();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to remove client');
    }
  };

  const searchUsers = async () => {
    if (!searchEmail.trim()) return;

    try {
      // Note: This would need a user search endpoint
      // For now, we'll just use the email directly
      setSelectedUserId(searchEmail);
    } catch (error) {
      console.error('Failed to search users:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-muted-text">Loading...</div>
      </div>
    );
  }

  if (!user || (user.role !== 'COACH' && !user.isAdmin)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Clients
            </h1>
            <p className="text-muted-text">Manage your client roster</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-node-volt text-dark font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            + Add Client
          </button>
        </div>

        {/* Clients List */}
        <div className="bg-panel thin-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-panel border-b thin-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Client</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Programs</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Joined</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b thin-border hover:bg-panel/50">
                    <td className="px-6 py-4">
                      <Link
                        href={`/coach/clients/${client.clientId}`}
                        className="font-medium text-text-white hover:text-node-volt transition-colors"
                      >
                        {client.client.name || client.client.email}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded text-sm ${
                          client.status === 'ACTIVE'
                            ? 'bg-node-volt/20 text-node-volt'
                            : 'bg-panel text-muted-text'
                        }`}
                      >
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-text">
                      {client.assignments?.length || 0} active
                    </td>
                    <td className="px-6 py-4 text-muted-text text-sm">
                      {new Date(client.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link
                          href={`/coach/clients/${client.clientId}`}
                          className="text-node-volt hover:underline text-sm"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleRemoveClient(client.clientId)}
                          className="text-red-400 hover:underline text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {clients.length === 0 && (
          <div className="text-center py-12 text-muted-text">
            <p className="mb-4">No clients yet.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-node-volt hover:underline"
            >
              Add your first client →
            </button>
          </div>
        )}

        {/* Add Client Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-panel thin-border rounded-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Add Client
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-muted-text">
                    Client Email
                  </label>
                  <input
                    type="email"
                    value={searchEmail}
                    onChange={(e) => {
                      setSearchEmail(e.target.value);
                      setSelectedUserId(e.target.value);
                    }}
                    placeholder="client@example.com"
                    className="w-full bg-panel thin-border rounded-lg px-4 py-3 text-text-white focus:outline-none focus:border-node-volt"
                  />
                  <p className="text-xs text-muted-text mt-2">
                    Enter the email address of the user you want to add as a client
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-muted-text">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={clientNotes}
                    onChange={(e) => setClientNotes(e.target.value)}
                    placeholder="Any initial notes about this client..."
                    className="w-full bg-panel thin-border rounded-lg px-4 py-3 text-text-white focus:outline-none focus:border-node-volt resize-none"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedUserId('');
                    setClientNotes('');
                    setSearchEmail('');
                  }}
                  className="flex-1 bg-panel thin-border text-text-white px-6 py-3 rounded-lg hover:bg-panel transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddClient}
                  disabled={!selectedUserId}
                  className="flex-1 bg-node-volt text-dark font-bold px-6 py-3 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  Add Client
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6">
          <Link
            href="/coach"
            className="text-muted-text hover:text-text-white transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

