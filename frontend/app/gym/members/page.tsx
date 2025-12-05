'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { gymApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { ClickableUserName } from '@/components/user/ClickableUserName';

export default function GymMembersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [membershipType, setMembershipType] = useState('MONTHLY');

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'GYM_OWNER' && !user.isAdmin))) {
      router.push('/');
      return;
    }

    if (user) {
      loadMembers();
    }
  }, [user, authLoading]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await gymApi.getMembers();
      setMembers(data);
    } catch (error) {
      console.error('Failed to load members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUserId) return;

    try {
      await gymApi.addMember({
        memberId: selectedUserId,
        membershipType,
        status: 'ACTIVE',
      });
      await loadMembers();
      setShowAddModal(false);
      setSelectedUserId('');
      setSearchEmail('');
      setMembershipType('MONTHLY');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      await gymApi.removeMember(memberId);
      await loadMembers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to remove member');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-muted-text">Loading...</div>
      </div>
    );
  }

  if (!user || (user.role !== 'GYM_OWNER' && !user.isAdmin)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Members
            </h1>
            <p className="text-muted-text">Manage your gym member roster</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-node-volt text-dark font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            + Add Member
          </button>
        </div>

        {/* Members List */}
        <div className="bg-panel thin-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-panel border-b thin-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Member</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Membership</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Joined</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id} className="border-b thin-border hover:bg-panel/50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-text-white">
                        <ClickableUserName
                          userId={member.memberId}
                          name={member.member.name}
                          email={member.member.email}
                          className="text-text-white"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded text-sm ${
                          member.status === 'ACTIVE'
                            ? 'bg-node-volt/20 text-node-volt'
                            : 'bg-panel text-muted-text'
                        }`}
                      >
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-text">
                      {member.membershipType || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-muted-text text-sm">
                      {new Date(member.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleRemoveMember(member.memberId)}
                        className="text-red-400 hover:underline text-sm"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {members.length === 0 && (
          <div className="text-center py-12 text-muted-text">
            <p className="mb-4">No members yet.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-node-volt hover:underline"
            >
              Add your first member →
            </button>
          </div>
        )}

        {/* Add Member Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-panel thin-border rounded-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Add Member
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-muted-text">
                    Member Email
                  </label>
                  <input
                    type="email"
                    value={searchEmail}
                    onChange={(e) => {
                      setSearchEmail(e.target.value);
                      setSelectedUserId(e.target.value);
                    }}
                    placeholder="member@example.com"
                    className="w-full bg-panel thin-border rounded-lg px-4 py-3 text-text-white focus:outline-none focus:border-node-volt"
                  />
                  <p className="text-xs text-muted-text mt-2">
                    Enter the email address of the user you want to add as a member
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-muted-text">
                    Membership Type
                  </label>
                  <select
                    value={membershipType}
                    onChange={(e) => setMembershipType(e.target.value)}
                    className="w-full bg-panel thin-border rounded-lg px-4 py-3 text-text-white focus:outline-none focus:border-node-volt"
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="ANNUAL">Annual</option>
                    <option value="DROP_IN">Drop-In</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedUserId('');
                    setSearchEmail('');
                    setMembershipType('MONTHLY');
                  }}
                  className="flex-1 bg-panel thin-border text-text-white px-6 py-3 rounded-lg hover:bg-panel transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMember}
                  disabled={!selectedUserId}
                  className="flex-1 bg-node-volt text-dark font-bold px-6 py-3 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  Add Member
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6">
          <Link
            href="/gym"
            className="text-muted-text hover:text-text-white transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

