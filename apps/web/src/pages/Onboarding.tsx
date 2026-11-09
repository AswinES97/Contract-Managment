import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import type { Contact } from "@/types/contractManagement";
import ContactsEditor from "@/components/ContactsEditor";
import type { AppDispatch, RootState } from "@/redux/store";
import {
  fetchCustomers,
  createCustomer,
  updateCustomer,
  addCustomerCloudAccount,
} from "@/redux/customerThunk";
import { fetchServiceTypes } from "@/redux/serviceTypeThunk";
import {
  completeOnboarding,
  saveOnboardingStep,
  fetchOnboardingSteps,
  type CompleteOnboardingPayload,
  type OnboardingContractTerms,
  type OnboardingServiceItem,
  type OnboardingCloudDetails,
} from "@/redux/onboardingThunk";

export interface OnboardingContractService {
  id: string;
  serviceTypeId: string;
  serviceTypeName: string;
  monthlyAmount: number;
  startDate: string;
  endDate: string;
}

const makeDefaultContact = (): Contact => ({
  id: "con-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
  name: "",
  role: "Primary Technical Lead",
  email: "",
  phone: "",
  isPrimary: true,
});

const isCloudBillService = (name: string): boolean => {
  const lower = (name || "").toLowerCase();
  return lower.includes("cloud bill") || lower.includes("cloud usage");
};

export default function OnboardingPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { customers } = useSelector((state: RootState) => state.customer);
  const { serviceTypes: fetchedServiceTypes } = useSelector(
    (state: RootState) => state.serviceTypes,
  );
  const { submitting } = useSelector((state: RootState) => state.onboarding);

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [stepSaving, setStepSaving] = useState(false);
  const [resolvedCustomerId, setResolvedCustomerId] = useState<string | null>(
    null,
  );

  const [onboardingContractId, setOnboardingContractId] = useState<string>(() =>
    crypto.randomUUID(),
  );

  useEffect(() => {
    dispatch(fetchCustomers());
    dispatch(fetchServiceTypes());
  }, [dispatch]);

  const availableServiceTypes = fetchedServiceTypes.filter(
    (s) => s.isActive !== false,
  );

  const [isNewCustomer, setIsNewCustomer] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([makeDefaultContact()]);

  const [scopeDescription, setScopeDescription] = useState("");
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState("2026-12-31");
  const [billingFrequency, setBillingFrequency] = useState("Monthly");
  const [billingTiming, setBillingTiming] = useState("In advance");

  const [contractServices, setContractServices] = useState<
    OnboardingContractService[]
  >([
    {
      id: "srv-1",
      serviceTypeId: "st-managed",
      serviceTypeName: "Managed services",
      monthlyAmount: 2500,
      startDate: "2026-01-01",
      endDate: "2026-12-31",
    },
  ]);

  const [includeCloud, setIncludeCloud] = useState(true);
  const [cloudProvider, setCloudProvider] = useState<"AWS" | "AZURE">("AWS");
  const [cloudAccountId, setCloudAccountId] = useState("123456789012");
  const [cloudDiscount, setCloudDiscount] = useState<number>(5);
  const [awsAccessKeyId, setAwsAccessKeyId] = useState("");
  const [awsSecretAccessKey, setAwsSecretAccessKey] = useState("");
  const [showAwsSecret, setShowAwsSecret] = useState(false);

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setResolvedCustomerId(customerId || null);
    if (customerId) {
      dispatch(fetchOnboardingSteps({ customerId }))
        .unwrap()
        .then((steps) => {
          const comp = new Set<number>();
          let existingContractId: string | null = null;
          steps.forEach((s) => {
            if (s.completed) comp.add(s.step);
            if (s.contractId) existingContractId = s.contractId;
          });
          if (existingContractId) {
            setOnboardingContractId(existingContractId);
          } else {
            setOnboardingContractId(crypto.randomUUID());
          }
          setCompletedSteps(comp);
        })
        .catch(() => {
          setOnboardingContractId(crypto.randomUUID());
          setCompletedSteps(new Set());
        });
    } else {
      setCompletedSteps(new Set());
      setOnboardingContractId(crypto.randomUUID());
    }
  };

  const handleAddService = () => {
    const firstOption = availableServiceTypes[0] || {
      id: "st-managed",
      name: "Managed services",
      monthlyPrice: 2500,
    };
    const name = "Managed services";
    const rawPrice = firstOption.monthlyPrice ?? 0;
    const price =
      typeof rawPrice === "number"
        ? rawPrice
        : parseFloat(String(rawPrice || 0));

    const newService: OnboardingContractService = {
      id: "srv-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
      serviceTypeId: firstOption.id,
      serviceTypeName: name,
      monthlyAmount: isCloudBillService(name) ? 0 : isNaN(price) ? 0 : price,
      startDate: startDate || "2026-01-01",
      endDate: endDate || "2026-12-31",
    };

    setContractServices([...contractServices, newService]);
  };

  const handleChangeServiceType = (serviceId: string, newTypeId: string) => {
    const foundType = availableServiceTypes.find((st) => st.id === newTypeId);
    if (!foundType) return;
    const name = foundType.name || "";
    const isCloud = isCloudBillService(name);
    const rawPrice = foundType.monthlyPrice ?? 0;
    const price =
      typeof rawPrice === "number"
        ? rawPrice
        : parseFloat(String(rawPrice || 0));

    setContractServices((prev) =>
      prev.map((s) =>
        s.id === serviceId
          ? {
              ...s,
              serviceTypeId: foundType.id,
              serviceTypeName: name,
              monthlyAmount: isCloud ? 0 : isNaN(price) ? 0 : price,
            }
          : s,
      ),
    );

    // If changing to a cloud bill service, configure Step 4 defaults
    if (isCloud) {
      setIncludeCloud(true);
      if (name.toLowerCase().includes("azure")) {
        setCloudProvider("AZURE");
      } else if (name.toLowerCase().includes("aws")) {
        setCloudProvider("AWS");
      }
    }
  };

  const handleUpdateServiceField = (
    serviceId: string,
    field: "monthlyAmount" | "startDate" | "endDate",
    value: string | number,
  ) => {
    setContractServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, [field]: value } : s)),
    );
  };

  const handleRemoveService = (serviceId: string) => {
    if (contractServices.length <= 1) {
      toast.error("Contract must include at least one service component");
      return;
    }
    setContractServices((prev) => prev.filter((s) => s.id !== serviceId));
  };

  const validateStep = useCallback(
    (step: number): string | null => {
      if (step === 1) {
        if (isNewCustomer) {
          if (!customerName.trim()) return "Please enter a company name";
          const primary = contacts.find((c) => c.isPrimary) ?? contacts[0];
          if (!primary?.name?.trim()) return "Primary contact must have a name";
          if (!primary?.email?.trim())
            return "Primary contact must have an email";
        } else {
          if (!selectedCustomerId) return "Please select an existing customer";
        }
      }

      if (step === 2) {
        if (!scopeDescription.trim())
          return "Please enter a contract scope description";
        if (!startDate) return "Please select a contract start date";
        if (!endDate) return "Please select a contract end date";
        if (startDate > endDate)
          return "Contract start date cannot be after end date";
      }

      if (step === 3) {
        if (contractServices.length === 0)
          return "Please add at least one service to the contract";
        for (const s of contractServices) {
          if (!s.startDate || !s.endDate)
            return `Please specify start and end dates for service "${s.serviceTypeName}"`;
          if (s.startDate > s.endDate)
            return `Start date cannot be after end date for "${s.serviceTypeName}"`;
          if (
            !isCloudBillService(s.serviceTypeName) &&
            (isNaN(s.monthlyAmount) || s.monthlyAmount < 0)
          )
            return `Please enter a valid monthly amount for "${s.serviceTypeName}"`;
        }
      }

      if (step === 4) {
        if (includeCloud) {
          if (!cloudAccountId.trim())
            return "Please enter a valid cloud account / subscription ID";
          if (cloudProvider === "AWS") {
            if (!awsAccessKeyId.trim())
              return "Please enter your AWS Access Key ID";
            if (!awsSecretAccessKey.trim())
              return "Please enter your AWS Secret Access Key";
          }
        }
      }

      return null;
    },
    [
      isNewCustomer,
      customerName,
      contacts,
      selectedCustomerId,
      scopeDescription,
      startDate,
      endDate,
      contractServices,
      includeCloud,
      cloudAccountId,
      cloudProvider,
      awsAccessKeyId,
      awsSecretAccessKey,
    ],
  );

  const persistStep = useCallback(
    async (
      cid: string,
      step: number,
      extraData?: {
        contract?: OnboardingContractTerms;
        services?: OnboardingServiceItem[];
        cloud?: OnboardingCloudDetails;
      },
    ) => {
      await dispatch(
        saveOnboardingStep({
          customerId: cid,
          contractId: onboardingContractId,
          step,
          completed: true,
          ...extraData,
        }),
      ).unwrap();
      setCompletedSteps((prev) => new Set(prev).add(step));
    },
    [dispatch, onboardingContractId],
  );

  const isBusy = stepSaving || submitting;

  const handleNext = useCallback(async () => {
    // Block double-clicks while saving
    if (stepSaving || submitting) return;

    const err = validateStep(currentStep);
    if (err) {
      toast.error(err);
      return;
    }

    setStepSaving(true);

    try {
      let cid = resolvedCustomerId;

      if (currentStep === 1) {
        if (isNewCustomer) {
          const contactList: Contact[] = contacts
            .filter((c) => c.name.trim())
            .map((c) => ({
              id: c.id,
              name: c.name.trim(),
              role: c.role?.trim() || "",
              email: c.email?.trim() || "",
              phone: c.phone?.trim() || "",
              isPrimary: Boolean(c.isPrimary),
            }));

          if (!cid) {
            const result = await dispatch(
              createCustomer({
                name: customerName.trim(),
                billingAddress: billingAddress.trim() || undefined,
                notes: notes.trim() || undefined,
                status: "INACTIVE",
                contacts: contactList,
              }),
            ).unwrap();

            cid = result.id;
            setResolvedCustomerId(cid);
            toast.success(`Customer "${result.name}" saved to database`);
          } else {
            await dispatch(
              updateCustomer({
                id: cid,
                name: customerName.trim(),
                billingAddress: billingAddress.trim() || undefined,
                notes: notes.trim() || undefined,
                contacts: contactList,
              }),
            ).unwrap();
            toast.success(`Customer details updated`);
          }
        } else {
          // Existing customer — record ID
          cid = selectedCustomerId;
          setResolvedCustomerId(cid);
        }

        if (cid) {
          await persistStep(cid, 1);
        }
      }

      if (!cid) {
        cid = resolvedCustomerId || selectedCustomerId;
      }

      if (!cid) {
        toast.error("Please complete customer setup in Step 1 first");
        setCurrentStep(1);
        return;
      }

      if (currentStep === 2) {
        await persistStep(cid, 2, {
          contract: {
            scopeDescription: scopeDescription.trim(),
            startDate,
            endDate,
            billingFrequency,
            billingTiming,
          },
        });
        toast.success("Step 2: Contract terms saved to server");
      }

      // ── Step 3: Save services & monthly fees to server ───────────────────
      if (currentStep === 3) {
        const hasCloudService = contractServices.some((s) =>
          isCloudBillService(s.serviceTypeName),
        );
        if (hasCloudService) {
          setIncludeCloud(true);
          const hasAzure = contractServices.some((s) =>
            s.serviceTypeName.toLowerCase().includes("azure"),
          );
          setCloudProvider(hasAzure ? "AZURE" : "AWS");
        }

        await persistStep(cid, 3, {
          services: contractServices.map((s) => {
            const matched = availableServiceTypes.find(
              (st) =>
                st.id === s.serviceTypeId ||
                st.name.toLowerCase() === s.serviceTypeName.toLowerCase(),
            );
            return {
              serviceTypeId: matched?.id || s.serviceTypeId,
              serviceTypeName: s.serviceTypeName,
              monthlyAmount: Number(s.monthlyAmount) || 0,
              startDate: s.startDate,
              endDate: s.endDate,
            };
          }),
        });
        toast.success("Step 3: Services & fees saved to server");
      }

      // ── Step 4: Link cloud account and save discount to server ───────────
      if (currentStep === 4) {
        if (includeCloud && cloudAccountId.trim()) {
          try {
            await dispatch(
              addCustomerCloudAccount({
                customerId: cid,
                provider: cloudProvider,
                externalAccountId: cloudAccountId.trim(),
                ...(cloudProvider === "AWS"
                  ? {
                      accessKeyId: awsAccessKeyId.trim() || undefined,
                      secretAccessKey: awsSecretAccessKey.trim() || undefined,
                    }
                  : {}),
              }),
            ).unwrap();
          } catch {
            // Handled or will be finalized in complete onboarding
          }
        }

        await persistStep(cid, 4, {
          cloud: includeCloud
            ? {
                provider: cloudProvider,
                externalAccountId: cloudAccountId.trim(),
                discountPercentage: Number(cloudDiscount) || 0,
                ...(cloudProvider === "AWS"
                  ? {
                      accessKeyId: awsAccessKeyId.trim() || undefined,
                      secretAccessKey: awsSecretAccessKey.trim() || undefined,
                    }
                  : {}),
              }
            : undefined,
        });
        toast.success("Step 4: Cloud details saved to server");
      }

      setCurrentStep((prev) => Math.min(prev + 1, 5));
    } catch (err: unknown) {
      toast.error(
        typeof err === "string" ? err : "An error occurred, please try again",
      );
    } finally {
      setStepSaving(false);
    }
  }, [
    stepSaving,
    submitting,
    currentStep,
    validateStep,
    resolvedCustomerId,
    isNewCustomer,
    selectedCustomerId,
    customerName,
    billingAddress,
    notes,
    contacts,
    scopeDescription,
    startDate,
    endDate,
    billingFrequency,
    billingTiming,
    contractServices,
    includeCloud,
    cloudAccountId,
    cloudProvider,
    cloudDiscount,
    awsAccessKeyId,
    awsSecretAccessKey,
    availableServiceTypes,
    persistStep,
    dispatch,
  ]);

  const handleBack = useCallback(() => {
    if (stepSaving || submitting) return;
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, [stepSaving, submitting]);

  const handleStepClick = useCallback(
    (stepNumber: number) => {
      if (isBusy) return;
      if (stepNumber === currentStep) return;

      const isCompleted =
        completedSteps.has(stepNumber) || stepNumber < currentStep;

      if (stepNumber === 1 || isCompleted) {
        setCurrentStep(stepNumber);
      } else {
        toast.info(
          `Please complete current steps before jumping to Step ${stepNumber}`,
        );
      }
    },
    [isBusy, currentStep, completedSteps],
  );

  const handleActivate = useCallback(async () => {
    if (stepSaving || submitting) return;

    const cid = resolvedCustomerId || selectedCustomerId;

    const payload: CompleteOnboardingPayload = {
      ...(isNewCustomer
        ? { customerId: cid || undefined }
        : { customerId: cid }),
      contractId: onboardingContractId,
      contract: {
        scopeDescription,
        startDate,
        endDate,
        billingFrequency,
        billingTiming,
      },
      services: contractServices.map((s) => {
        const matched = availableServiceTypes.find(
          (st) =>
            st.id === s.serviceTypeId ||
            st.name.toLowerCase() === s.serviceTypeName.toLowerCase(),
        );
        return {
          serviceTypeId: matched?.id || s.serviceTypeId,
          serviceTypeName: s.serviceTypeName,
          monthlyAmount: Number(s.monthlyAmount) || 0,
          startDate: s.startDate,
          endDate: s.endDate,
        };
      }),
      ...(includeCloud
        ? {
            cloud: {
              provider: cloudProvider,
              externalAccountId: cloudAccountId.trim(),
              discountPercentage: Number(cloudDiscount) || 0,
              ...(cloudProvider === "AWS"
                ? {
                    accessKeyId: awsAccessKeyId.trim() || undefined,
                    secretAccessKey: awsSecretAccessKey.trim() || undefined,
                  }
                : {}),
            },
          }
        : {}),
    };

    try {
      const result = await dispatch(completeOnboarding(payload)).unwrap();
      toast.success(
        `✅ "${result.customer.name}" onboarded — ${contractServices.length} service(s) activated!`,
      );
      navigate("/contracts");
    } catch (err: unknown) {
      toast.error(
        typeof err === "string"
          ? err
          : "Failed to complete customer onboarding",
      );
    }
  }, [
    stepSaving,
    submitting,
    resolvedCustomerId,
    selectedCustomerId,
    isNewCustomer,
    scopeDescription,
    startDate,
    endDate,
    billingFrequency,
    billingTiming,
    contractServices,
    includeCloud,
    cloudProvider,
    cloudAccountId,
    cloudDiscount,
    awsAccessKeyId,
    awsSecretAccessKey,
    availableServiceTypes,
    onboardingContractId,
    dispatch,
    navigate,
  ]);

  const steps = [
    { number: 1, title: "Customer & Contacts" },
    { number: 2, title: "Contract & Terms" },
    { number: 3, title: "Services & Fees" },
    { number: 4, title: "Cloud & Discount" },
    { number: 5, title: "Review & Activate" },
  ];

  const primaryContact = contacts.find((c) => c.isPrimary) ?? contacts[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-xs p-6 border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900">
          Customer Onboarding
        </h2>

        {/* Stepper Wizard Bar */}
        <div className="mt-8 flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 z-0"></div>
          {steps.map((st) => {
            const isCurrent = currentStep === st.number;
            const isCompleted =
              completedSteps.has(st.number) || currentStep > st.number;
            const canNavigate = (st.number === 1 || isCompleted) && !isBusy;

            return (
              <button
                key={st.number}
                type="button"
                disabled={!canNavigate && !isCurrent}
                onClick={() => handleStepClick(st.number)}
                className={`relative z-10 flex flex-col items-center bg-white px-2 focus:outline-hidden transition-all ${
                  canNavigate && !isCurrent
                    ? "cursor-pointer group hover:scale-105"
                    : isCurrent
                      ? "cursor-default"
                      : "cursor-not-allowed opacity-75"
                }`}
                title={
                  isCurrent
                    ? `Current Step: ${st.title}`
                    : canNavigate
                      ? `Jump to Step ${st.number}: ${st.title}`
                      : `Step ${st.number}: ${st.title} (Complete previous steps first)`
                }
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isCurrent && isBusy
                      ? "bg-blue-500 text-white ring-4 ring-blue-100 animate-pulse"
                      : isCurrent
                        ? "bg-blue-600 text-white ring-4 ring-blue-100 shadow-sm"
                        : isCompleted
                          ? "bg-emerald-600 text-white group-hover:bg-emerald-700 group-hover:ring-4 group-hover:ring-emerald-100 shadow-xs"
                          : "bg-slate-100 text-slate-400 border border-slate-300"
                  }`}
                >
                  {isBusy && isCurrent ? (
                    <svg
                      className="animate-spin h-4 w-4 text-white"
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
                  ) : isCompleted ? (
                    "✓"
                  ) : (
                    st.number
                  )}
                </div>
                <span
                  className={`text-[11px] font-semibold mt-2 transition-colors ${
                    isCurrent
                      ? "text-blue-600 font-bold"
                      : isCompleted
                        ? "text-emerald-700 group-hover:text-emerald-800"
                        : "text-slate-400"
                  }`}
                >
                  {st.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Content Box */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-8 relative">
        {/* Loading Overlay when saving */}
        {isBusy && (
          <div className="absolute inset-0 z-30 bg-white/75 backdrop-blur-[1px] flex flex-col items-center justify-center rounded-xl transition-all">
            <div className="bg-white px-6 py-4 rounded-xl shadow-lg border border-slate-200 flex items-center gap-3">
              <svg
                className="animate-spin h-5 w-5 text-blue-600"
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
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-800">
                  {submitting
                    ? "Activating Contract & Starting Billing..."
                    : stepSaving &&
                        currentStep === 1 &&
                        isNewCustomer &&
                        !resolvedCustomerId
                      ? "Saving New Customer to Database..."
                      : stepSaving &&
                          currentStep === 1 &&
                          isNewCustomer &&
                          resolvedCustomerId
                        ? "Updating Customer Details..."
                        : `Saving Step ${currentStep} to Database...`}
                </p>
                <p className="text-xs text-slate-500">
                  Please wait while the server processes your request
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Temporarily disable all form controls during backend processing */}
        <fieldset
          disabled={isBusy}
          className="block border-0 p-0 m-0 min-w-0 disabled:opacity-60 disabled:pointer-events-none transition-opacity"
        >
          {/* STEP 1: Customer and Contacts */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-slate-900 border-b pb-2">
                Customer & Contacts
              </h2>

              {/* New vs Existing Toggle */}
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input
                    type="radio"
                    checked={isNewCustomer}
                    onChange={() => {
                      setIsNewCustomer(true);
                      setSelectedCustomerId("");
                      setResolvedCustomerId(null);
                      setOnboardingContractId(crypto.randomUUID());
                      setCompletedSteps(new Set());
                    }}
                    className="text-blue-600"
                  />
                  Create New Customer
                </label>
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input
                    type="radio"
                    checked={!isNewCustomer}
                    onChange={() => {
                      setIsNewCustomer(false);
                      setResolvedCustomerId(null);
                      setOnboardingContractId(crypto.randomUUID());
                      setCompletedSteps(new Set());
                    }}
                    className="text-blue-600"
                  />
                  Select Existing Customer
                </label>
              </div>

              {isNewCustomer ? (
                <div className="space-y-4">
                  {/* Company Details */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Company Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Company Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="e.g. Al Habtoor Technologies"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Billing Address
                        </label>
                        <input
                          type="text"
                          value={billingAddress}
                          onChange={(e) => setBillingAddress(e.target.value)}
                          placeholder="Office 302, Business Bay, Dubai"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Notes / Internal Remarks
                        </label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="e.g. VIP customer, escalate billing queries to finance team"
                          rows={2}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contacts Editor */}
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Contacts
                      </h3>
                      <span className="text-[11px] text-slate-400">
                        {contacts.length} contact
                        {contacts.length !== 1 ? "s" : ""} · 1 primary required
                      </span>
                    </div>
                    <ContactsEditor
                      contacts={contacts}
                      onChange={setContacts}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Choose Existing Customer
                    </label>
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => handleSelectCustomer(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    >
                      <option value="">-- Choose Customer --</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Show selected customer contacts read-only */}
                  {selectedCustomerId &&
                    (() => {
                      const existing = customers.find(
                        (c) => c.id === selectedCustomerId,
                      );
                      if (!existing || existing.contacts.length === 0)
                        return null;
                      return (
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                            Existing Contacts
                          </span>
                          {existing.contacts.map((ct) => (
                            <div
                              key={ct.id}
                              className={`p-2.5 rounded-lg border text-xs space-y-0.5 ${
                                ct.isPrimary
                                  ? "border-blue-200 bg-blue-50/60"
                                  : "border-slate-200 bg-white"
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-slate-800">
                                  {ct.name}
                                </span>
                                {ct.isPrimary && (
                                  <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full uppercase">
                                    Primary
                                  </span>
                                )}
                              </div>
                              {ct.role && (
                                <p className="text-slate-500">{ct.role}</p>
                              )}
                              <p className="font-mono text-[11px] text-slate-600">
                                {ct.email}
                                {ct.phone ? ` · ${ct.phone}` : ""}
                              </p>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 border-b pb-2">
                Contract Dates & Payment Terms
              </h2>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Scope Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={scopeDescription}
                  onChange={(e) => setScopeDescription(e.target.value)}
                  placeholder="Scope description: e.g. AWS Cloud Hosting, 24/7 Managed NOC & SOC Monitoring"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Start Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      const nextVal = e.target.value;
                      setStartDate(nextVal);
                      // Update default dates for any existing services
                      setContractServices((prev) =>
                        prev.map((s) => ({ ...s, startDate: nextVal })),
                      );
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    End Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      const nextVal = e.target.value;
                      setEndDate(nextVal);
                      // Update default dates for any existing services
                      setContractServices((prev) =>
                        prev.map((s) => ({ ...s, endDate: nextVal })),
                      );
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="In advance">In advance</option>
                    <option value="In arrears">In arrears</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Contract Services & Monthly Fees (FR4) */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Contract Services & Monthly Fees
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleAddService}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer self-start sm:self-auto shrink-0"
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
                  Add Service Component
                </button>
              </div>

              {/* List of Configured Contract Services */}
              <div className="space-y-4">
                {contractServices.map((service, index) => {
                  const isCloud = isCloudBillService(service.serviceTypeName);

                  return (
                    <div
                      key={service.id}
                      className="p-4.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition space-y-3"
                    >
                      {/* Row Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-800">
                            {service.serviceTypeName}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              isCloud
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {isCloud
                              ? "Usage-Based Cloud"
                              : "Fixed Monthly Fee"}
                          </span>
                        </div>

                        {contractServices.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveService(service.id)}
                            className="text-xs font-semibold text-rose-500 hover:text-rose-700 hover:underline cursor-pointer transition"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      {/* Fields Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                        {/* Service Type Dropdown */}
                        <div className="sm:col-span-2 lg:col-span-1">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Service Type{" "}
                            <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={service.serviceTypeId}
                            onChange={(e) =>
                              handleChangeServiceType(
                                service.id,
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium"
                          >
                            {availableServiceTypes.map((st) => (
                              <option key={st.id} value={st.id}>
                                {st.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Monthly Fee / Usage Note */}
                        <div className="sm:col-span-2 lg:col-span-1">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Monthly Amount (AED)
                          </label>
                          {isCloud ? (
                            <div className="px-3 py-2 border border-amber-200 bg-amber-50/70 rounded-lg text-[11px] text-amber-800 font-semibold flex items-center gap-1.5 h-[36px]">
                              <span>⚡</span>
                              <span>Usage-Based (Actual Usage)</span>
                            </div>
                          ) : (
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 font-semibold text-xs pointer-events-none">
                                AED
                              </span>
                              <input
                                type="number"
                                min="0"
                                step="100"
                                value={service.monthlyAmount}
                                onChange={(e) =>
                                  handleUpdateServiceField(
                                    service.id,
                                    "monthlyAmount",
                                    Number(e.target.value),
                                  )
                                }
                                className="w-full pl-11 pr-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-semibold bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-right"
                              />
                            </div>
                          )}
                        </div>

                        {/* Service Start Date */}
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Service Start Date{" "}
                            <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="date"
                            value={service.startDate}
                            onChange={(e) =>
                              handleUpdateServiceField(
                                service.id,
                                "startDate",
                                e.target.value,
                              )
                            }
                            className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs font-mono bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                          />
                        </div>

                        {/* Service End Date */}
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Service End Date{" "}
                            <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="date"
                            value={service.endDate}
                            onChange={(e) =>
                              handleUpdateServiceField(
                                service.id,
                                "endDate",
                                e.target.value,
                              )
                            }
                            className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs font-mono bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                          />
                        </div>
                      </div>

                      {/* Explanatory subtitle for row */}
                      {isCloud ? (
                        <p className="text-[11px] text-amber-700 italic">
                          Amount is not fixed: it comes from actual cloud
                          consumption measured via cloud provider APIs at month
                          end.
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-400">
                          {/* Fixed fee applied monthly from {service.startDate} to{" "}
                          {service.endDate}. */}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Business Rule / Mid-Contract Note */}
              {/* <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
                <strong className="block font-semibold">
                  Mid-Contract Rate Changes (FR4):
                </strong>
                <p className="text-[11px] leading-relaxed text-blue-800">
                  Because each service has its own monthly amount and
                  independent start/end dates, a fee can change mid-contract. To
                  set up tiered pricing (e.g., Managed Services at AED 2,500/mo
                  for Months 1–6, then upgrading to AED 3,500/mo for Months
                  7–12), add the service component twice with adjacent date
                  ranges.
                </p>
              </div> */}
            </div>
          )}

          {/* STEP 4: Cloud Discount & Account Link */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 border-b pb-2">
                Cloud Account & Discount Percentage
              </h2>

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
                          onChange={(e) =>
                            setCloudProvider(e.target.value as "AWS" | "AZURE")
                          }
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                        >
                          <option value="AWS">AWS (Amazon Web Services)</option>
                          <option value="AZURE">Azure (Microsoft Azure)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {cloudProvider === "AWS"
                            ? "AWS Account ID (12 digits)"
                            : "Azure Subscription / Tenant ID"}
                        </label>
                        <input
                          type="text"
                          value={cloudAccountId}
                          onChange={(e) => setCloudAccountId(e.target.value)}
                          placeholder={
                            cloudProvider === "AWS"
                              ? "e.g. 123456789012"
                              : "e.g. 00000000-0000-0000-0000-000000000000"
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    {/* AWS API Keys (Only for AWS) */}
                    {cloudProvider === "AWS" && (
                      <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-lg space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">🔑</span>
                          <div>
                            <h4 className="text-xs font-bold text-amber-900">
                              AWS API Access Credentials
                            </h4>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              AWS Access Key ID{" "}
                              <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={awsAccessKeyId}
                              onChange={(e) =>
                                setAwsAccessKeyId(e.target.value.trim())
                              }
                              placeholder="e.g. AKIAIOSFODNN7EXAMPLE"
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono uppercase bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              AWS Secret Access Key{" "}
                              <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                              <input
                                type={showAwsSecret ? "text" : "password"}
                                value={awsSecretAccessKey}
                                onChange={(e) =>
                                  setAwsSecretAccessKey(e.target.value.trim())
                                }
                                placeholder="e.g. wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                                className="w-full pl-3 pr-10 py-2 border border-slate-300 rounded-lg text-xs font-mono bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                              />
                              <button
                                type="button"
                                onClick={() => setShowAwsSecret(!showAwsSecret)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                                tabIndex={-1}
                              >
                                {showAwsSecret ? (
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
                                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                                    />
                                  </svg>
                                ) : (
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
                                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

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
                          onChange={(e) =>
                            setCloudDiscount(Number(e.target.value))
                          }
                          className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono text-right focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                        />
                        <span className="font-bold text-slate-700">%</span>
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
                Review & Activate
              </h2>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs uppercase text-slate-400 font-bold block">
                      Customer
                    </span>
                    <p className="font-semibold text-slate-800">
                      {isNewCustomer ? customerName : "Selected Customer"}
                    </p>
                    {isNewCustomer && primaryContact && (
                      <div className="mt-1 space-y-0.5">
                        <p className="text-xs text-slate-500 font-medium">
                          {primaryContact.name}
                          {primaryContact.role && ` — ${primaryContact.role}`}
                        </p>
                        <p className="text-xs text-slate-400 font-mono">
                          {primaryContact.email}
                          {primaryContact.phone && ` · ${primaryContact.phone}`}
                        </p>
                        {contacts.length > 1 && (
                          <p className="text-[11px] text-slate-400 italic">
                            + {contacts.length - 1} additional contact
                            {contacts.length - 1 !== 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-xs uppercase text-slate-400 font-bold block">
                      Contract Term
                    </span>
                    <p className="font-semibold text-slate-800">
                      {startDate} to {endDate}
                    </p>
                    <p className="text-xs text-slate-500">
                      {billingFrequency} &middot; {billingTiming}
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase text-slate-400 font-bold block">
                      Scope & Services ({contractServices.length} Component
                      {contractServices.length !== 1 ? "s" : ""})
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 mb-2 italic">
                    "{scopeDescription}"
                  </p>

                  <div className="space-y-2">
                    {contractServices.map((s) => {
                      const isCloud = isCloudBillService(s.serviceTypeName);
                      return (
                        <div
                          key={s.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 text-xs gap-1.5"
                        >
                          <div>
                            <span className="font-bold text-slate-800 block">
                              {s.serviceTypeName}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              Effective: {s.startDate} to {s.endDate}
                            </span>
                          </div>
                          <div className="text-right self-start sm:self-auto">
                            {isCloud ? (
                              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                Usage-Based ({cloudProvider} &minus;{" "}
                                {cloudDiscount}% discount)
                              </span>
                            ) : (
                              <span className="font-mono font-bold text-slate-900">
                                AED {s.monthlyAmount.toLocaleString()} / month
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {includeCloud && (
                  <div className="border-t border-slate-200 pt-3 text-xs">
                    <span className="text-xs uppercase text-slate-400 font-bold block mb-1">
                      Linked Cloud Account
                    </span>
                    <p className="text-slate-700 font-mono">
                      {cloudProvider}: {cloudAccountId} ({cloudDiscount}%
                      discount applied to monthly bill)
                    </p>
                    {cloudProvider === "AWS" && (
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                        <span>🔑 AWS Credentials:</span>
                        {awsAccessKeyId ? (
                          <span className="font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            {awsAccessKeyId.slice(0, 4)}••••••••
                            {awsAccessKeyId.slice(-4)} (Configured &amp;
                            Encrypted)
                          </span>
                        ) : (
                          <span className="text-amber-600 italic">
                            None provided
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium">
                  ✓ Once activated, this contract will be officially billable
                  and included in monthly calculation.
                </div>
              </div>
            </div>
          )}
        </fieldset>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-6 mt-6 border-t border-slate-100">
          {/* Back button */}
          <button
            type="button"
            disabled={currentStep === 1 || isBusy}
            onClick={handleBack}
            className={`px-4 py-2 border rounded-lg text-xs font-semibold transition ${
              currentStep === 1 || isBusy
                ? "border-slate-200 text-slate-300 cursor-not-allowed"
                : "border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
            }`}
          >
            ← Previous Step
          </button>

          {/* Status badge when saving */}
          {isBusy && (
            <span className="text-xs text-slate-500 italic flex items-center gap-1.5">
              <svg
                className="animate-spin h-3.5 w-3.5 text-blue-500"
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
              {submitting
                ? "Activating billing…"
                : stepSaving && currentStep === 1 && isNewCustomer
                  ? "Creating customer…"
                  : "Saving…"}
            </span>
          )}

          {/* Next / Activate button */}
          {currentStep < 5 ? (
            <button
              type="button"
              disabled={isBusy}
              onClick={handleNext}
              className={`px-5 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-2 ${
                isBusy
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:bg-blue-700 cursor-pointer"
              }`}
            >
              {stepSaving ? (
                <>
                  <svg
                    className="animate-spin h-3.5 w-3.5 text-white"
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
                  <span>Saving…</span>
                </>
              ) : (
                <span>Next →</span>
              )}
            </button>
          ) : (
            <button
              type="button"
              disabled={isBusy}
              onClick={handleActivate}
              className={`px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold shadow-md shadow-emerald-600/30 transition flex items-center gap-2 ${
                isBusy
                  ? "opacity-75 cursor-not-allowed"
                  : "hover:bg-emerald-700 cursor-pointer"
              }`}
            >
              {submitting ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
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
                  <span>Activating Billing…</span>
                </>
              ) : (
                <span>Activate Contract & Finish</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
