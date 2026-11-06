import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { initialContracts, initialBills } from "@/data/mockData";
import { toast } from "sonner";

export default function DashboardPage() {
  const { user, isViewer, canWrite } = useAuth();
  const [bills, setBills] = useState(initialBills);

  const activeContracts = initialContracts.filter((c) => c.status === "ACTIVE");
  const pendingInvoices = bills.filter((b) => b.invoiceStatus.status !== "COMPLETED");

  const handleSyncFinanceStatus = (billId: string) => {
    if (isViewer) {
      toast.error("Read-only access: Viewers cannot trigger invoice status checks.");
      return;
    }
    setBills((prev) =>
      prev.map((b) => {
        if (b.id === billId) {
          const nextStatus = b.invoiceStatus.status === "PENDING" ? "RAISED" : "COMPLETED";
          return {
            ...b,
            invoiceStatus: {
              ...b.invoiceStatus,
              status: nextStatus,
              invoiceNumber: b.invoiceStatus.invoiceNumber || `INV-${Date.now().toString().slice(-4)}`,
              invoiceDate: b.invoiceStatus.invoiceDate || new Date().toISOString().split("T")[0],
              checkedAt: new Date().toISOString().replace("T", " ").slice(0, 19),
            },
          };
        }
        return b;
      })
    );
    toast.success("Finance system invoice status refreshed!");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">
              Contract & Billing Operations
            </h1>
            <span className="text-xs px-2.5 py-1 rounded font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {user?.role}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Answers the 3 core questions: Active contracts, Monthly bills calculation, and Invoice status.
          </p>
        </div>

        {canWrite && (
          <div className="flex items-center gap-3">
            <Link
              to="/onboarding"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition flex items-center gap-2"
            >
              <span>+ Customer Onboarding</span>
            </Link>
            <Link
              to="/cloud-usage"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium border border-slate-300 transition"
            >
              Trigger Cloud Sync
            </Link>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Active Contracts
          </p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">
            {activeContracts.length}
          </p>
          <p className="text-xs text-emerald-600 font-medium mt-1">
            &bull; All in active billing scope
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Pending / Raised Invoices
          </p>
          <p className="text-3xl font-extrabold text-amber-600 mt-2">
            {pendingInvoices.length}
          </p>
          <p className="text-xs text-slate-500 mt-1">Checked against finance API</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Billed (AED)
          </p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">
            AED {bills.reduce((acc, b) => acc + b.totalAmount, 0).toLocaleString()}
          </p>
          <p className="text-xs text-blue-600 font-medium mt-1">Fixed fees + Cloud net</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Unfinished Onboardings
          </p>
          <p className="text-3xl font-extrabold text-rose-600 mt-2">1</p>
          <p className="text-xs text-rose-500 font-medium mt-1">Customer C (Not billable)</p>
        </div>
      </div>

      {/* The 3 Core Questions Section */}
      <div className="space-y-6">
        {/* QUESTION 1: Active Contracts, Scope & End Dates */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Question 1
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Which contracts are active, what is in scope, and when do they end?
              </h2>
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
                  <th className="px-6 py-3 text-left">Included Services</th>
                  <th className="px-6 py-3 text-left">Payment Terms</th>
                  <th className="px-6 py-3 text-left">End Date</th>
                  <th className="px-6 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {initialContracts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {c.customerName}
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs">
                      {c.scopeDescription}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {c.services.map((s) => (
                          <span
                            key={s.id}
                            className="inline-block text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200"
                          >
                            {s.serviceTypeName}
                            {s.monthlyAmount ? ` (AED ${s.monthlyAmount}/mo)` : ""}
                            {s.discountPercentage !== undefined
                              ? ` (${s.discountPercentage}% disc)`
                              : ""}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <span className="font-medium text-slate-800">{c.billingFrequency}</span>
                      <span className="text-slate-400 block">{c.billingTiming}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      {c.endDate}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                          c.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {c.status}
                        {!c.onboardingCompleted ? " (Unfinished)" : ""}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* QUESTION 2 & 3: Total Bill per customer & month + Finance Invoice Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Question 2 Table */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  Question 2
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  Total Bill (Contract Fees + Cloud Usage after Discount)
                </h2>
              </div>
              <Link
                to="/billing"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                Full Billing &rarr;
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-3 text-left">Customer & Period</th>
                    <th className="px-6 py-3 text-right">Fixed Fees</th>
                    <th className="px-6 py-3 text-right">Cloud (Net)</th>
                    <th className="px-6 py-3 text-right font-bold text-slate-900">Total (AED)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {bills.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">{b.customerName}</p>
                        <p className="text-xs text-slate-400">{b.billingMonth}</p>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-slate-600">
                        AED {b.fixedAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-slate-600">
                        AED {(b.cloudUsageAmount - b.cloudDiscountAmount).toLocaleString()}
                        <span className="block text-[10px] text-emerald-600 font-sans">
                          (Saved AED {b.cloudDiscountAmount.toLocaleString()})
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-slate-900 text-base">
                        AED {b.totalAmount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Question 3: Finance Invoice Status */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                Question 3
              </span>
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                Finance System Invoice Status
              </h2>

              <div className="space-y-4">
                {bills.map((b) => (
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
                      <span>{b.invoiceStatus.invoiceNumber || "No Invoice #"}</span>
                      <span className="font-mono">AED {b.totalAmount.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 pt-1 border-t border-slate-200">
                      <span>Checked: {b.invoiceStatus.checkedAt.split(" ")[1]}</span>
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

            <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Finance REST Integration:</span> Checks invoice status against ERP via token-authenticated API stub.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
