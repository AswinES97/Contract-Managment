import type { Contact } from "@/types/contractManagement";

interface ContactsEditorProps {
  contacts: Contact[];
  onChange: (contacts: Contact[]) => void;
}

const emptyContact = (): Contact => ({
  id: "con-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
  name: "",
  role: "",
  email: "",
  phone: "",
  isPrimary: false,
});

export default function ContactsEditor({
  contacts,
  onChange,
}: ContactsEditorProps) {
  const setPrimary = (targetIdx: number) => {
    onChange(contacts.map((c, i) => ({ ...c, isPrimary: i === targetIdx })));
  };

  const updateField = (
    targetIdx: number,
    field: keyof Omit<Contact, "id" | "isPrimary">,
    value: string,
  ) => {
    onChange(
      contacts.map((c, i) => (i === targetIdx ? { ...c, [field]: value } : c)),
    );
  };

  const addContact = () => {
    const newContact = emptyContact();
    // If no contacts yet, make it primary
    if (contacts.length === 0) newContact.isPrimary = true;
    onChange([...contacts, newContact]);
  };

  const removeContact = (targetIdx: number) => {
    const remaining = contacts.filter((_, i) => i !== targetIdx);
    // If we removed the primary, promote the first remaining contact
    const removedWasPrimary = contacts[targetIdx]?.isPrimary;
    if (removedWasPrimary && remaining.length > 0) {
      remaining[0] = { ...remaining[0], isPrimary: true };
    }
    onChange(remaining);
  };

  const primaryIdx = contacts.findIndex((c) => c.isPrimary);
  const activePrimaryIdx = primaryIdx >= 0 ? primaryIdx : 0;

  return (
    <div className="space-y-3">
      {contacts.map((contact, idx) => {
        const isPrimary = idx === activePrimaryIdx;
        return (
          <div
            key={contact.id || `contact-${idx}`}
            className={`rounded-lg border p-4 space-y-3 transition ${
              isPrimary
                ? "border-blue-300 bg-blue-50/40"
                : "border-slate-200 bg-slate-50/60"
            }`}
          >
            {/* Contact Header Row */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">
                  Contact {idx + 1}
                </span>
                {isPrimary && (
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                    Primary
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Set Primary Radio */}
                {!isPrimary && (
                  <button
                    type="button"
                    onClick={() => setPrimary(idx)}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold hover:underline cursor-pointer transition"
                  >
                    Set as Primary
                  </button>
                )}

                {/* Remove Contact — only if more than 1 exists */}
                {contacts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeContact(idx)}
                    className="text-[11px] text-rose-500 hover:text-rose-700 font-semibold hover:underline cursor-pointer transition"
                    title="Remove contact"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            {/* Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Full Name{" "}
                  {isPrimary && <span className="text-rose-500">*</span>}
                </label>
                <input
                  type="text"
                  value={contact.name}
                  onChange={(e) => updateField(idx, "name", e.target.value)}
                  placeholder="e.g. Ahmed Al-Nuaimi"
                  required={isPrimary}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Role / Designation
                </label>
                <input
                  type="text"
                  value={contact.role || ""}
                  onChange={(e) => updateField(idx, "role", e.target.value)}
                  placeholder="e.g. CTO / IT Director"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Email{" "}
                  {isPrimary && <span className="text-rose-500">*</span>}
                </label>
                <input
                  type="email"
                  value={contact.email}
                  onChange={(e) => updateField(idx, "email", e.target.value)}
                  placeholder="ahmed@company.ae"
                  required={isPrimary}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  value={contact.phone}
                  onChange={(e) => updateField(idx, "phone", e.target.value)}
                  placeholder="+971 50 123 4567"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                />
              </div>
            </div>
          </div>
        );
      })}

      {/* Add Contact Button */}
      <button
        type="button"
        onClick={addContact}
        className="w-full py-2 border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/40 rounded-lg text-xs font-semibold text-slate-500 hover:text-blue-600 transition cursor-pointer flex items-center justify-center gap-1.5"
      >
        <svg
          className="w-3.5 h-3.5"
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
        Add Another Contact
      </button>
    </div>
  );
}
