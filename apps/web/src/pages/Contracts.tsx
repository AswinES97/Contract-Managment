import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { initialContracts } from "@/data/mockData";
import type { Contract } from "@/types/contractManagement";

export default function ContractsPage() {
  const { canWrite } = useAuth();
  const [contracts] = useState<Contract[]>(initialContracts);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  const filteredContracts = contracts.filter((c) => {
    if (statusFilter === "ALL") return true;
    return c.status === statusFilter;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contracts & Scope</h1>
          <p className="text-sm text-slate-500 mt-1">
            FR3 & FR4: Multi-contract support, service breakdown, mid-contract fee changes & payment terms.
          </p>
        </div>

        {canWrite && (
          <Link
            to="/onboarding"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition inline-flex items-center gap-2"
          >
            <span>+ New Contract Onboarding</span>
          </Link>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2">
          Filter by Status:
        </span>
        {["ALL", "ACTIVE", "DRAFT", "EXPIRED", "TERMINATED"].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${
              statusFilter === st
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Contracts Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredContracts.map((cnt) => (
          <div
            key={cnt.id}
            className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition"
          >
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-slate-900">
                      {cnt.customerName}
                    </h3>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        cnt.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {cnt.status}
                    </span>
                    {!cnt.onboardingCompleted && (
                      <span className="text-[11px] font-semibold bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.5 rounded">
                        Onboarding Incomplete (Step {cnt.onboardingStep}/5)
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-slate-600 mt-1">
                    {cnt.scopeDescription}
                  </p>
                </div>

                {/* Dates & Payment terms badges */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Contract Term
                    </span>
                    <span className="font-mono font-medium text-slate-800">
                      {cnt.startDate} &rarr; {cnt.endDate}
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
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Scope & Services Included (Mid-contract dates & Discounts)
                </h4>
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
                        {srv.monthlyAmount ? (
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">Fixed Fee:</span>
                            <span className="font-bold font-mono text-slate-900">
                              AED {srv.monthlyAmount.toLocaleString()}/mo
                            </span>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">Cloud Discount:</span>
                            <span className="font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              {srv.discountPercentage ?? 0}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Billable status:{" "}
                  <strong className={cnt.onboardingCompleted ? "text-emerald-600" : "text-rose-600"}>
                    {cnt.onboardingCompleted ? "Billable" : "Not billable until onboarding completes"}
                  </strong>
                </span>

                <button
                  onClick={() => setSelectedContract(cnt)}
                  className="font-semibold text-blue-600 hover:text-blue-800"
                >
                  View Full Contract Details &rarr;
                </button>
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
                <p className="text-xs text-slate-500">ID: {selectedContract.id}</p>
              </div>
              <button
                onClick={() => setSelectedContract(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase">Scope</span>
                <p className="font-medium text-slate-800 mt-0.5">{selectedContract.scopeDescription}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 uppercase">Start Date:</span>{" "}
                  <strong className="text-slate-800">{selectedContract.startDate}</strong>
                </div>
                <div>
                  <span className="text-slate-400 uppercase">End Date:</span>{" "}
                  <strong className="text-slate-800">{selectedContract.endDate}</strong>
                </div>
                <div>
                  <span className="text-slate-400 uppercase">Frequency:</span>{" "}
                  <strong className="text-slate-800">{selectedContract.billingFrequency}</strong>
                </div>
                <div>
                  <span className="text-slate-400 uppercase">Timing:</span>{" "}
                  <strong className="text-slate-800">{selectedContract.billingTiming}</strong>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase block mb-2">
                  Service Components
                </span>
                <div className="space-y-2">
                  {selectedContract.services.map((s, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-800">{s.serviceTypeName}</span>
                        <p className="text-[11px] text-slate-500 font-mono">
                          Effective: {s.startDate} to {s.endDate || "Contract End"}
                        </p>
                      </div>
                      <div className="text-right">
                        {s.monthlyAmount ? (
                          <span className="font-mono font-bold text-slate-900">
                            AED {s.monthlyAmount.toLocaleString()}/mo
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            {s.discountPercentage}% Discount on Usage
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedContract(null)}
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
