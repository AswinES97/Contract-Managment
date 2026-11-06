import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { initialCloudUsage } from "@/data/mockData";
import type { CloudUsageMonthly } from "@/types/contractManagement";
import { toast } from "sonner";

export default function CloudUsagePage() {
  const { canWrite, isViewer } = useAuth();
  const [usageList, setUsageList] = useState<CloudUsageMonthly[]>(initialCloudUsage);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAzureModalOpen, setIsAzureModalOpen] = useState(false);

  // Azure form state
  const [azureCustomer, setAzureCustomer] = useState("Customer B (FinTech Global)");
  const [azureAccount, setAzureAccount] = useState("sub-azure-9921-prod");
  const [azureMonth, setAzureMonth] = useState("2026-11");
  const [azureAmount, setAzureAmount] = useState(8500);

  const handleSyncAWS = () => {
    if (isViewer) {
      toast.error("Viewers have read-only access. Cannot trigger cloud sync.");
      return;
    }

    setIsSyncing(true);
    toast.info("Connecting to AWS Cost Explorer API (GetCostAndUsage)...");

    setTimeout(() => {
      const nowStr = new Date().toISOString().replace("T", " ").slice(0, 19);
      setUsageList((prev) =>
        prev.map((u) => {
          if (u.provider === "AWS") {
            return {
              ...u,
              fetchedAt: `${nowStr} (Re-synced via AWS Cost Explorer API)`,
            };
          }
          return u;
        })
      );
      setIsSyncing(false);
      toast.success("AWS monthly usage successfully synchronized!");
    }, 1200);
  };

  const handleAddAzure = (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewer) {
      toast.error("Viewers cannot record cloud usage.");
      return;
    }

    const newRecord: CloudUsageMonthly = {
      id: "cu-" + Date.now(),
      customerName: azureCustomer,
      provider: "AZURE",
      externalAccountId: azureAccount,
      billingMonth: azureMonth,
      amount: azureAmount,
      currency: "AED",
      fetchedAt: `${new Date().toISOString().replace("T", " ").slice(0, 19)} (Manual Entry / CSV)`,
      discountPercentage: 0,
      netAmount: azureAmount,
    };

    setUsageList([newRecord, ...usageList]);
    setIsAzureModalOpen(false);
    toast.success("Azure monthly usage recorded successfully!");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cloud Usage & Sync</h1>
          <p className="text-sm text-slate-500 mt-1">
            FR6: AWS API monthly cost sync (GetCostAndUsage) and Azure manual/CSV usage records.
          </p>
        </div>

        {canWrite ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAzureModalOpen(true)}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold transition"
            >
              + Upload Azure Usage (CSV / Manual)
            </button>
            <button
              disabled={isSyncing}
              onClick={handleSyncAWS}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold shadow-sm transition flex items-center gap-2"
            >
              <span>{isSyncing ? "Syncing AWS..." : "⚡ Trigger AWS Usage Sync"}</span>
            </button>
          </div>
        ) : (
          <span className="text-xs bg-slate-100 text-slate-500 border border-slate-200 px-3 py-1.5 rounded-lg font-medium">
            Read-Only Access
          </span>
        )}
      </div>

      {/* Cloud Usage Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Synced Cloud Accounts & Consumption Records
          </h2>
          <span className="text-xs text-slate-500">
            {usageList.length} Accounts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-3 text-left">Customer</th>
                <th className="px-6 py-3 text-left">Provider & Account</th>
                <th className="px-6 py-3 text-left">Billing Month</th>
                <th className="px-6 py-3 text-right">Actual Cost (AED)</th>
                <th className="px-6 py-3 text-right">Discount</th>
                <th className="px-6 py-3 text-right font-bold text-slate-900">Billed Net (AED)</th>
                <th className="px-6 py-3 text-left">Fetched At / Sync Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {usageList.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {u.customerName}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded font-mono ${
                        u.provider === "AWS"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {u.provider}
                    </span>
                    <span className="block font-mono text-xs text-slate-500 mt-0.5">
                      {u.externalAccountId}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">
                    {u.billingMonth}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-slate-700">
                    AED {u.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {u.discountPercentage}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-slate-900 text-base">
                    AED {u.netAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {u.fetchedAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Azure Modal */}
      {isAzureModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Enter Azure Monthly Usage (FR6)
            </h3>

            <form onSubmit={handleAddAzure} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Customer</label>
                <input
                  type="text"
                  value={azureCustomer}
                  onChange={(e) => setAzureCustomer(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Azure Subscription ID</label>
                <input
                  type="text"
                  value={azureAccount}
                  onChange={(e) => setAzureAccount(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Month (YYYY-MM)</label>
                  <input
                    type="month"
                    value={azureMonth}
                    onChange={(e) => setAzureMonth(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (AED)</label>
                  <input
                    type="number"
                    value={azureAmount}
                    onChange={(e) => setAzureAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg text-sm font-mono text-right"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAzureModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
