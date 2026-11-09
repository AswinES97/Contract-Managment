import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "@/hooks/useAuth";
import type { AppDispatch, RootState } from "@/redux/store";
import {
  fetchDashboardStats,
  type DashboardRecentContract,
  type DashboardCloudUsageItem,
} from "@/redux/dashboardThunk";
import { fetchBills, syncInvoiceStatus } from "@/redux/billingThunk";
import type { Bill } from "@/types/contractManagement";
import { toast } from "sonner";

export default function DashboardPage() {
  const { user, isViewer, canWrite } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const { stats, loading, error } = useSelector(
    (state: RootState) => state.dashboard,
  );
  const { bills } = useSelector((state: RootState) => state.billing);

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchBills());
  }, [dispatch]);

  const handleSyncFinanceStatus = async (billId: string) => {
    if (isViewer) {
      toast.error(
        "Read-only access: Viewers cannot trigger invoice status checks.",
      );
      return;
    }
    try {
      await dispatch(syncInvoiceStatus(billId)).unwrap();
      toast.success("Finance system invoice status refreshed!");
    } catch {
      toast.error("Failed to refresh finance status");
    }
  };

  const handleRefresh = () => {
    dispatch(fetchDashboardStats());
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-xl shadow-xs p-6 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900">
              Contract & Billing Operations
            </h2>
            <span className="text-xs px-2.5 py-1 rounded font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-center justify-between">
          <span>Failed to load dashboard statistics: {error}</span>
          <button
            onClick={handleRefresh}
            className="underline font-medium hover:text-rose-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Active Contracts
          </p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">
            {loading && !stats ? "..." : (stats?.activeContracts ?? 0)}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Customers
          </p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">
            {loading && !stats ? "..." : (stats?.totalCustomers ?? 0)}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Monthly Rec. Revenue
          </p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">
            {loading && !stats
              ? "..."
              : `AED ${(stats?.monthlyRecurringRevenue ?? 0).toLocaleString()}`}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Onboarding In Progress
          </p>
          <p className="text-3xl font-extrabold text-amber-600 mt-2">
            {loading && !stats ? "..." : (stats?.onboardingInProgress ?? 0)}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Contracts
              </span>
            </div>
            <Link
              to="/contracts"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              View All Contracts &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-3 text-left">Customer</th>
                  <th className="px-6 py-3 text-left">Scope Description</th>
                  <th className="px-6 py-3 text-left">Payment Terms</th>
                  <th className="px-6 py-3 text-left">End Date</th>
                  <th className="px-6 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {stats?.recentContracts && stats.recentContracts.length > 0 ? (
                  stats.recentContracts.map((c: DashboardRecentContract) => (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {c.customerName}
                      </td>
                      <td className="px-6 py-4 text-slate-600 max-w-xs truncate">
                        {c.scopeDescription || "Standard agreement"}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <span className="font-medium text-slate-800">
                          {c.billingFrequency}
                        </span>
                        <span className="text-slate-400 block">
                          {c.billingTiming}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">
                        {c.endDate || "Ongoing"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                            c.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-800"
                              : c.status === "DRAFT"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-800"
                          }`}
                        >
                          {c.status}
                          {!c.onboardingCompleted ? " (Unfinished)" : ""}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-slate-400 text-sm"
                    >
                      {loading
                        ? "Loading contracts..."
                        : "No contracts found in database."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Question 2: Cloud Consumption / Billing overview */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  Cloud
                </span>
              </div>
              <Link
                to="/cloud-usage"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                All Cloud Accounts &rarr;
              </Link>
            </div>

            <div className="overflow-x-auto">
              {stats?.recentCloudUsage && stats.recentCloudUsage.length > 0 ? (
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-6 py-3 text-left">Customer</th>
                      <th className="px-6 py-3 text-left">
                        Provider & Account
                      </th>
                      <th className="px-6 py-3 text-left">Month</th>
                      <th className="px-6 py-3 text-right font-bold text-slate-900">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {stats.recentCloudUsage.map(
                      (u: DashboardCloudUsageItem) => (
                        <tr
                          key={u.id}
                          className="hover:bg-slate-50/70 transition"
                        >
                          <td className="px-6 py-4 font-semibold text-slate-900">
                            {u.customerName}
                          </td>
                          <td className="px-6 py-4 text-xs">
                            <span className="font-semibold text-slate-800">
                              {u.provider}
                            </span>
                            <span className="text-slate-400 block font-mono text-[11px]">
                              {u.externalAccountId}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs font-mono text-slate-600">
                            {u.billingMonth}
                          </td>
                          <td className="px-6 py-4 text-right font-mono font-bold text-slate-900 text-sm">
                            {u.currency} {u.amount.toLocaleString()}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              ) : (
                <div className="p-6">
                  {/* Fallback to Billing Summary table if cloud usage is empty */}
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase font-semibold">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          Customer & Period
                        </th>
                        <th className="px-4 py-3 text-right">Fixed Fees</th>
                        <th className="px-4 py-3 text-right">Cloud (Net)</th>
                        <th className="px-4 py-3 text-right font-bold text-slate-900">
                          Total (AED)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {bills.map((b: Bill) => (
                        <tr
                          key={b.id}
                          className="hover:bg-slate-50/70 transition"
                        >
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-900">
                              {b.customerName}
                            </p>
                            <p className="text-xs text-slate-400">
                              {b.billingMonth}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-slate-600 text-xs">
                            AED {b.fixedAmount.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-slate-600 text-xs">
                            AED{" "}
                            {(
                              b.cloudUsageAmount - b.cloudDiscountAmount
                            ).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 text-sm">
                            AED {b.totalAmount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                Bill
              </span>

              <div className="space-y-4">
                {bills.map((b: Bill) => (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-slate-900">
                        {b.customerName.split("(")[0]}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          b.invoiceStatus.status === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-800"
                            : b.invoiceStatus.status === "RAISED"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {b.invoiceStatus.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>
                        {b.invoiceStatus.invoiceNumber || "No Invoice #"}
                      </span>
                      <span className="font-mono">
                        AED {b.totalAmount.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 pt-1 border-t border-slate-200">
                      <span>
                        Checked: {b.invoiceStatus.checkedAt.split(" ")[1]}
                      </span>
                      {canWrite && (
                        <button
                          onClick={() => handleSyncFinanceStatus(b.id)}
                          className="text-blue-600 font-semibold hover:underline"
                        >
                          Re-check API
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
