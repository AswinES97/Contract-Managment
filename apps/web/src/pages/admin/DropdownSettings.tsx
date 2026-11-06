import { useState } from "react";
import { initialServiceTypes, billingFrequencies, billingTimings } from "@/data/mockData";
import type { ServiceTypeItem } from "@/types/contractManagement";
import { toast } from "sonner";

export default function DropdownSettingsPage() {
  const [serviceTypes, setServiceTypes] = useState<ServiceTypeItem[]>(initialServiceTypes);
  const [newServiceName, setNewServiceName] = useState("");

  const handleAddServiceType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;

    const newItem: ServiceTypeItem = {
      id: "st-" + Date.now(),
      name: newServiceName.trim(),
      isActive: true,
    };

    setServiceTypes([...serviceTypes, newItem]);
    setNewServiceName("");
    toast.success(`Service Type "${newItem.name}" added to dropdowns`);
  };

  const handleToggleService = (id: string) => {
    setServiceTypes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
    toast.success("Service type updated");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-900">Dropdown Settings & Lookups</h1>
          <span className="text-xs px-2 py-0.5 rounded font-bold bg-blue-100 text-blue-700">
            Admin Only
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          FR1 & FR4: Manage configurable dropdown options for service types, billing frequencies, and billing timings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Service Types Box */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Service Types (FR4)</h2>
              <p className="text-xs text-slate-500">Available in contract services dropdown</p>
            </div>
            <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded">
              {serviceTypes.length} Types
            </span>
          </div>

          <form onSubmit={handleAddServiceType} className="flex gap-2">
            <input
              type="text"
              value={newServiceName}
              onChange={(e) => setNewServiceName(e.target.value)}
              placeholder="e.g. DevOps Support / DB Management"
              className="flex-1 px-3 py-1.5 border rounded-lg text-xs"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
            >
              + Add Type
            </button>
          </form>

          <div className="space-y-2 pt-2">
            {serviceTypes.map((st) => (
              <div
                key={st.id}
                className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${st.isActive ? "bg-emerald-500" : "bg-slate-300"}`}></span>
                  <span className="font-semibold text-slate-800">{st.name}</span>
                </div>
                <button
                  onClick={() => handleToggleService(st.id)}
                  className={`text-xs font-medium px-2 py-0.5 rounded ${
                    st.isActive
                      ? "text-rose-600 hover:bg-rose-50"
                      : "text-emerald-600 hover:bg-emerald-50"
                  }`}
                >
                  {st.isActive ? "Disable" : "Enable"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Terms Lookups */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div className="border-b pb-3">
            <h2 className="text-base font-bold text-slate-900">Payment Terms (FR7)</h2>
            <p className="text-xs text-slate-500">Fixed lookup values referenced on each contract</p>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Billing Frequencies
            </h3>
            <div className="flex flex-wrap gap-2">
              {billingFrequencies.map((f) => (
                <span
                  key={f}
                  className="px-3 py-1 bg-slate-100 text-slate-800 rounded-lg border border-slate-200 text-xs font-semibold"
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
                  className="px-3 py-1 bg-slate-100 text-slate-800 rounded-lg border border-slate-200 text-xs font-semibold"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
            <strong>Timing Note:</strong> Fixed service amounts follow billing timing (in advance / in arrears). Cloud usage is always billed after the month ends, since it is not known earlier (FR8).
          </div>
        </div>
      </div>
    </div>
  );
}
