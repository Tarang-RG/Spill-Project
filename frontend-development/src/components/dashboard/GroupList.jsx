import { useState } from "react";
import { Plus, Users, X, Copy, Check, UserPlus } from "lucide-react";
import { createGroup, joinGroup } from "../../services/groupService";
import { useNavigate } from "react-router";

export default function GroupList({ groups = [], loading, onGroupCreated }) {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");
  const navigate = useNavigate();

  async function handleCreateGroup(e) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Group name is required.");
      return;
    }

    try {
      setCreating(true);

      const newGroup = await createGroup({
        name: name.trim(),
        description: description.trim()
      });

      onGroupCreated?.(newGroup);

      setName("");
      setDescription("");
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || "Could not create group. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  async function copyInviteCode(group) {
    try {
      await navigator.clipboard.writeText(group.inviteCode);
      setCopiedId(group.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setError("Could not copy invite code.");
    }
  }

  async function handleJoinGroup(e) {
    e.preventDefault();
    setJoinError("");

    if (!inviteCode.trim()) {
        setJoinError("Please enter an invite code.");
        return;
    }

    try {
        setJoining(true);

        const joinedGroup = await joinGroup(inviteCode.trim());

        onGroupCreated?.(joinedGroup);

        setInviteCode("");
        setShowJoinModal(false);
    } catch (err) {
        setJoinError(
            err.response?.data?.message || "Unable to join group. Check the invite code."
        );
    } finally {
        setJoining(false);
    }
  }

  return (
    <>
      <section className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">My Groups</h3>
            <p className="text-sm text-slate-500 mt-1">
              Manage your shared expenses.
            </p>
          </div>

          <div className="flex items-center gap-2">
              <button
                  onClick={() => setShowJoinModal(true)}
                  className="flex items-center gap-2 border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold"
              >
                <UserPlus size={18} />
                Join
              </button>

              <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-semibold"
              >
              <Plus size={18} />
              Create Group
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-center py-12 text-slate-500">Loading groups...</p>
        ) : groups.length === 0 ? (
          <div className="py-12 flex flex-col items-center text-center">
            <div className="bg-green-50 text-green-600 p-5 rounded-full mb-4">
              <Users size={30} />
            </div>

            <h4 className="font-semibold text-slate-800">No groups yet</h4>

            <p className="text-sm text-slate-500 mt-2 max-w-sm">
              Create your first group or join your friends to start splitting bills.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map((group) => (
              <div
                key={group.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-200 rounded-xl p-4 hover:border-green-300 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-green-50 text-green-600 p-3 rounded-xl">
                    <Users size={22} />
                  </div>

                  <div>
                    <button
                        onClick={() => navigate(`/groups/${group.id}`)}
                        className="font-semibold text-slate-900 hover:text-green-700 text-left"
                    >
                        {group.name}
                    </button>
                    <p className="text-xs text-slate-500 mt-1">
                      {group.role} · Invite code: {group.inviteCode}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => copyInviteCode(group)}
                  className="flex items-center justify-center gap-2 text-sm text-green-700 hover:bg-green-50 px-3 py-2 rounded-lg"
                >
                  {copiedId === group.id ? <Check size={16} /> : <Copy size={16} />}
                  {copiedId === group.id ? "Copied" : "Copy code"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                Create a Group
              </h3>

              <button
                onClick={() => {
                  setShowModal(false);
                  setError("");
                }}
                className="text-slate-500 hover:text-slate-800"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. College Friends"
                  maxLength={100}
                  required
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this group for?"
                  maxLength={500}
                  rows={3}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <button
                type="submit"
                disabled={creating}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white py-3 rounded-xl font-semibold"
              >
                {creating ? "Creating..." : "Create Group"}
              </button>
            </form>
          </div>
        </div>
      )}
      {showJoinModal && (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl">

            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">
                    Join a Group
                </h3>

                <button
                    onClick={() => {
                        setShowJoinModal(false);
                        setJoinError("");
                    }}
                    className="text-slate-500 hover:text-slate-800"
                >
                    <X size={22} />
                </button>
            </div>

            <form onSubmit={handleJoinGroup} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Invite Code
                    </label>

                    <input
                        type="text"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                        placeholder="Enter invite code"
                        maxLength={12}
                        required
                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 uppercase"
                    />
                </div>

                {joinError && (
                    <p className="text-sm text-red-600">{joinError}</p>
                )}

                <button
                    type="submit"
                    disabled={joining}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white py-3 rounded-xl font-semibold"
                >
                    {joining ? "Joining..." : "Join Group"}
                </button>
            </form>
        </div>
    </div>
)}
    </>
  );
}
