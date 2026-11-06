import { useState, type FormEvent } from "react";
import { useAuth } from "@/hooks/useAuth";
import { initialCustomers } from "@/data/mockData";
import type { Customer, Contact, CustomerStatus } from "@/types/contractManagement";
import { toast } from "sonner";

export default function CustomersPage() {
  const { canWrite, isViewer } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formName, setFormName] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formStatus, setFormStatus] = useState<CustomerStatus>("ACTIVE");
  const [formContactName, setFormContactName] = useState("");
  const [formContactRole, setFormContactRole] = useState("");
  const [formContactEmail, setFormContactEmail] = useState("");
  const [formContactPhone, setFormContactPhone] = useState("");

  const handleOpenCreate = () => {
    if (isViewer) {
      toast.error("Viewers have read-only access.");
      return;
    }
    setSelectedCustomer(null);
    setFormName("");
    setFormAddress("");
    setFormNotes("");
    setFormStatus("ACTIVE");
    setFormContactName("");
    setFormContactRole("");
    setFormContactEmail("");
    setFormContactPhone("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (customer: Customer) => {
    if (isViewer) {
      toast.error("Viewers have read-only access.");
      return;
    }
    setSelectedCustomer(customer);
    setFormName(customer.name);
    setFormAddress(customer.billingAddress);
    setFormNotes(customer.notes);
    setFormStatus(customer.status);
    const primary = customer.contacts.find((c) => c.isPrimary) || customer.contacts[0];
    if (primary) {
      setFormContactName(primary.name);
      setFormContactRole(primary.role);
      setFormContactEmail(primary.email);
      setFormContactPhone(primary.phone);
    }
    setIsModalOpen(true);
  };

  const handleSaveCustomer = (e: FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Please enter a customer name");
      return;
    }

    const updatedContact: Contact = {
      id: "con-" + Date.now(),
      name: formContactName || "Lead Contact",
      role: formContactRole || "Decision Maker",
      email: formContactEmail || "contact@example.com",
      phone: formContactPhone || "+971 4 000 0000",
      isPrimary: true,
    };

    if (selectedCustomer) {
      // Edit
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === selectedCustomer.id
            ? {
                ...c,
                name: formName,
                billingAddress: formAddress,
                notes: formNotes,
                status: formStatus,
                contacts: [updatedContact, ...c.contacts.filter((ct) => !ct.isPrimary)],
              }
            : c
        )
      );
      toast.success("Customer updated successfully");
    } else {
      // Create
      const newCustomer: Customer = {
        id: "cust-" + Date.now(),
        name: formName,
        billingAddress: formAddress,
        notes: formNotes,
        status: formStatus,
        contacts: [updatedContact],
        cloudAccounts: [],
        contractCount: 0,
      };
      setCustomers([newCustomer, ...customers]);
      toast.success("New customer created successfully");
    }

    setIsModalOpen(false);
  };

  const handleToggleStatus = (id: string) => {
    if (isViewer) {
      toast.error("Viewers cannot toggle customer status.");
      return;
    }
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" }
          : c
      )
    );
    toast.success("Customer status updated");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers & Contacts</h1>
          <p className="text-sm text-slate-500 mt-1">
            FR2: Manage company details, status, billing addresses, and primary contacts.
          </p>
        </div>

        {canWrite ? (
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
          >
            + Create Customer
          </button>
        ) : (
          <span className="text-xs bg-slate-100 text-slate-500 border border-slate-200 px-3 py-1.5 rounded-lg font-medium">
            Read-Only Access
          </span>
        )}
      </div>

      {/* Customer Directory */}
      <div className="grid grid-cols-1 gap-6">
        {customers.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition"
          >
            {/* Customer Information */}
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-slate-900">{c.name}</h3>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                    c.status === "ACTIVE"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {c.status}
                </span>
                <span className="text-xs text-slate-400">
                  {c.contractCount || 0} Contract(s)
                </span>
              </div>

              <div className="text-sm text-slate-600">
                <p className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">Billing Address:</span>{" "}
                  {c.billingAddress}
                </p>
                {c.notes && (
                  <p className="mt-1 text-slate-500 italic">
                    Note: "{c.notes}"
                  </p>
                )}
              </div>

              {/* Linked Cloud Accounts */}
              {c.cloudAccounts && c.cloudAccounts.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-semibold text-slate-500">Cloud Accounts:</span>
                  {c.cloudAccounts.map((ca) => (
                    <span
                      key={ca.id}
                      className="text-xs font-mono bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded"
                    >
                      {ca.provider}: {ca.externalAccountId}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Contacts Card */}
            <div className="md:w-80 bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Associated Contacts
              </span>
              {c.contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="p-2.5 bg-white rounded border border-slate-200 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{contact.name}</span>
                    {contact.isPrimary && (
                      <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.2 rounded">
                        PRIMARY
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500">{contact.role}</p>
                  <p className="text-slate-600 font-mono text-[11px]">{contact.email} &middot; {contact.phone}</p>
                </div>
              ))}
            </div>

            {/* Actions */}
            {canWrite && (
              <div className="flex md:flex-col justify-end gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                <button
                  onClick={() => handleOpenEdit(c)}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition"
                >
                  Edit Details
                </button>
                <button
                  onClick={() => handleToggleStatus(c.id)}
                  className="px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50 rounded border border-amber-200 transition"
                >
                  {c.status === "ACTIVE" ? "Deactivate" : "Activate"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              {selectedCustomer ? "Edit Customer Details" : "Create New Customer"}
            </h2>

            <form onSubmit={handleSaveCustomer} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Customer Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Acme Corporation"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Billing Address</label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Street, City, Country"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Special Terms</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Operational notes, cloud usage specs..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  rows={2}
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Primary Contact Details
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Contact Name</label>
                    <input
                      type="text"
                      value={formContactName}
                      onChange={(e) => setFormContactName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Role / Designation</label>
                    <input
                      type="text"
                      value={formContactRole}
                      onChange={(e) => setFormContactRole(e.target.value)}
                      placeholder="CTO / IT Lead"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Email</label>
                    <input
                      type="email"
                      value={formContactEmail}
                      onChange={(e) => setFormContactEmail(e.target.value)}
                      placeholder="john@acme.com"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Phone</label>
                    <input
                      type="text"
                      value={formContactPhone}
                      onChange={(e) => setFormContactPhone(e.target.value)}
                      placeholder="+971 4 000 0000"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
