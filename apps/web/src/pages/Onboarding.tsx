import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { initialCustomers } from "@/data/mockData";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  // Step 1
  const [isNewCustomer, setIsNewCustomer] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactRole, setContactRole] = useState("Primary Technical Lead");

  // Step 2
  const [scopeDescription, setScopeDescription] = useState("");
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState("2026-12-31");
  const [billingFrequency, setBillingFrequency] = useState("Monthly");
  const [billingTiming, setBillingTiming] = useState("In advance");

  // Step 3
  const [includeManaged, setIncludeManaged] = useState(true);
  const [managedMonthlyFee, setManagedMonthlyFee] = useState(2500);
  const [includeSoc, setIncludeSoc] = useState(false);
  const [socMonthlyFee, setSocMonthlyFee] = useState(4000);

  // Step 4
  const [includeCloud, setIncludeCloud] = useState(true);
  const [cloudProvider, setCloudProvider] = useState<"AWS" | "AZURE">("AWS");
  const [cloudAccountId, setCloudAccountId] = useState("123456789012");
  const [cloudDiscount, setCloudDiscount] = useState<number>(5);

  const handleNext = () => {
    if (currentStep === 1) {
      if (isNewCustomer && (!customerName || !contactEmail)) {
        toast.error("Please fill in customer name and contact email");
        return;
      }
      if (!isNewCustomer && !selectedCustomerId) {
        toast.error("Please select an existing customer");
        return;
      }
    }
    if (currentStep === 2) {
      if (!scopeDescription || !startDate || !endDate) {
        toast.error("Please fill in contract scope and dates");
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleActivate = () => {
    toast.success("Contract successfully activated! It is now billable.");
    navigate("/contracts");
  };

  const steps = [
    { number: 1, title: "Customer & Contacts" },
    { number: 2, title: "Contract & Terms" },
    { number: 3, title: "Services & Fees" },
    { number: 4, title: "Cloud & Discount" },
    { number: 5, title: "Review & Activate" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">Guided Customer Onboarding</h1>
        <p className="text-sm text-slate-500 mt-1">
          FR10: 5-step wizard to set up customer, contract terms, services, cloud discounts, and activate billing.
        </p>

        {/* Stepper Wizard Bar */}
        <div className="mt-8 flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 z-0"></div>
          {steps.map((st) => (
            <div
              key={st.number}
              className="relative z-10 flex flex-col items-center bg-white px-2"
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition ${
                  currentStep === st.number
                    ? "bg-blue-600 text-white ring-4 ring-blue-100"
                    : currentStep > st.number
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-400 border border-slate-300"
                }`}
              >
                {currentStep > st.number ? "✓" : st.number}
              </div>
              <span
                className={`text-[11px] font-semibold mt-2 ${
                  currentStep === st.number
                    ? "text-blue-600"
                    : currentStep > st.number
                    ? "text-slate-800"
                    : "text-slate-400"
                }`}
              >
                {st.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content Box */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        {/* STEP 1: Customer and Contacts */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b pb-2">
              Step 1: Customer and Contacts
            </h2>

            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input
                  type="radio"
                  checked={isNewCustomer}
                  onChange={() => setIsNewCustomer(true)}
                  className="text-blue-600"
                />
                Create New Customer
              </label>
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input
                  type="radio"
                  checked={!isNewCustomer}
                  onChange={() => setIsNewCustomer(false)}
                  className="text-blue-600"
                />
                Select Existing Customer
              </label>
            </div>

            {isNewCustomer ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name *</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Al Habtoor Technologies"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Billing Address</label>
                  <input
                    type="text"
                    value={billingAddress}
                    onChange={(e) => setBillingAddress(e.target.value)}
                    placeholder="Office 302, Business Bay, Dubai"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Contact Name *</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Ahmed Al-Nuaimi"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Role / Designation</label>
                  <input
                    type="text"
                    value={contactRole}
                    onChange={(e) => setContactRole(e.target.value)}
                    placeholder="IT Director"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="ahmed@company.ae"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+971 50 123 4567"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Choose Customer</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="">-- Choose Customer --</option>
                  {initialCustomers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Contract Dates & Payment Terms */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b pb-2">
              Step 2: Contract Dates & Payment Terms
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Scope Description *</label>
              <textarea
                value={scopeDescription}
                onChange={(e) => setScopeDescription(e.target.value)}
                placeholder="Scope description: e.g. AWS Cloud Hosting, 24/7 Managed NOC & SOC Monitoring"
                className="w-full px-3 py-2 border rounded-lg text-sm"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date *</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">End Date *</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Billing Frequency (FR7 Dropdown)
                </label>
                <select
                  value={billingFrequency}
                  onChange={(e) => setBillingFrequency(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Billing Timing (FR7 Dropdown)
                </label>
                <select
                  value={billingTiming}
                  onChange={(e) => setBillingTiming(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="In advance">In advance</option>
                  <option value="In arrears">In arrears</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Contract Services & Monthly Fees */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b pb-2">
              Step 3: Contract Services & Monthly Amounts (FR4)
            </h2>
            <p className="text-xs text-slate-500">
              Each service has its own monthly amount and can be configured with mid-contract dates.
            </p>

            <div className="space-y-4 pt-2">
              {/* Managed Services */}
              <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={includeManaged}
                    onChange={(e) => setIncludeManaged(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <div>
                    <span className="font-bold text-slate-800 text-sm block">Managed Services</span>
                    <span className="text-xs text-slate-500">Cloud & IT Infrastructure Management</span>
                  </div>
                </div>

                {includeManaged && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600">Monthly Fee: AED</span>
                    <input
                      type="number"
                      value={managedMonthlyFee}
                      onChange={(e) => setManagedMonthlyFee(Number(e.target.value))}
                      className="w-28 px-2 py-1.5 border rounded text-sm text-right font-mono"
                    />
                  </div>
                )}
              </div>

              {/* SOC Services */}
              <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={includeSoc}
                    onChange={(e) => setIncludeSoc(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <div>
                    <span className="font-bold text-slate-800 text-sm block">SOC Services</span>
                    <span className="text-xs text-slate-500">24/7 Security Operations Center Monitoring</span>
                  </div>
                </div>

                {includeSoc && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600">Monthly Fee: AED</span>
                    <input
                      type="number"
                      value={socMonthlyFee}
                      onChange={(e) => setSocMonthlyFee(Number(e.target.value))}
                      className="w-28 px-2 py-1.5 border rounded text-sm text-right font-mono"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Cloud Discount & Account Link */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b pb-2">
              Step 4: Cloud Account & Discount Percentage (FR5, FR6)
            </h2>
            <p className="text-xs text-slate-500">
              For cloud bill services, the amount is not fixed. It is pulled from actual cloud usage minus your discount percentage.
            </p>

            <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 space-y-4">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCloud}
                  onChange={(e) => setIncludeCloud(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                Include Cloud Reselling / Management (AWS or Azure)
              </label>

              {includeCloud && (
                <div className="space-y-4 pl-6 border-l-2 border-blue-400">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Cloud Provider
                      </label>
                      <select
                        value={cloudProvider}
                        onChange={(e) => setCloudProvider(e.target.value as "AWS" | "AZURE")}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      >
                        <option value="AWS">AWS (Amazon Web Services)</option>
                        <option value="AZURE">Azure (Microsoft Azure)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Linked Account ID / Subscription ID
                      </label>
                      <input
                        type="text"
                        value={cloudAccountId}
                        onChange={(e) => setCloudAccountId(e.target.value)}
                        placeholder="e.g. 12-digit AWS Account ID"
                        className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Cloud Bill Discount Percentage (0% to 100%)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={cloudDiscount}
                        onChange={(e) => setCloudDiscount(Number(e.target.value))}
                        className="w-24 px-3 py-2 border rounded-lg text-sm font-mono text-right"
                      />
                      <span className="font-bold text-slate-700">%</span>
                      <span className="text-xs text-slate-500">
                        (e.g., 5% or 8%. Actual bill = Cloud Usage &minus; Discount%)
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 5: Review & Activate */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b pb-2">
              Step 5: Review & Activate
            </h2>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs uppercase text-slate-400 font-bold block">Customer</span>
                  <p className="font-semibold text-slate-800">
                    {isNewCustomer ? customerName : "Selected Customer"}
                  </p>
                  <p className="text-xs text-slate-500">{contactName} ({contactEmail})</p>
                </div>
                <div>
                  <span className="text-xs uppercase text-slate-400 font-bold block">Contract Term</span>
                  <p className="font-semibold text-slate-800">{startDate} to {endDate}</p>
                  <p className="text-xs text-slate-500">{billingFrequency} &middot; {billingTiming}</p>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3">
                <span className="text-xs uppercase text-slate-400 font-bold block mb-2">Scope & Services</span>
                <p className="text-xs text-slate-700 mb-2 italic">"{scopeDescription}"</p>
                <ul className="space-y-1 text-xs">
                  {includeManaged && (
                    <li className="flex justify-between font-medium">
                      <span>Managed Services</span>
                      <span className="font-mono">AED {managedMonthlyFee.toLocaleString()} / month</span>
                    </li>
                  )}
                  {includeSoc && (
                    <li className="flex justify-between font-medium">
                      <span>SOC Services</span>
                      <span className="font-mono">AED {socMonthlyFee.toLocaleString()} / month</span>
                    </li>
                  )}
                  {includeCloud && (
                    <li className="flex justify-between font-medium text-emerald-700">
                      <span>Cloud Bill ({cloudProvider} Account: {cloudAccountId})</span>
                      <span>Usage &minus; {cloudDiscount}% discount</span>
                    </li>
                  )}
                </ul>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium">
                ✓ Once activated, this contract will be officially billable and included in monthly calculation.
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-6 mt-6 border-t border-slate-100">
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={handleBack}
            className={`px-4 py-2 border rounded-lg text-xs font-semibold ${
              currentStep === 1
                ? "border-slate-200 text-slate-300 cursor-not-allowed"
                : "border-slate-300 text-slate-700 hover:bg-slate-50"
            }`}
          >
            &larr; Previous Step
          </button>

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
            >
              Next Step &rarr;
            </button>
          ) : (
            <button
              type="button"
              onClick={handleActivate}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-md shadow-emerald-600/30 transition"
            >
              Activate Contract & Finish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
