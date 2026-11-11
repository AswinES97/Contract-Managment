import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "@/hooks/useAuth";
import type { AppDispatch, RootState } from "@/redux/store";
import {
  fetchCloudUsage,
  fetchCloudAccounts,
  syncAwsUsage,
  recordAzureUsage,
} from "@/redux/cloudUsageThunk";
import type { CloudUsageMonthly } from "@/types/contractManagement";
import { toast } from "sonner";

export default function CloudUsagePage() {
  const { canWrite, isViewer } = useAuth();
  const dispatch = useDispatch<AppDispatch>();

  const { usageList, accounts, loading, isSyncing, isSavingAzure, error } =
    useSelector((state: RootState) => state.cloudUsage);

  const [isAzureModalOpen, setIsAzureModalOpen] = useState(false);

  const [azureCustomer, setAzureCustomer] = useState("");
  const [azureAccount, setAzureAccount] = useState("");
  const [azureMonth, setAzureMonth] = useState("2026-11");
  const [azureAmount, setAzureAmount] = useState<number>(8500);


  const [modalMode, setModalMode] = useState<"manual" | "csv">("manual");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvParsedCount, setCsvParsedCount] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchCloudUsage());
    dispatch(fetchCloudAccounts());
  }, [dispatch]);

  const handleOpenAzureModal = () => {
    if (!azureAccount && accounts.length > 0) {
      const firstAzure = accounts.find((a) => a.provider === "AZURE");
      if (firstAzure) {
        setAzureAccount(firstAzure.externalAccountId);
        setAzureCustomer(firstAzure.customerName || "");
      }
    }
    setIsAzureModalOpen(true);
  };

  const handleSyncAWS = async () => {
    if (isViewer) {
      toast.error("Viewers have read-only access. Cannot trigger cloud sync.");
      return;
    }

    toast.info("Connecting to AWS Cost Explorer API (GetCostAndUsage)...");
    try {
      const res = await dispatch(syncAwsUsage()).unwrap();
      toast.success(
        `AWS monthly usage synchronized successfully for ${res.syncedAccounts} account(s)!`,
      );
    } catch (err) {
      toast.error(
        typeof err === "string" ? err : "Failed to synchronize AWS usage",
      );
    }
  };

  const handleAccountSelect = (accountId: string) => {
    setAzureAccount(accountId);
    const found = accounts.find((a) => a.externalAccountId === accountId);
    if (found && found.customerName) {
      setAzureCustomer(found.customerName);
    }
  };

  const handleCsvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").filter((l) => l.trim().length > 0);
      // Skip header if present
      const hasHeader =
        lines[0].toLowerCase().includes("account") ||
        lines[0].toLowerCase().includes("month");
      const dataRows = hasHeader ? lines.slice(1) : lines;
      setCsvParsedCount(dataRows.length);
    };
    reader.readAsText(file);
  };

  const handleAddAzure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewer) {
      toast.error("Viewers cannot record cloud usage.");
      return;
    }

    if (modalMode === "csv") {
      if (!csvFile) {
        toast.error("Please choose a CSV file to upload.");
        return;
      }

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const text = event.target?.result as string;
          const lines = text.split("\n").filter((l) => l.trim().length > 0);
          const hasHeader =
            lines[0].toLowerCase().includes("account") ||
            lines[0].toLowerCase().includes("month");
          const dataRows = hasHeader ? lines.slice(1) : lines;

          const recordsToUpload = dataRows.map((line) => {
            const parts = line.split(",").map((p) => p.trim());
            // Expected formats:
            // 4 cols: Customer, Account, Month, Amount
            // 3 cols: Account, Month, Amount
            if (parts.length >= 4) {
              return {
                customerName: parts[0],
                externalAccountId: parts[1],
                billingMonth: parts[2],
                amount: parseFloat(parts[3]) || 0,
              };
            }
            return {
              externalAccountId: parts[0],
              billingMonth: parts[1],
              amount: parseFloat(parts[2]) || 0,
            };
          });

          await dispatch(recordAzureUsage(recordsToUpload)).unwrap();
          toast.success(
            `Successfully uploaded ${recordsToUpload.length} Azure usage records!`,
          );
          setIsAzureModalOpen(false);
          setCsvFile(null);
          setCsvParsedCount(null);
          dispatch(fetchCloudUsage());
        } catch (err) {
          toast.error(
            typeof err === "string" ? err : "Failed to parse and upload CSV",
          );
        }
      };
      reader.readAsText(csvFile);
      return;
    }

    // Manual mode
    if (!azureAccount.trim() || !azureMonth.trim() || !azureAmount) {
      toast.error("Please fill in account ID, month, and amount.");
      return;
    }

    try {
      await dispatch(
        recordAzureUsage({
          customerName: azureCustomer.trim() || undefined,
          externalAccountId: azureAccount.trim(),
          billingMonth: azureMonth.trim(),
          amount: Number(azureAmount),
        }),
      ).unwrap();
      toast.success("Azure monthly usage recorded successfully!");
      setIsAzureModalOpen(false);
      dispatch(fetchCloudUsage());
    } catch (err) {
      toast.error(
        typeof err === "string" ? err : "Failed to record Azure usage",
      );
    }
  };

  const handleRefresh = () => {
    dispatch(fetchCloudUsage());
    dispatch(fetchCloudAccounts());
    toast.success("Cloud usage records refreshed!");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-xs p-6 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Cloud Usage & Sync
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition text-sm flex items-center gap-1.5"
            title="Refresh records"
          >
            <span className={loading ? "inline-block animate-spin" : ""}>
              🔄
            </span>
            <span className="font-medium text-xs">Refresh</span>
          </button>

          {canWrite ? (
            <>
              <button
                onClick={handleOpenAzureModal}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold transition"
              >
                + Upload Azure Usage (CSV / Manual)
              </button>
              <button
                disabled={isSyncing}
                onClick={handleSyncAWS}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold shadow-xs transition flex items-center gap-2"
              >
                <span>
                  {isSyncing ? "Syncing AWS..." : "Re-Sync AWS Usage"}
                </span>
              </button>
            </>
          ) : (
            <span className="text-xs bg-slate-100 text-slate-500 border border-slate-200 px-3 py-1.5 rounded-lg font-medium">
              Read-Only Access
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-center justify-between">
          <span>Failed to load cloud usage: {error}</span>
          <button
            onClick={handleRefresh}
            className="underline font-medium hover:text-rose-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* Cloud Usage Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <span className="text-xs text-slate-500 font-medium">
            {usageList.length} Record{usageList.length === 1 ? "" : "s"}
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
                <th className="px-6 py-3 text-right font-bold text-slate-900">
                  Billed Net (AED)
                </th>
                <th className="px-6 py-3 text-left">
                  Fetched At / Sync Source
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading && usageList.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-slate-400 text-sm"
                  >
                    Loading cloud usage records...
                  </td>
                </tr>
              ) : usageList.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-slate-400 text-sm"
                  >
                    No cloud usage records found.
                  </td>
                </tr>
              ) : (
                usageList.map((u: CloudUsageMonthly) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Azure Modal (Manual + CSV Upload) */}
      {isAzureModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                Record Azure Usage
              </h3>
              <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setModalMode("manual")}
                  className={`px-3 py-1 rounded-md transition ${
                    modalMode === "manual"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Manual Form
                </button>
                <button
                  type="button"
                  onClick={() => setModalMode("csv")}
                  className={`px-3 py-1 rounded-md transition ${
                    modalMode === "csv"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  CSV Upload
                </button>
              </div>
            </div>

            <form onSubmit={handleAddAzure} className="space-y-4 text-sm">
              {modalMode === "manual" ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Linked Cloud Account (or type ID below)
                    </label>
                    <select
                      value={azureAccount}
                      onChange={(e) => handleAccountSelect(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                    >
                      <option value="">-- Custom / New Account --</option>
                      {accounts.map((a) => (
                        <option key={a.id} value={a.externalAccountId}>
                          {a.provider} - {a.externalAccountId} ({a.customerName}
                          )
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Customer B (FinTech Global)"
                      value={azureCustomer}
                      onChange={(e) => setAzureCustomer(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Azure Subscription ID
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. sub-azure-9921-prod"
                      value={azureAccount}
                      onChange={(e) => setAzureAccount(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Month (YYYY-MM)
                      </label>
                      <input
                        type="month"
                        required
                        value={azureMonth}
                        onChange={(e) => setAzureMonth(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Amount (AED)
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={azureAmount}
                        onChange={(e) => setAzureAmount(Number(e.target.value))}
                        className="w-full px-3 py-2 border rounded-lg text-sm font-mono text-right"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition cursor-pointer">
                    <input
                      type="file"
                      accept=".csv,text/csv"
                      onChange={handleCsvChange}
                      className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-xs text-slate-400 mt-2">
                      CSV format: <code>Customer, Account, Month, Amount</code>{" "}
                      or <code>Account, Month, Amount</code>
                    </p>
                  </div>

                  {csvParsedCount !== null && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-200">
                      ✓ Ready to upload {csvParsedCount} record
                      {csvParsedCount === 1 ? "" : "s"}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAzureModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingAzure}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  {isSavingAzure ? "Saving..." : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
