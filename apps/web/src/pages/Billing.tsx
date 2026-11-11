import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "@/hooks/useAuth";
import type { AppDispatch, RootState } from "@/redux/store";
import {
  fetchBills,
  calculateBills,
  syncInvoiceStatus,
} from "@/redux/billingThunk";
import { setSelectedBill } from "@/redux/billingSlice";
import type { Bill, BillLineItem } from "@/types/contractManagement";
import { toast } from "sonner";

export default function BillingPage() {
  const { canWrite, isViewer } = useAuth();
  const dispatch = useDispatch<AppDispatch>();

  const { bills, selectedBill, loading, isCalculating, syncingBillId, error } =
    useSelector((state: RootState) => state.billing);

  useEffect(() => {
    dispatch(fetchBills());
  }, [dispatch]);

  const handleSyncFinance = async (billId: string) => {
    if (isViewer) {
      toast.error(
        "Read-only access: Viewers cannot trigger invoice status checks.",
      );
      return;
    }

    try {
      const updated = await dispatch(syncInvoiceStatus(billId)).unwrap();
      toast.success(
        `Finance API checked: Invoice status is now ${updated.invoiceStatus.status}!`,
      );
    } catch (err) {
      toast.error(
        typeof err === "string"
          ? err
          : "Failed to sync invoice status with ERP",
      );
    }
  };

  const handleRecalculateBills = async () => {
    if (isViewer) {
      toast.error(
        "Read-only access: Viewers cannot trigger bill calculations.",
      );
      return;
    }

    toast.info("Calculating bills from active contracts and cloud usage...");
    try {
      const generated = await dispatch(calculateBills()).unwrap();
      toast.success(`Calculated ${generated.length} bill snapshot(s)!`);
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to calculate bills");
    }
  };

  const handleRefresh = () => {
    dispatch(fetchBills());
    toast.success("Billing records refreshed!");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-xs p-6 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Billing & Invoices
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition text-sm flex items-center gap-1.5"
            title="Refresh bills"
          >
            <span className={loading ? "inline-block animate-spin" : ""}>
              🔄
            </span>
            <span className="font-medium text-xs">Refresh</span>
          </button>

          {canWrite && (
            <button
              onClick={handleRecalculateBills}
              disabled={isCalculating}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold shadow-xs transition flex items-center gap-2"
            >
              <span>
                {isCalculating ? "Calculating..." : "Recalculate Bills"}
              </span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-center justify-between">
          <span>Failed to load billing records: {error}</span>
          <button
            onClick={handleRefresh}
            className="underline font-medium hover:text-rose-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* Bills Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <span className="text-xs text-slate-500 font-medium">
            {bills.length} Record{bills.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-3 text-left">Customer & Period</th>
                <th className="px-6 py-3 text-right">Fixed Fees</th>
                <th className="px-6 py-3 text-right">Cloud Usage</th>
                <th className="px-6 py-3 text-right">Discount</th>
                <th className="px-6 py-3 text-right font-bold text-slate-900">
                  Total (AED)
                </th>
                <th className="px-6 py-3 text-left">Invoice Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading && bills.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-slate-400 text-sm"
                  >
                    Loading billing snapshots from database...
                  </td>
                </tr>
              ) : bills.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-slate-400 text-sm"
                  >
                    No bills calculated yet.
                  </td>
                </tr>
              ) : (
                bills.map((b: Bill) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">
                        {b.customerName}
                      </p>
                      <p className="text-xs text-slate-400 font-mono">
                        {b.billingMonth} ({b.periodStart} &rarr; {b.periodEnd})
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-slate-600">
                      AED {b.fixedAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-slate-600">
                      AED {b.cloudUsageAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-emerald-600 font-semibold">
                      &minus; AED {b.cloudDiscountAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-slate-900 text-base">
                      AED {b.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase inline-block ${
                            b.invoiceStatus.status === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-800"
                              : b.invoiceStatus.status === "RAISED"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {b.invoiceStatus.status}
                        </span>
                        {b.invoiceStatus.invoiceNumber && (
                          <p className="text-xs text-slate-500 font-mono">
                            {b.invoiceStatus.invoiceNumber}
                          </p>
                        )}
                        <p className="text-[10px] text-slate-400">
                          Checked: {b.invoiceStatus.checkedAt.split(" ")[1]}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-y-1">
                      <button
                        onClick={() => dispatch(setSelectedBill(b))}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 block ml-auto"
                      >
                        View Breakdown &rarr;
                      </button>
                      {canWrite && (
                        <button
                          disabled={syncingBillId === b.id}
                          onClick={() => handleSyncFinance(b.id)}
                          className="text-[11px] text-slate-500 hover:text-slate-800 underline block ml-auto disabled:opacity-50"
                        >
                          {syncingBillId === b.id
                            ? "Checking..."
                            : "Check Finance API"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bill Breakdown Modal */}
      {selectedBill && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-6 border border-slate-200">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Bill Breakdown
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedBill.customerName} &middot;{" "}
                  {selectedBill.billingMonth}
                </p>
              </div>
              <button
                onClick={() => dispatch(setSelectedBill(null))}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {selectedBill.lineItems.map((item: BillLineItem) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-800 block">
                        {item.description}
                      </span>
                      <span className="text-[11px] text-slate-400 uppercase font-mono">
                        Type: {item.sourceType}
                        {item.discountPercentage > 0 &&
                          ` (${item.discountPercentage}% discount)`}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold font-mono text-slate-900 text-sm">
                        AED {item.finalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-lg flex justify-between items-center text-sm">
                <div>
                  <span className="font-bold text-blue-900 block">
                    Total Calculated Bill
                  </span>
                </div>
                <span className="text-xl font-bold font-mono text-blue-900">
                  AED {selectedBill.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex justify-end mt-6 pt-3 border-t border-slate-100">
              <button
                onClick={() => dispatch(setSelectedBill(null))}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
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
