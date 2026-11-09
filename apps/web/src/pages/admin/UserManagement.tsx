import { useEffect, useState, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Roles, type RoleType } from "@/types/roles";
import { toast } from "sonner";
import type { AppDispatch, RootState } from "@/redux/store";
import {
  fetchUsers,
  updateUserRole,
  createUser,
  updateUserStatus,
} from "@/redux/userThunk";

export default function UserManagementPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading, updateLoading } = useSelector(
    (state: RootState) => state.user,
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<RoleType>(Roles.END_USER);

  //todo: get the current user and disable edit option
  
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchUsers());
  };

  const handleAddUser = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter user email");
      return;
    }

    if (!password.trim()) {
      toast.error("Please enter password");
      return;
    }

    const action = await dispatch(
      createUser({
        name: name || email.split("@")[0],
        password,
        email,
        role,
        isActive: true,
      }),
    );

    if (createUser.fulfilled.match(action)) {
      toast.success("New user created!");
      setIsModalOpen(false);
      setName("");
      setEmail("");
      setPassword("");
      setRole(Roles.END_USER);
    } else {
      toast.error(action.payload || "Failed to create user");
    }
  };

  const handleToggleActive = async (id: string) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;
    const nextStatus = !target.isActive;

    const action = await dispatch(
      updateUserStatus({
        id,
        isActive: nextStatus,
      }),
    );

    if (updateUserStatus.fulfilled.match(action)) {
      toast.success(
        nextStatus
          ? `User ${target.name} reactivated`
          : `User ${target.name} deactivated (retained in history)`,
      );
    } else {
      const errorMsg =
        typeof action.payload === "string"
          ? action.payload
          : "Failed to update user status";
      toast.error(errorMsg);
    }
  };

  const handleChangeRole = async (id: string, newRole: RoleType) => {
    const action = await dispatch(
      updateUserRole({
        id,
        role: newRole,
      }),
    );

    if (updateUserRole.fulfilled.match(action)) {
      toast.success("Role updated successfully!");
    } else {
      const errorMsg =
        typeof action.payload === "string"
          ? action.payload
          : "Failed to update role";
      toast.error(errorMsg);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900">
              User & Role Management
            </h2>
            <span className="text-xs px-3 py-0.5 rounded font-bold bg-blue-100 text-blue-700">
              Admin Only
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
        >
          + Add User
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Users ({loading ? "..." : users?.length})
            </h2>
            {loading && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <svg
                  className="animate-spin h-3 w-3 text-blue-600"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Loading
              </span>
            )}
            {updateLoading && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                Updating...
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={loading || updateLoading}
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium px-2 py-1 rounded-md hover:bg-slate-200/60 transition disabled:opacity-50"
              title="Refresh users"
            >
              <svg
                className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-3 text-left">User Name & Email</th>
                <th className="px-6 py-3 text-left">Assigned Role</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Created At</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                      <p className="text-sm font-semibold text-slate-700">
                        Loading platform users...
                      </p>
                      <p className="text-xs text-slate-400">
                        Fetching users from server
                      </p>
                    </div>
                  </td>
                </tr>
              ) : users?.length > 0 ? (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{u.name}</p>
                      <p className="text-xs text-slate-400 font-mono">
                        {u.email}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={u.role}
                        disabled={updateLoading}
                        onChange={(e) =>
                          handleChangeRole(u.id, e.target.value as RoleType)
                        }
                        className={`text-xs font-bold px-2.5 py-1 rounded-md border focus:outline-none transition ${
                          u.role === Roles.ADMIN
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : u.role === Roles.VIEWER
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        <option value={Roles.ADMIN}>ADMIN</option>
                        <option value={Roles.END_USER}>END_USER</option>
                        <option value={Roles.VIEWER}>VIEWER</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                          u.isActive
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-600 line-through"
                        }`}
                      >
                        {u.isActive ? "Active" : "Deactivated"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                      {u.createdAt}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleActive(u.id)}
                        disabled={updateLoading}
                        className={`text-xs font-semibold px-3 py-1 rounded transition disabled:opacity-50 ${
                          u.isActive
                            ? "text-rose-600 hover:bg-rose-50"
                            : "text-emerald-600 hover:bg-emerald-50"
                        }`}
                      >
                        {u.isActive ? "Deactivate" : "Reactivate"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-slate-500 text-sm"
                  >
                    No platform users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Add Users 
            </h3>

            <form onSubmit={handleAddUser} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Finance"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@f9infotech.com"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password *
                </label>
                <input
                  type="email"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin@1234"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as RoleType)}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-semibold"
                >
                  <option value={Roles.ADMIN}>
                    ADMIN - Platform Owner (Full Write + Admin)
                  </option>
                  <option value={Roles.END_USER}>
                    END_USER - Sales, Delivery & Finance (Write Access)
                  </option>
                  <option value={Roles.VIEWER}>
                    VIEWER - Management Visibility (Read-Only)
                  </option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                >
                  {updateLoading ? "Saving..." : "Add User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
