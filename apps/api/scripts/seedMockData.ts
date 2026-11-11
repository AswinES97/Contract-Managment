import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

interface SeedSummary {
  customers: number;
  contracts: {
    total: number;
    active: number;
    draft: number;
    expired: number;
    terminated: number;
  };
  onboarding: {
    completed: number;
    step4: number;
    step3: number;
    step2: number;
    step1: number;
  };
  bills: {
    total: number;
    pending: number;
    raised: number;
    completed: number;
  };
  cloudAccounts: number;
}

// Name parts for generating distinct, realistic UAE / Middle East enterprise names
const COMPANY_PREFIXES = [
  "Al Futtaim", "Emirates", "Dubai", "Abu Dhabi", "Gulf", "Falcon", "Apex", "Horizon",
  "Oasis", "Crescent", "Noor", "RAK", "Barakah", "Dana", "Etihad", "Masdar", "Emaar",
  "DAMAC", "Shurooq", "Al Habtoor", "Majid Al Futtaim", "Mubadala", "G42", "Careem",
  "Nexus", "Vertex", "Summit", "Prime", "Quantum", "Titan", "Beacon", "Stellar",
  "Vanguard", "Astra", "Vision", "Core", "Stratum", "Zenith", "Pioneer", "Atlas",
  "Cobalt", "Silverline", "Omni", "Pulse", "Alpha", "Matrix", "Unified", "NextGen",
  "Bayanat", "Yahsat", "Tabreed", "Aldar", "Dubai Holding", "Sobha", "DEWA", "ADNOC"
];

const COMPANY_SECTORS = [
  "Technologies", "Digital Solutions", "Cloud Systems", "FinTech Services",
  "Logistics & Cargo", "Healthcare Informatics", "Energy Solutions", "Cybersecurity",
  "Retail Innovations", "Aviation Services", "Capital Partners", "Data Analytics",
  "Managed Services", "Infrastructure Networks", "Telecom Solutions", "AI Ventures",
  "Media & Communications", "Financial Group", "Consulting & Advisory", "Enterprise Labs",
  "E-Commerce Solutions", "Supply Chain Systems", "Smart Mobility", "Software Labs"
];

const COMPANY_LEGAL = ["LLC", "FZ-LLC", "PJSC", "Group", "Holdings", "Middle East", "International", "Solutions"];

const UAE_LOCATIONS = [
  "Level 14, Al Saada Tower, Dubai Internet City, Dubai",
  "Building 3, Dubai Media City, Dubai",
  "Tower B, Business Bay, Dubai",
  "Al Maryah Island, ADGM Square, Abu Dhabi",
  "Gate Precinct 4, DIFC, Dubai",
  "Office 201, Dubai Silicon Oasis, Dubai",
  "Al Khatem Tower, Al Maryah Island, Abu Dhabi",
  "Floor 22, Marina Plaza, Dubai Marina, Dubai",
  "Building 11, Bay Square, Business Bay, Dubai",
  "Al Reem Island, Sky Tower, Abu Dhabi",
  "Sheikh Zayed Road, Trade Centre 2, Dubai",
  "Dubai Design District (d3), Building 7, Dubai",
  "Jumeirah Lakes Towers (JLT), Cluster X, Dubai",
  "Al Majaz Waterfront, Sharjah",
  "RAK Economic Zone, Al Nakheel, Ras Al Khaimah",
  "TwoFour54, Media Zone, Yas Island, Abu Dhabi",
  "Dubai South, Business Park Building C, Dubai",
  "Downtown Dubai, Boulevard Plaza Tower 1, Dubai",
  "Al Barsha 1, Al Attar Business Tower, Dubai",
  "Corniche Road, Landmark Tower, Abu Dhabi"
];

const FIRST_NAMES = [
  "Tariq", "Fatima", "Omar", "Amina", "Zaid", "Mariam", "Rashid", "Layla",
  "Khalid", "Sara", "Ahmed", "Noura", "Hamad", "Reem", "Sultan", "Huda",
  "Mansoor", "Zainab", "Fahad", "Mona", "Ali", "Salma", "Saif", "Yasmin",
  "Abdullah", "Dina", "Hassan", "Aisha", "Salem", "Lina", "Bilal", "Maya",
  "Kareem", "Farah", "Nasser", "Rania", "Adel", "Samira", "Faisal", "Nadia",
  "Yousef", "Noor", "Majid", "Laila", "Marwan", "Dana", "Jamal", "Hana",
  "Ibrahim", "Rashed", "Karim", "Zahra", "Humaid", "Malak", "Bader", "Jana"
];

const LAST_NAMES = [
  "Al Mansoori", "Al Nuaimi", "Al Zaabi", "Al Shamsi", "Al Hashimi", "Al Qasimi",
  "Al Falasi", "Al Suwaidi", "Al Marzooqi", "Al Kaabi", "Al Mazrouei", "Al Blooshi",
  "Al Ameri", "Al Maktoum", "Al Nahyan", "Al Dhaheri", "Al Awadhi", "Al Mehairi",
  "Khan", "Patel", "Sharma", "Smith", "Johnson", "Williams", "Taylor", "Davies",
  "Siddiqui", "Farooq", "Rahman", "Haddad", "Khoury", "Najjar", "Ghanem", "Saleh"
];

const ROLES = [
  "Chief Technology Officer",
  "VP of IT Infrastructure",
  "Head of Cloud Operations",
  "Lead DevOps Architect",
  "IT Procurement Director",
  "Chief Information Security Officer",
  "Finance & Billing Manager",
  "Engineering Director",
  "Systems Administrator Lead",
  "Primary Technical Lead"
];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateCompanyName(index: number): string {
  const prefix = COMPANY_PREFIXES[(index * 7) % COMPANY_PREFIXES.length];
  const sector = COMPANY_SECTORS[(index * 13) % COMPANY_SECTORS.length];
  const legal = COMPANY_LEGAL[(index * 5) % COMPANY_LEGAL.length];
  const suffixNum = index > 200 ? ` (${index + 100})` : "";
  return `${prefix} ${sector} ${legal}${suffixNum}`;
}

async function ensureDefaultServiceTypes(prisma: PrismaClient) {
  const defaultTypes = [
    { name: "Managed services", monthlyPrice: 2500 },
    { name: "Cloud Bill (AWS)", monthlyPrice: 0 },
    { name: "Cloud Bill (Azure)", monthlyPrice: 0 },
    { name: "24/7 DevOps & SRE Support", monthlyPrice: 4500 },
    { name: "Cybersecurity & Compliance Monitoring", monthlyPrice: 3500 },
    { name: "Database Administration (DBA)", monthlyPrice: 2200 },
    { name: "Network Infrastructure & Firewall", monthlyPrice: 1800 },
    { name: "Application Performance Monitoring (APM)", monthlyPrice: 1500 },
  ];

  const serviceTypes = [];
  for (const st of defaultTypes) {
    const record = await prisma.serviceType.upsert({
      where: { name: st.name },
      update: { monthlyPrice: st.monthlyPrice, isActive: true },
      create: { name: st.name, monthlyPrice: st.monthlyPrice, isActive: true },
    });
    serviceTypes.push(record);
  }

  return serviceTypes;
}

export async function seedMockCustomers(totalCustomers: number = 500): Promise<SeedSummary> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not defined in environment.");
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  const summary: SeedSummary = {
    customers: 0,
    contracts: { total: 0, active: 0, draft: 0, expired: 0, terminated: 0 },
    onboarding: { completed: 0, step4: 0, step3: 0, step2: 0, step1: 0 },
    bills: { total: 0, pending: 0, raised: 0, completed: 0 },
    cloudAccounts: 0,
  };

  try {
    console.log(`\n======================================================`);
    console.log(`🚀 Starting Seed of ${totalCustomers} Customers with Contracts & Bills`);
    console.log(`======================================================\n`);

    const serviceTypes = await ensureDefaultServiceTypes(prisma);
    const managedType = serviceTypes.find((s) => s.name === "Managed services")!;
    const awsType = serviceTypes.find((s) => s.name === "Cloud Bill (AWS)")!;
    const azureType = serviceTypes.find((s) => s.name === "Cloud Bill (Azure)")!;
    const otherTypes = serviceTypes.filter(
      (s) => s.name !== "Managed services" && s.name !== "Cloud Bill (AWS)" && s.name !== "Cloud Bill (Azure)",
    );

    let invoiceSequence = 1000;
    const BATCH_SIZE = Math.min(25, Math.max(1, totalCustomers));
    const totalBatches = Math.ceil(totalCustomers / BATCH_SIZE);

    for (let batchIdx = 0; batchIdx < totalBatches; batchIdx++) {
      const startIndex = batchIdx * BATCH_SIZE;
      const endIndex = Math.min(startIndex + BATCH_SIZE, totalCustomers);

      await prisma.$transaction(async (tx) => {
        for (let i = startIndex; i < endIndex; i++) {
          const custIdx = i + 1;
          const companyName = generateCompanyName(custIdx);
          const address = getRandomItem(UAE_LOCATIONS);

          // Onboarding Profile Assignment (Proportional across any total count):
          // ~60%: COMPLETED (Customer ACTIVE, 1-3 contracts, bills)
          // ~10%: STEP_4_DONE (pending step 5 review, Contract DRAFT with services & cloud)
          // ~10%: STEP_3_DONE (pending step 4 cloud, Contract DRAFT with services)
          // ~10%: STEP_2_DONE (pending step 3 services, Contract DRAFT with dates/scope only)
          // ~10%: STEP_1_DONE (pending step 2 terms, No contract yet)
          let onboardingProfile: "COMPLETED" | "STEP_4_DONE" | "STEP_3_DONE" | "STEP_2_DONE" | "STEP_1_DONE";
          const ratio = (custIdx - 1) / totalCustomers;
          if (ratio < 0.6) {
            onboardingProfile = "COMPLETED";
            summary.onboarding.completed++;
          } else if (ratio < 0.7) {
            onboardingProfile = "STEP_4_DONE";
            summary.onboarding.step4++;
          } else if (ratio < 0.8) {
            onboardingProfile = "STEP_3_DONE";
            summary.onboarding.step3++;
          } else if (ratio < 0.9) {
            onboardingProfile = "STEP_2_DONE";
            summary.onboarding.step2++;
          } else {
            onboardingProfile = "STEP_1_DONE";
            summary.onboarding.step1++;
          }

          const customerStatus = onboardingProfile === "COMPLETED" ? "ACTIVE" : "INACTIVE";

          // 1. Create Customer
          const customer = await tx.customer.create({
            data: {
              name: companyName,
              billingAddress: address,
              notes: `Customer profile: ${onboardingProfile}. Tier: ${custIdx % 3 === 0 ? "Enterprise" : "Standard"}.`,
              status: customerStatus,
            },
          });
          summary.customers++;

          // 2. Create Contacts (1 to 3 contacts per customer, 1 primary)
          const contactCount = getRandomInt(1, 3);
          for (let c = 0; c < contactCount; c++) {
            const firstName = getRandomItem(FIRST_NAMES);
            const lastName = getRandomItem(LAST_NAMES);
            const isPrimary = c === 0;
            const cleanCompanyName = companyName.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 15);
            const email = `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/\s+/g, "")}@${cleanCompanyName}.ae`;
            const phone = `+971 50 ${getRandomInt(100, 999)} ${getRandomInt(1000, 9999)}`;

            await tx.contact.create({
              data: {
                customerId: customer.id,
                name: `${firstName} ${lastName}`,
                role: isPrimary ? "Primary Technical Lead" : getRandomItem(ROLES),
                email,
                phone,
                isPrimary,
              },
            });
          }

          // 3. Create Cloud Accounts if applicable (Steps 4 & 5)
          let awsAccount: any = null;
          let azureAccount: any = null;
          if (onboardingProfile === "COMPLETED" || onboardingProfile === "STEP_4_DONE") {
            const cloudTypeChoice = custIdx % 4; // 0: AWS only, 1: Azure only, 2: Both, 3: None
            if (cloudTypeChoice === 0 || cloudTypeChoice === 2) {
              const awsId = `1200${custIdx.toString().padStart(8, "0")}`;
              awsAccount = await tx.cloudAccount.create({
                data: {
                  customerId: customer.id,
                  provider: "AWS",
                  externalAccountId: awsId,
                  isActive: true,
                },
              });
              summary.cloudAccounts++;

              // Monthly usage for AWS
              await tx.cloudUsageMonthly.create({
                data: {
                  cloudAccountId: awsAccount.id,
                  billingMonth: new Date("2026-02-01"),
                  amount: getRandomInt(5000, 35000),
                  currency: "AED",
                },
              });
            }

            if (cloudTypeChoice === 1 || cloudTypeChoice === 2) {
              const azureId = `sub-az-${custIdx.toString().padStart(6, "0")}`;
              azureAccount = await tx.cloudAccount.create({
                data: {
                  customerId: customer.id,
                  provider: "AZURE",
                  externalAccountId: azureId,
                  isActive: true,
                },
              });
              summary.cloudAccounts++;

              // Monthly usage for Azure
              await tx.cloudUsageMonthly.create({
                data: {
                  cloudAccountId: azureAccount.id,
                  billingMonth: new Date("2026-02-01"),
                  amount: getRandomInt(4000, 28000),
                  currency: "AED",
                },
              });
            }
          }

          // 4. Handle Contracts Based on Profile
          if (onboardingProfile === "STEP_1_DONE") {
            // Step 1 only - no contract drafted yet
            await tx.onboardingStep.create({
              data: {
                customer_id: customer.id,
                contract_id: null,
                step: 1,
                status: "PENDING",
                completed: true,
                completedAt: new Date(),
              },
            });
            continue;
          }

          // Incomplete Onboarding Contracts (Steps 2, 3, 4)
          if (onboardingProfile !== "COMPLETED") {
            const draftContract = await tx.contract.create({
              data: {
                customerId: customer.id,
                scopeDescription: `Initial Scope for ${companyName} - Deployment & Cloud Architecture`,
                startDate: new Date("2026-02-01"),
                endDate: new Date("2027-01-31"),
                status: "DRAFT",
                billingFrequency: getRandomItem(["Monthly", "Quarterly"]),
                billingTiming: getRandomItem(["In advance", "In arrears"]),
                onboardingCompletedAt: null,
              },
            });
            summary.contracts.total++;
            summary.contracts.draft++;

            // Step 2 has no services yet
            if (onboardingProfile === "STEP_3_DONE" || onboardingProfile === "STEP_4_DONE") {
              // Add 1-2 services
              const cs1 = await tx.contractService.create({
                data: {
                  contractId: draftContract.id,
                  serviceTypeId: managedType.id,
                  monthlyAmount: 2500,
                  startDate: new Date("2026-02-01"),
                  endDate: new Date("2027-01-31"),
                },
              });

              if (awsAccount || onboardingProfile === "STEP_4_DONE") {
                const cloudSvc = await tx.contractService.create({
                  data: {
                    contractId: draftContract.id,
                    serviceTypeId: awsType.id,
                    monthlyAmount: null,
                    startDate: new Date("2026-02-01"),
                    endDate: new Date("2027-01-31"),
                  },
                });

                await tx.serviceDiscount.create({
                  data: {
                    contractServiceId: cloudSvc.id,
                    percentage: getRandomItem([5, 8, 10, 15]),
                    effectiveFrom: new Date("2026-02-01"),
                    effectiveTo: new Date("2027-01-31"),
                  },
                });
              }
            }

            // Create appropriate OnboardingStep records
            const maxStep =
              onboardingProfile === "STEP_4_DONE"
                ? 4
                : onboardingProfile === "STEP_3_DONE"
                  ? 3
                  : 2;

            for (let step = 1; step <= 5; step++) {
              const isCompleted = step <= maxStep;
              await tx.onboardingStep.create({
                data: {
                  customer_id: customer.id,
                  contract_id: draftContract.id,
                  step,
                  status: "PENDING",
                  completed: isCompleted,
                  completedAt: isCompleted ? new Date() : null,
                },
              });
            }
            continue;
          }

          // COMPLETED Profile: Can have 1, 2, or 3 contracts with varied statuses
          const numContracts = custIdx % 10 === 0 ? 3 : custIdx % 3 === 0 ? 2 : 1;
          const contractsToCreate = [];

          // Primary active contract
          contractsToCreate.push({
            status: "ACTIVE" as const,
            scope: `24/7 Managed Cloud Infrastructure & Enterprise DevOps Support for ${companyName}`,
            start: new Date("2026-01-01"),
            end: new Date("2026-12-31"),
            completed: true,
          });

          if (numContracts >= 2) {
            // Second contract: either a prior EXPIRED contract or a DRAFT upcoming renewal
            if (custIdx % 2 === 0) {
              contractsToCreate.push({
                status: "EXPIRED" as const,
                scope: `Phase 1 Core Infrastructure Migration & Onboarding Agreement`,
                start: new Date("2025-01-01"),
                end: new Date("2025-12-31"),
                completed: true,
              });
            } else {
              contractsToCreate.push({
                status: "DRAFT" as const,
                scope: `Next Year Strategic AI & Machine Learning Pipeline Expansion`,
                start: new Date("2027-01-01"),
                end: new Date("2027-12-31"),
                completed: false,
              });
            }
          }

          if (numContracts >= 3) {
            // Third contract: TERMINATED historical contract
            contractsToCreate.push({
              status: "TERMINATED" as const,
              scope: `Legacy On-Premises Monitoring & Co-location Maintenance`,
              start: new Date("2024-06-01"),
              end: new Date("2024-11-30"),
              completed: true,
            });
          }

          for (let cIdx = 0; cIdx < contractsToCreate.length; cIdx++) {
            const spec = contractsToCreate[cIdx];
            const billingFreq = getRandomItem(["Monthly", "Quarterly", "Yearly"]);
            const billingTiming = getRandomItem(["In advance", "In arrears"]);

            const contract = await tx.contract.create({
              data: {
                customerId: customer.id,
                scopeDescription: spec.scope,
                startDate: spec.start,
                endDate: spec.end,
                status: spec.status,
                billingFrequency: billingFreq,
                billingTiming,
                onboardingCompletedAt: spec.completed ? new Date("2026-01-05") : null,
              },
            });

            summary.contracts.total++;
            if (spec.status === "ACTIVE") summary.contracts.active++;
            if (spec.status === "DRAFT") summary.contracts.draft++;
            if (spec.status === "EXPIRED") summary.contracts.expired++;
            if (spec.status === "TERMINATED") summary.contracts.terminated++;

            // Add services to contract
            const fixedServiceCount = getRandomInt(1, 3);
            const chosenOther = [...otherTypes].sort(() => 0.5 - Math.random()).slice(0, fixedServiceCount);

            // Base Managed services
            await tx.contractService.create({
              data: {
                contractId: contract.id,
                serviceTypeId: managedType.id,
                monthlyAmount: 2500,
                startDate: spec.start,
                endDate: spec.end,
              },
            });

            // Extra specialty services
            for (const extraType of chosenOther) {
              await tx.contractService.create({
                data: {
                  contractId: contract.id,
                  serviceTypeId: extraType.id,
                  monthlyAmount: Number(extraType.monthlyPrice) || 2000,
                  startDate: spec.start,
                  endDate: spec.end,
                },
              });
            }

            // Cloud Service & Discount
            if (awsAccount) {
              const awsSvc = await tx.contractService.create({
                data: {
                  contractId: contract.id,
                  serviceTypeId: awsType.id,
                  monthlyAmount: null,
                  startDate: spec.start,
                  endDate: spec.end,
                },
              });

              await tx.serviceDiscount.create({
                data: {
                  contractServiceId: awsSvc.id,
                  percentage: getRandomItem([5, 8, 10, 12, 15]),
                  effectiveFrom: spec.start,
                  effectiveTo: spec.end,
                },
              });
            }

            if (azureAccount) {
              const azureSvc = await tx.contractService.create({
                data: {
                  contractId: contract.id,
                  serviceTypeId: azureType.id,
                  monthlyAmount: null,
                  startDate: spec.start,
                  endDate: spec.end,
                },
              });

              await tx.serviceDiscount.create({
                data: {
                  contractServiceId: azureSvc.id,
                  percentage: getRandomItem([5, 7, 10, 15]),
                  effectiveFrom: spec.start,
                  effectiveTo: spec.end,
                },
              });
            }

            // Onboarding Steps for primary contract
            if (cIdx === 0) {
              for (let step = 1; step <= 5; step++) {
                await tx.onboardingStep.create({
                  data: {
                    customer_id: customer.id,
                    contract_id: contract.id,
                    step,
                    status: "COMPLETED",
                    completed: true,
                    completedAt: new Date("2026-01-05"),
                  },
                });
              }
            }

            // 5. Generate Bills & Invoices for ACTIVE and EXPIRED contracts
            if (spec.status === "ACTIVE" || spec.status === "EXPIRED") {
              const billMonths =
                spec.status === "ACTIVE"
                  ? [
                      { label: "2026-01", start: new Date("2026-01-01"), end: new Date("2026-01-31") },
                      { label: "2026-02", start: new Date("2026-02-01"), end: new Date("2026-02-28") },
                    ]
                  : [
                      { label: "2025-11", start: new Date("2025-11-01"), end: new Date("2025-11-30") },
                      { label: "2025-12", start: new Date("2025-12-01"), end: new Date("2025-12-31") },
                    ];

              for (let bIdx = 0; bIdx < billMonths.length; bIdx++) {
                const bm = billMonths[bIdx];
                const fixedAmount = 2500 + chosenOther.reduce((acc, curr) => acc + (Number(curr.monthlyPrice) || 2000), 0);
                const cloudRaw = awsAccount || azureAccount ? getRandomInt(8000, 30000) : 0;
                const cloudDiscountAmount = cloudRaw > 0 ? Math.round(cloudRaw * 0.1) : 0;
                const totalAmount = fixedAmount + (cloudRaw - cloudDiscountAmount);

                const bill = await tx.bill.create({
                  data: {
                    contractId: contract.id,
                    periodStart: bm.start,
                    periodEnd: bm.end,
                    billingMonth: bm.label,
                    currency: "AED",
                    fixedAmount,
                    cloudUsageAmount: cloudRaw,
                    cloudDiscountAmount,
                    totalAmount,
                  },
                });
                summary.bills.total++;

                // Line items
                await tx.billLineItem.create({
                  data: {
                    billId: bill.id,
                    description: `Fixed Services Core Package (${bm.label})`,
                    sourceType: "FIXED_SERVICE",
                    quantity: 1,
                    unitAmount: fixedAmount,
                    discountPercentage: 0,
                    finalAmount: fixedAmount,
                  },
                });

                if (cloudRaw > 0) {
                  await tx.billLineItem.create({
                    data: {
                      billId: bill.id,
                      description: `Enterprise Cloud Usage & Support (${bm.label})`,
                      sourceType: "CLOUD_USAGE",
                      quantity: 1,
                      unitAmount: cloudRaw,
                      discountPercentage: 10,
                      finalAmount: cloudRaw - cloudDiscountAmount,
                    },
                  });
                }

                // Invoice Status: PENDING, RAISED, or COMPLETED
                const invStatusChoice = (custIdx + bIdx) % 3;
                let invoiceStatusState: "PENDING" | "RAISED" | "COMPLETED";
                let invoiceNumber: string | null = null;
                let invoiceDate: Date | null = null;

                if (invStatusChoice === 0) {
                  invoiceStatusState = "COMPLETED";
                  invoiceNumber = `INV-2026-${invoiceSequence++}`;
                  invoiceDate = new Date("2026-02-10");
                  summary.bills.completed++;
                } else if (invStatusChoice === 1) {
                  invoiceStatusState = "RAISED";
                  invoiceNumber = `INV-2026-${invoiceSequence++}`;
                  invoiceDate = new Date("2026-02-25");
                  summary.bills.raised++;
                } else {
                  invoiceStatusState = "PENDING";
                  summary.bills.pending++;
                }

                await tx.invoiceStatus.create({
                  data: {
                    billId: bill.id,
                    status: invoiceStatusState,
                    invoiceNumber,
                    invoiceDate,
                    checkedAt: new Date(),
                  },
                });
              }
            }
          }
        }
      });

      const pct = Math.round((endIndex / totalCustomers) * 100);
      console.log(`[Batch ${batchIdx + 1}/${totalBatches}] Seeded ${endIndex}/${totalCustomers} customers (${pct}% completed)...`);
    }

    console.log(`\n======================================================`);
    console.log(`🎉 Seeding Successfully Completed!`);
    console.log(`======================================================`);
    console.log(`📊 Total Customers Created: ${summary.customers}`);
    console.log(`  ├─ Completed Onboarding (Step 5 Done): ${summary.onboarding.completed}`);
    console.log(`  ├─ Incomplete Step 4 Done (Pending Step 5): ${summary.onboarding.step4}`);
    console.log(`  ├─ Incomplete Step 3 Done (Pending Step 4): ${summary.onboarding.step3}`);
    console.log(`  ├─ Incomplete Step 2 Done (Pending Step 3): ${summary.onboarding.step2}`);
    console.log(`  └─ Incomplete Step 1 Done (Pending Step 2): ${summary.onboarding.step1}`);
    console.log(`📋 Total Contracts Created: ${summary.contracts.total}`);
    console.log(`  ├─ ACTIVE Contracts: ${summary.contracts.active}`);
    console.log(`  ├─ DRAFT Contracts: ${summary.contracts.draft}`);
    console.log(`  ├─ EXPIRED Contracts: ${summary.contracts.expired}`);
    console.log(`  └─ TERMINATED Contracts: ${summary.contracts.terminated}`);
    console.log(`🧾 Total Bills Created: ${summary.bills.total}`);
    console.log(`  ├─ COMPLETED Invoices (Paid): ${summary.bills.completed}`);
    console.log(`  ├─ RAISED Invoices (Issued): ${summary.bills.raised}`);
    console.log(`  └─ PENDING Invoices (Draft): ${summary.bills.pending}`);
    console.log(`☁️ Total Cloud Accounts Created: ${summary.cloudAccounts}`);
    console.log(`======================================================\n`);

    return summary;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  try {
    const countArg = process.argv[2];
    const parsed = countArg ? parseInt(countArg, 10) : 500;
    const total = isNaN(parsed) || parsed <= 0 ? 500 : parsed;
    await seedMockCustomers(total);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

// Execute when invoked directly
if (process.argv[1]?.endsWith("seedMockData.ts") || process.argv[1]?.endsWith("seedMockData.js")) {
  main();
}
