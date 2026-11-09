import { useEffect, useState, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { billingFrequencies, billingTimings } from "@/data/mockData";
import { toast } from "sonner";
import type { AppDispatch, RootState } from "@/redux/store";
import {
  fetchServiceTypes,
  createServiceType,
  updateServiceType,
  updateServiceTypeStatus,
  deleteServiceType,
  type ServiceTypeData,
} from "@/redux/serviceTypeThunk";

export default function DropdownSettingsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { serviceTypes, loading, updateLoading } = useSelector(
    (state: RootState) => state.serviceTypes,
  );

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [newMonthlyPrice, setNewMonthlyPrice] = useState<string>("0");
  const [newIsActive, setNewIsActive] = useState(true);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ServiceTypeData | null>(null);
  const [editName, setEditName] = useState("");
  const [editMonthlyPrice, setEditMonthlyPrice] = useState<string>("0");
  const [editIsActive, setEditIsActive] = useState(true);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<ServiceTypeData | null>(
    null,
  );

  useEffect(() => {
    dispatch(fetchServiceTypes());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchServiceTypes());
  };

  const handleOpenAddModal = () => {
    setNewServiceName("");
    setNewMonthlyPrice("0");
    setNewIsActive(true);
    setIsAddModalOpen(true);
  };

  const handleAddServiceType = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = newServiceName.trim();
    if (!trimmedName) {
      toast.error("Service type name is required");
      return;
    }

    const priceNum = parseFloat(newMonthlyPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error("Please enter a valid monthly price (0 or higher)");
      return;
    }

    const action = await dispatch(
      createServiceType({
        name: trimmedName,
        serviceName: trimmedName,
        monthlyPrice: priceNum,
        monthlyBaseCharge: priceNum,
        isActive: newIsActive,
      }),
    );

    if (createServiceType.fulfilled.match(action)) {
      toast.success(
        `Service Type "${action.payload.name}" created successfully`,
      );
      setIsAddModalOpen(false);
      setNewServiceName("");
      setNewMonthlyPrice("0");
    } else {
      const errorMsg =
        typeof action.payload === "string"
          ? action.payload
          : "Failed to create service type";
      toast.error(errorMsg);
    }
  };

  const handleOpenEditModal = (item: ServiceTypeData) => {
    setEditingItem(item);
    setEditName(item.name || item.serviceName || "");
    setEditMonthlyPrice(
      item.monthlyPrice !== undefined ? String(item.monthlyPrice) : "0",
    );
    setEditIsActive(item.isActive);
    setIsEditModalOpen(true);
  };

  const handleUpdateServiceType = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const trimmedName = editName.trim();
    if (!trimmedName) {
      toast.error("Service type name cannot be empty");
      return;
    }

    const priceNum = parseFloat(editMonthlyPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error("Please enter a valid monthly price");
      return;
    }

    const action = await dispatch(
      updateServiceType({
        id: editingItem.id,
        name: trimmedName,
        serviceName: trimmedName,
        monthlyPrice: priceNum,
        monthlyBaseCharge: priceNum,
        isActive: editIsActive,
      }),
    );

    if (updateServiceType.fulfilled.match(action)) {
      toast.success(`Service type "${action.payload.name}" updated`);
      setIsEditModalOpen(false);
      setEditingItem(null);
    } else {
      const errorMsg =
        typeof action.payload === "string"
          ? action.payload
          : "Failed to update service type";
      toast.error(errorMsg);
    }
  };

  const handleToggleStatus = async (item: ServiceTypeData) => {
    const nextStatus = !item.isActive;
    const action = await dispatch(
      updateServiceTypeStatus({
        id: item.id,
        isActive: nextStatus,
      }),
    );

    if (updateServiceTypeStatus.fulfilled.match(action)) {
      toast.success(
        `Service type ${item.name || item.serviceName} ${
          nextStatus ? "enabled" : "disabled"
        }`,
      );
    } else {
      const errorMsg =
        typeof action.payload === "string"
          ? action.payload
          : "Failed to update status";
      toast.error(errorMsg);
    }
  };

  // const handleOpenDeleteModal = (item: ServiceTypeData) => {
  //   setDeletingItem(item);
  //   setIsDeleteModalOpen(true);
  // };

  const handleDeleteServiceType = async () => {
    if (!deletingItem) return;

    const action = await dispatch(deleteServiceType(deletingItem.id));

    if (deleteServiceType.fulfilled.match(action)) {
      toast.success(
        `Service type "${deletingItem.name || deletingItem.serviceName}" deleted`,
      );
      setIsDeleteModalOpen(false);
      setDeletingItem(null);
    } else {
      const errorMsg =
        typeof action.payload === "string"
          ? action.payload
          : "Failed to delete service type";
      toast.error(errorMsg);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-xs p-6 border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-slate-900">
                Dropdown Settings
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-100 text-blue-700">
                Admin Only
              </span>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="self-start sm:self-auto text-xs px-3 py-1.5 border border-slate-300 hover:bg-slate-50 rounded-lg text-slate-700 font-medium transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Service Types Section (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Service Types
                </h2>
                <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                  {serviceTypes.length} configured
                </span>
              </div>
            </div>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Type
            </button>
          </div>

          {/* Service Types Table / List */}
          {loading ? (
            <div className="py-16 text-center text-slate-500">
              <svg
                className="w-7 h-7 animate-spin mx-auto text-blue-600 mb-2"
                fill="none"
                viewBox="0 0 24 24"
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
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              <p className="text-xs">Loading service types...</p>
            </div>
          ) : serviceTypes.length === 0 ? (
            <div className="py-12 text-center text-slate-500 border border-dashed rounded-lg">
              <p className="text-xs font-medium">No service types found.</p>
              <button
                onClick={handleOpenAddModal}
                className="mt-3 text-xs text-blue-600 hover:underline font-semibold"
              >
                Create your first service type
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                    <th className="py-3 px-3">Service Name</th>
                    <th className="py-3 px-3">Monthly Charge (AED)</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {serviceTypes.map((st) => {
                    const displayName = st.name || st.serviceName;
                    const price =
                      st.monthlyPrice ?? Number(st.monthlyBaseCharge ?? 0);
                    return (
                      <tr
                        key={st.id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                st.isActive ? "bg-emerald-500" : "bg-slate-300"
                              }`}
                            />
                            <div>
                              <span className="font-semibold text-slate-900 block">
                                {displayName}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-800">
                            {price > 0 ? (
                              <>
                                AED{" "}
                                {price.toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                                <span className="text-[10px] text-slate-400 font-normal ml-1">
                                  / month
                                </span>
                              </>
                            ) : (
                              <span className="text-slate-400 italic">
                                AED 0.00 (Usage/Variable)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              st.isActive
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {st.isActive ? "Active" : "Disabled"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditModal(st)}
                              disabled={updateLoading}
                              className="px-2 py-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded text-xs font-medium transition cursor-pointer disabled:opacity-50"
                              title="Edit Service Type"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleToggleStatus(st)}
                              disabled={updateLoading}
                              className={`px-2 py-1 rounded text-xs font-medium transition cursor-pointer disabled:opacity-50 ${
                                st.isActive
                                  ? "text-amber-600 hover:bg-amber-50"
                                  : "text-emerald-600 hover:bg-emerald-50"
                              }`}
                              title={
                                st.isActive
                                  ? "Disable service"
                                  : "Enable service"
                              }
                            >
                              {st.isActive ? "Disable" : "Enable"}
                            </button>
                            {/* <button
                              onClick={() => handleOpenDeleteModal(st)}
                              disabled={updateLoading}
                              className="px-2 py-1 text-rose-600 hover:bg-rose-50 rounded text-xs font-medium transition cursor-pointer disabled:opacity-50"
                              title="Delete Service Type"
                            >
                              Delete
                            </button> */}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payment Terms Lookups (1 Column) */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">
              Payment Terms 
            </h2>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Billing Frequencies
            </h3>
            <div className="flex flex-wrap gap-2">
              {billingFrequencies.map((f) => (
                <span
                  key={f}
                  className="px-3 py-1.5 bg-slate-100 text-slate-800 rounded-lg border border-slate-200 text-xs font-semibold"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Billing Timings
            </h3>
            <div className="flex flex-wrap gap-2">
              {billingTimings.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1.5 bg-slate-100 text-slate-800 rounded-lg border border-slate-200 text-xs font-semibold"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Service Type Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Add Service Type
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition cursor-pointer"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddServiceType} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Service Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  placeholder="e.g. 24/7 SOC Monitoring / Database Admin"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Monthly Base Charge (AED){" "}
                  <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-semibold text-xs pointer-events-none">
                    AED
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={newMonthlyPrice}
                    onChange={(e) => setNewMonthlyPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-12 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsActive}
                    onChange={(e) => setNewIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">
                      Active
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={updateLoading}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg text-slate-700 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  {updateLoading ? (
                    <>
                      <svg
                        className="w-3.5 h-3.5 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
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
                          d="M4 12a8 8 0 018-8v8H4z"
                        />
                      </svg>
                      Creating...
                    </>
                  ) : (
                    "Create Service Type"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Service Type Modal */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Edit Service Type
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingItem(null);
                }}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition cursor-pointer"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form
              onSubmit={handleUpdateServiceType}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Service Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Monthly Base Charge (AED){" "}
                  <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-semibold text-xs pointer-events-none">
                    AED
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={editMonthlyPrice}
                    onChange={(e) => setEditMonthlyPrice(e.target.value)}
                    className="w-full pl-12 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editIsActive}
                    onChange={(e) => setEditIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">
                      Active
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingItem(null);
                  }}
                  disabled={updateLoading}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg text-slate-700 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  {updateLoading ? (
                    <>
                      <svg
                        className="w-3.5 h-3.5 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
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
                          d="M4 12a8 8 0 018-8v8H4z"
                        />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deletingItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-3 text-rose-600">
              <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Delete Service Type
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Are you sure you want to remove{" "}
              <span className="font-semibold text-slate-900">
                "{deletingItem.name || deletingItem.serviceName}"
              </span>
              ? This service will no longer be selectable for new contracts.
            </p>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletingItem(null);
                }}
                disabled={updateLoading}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteServiceType}
                disabled={updateLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                {updateLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
