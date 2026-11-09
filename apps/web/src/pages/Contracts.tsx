import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "@/hooks/useAuth";
import type { AppDispatch, RootState } from "@/redux/store";
import { fetchContracts } from "@/redux/contractThunk";
import { setStatusFilter, setSelectedContract } from "@/redux/contractSlice";

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-800 border-emerald-200",
  DRAFT: "bg-amber-100 text-amber-800 border-amber-200",
  EXPIRED: "bg-slate-100 text-slate-700 border-slate-200",
  TERMINATED: "bg-rose-100 text-rose-800 border-rose-200",
};

export default function ContractsPage() {
  const { canWrite } = useAuth();
  const dispatch = useDispatch<AppDispatch>();

  const { contracts, loading, error, statusFilter, selectedContract } =
    useSelector((state: RootState) => state.contract);

  useEffect(() => {
    dispatch(fetchContracts({ status: statusFilter }));
  }, [dispatch, statusFilter]);

  const handleRefresh = () => {
    dispatch(fetchContracts({ status: statusFilter }));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="bg-white rounded-xl shadow-xs p-6 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Contracts & Scope
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Refresh contracts from database"
          >
            <svg
              className={`w-4 h-4 text-slate-500 ${loading ? "animate-spin" : ""}`}
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
            <span>Refresh</span>
          </button>

          {canWrite && (
            <Link
              to="/onboarding"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-xs transition inline-flex items-center gap-2"
            >
              <span>+ New Contract Onboarding</span>
            </Link>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2 shrink-0">
            Status:
          </span>
          {["ALL", "ACTIVE", "DRAFT", "EXPIRED", "TERMINATED"].map((st) => (
            <button
              key={st}
              onClick={() => dispatch(setStatusFilter(st))}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition shrink-0 cursor-pointer ${
                statusFilter === st
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-rose-500 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
          <button
            onClick={handleRefresh}
            className="text-xs font-semibold text-rose-700 underline hover:text-rose-900 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading state skeleton */}
      {loading && contracts.length === 0 && (
        <div className="grid grid-cols-1 gap-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4 animate-pulse"
            >
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <div className="h-5 bg-slate-200 rounded w-48" />
                  <div className="h-4 bg-slate-100 rounded w-64" />
                </div>
                <div className="h-8 bg-slate-200 rounded w-32" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="h-20 bg-slate-100 rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && contracts.length === 0 && !error && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-base font-bold text-slate-800">
            No contracts found
          </h3>

          <div className="mt-5 flex items-center justify-center gap-3">
            {statusFilter !== "ALL" && (
              <button
                type="button"
                onClick={() => dispatch(setStatusFilter("ALL"))}
                className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Clear filter
              </button>
            )}
            {canWrite && (
              <Link
                to="/onboarding"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
              >
                + Start Onboarding
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Contracts Grid */}
      <div className="grid grid-cols-1 gap-6">
        {contracts.map((cnt) => (
          <div
            key={cnt.id}
            className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden hover:shadow-md transition"
          >
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-slate-900">
                      {cnt.customerName}
                    </h3>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase border ${
                        STATUS_COLORS[cnt.status] ||
                        "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {cnt.status}
                    </span>
                    {!cnt.onboardingCompleted && (
                      <Link
                        to="/onboarding"
                        className="text-[11px] font-semibold bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.5 rounded hover:bg-rose-100 transition inline-flex items-center gap-1"
                        title="Click to resume onboarding"
                      >
                        <span>
                          Onboarding Incomplete (Step {cnt.onboardingStep}/5)
                        </span>
                        <span>&rarr;</span>
                      </Link>
                    )}
                  </div>
                  <p className="text-sm font-medium text-slate-600 mt-1">
                    {cnt.scopeDescription || "No scope description provided."}
                  </p>
                </div>

                {/* Dates & Payment terms badges */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Contract Term
                    </span>
                    <span className="font-mono font-medium text-slate-800">
                      {cnt.startDate || "N/A"} &rarr; {cnt.endDate || "N/A"}
                    </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Payment Terms
                    </span>
                    <span className="font-medium text-slate-800">
                      {cnt.billingFrequency} &middot; {cnt.billingTiming}
                    </span>
                  </div>
                </div>
              </div>

              {/* Service Breakdown (FR4, FR5) */}
              <div className="mt-4">
                {cnt.services && cnt.services.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {cnt.services.map((srv) => (
                      <div
                        key={srv.id}
                        className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex flex-col justify-between"
                      >
                        <div>
                          <span className="font-bold text-slate-900 block text-sm">
                            {srv.serviceTypeName}
                          </span>
                          <p className="text-slate-500 font-mono text-[11px] mt-1">
                            {srv.startDate} to {srv.endDate || "End"}
                          </p>
                        </div>

                        <div className="mt-2 pt-2 border-t border-slate-200">
                          {srv.monthlyAmount !== undefined &&
                          srv.monthlyAmount !== null ? (
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500">Fixed Fee:</span>
                              <span className="font-bold font-mono text-slate-900">
                                AED {srv.monthlyAmount.toLocaleString()}/mo
                              </span>
                            </div>
                          ) : (
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500">
                                Cloud Discount:
                              </span>
                              <span className="font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                {srv.discountPercentage ?? 0}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    No services associated with this contract yet.
                  </p>
                )}
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
                <span>
                  Billable status:{" "}
                  <strong
                    className={
                      cnt.onboardingCompleted
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }
                  >
                    {cnt.onboardingCompleted ? "Billable" : "Not billable"}
                  </strong>
                </span>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => dispatch(setSelectedContract(cnt))}
                    className="font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    View Full Contract Details &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Contract Details Modal */}
      {selectedContract && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedContract.customerName}
                </h3>
                {/* <p className="text-xs text-slate-500 font-mono">
                  ID: {selectedContract.id}
                </p> */}
              </div>
              <button
                onClick={() => dispatch(setSelectedContract(null))}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase">
                    Status
                  </span>
                  <div className="mt-1">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase border ${
                        STATUS_COLORS[selectedContract.status] ||
                        "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {selectedContract.status}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase">
                  Scope
                </span>
                <p className="font-medium text-slate-800 mt-0.5">
                  {selectedContract.scopeDescription || "None provided"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 uppercase">Start Date:</span>{" "}
                  <strong className="text-slate-800 font-mono">
                    {selectedContract.startDate || "N/A"}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 uppercase">End Date:</span>{" "}
                  <strong className="text-slate-800 font-mono">
                    {selectedContract.endDate || "N/A"}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 uppercase">Frequency:</span>{" "}
                  <strong className="text-slate-800">
                    {selectedContract.billingFrequency}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 uppercase">Timing:</span>{" "}
                  <strong className="text-slate-800">
                    {selectedContract.billingTiming}
                  </strong>
                </div>
              </div>

              {/* Linked Cloud Accounts */}
              {selectedContract.cloudAccounts &&
                selectedContract.cloudAccounts.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase block mb-2">
                      Linked Cloud Accounts
                    </span>
                    <div className="space-y-1.5">
                      {selectedContract.cloudAccounts.map((ca) => (
                        <div
                          key={ca.id}
                          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs flex justify-between items-center"
                        >
                          <span className="font-bold text-slate-700">
                            {ca.provider}
                          </span>
                          <span className="font-mono text-slate-600">
                            {ca.externalAccountId}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Service Components */}
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase block mb-2">
                  Service Components ({selectedContract.services?.length || 0})
                </span>
                {selectedContract.services &&
                selectedContract.services.length > 0 ? (
                  <div className="space-y-2">
                    {selectedContract.services.map((s, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-800">
                            {s.serviceTypeName}
                          </span>
                          <p className="text-[11px] text-slate-500 font-mono">
                            Effective: {s.startDate} to{" "}
                            {s.endDate || "Contract End"}
                          </p>
                        </div>
                        <div className="text-right">
                          {s.monthlyAmount !== undefined &&
                          s.monthlyAmount !== null ? (
                            <span className="font-mono font-bold text-slate-900">
                              AED {s.monthlyAmount.toLocaleString()}/mo
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                              {s.discountPercentage ?? 0}% Discount on Usage
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    No services listed.
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end mt-6 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => dispatch(setSelectedContract(null))}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
