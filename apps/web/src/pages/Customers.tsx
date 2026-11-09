import { useEffect, useState, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "@/hooks/useAuth";
import type {
  Customer,
  Contact,
  CustomerStatus,
} from "@/types/contractManagement";
import { toast } from "sonner";
import ContactsEditor from "@/components/ContactsEditor";
import type { AppDispatch, RootState } from "@/redux/store";
import {
  fetchCustomers,
  createCustomer,
  updateCustomer,
  updateCustomerStatus,
} from "@/redux/customerThunk";

const makeDefaultContact = (): Contact => ({
  id: "con-" + Date.now(),
  name: "",
  role: "",
  email: "",
  phone: "",
  isPrimary: true,
});

export default function CustomersPage() {
  const { canWrite, isViewer } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const { customers, loading, updateLoading } = useSelector(
    (state: RootState) => state.customer,
  );

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formName, setFormName] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formStatus, setFormStatus] = useState<CustomerStatus>("ACTIVE");
  const [formContacts, setFormContacts] = useState<Contact[]>([
    makeDefaultContact(),
  ]);

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchCustomers());
  };

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
    setFormContacts([makeDefaultContact()]);
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
    // Ensure exactly one primary — promote first if none set
    const contacts =
      customer.contacts.length > 0 ? customer.contacts : [makeDefaultContact()];
    const hasPrimary = contacts.some((c) => c.isPrimary);
    setFormContacts(
      hasPrimary
        ? contacts
        : contacts.map((c, i) => ({ ...c, isPrimary: i === 0 })),
    );
    setIsModalOpen(true);
  };

  const handleSaveCustomer = async (e: FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Please enter a customer name");
      return;
    }

    const primary = formContacts.find((c) => c.isPrimary) ?? formContacts[0];
    if (!primary?.name?.trim() || !primary?.email?.trim()) {
      toast.error("Primary contact must have a name and email");
      return;
    }

    const normalizedContacts: Contact[] = formContacts.map((c, i) => ({
      ...c,
      id: c.id || "con-" + Date.now() + "-" + i,
      isPrimary: c.id === primary.id,
    }));

    if (selectedCustomer) {
      const action = await dispatch(
        updateCustomer({
          id: selectedCustomer.id,
          name: formName.trim(),
          billingAddress: formAddress.trim(),
          notes: formNotes.trim(),
          status: formStatus,
          contacts: normalizedContacts,
        }),
      );

      if (updateCustomer.fulfilled.match(action)) {
        toast.success("Customer updated successfully");
        setIsModalOpen(false);
      } else {
        const errorMsg =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to update customer";
        toast.error(errorMsg);
      }
    } else {
      const action = await dispatch(
        createCustomer({
          name: formName.trim(),
          billingAddress: formAddress.trim(),
          notes: formNotes.trim(),
          status: formStatus,
          contacts: normalizedContacts,
        }),
      );

      if (createCustomer.fulfilled.match(action)) {
        toast.success("New customer created successfully");
        setIsModalOpen(false);
      } else {
        const errorMsg =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to create customer";
        toast.error(errorMsg);
      }
    }
  };

  const handleToggleStatus = async (id: string) => {
    if (isViewer) {
      toast.error("Viewers cannot toggle customer status.");
      return;
    }
    const current = customers.find((c) => c.id === id);
    if (!current) return;
    const nextStatus: CustomerStatus =
      current.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    const action = await dispatch(
      updateCustomerStatus({ id, status: nextStatus }),
    );

    if (updateCustomerStatus.fulfilled.match(action)) {
      toast.success(
        `Customer "${current.name}" ${
          nextStatus === "ACTIVE" ? "activated" : "deactivated"
        }`,
      );
    } else {
      const errorMsg =
        typeof action.payload === "string"
          ? action.payload
          : "Failed to update customer status";
      toast.error(errorMsg);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Customers & Contacts
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="text-xs px-3 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg text-slate-700 font-medium transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
          >
            <svg
              className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
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
            Refresh
          </button>

          {canWrite ? (
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition cursor-pointer"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Customer
            </button>
          ) : (
            <span className="text-xs bg-slate-100 text-slate-500 border border-slate-200 px-3 py-1.5 rounded-lg font-medium">
              Read-Only Access
            </span>
          )}
        </div>
      </div>

      {/* Customer Directory */}
      {loading && customers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-16 text-center text-slate-500">
          <svg
            className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-3"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          <p className="text-sm font-medium">Loading customers...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-dashed border-slate-300 p-12 text-center text-slate-500">
          <p className="text-sm font-medium">No customers found.</p>
          {canWrite && (
            <button
              onClick={handleOpenCreate}
              className="mt-3 text-xs text-blue-600 hover:underline font-semibold"
            >
              Create your first customer
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {customers.map((c) => {
            const contactCount = c.contacts.length;
            const primary =
              c.contacts.find((ct) => ct.isPrimary) ?? c.contacts[0];
            const otherContacts = c.contacts.filter((ct) => !ct.isPrimary);
            return (
              <div
                key={c.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition"
              >
                {/* Customer Information */}
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-lg font-bold text-slate-900">
                      {c.name}
                    </h3>
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
                      {c.contractCount || contactCount || 0} Contract(s)
                    </span>
                  </div>

                  <div className="text-sm text-slate-600">
                    <p className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700">
                        Billing Address:
                      </span>{" "}
                      {c.billingAddress || (
                        <span className="italic text-slate-400">
                          None specified
                        </span>
                      )}
                    </p>
                    {c.notes && (
                      <p className="mt-1 text-slate-500 italic">
                        Note: "{c.notes}"
                      </p>
                    )}
                  </div>

                  {/* Linked Cloud Accounts */}
                  {c.cloudAccounts && c.cloudAccounts.length > 0 && (
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-xs font-semibold text-slate-500">
                        Cloud Accounts:
                      </span>
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

                {/* Contacts Panel */}
                <div className="md:w-80 bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Contacts
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {c.contacts.length} total
                    </span>
                  </div>

                  {/* Primary contact — always first */}
                  {primary && (
                    <div className="p-2.5 bg-white rounded-lg border border-blue-200 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">
                          {primary.name}
                        </span>
                        <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                          Primary
                        </span>
                      </div>
                      {primary.role && (
                        <p className="text-slate-500">{primary.role}</p>
                      )}
                      <p className="text-slate-600 font-mono text-[11px]">
                        {primary.email}
                        {primary.phone && ` · ${primary.phone}`}
                      </p>
                    </div>
                  )}

                  {/* Additional contacts */}
                  {otherContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="p-2.5 bg-white rounded border border-slate-200 text-xs space-y-0.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-700">
                          {contact.name}
                        </span>
                        {contact.role && (
                          <span className="text-[10px] text-slate-400 italic">
                            {contact.role}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 font-mono text-[11px]">
                        {contact.email}
                        {contact.phone && ` · ${contact.phone}`}
                      </p>
                    </div>
                  ))}

                  {c.contacts.length === 0 && (
                    <p className="text-xs text-slate-400 italic text-center py-2">
                      No contacts yet
                    </p>
                  )}
                </div>

                {/* Actions */}
                {canWrite && (
                  <div className="flex md:flex-col justify-end gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                    <button
                      onClick={() => handleOpenEdit(c)}
                      disabled={updateLoading}
                      className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition cursor-pointer disabled:opacity-50"
                    >
                      Edit Details
                    </button>
                    <button
                      onClick={() => handleToggleStatus(c.id)}
                      disabled={updateLoading}
                      className={`px-3 py-1.5 text-xs font-medium rounded border transition cursor-pointer disabled:opacity-50 ${
                        c.status === "ACTIVE"
                          ? "text-amber-700 hover:bg-amber-50 border-amber-200"
                          : "text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                      }`}
                    >
                      {c.status === "ACTIVE" ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {selectedCustomer ? "Edit Customer" : "Create New Customer"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition cursor-pointer"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form
              onSubmit={handleSaveCustomer}
              className="flex flex-col flex-1 overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Customer Info */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Company Details
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Company / Customer Name{" "}
                      <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Acme Corporation"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Billing Address
                      </label>
                      <input
                        type="text"
                        value={formAddress}
                        onChange={(e) => setFormAddress(e.target.value)}
                        placeholder="Street, City, Country"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Status
                      </label>
                      <select
                        value={formStatus}
                        onChange={(e) =>
                          setFormStatus(e.target.value as CustomerStatus)
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Notes / Special Terms
                    </label>
                    <textarea
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      placeholder="Operational notes, cloud usage specs..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm"
                      rows={2}
                    />
                  </div>
                </div>

                {/* Contacts Section */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Contacts
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      {formContacts.length} contact
                      {formContacts.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <ContactsEditor
                    contacts={formContacts}
                    onChange={setFormContacts}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 p-6 border-t border-slate-100 bg-slate-50/60 rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={updateLoading}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm cursor-pointer transition"
                >
                  {updateLoading ? (
                    <>
                      <svg
                        className="w-3.5 h-3.5 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        />
                      </svg>
                      Saving...
                    </>
                  ) : selectedCustomer ? (
                    "Save Changes"
                  ) : (
                    "Create Customer"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
