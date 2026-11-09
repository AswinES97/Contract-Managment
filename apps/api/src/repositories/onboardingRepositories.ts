import { PrismaClient } from "../generated/prisma/client.js";
import {
  IOnboardingStepRecord,
  ISaveOnboardingStepInput,
  ICompleteOnboardingInput,
  IOnboardingResult,
} from "../interfaces/onboarding/commonInterface.js";
import { IOnboardingRepository } from "../interfaces/onboarding/repositoryInterface.js";
import { ICustomerRecord } from "../interfaces/customer/commonInterface.js";
import CustomError from "../utils/customError.js";
import StatusCode from "../constants/statusCodes.js";

const customerInclude = {
  contacts: {
    orderBy: [{ isPrimary: "desc" as const }, { createdAt: "asc" as const }],
  },
  cloudAccounts: {
    select: {
      id: true,
      provider: true,
      externalAccountId: true,
    },
    orderBy: {
      createdAt: "desc" as const,
    },
  },
};

const isUuid = (val?: string | null): boolean =>
  typeof val === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    val,
  );

export class OnboardingRepositories implements IOnboardingRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  private formatCustomer(customer: {
    id: string;
    name: string;
    billingAddress: string | null;
    notes: string | null;
    status: "ACTIVE" | "INACTIVE";
    createdAt: Date | string;
    updatedAt: Date | string;
    contacts?: Array<{
      id: string;
      customerId?: string;
      name: string;
      role?: string | null;
      email?: string | null;
      phone?: string | null;
      isPrimary?: boolean;
    }>;
    cloudAccounts?: Array<{
      id: string;
      provider: string;
      externalAccountId: string;
    }>;
  }): ICustomerRecord {
    return {
      id: customer.id,
      name: customer.name,
      billingAddress: customer.billingAddress,
      notes: customer.notes,
      status: customer.status,
      createdAt:
        customer.createdAt instanceof Date
          ? customer.createdAt.toISOString()
          : String(customer.createdAt),
      updatedAt:
        customer.updatedAt instanceof Date
          ? customer.updatedAt.toISOString()
          : String(customer.updatedAt),
      contacts: (customer.contacts || []).map((ct) => ({
        id: ct.id,
        customerId: ct.customerId || customer.id,
        name: ct.name,
        role: ct.role || "",
        email: ct.email ?? null,
        phone: ct.phone ?? null,
        isPrimary: Boolean(ct.isPrimary),
      })),
      cloudAccounts: (customer.cloudAccounts || []).map((ca) => ({
        id: ca.id,
        provider: ca.provider,
        externalAccountId: ca.externalAccountId,
      })),
    };
  }

  private formatStep(step: {
    id: string;
    customer_id: string;
    contract_id: string | null;
    step: number;
    status: "PENDING" | "COMPLETED";
    completed: boolean;
    completedAt: Date | null;
  }): IOnboardingStepRecord {
    return {
      id: step.id,
      customerId: step.customer_id,
      contractId: step.contract_id,
      step: step.step,
      status: step.status,
      completed: step.completed,
      completedAt: step.completedAt ? step.completedAt.toISOString() : null,
    };
  }

  async getStepsByCustomerId(
    customerId: string,
    contractId?: string | null,
  ): Promise<IOnboardingStepRecord[]> {
    const steps = await this.prisma.onboardingStep.findMany({
      where: {
        customer_id: customerId,
        status: "PENDING",
        ...(contractId ? { contract_id: contractId } : {}),
      },
      orderBy: { step: "asc" },
    });

    return steps.map((s) => this.formatStep(s));
  }

  async upsertStep(
    input: ISaveOnboardingStepInput,
  ): Promise<IOnboardingStepRecord> {
    const isCompleted = input.completed ?? true;
    let contractId = input.contractId ?? null;

    // If a contractId is provided, ensure a DRAFT Contract record exists in `contracts`
    // so the foreign key constraint on onboarding_steps.contract_id is satisfied.
    if (contractId && isUuid(contractId)) {
      const contractStartDate =
        input.step === 2 && input.contract?.startDate
          ? new Date(input.contract.startDate)
          : undefined;
      const contractEndDate =
        input.step === 2 && input.contract?.endDate
          ? new Date(input.contract.endDate)
          : undefined;

      await this.prisma.contract.upsert({
        where: { id: contractId },
        create: {
          id: contractId,
          customerId: input.customerId,
          status: "DRAFT",
          ...(input.step === 2 && input.contract
            ? {
                scopeDescription: input.contract.scopeDescription,
                startDate: contractStartDate,
                endDate: contractEndDate,
                billingFrequency: input.contract.billingFrequency,
                billingTiming: input.contract.billingTiming,
              }
            : {}),
        },
        update: {
          ...(input.step === 2 && input.contract
            ? {
                scopeDescription: input.contract.scopeDescription,
                startDate: contractStartDate,
                endDate: contractEndDate,
                billingFrequency: input.contract.billingFrequency,
                billingTiming: input.contract.billingTiming,
              }
            : {}),
        },
      });
    }

    // Because contract_id is nullable, Prisma's compound unique key type only
    // accepts string (not null). We use findFirst + create/update instead.
    const existing = await this.prisma.onboardingStep.findFirst({
      where: {
        customer_id: input.customerId,
        contract_id: contractId,
        step: input.step,
      },
    });

    let step;
    if (existing) {
      step = await this.prisma.onboardingStep.update({
        where: { id: existing.id },
        data: {
          completed: isCompleted,
          status: "PENDING",
          completedAt: isCompleted ? new Date() : null,
        },
      });
    } else {
      step = await this.prisma.onboardingStep.create({
        data: {
          customer_id: input.customerId,
          contract_id: contractId,
          step: input.step,
          status: "PENDING",
          completed: isCompleted,
          completedAt: isCompleted ? new Date() : null,
        },
      });
    }

    // If Step 2 contract terms are provided, persist them in customer's record
    if (input.step === 2 && input.contract) {
      const contractNote = `[Contract Terms] Scope: ${input.contract.scopeDescription} | Period: ${input.contract.startDate} to ${input.contract.endDate} | ${input.contract.billingFrequency} (${input.contract.billingTiming})`;
      const existingCustomer = await this.prisma.customer.findUnique({
        where: { id: input.customerId },
        select: { notes: true },
      });
      if (existingCustomer) {
        let notes = existingCustomer.notes || "";
        if (notes.includes("[Contract Terms]")) {
          notes = notes
            .replace(/\[Contract Terms\].*?($|\n)/, contractNote + "\n")
            .trim();
        } else {
          notes = notes ? `${notes}\n${contractNote}` : contractNote;
        }
        await this.prisma.customer.update({
          where: { id: input.customerId },
          data: { notes },
        });
      }
    }

    const formatted = this.formatStep(step);
    if (input.contract) {
      formatted.contract = input.contract;
    }
    return formatted;
  }

  async completeOnboarding(
    input: ICompleteOnboardingInput,
  ): Promise<IOnboardingResult> {
    return this.prisma.$transaction(async (tx) => {
      let customerId = input.customerId?.trim();

      // 1. Resolve or Create Customer
      if (customerId) {
        const existing = await tx.customer.findUnique({
          where: { id: customerId },
          include: customerInclude,
        });
        if (!existing) {
          throw new CustomError("Customer not found", StatusCode.NOT_FOUND);
        }

        // Activate customer if not already active
        await tx.customer.update({
          where: { id: customerId },
          data: { status: "ACTIVE" },
        });
      } else {
        if (!input.customerName?.trim()) {
          throw new CustomError(
            "Customer name is required for new customer",
            StatusCode.BAD_REQUEST,
          );
        }

        let hasPrimary = false;
        const contactsData = (input.contacts || []).map((c) => {
          const isPrimary = !hasPrimary && Boolean(c.isPrimary);
          if (isPrimary) hasPrimary = true;
          return {
            name: c.name,
            role: c.role || "",
            email: c.email || null,
            phone: c.phone || null,
            isPrimary,
          };
        });
        if (contactsData.length > 0 && !hasPrimary) {
          contactsData[0].isPrimary = true;
        }

        const newCustomer = await tx.customer.create({
          data: {
            name: input.customerName.trim(),
            billingAddress: input.billingAddress || null,
            notes: input.notes || null,
            status: "ACTIVE",
            contacts:
              contactsData.length > 0 ? { create: contactsData } : undefined,
          },
          include: customerInclude,
        });
        customerId = newCustomer.id;
      }

      // 2. Cloud Account Linkage (if provided)
      let cloudAccountRecord: {
        id: string;
        provider: string;
        externalAccountId: string;
      } | null = null;

      if (input.cloud && input.cloud.externalAccountId?.trim()) {
        const provider = input.cloud.provider;
        const externalAccountId = input.cloud.externalAccountId.trim();
        const hasAwsCredentials =
          provider === "AWS" && Boolean(input.cloud.accessKeyId?.trim());

        const existingCloud = await tx.cloudAccount.findUnique({
          where: {
            provider_externalAccountId: {
              provider,
              externalAccountId,
            },
          },
        });

        if (existingCloud) {
          const updatedCloud = await tx.cloudAccount.update({
            where: { id: existingCloud.id },
            data: {
              customerId,
              isActive: true,
              ...(hasAwsCredentials
                ? {
                    awsCredentialsSecretArn: `arn:aws:secretsmanager:me-central-1:credentials:${input.cloud.accessKeyId!.trim().slice(0, 8)}`,
                    awsSecretsRegion: "me-central-1",
                  }
                : {}),
            },
          });
          cloudAccountRecord = {
            id: updatedCloud.id,
            provider: updatedCloud.provider,
            externalAccountId: updatedCloud.externalAccountId,
          };
        } else {
          const createdCloud = await tx.cloudAccount.create({
            data: {
              customerId,
              provider,
              externalAccountId,
              isActive: true,
              ...(hasAwsCredentials
                ? {
                    awsCredentialsSecretArn: `arn:aws:secretsmanager:me-central-1:credentials:${input.cloud.accessKeyId!.trim().slice(0, 8)}`,
                    awsSecretsRegion: "me-central-1",
                  }
                : {}),
            },
          });
          cloudAccountRecord = {
            id: createdCloud.id,
            provider: createdCloud.provider,
            externalAccountId: createdCloud.externalAccountId,
          };
        }
      }

      // 3. Create or Activate Contract in contracts table
      const now = new Date();
      const contractId =
        input.contractId && isUuid(input.contractId)
          ? input.contractId
          : crypto.randomUUID();

      const contractStartDate = input.contract.startDate
        ? new Date(input.contract.startDate)
        : null;
      const contractEndDate = input.contract.endDate
        ? new Date(input.contract.endDate)
        : null;

      await tx.contract.upsert({
        where: { id: contractId },
        create: {
          id: contractId,
          customerId,
          scopeDescription: input.contract.scopeDescription,
          startDate: contractStartDate,
          endDate: contractEndDate,
          billingFrequency: input.contract.billingFrequency,
          billingTiming: input.contract.billingTiming,
          status: "ACTIVE",
          onboardingCompletedAt: now,
        },
        update: {
          customerId,
          scopeDescription: input.contract.scopeDescription,
          startDate: contractStartDate,
          endDate: contractEndDate,
          billingFrequency: input.contract.billingFrequency,
          billingTiming: input.contract.billingTiming,
          status: "ACTIVE",
          onboardingCompletedAt: now,
        },
      });

      // 4. Save Contract Services and Discounts
      await tx.contractService.deleteMany({
        where: { contractId },
      });

      if (Array.isArray(input.services)) {
        for (const s of input.services) {
          let serviceType = null;
          if (s.serviceTypeId && isUuid(s.serviceTypeId)) {
            serviceType = await tx.serviceType.findUnique({
              where: { id: s.serviceTypeId },
            });
          }
          if (!serviceType && s.serviceTypeName?.trim()) {
            serviceType = await tx.serviceType.findUnique({
              where: { name: s.serviceTypeName.trim() },
            });
          }
          if (!serviceType && s.serviceTypeName?.trim()) {
            serviceType = await tx.serviceType.create({
              data: {
                name: s.serviceTypeName.trim(),
                monthlyPrice: Math.round(Number(s.monthlyAmount) || 0),
                isActive: true,
              },
            });
          }

          if (serviceType) {
            const isCloud = serviceType.name.toLowerCase().includes("cloud bill");
            const svcStartDate = s.startDate
              ? new Date(s.startDate)
              : contractStartDate || now;
            const svcEndDate = s.endDate
              ? new Date(s.endDate)
              : contractEndDate;

            const createdService = await tx.contractService.create({
              data: {
                contractId,
                serviceTypeId: serviceType.id,
                monthlyAmount: isCloud ? null : Number(s.monthlyAmount) || 0,
                startDate: svcStartDate,
                endDate: svcEndDate,
              },
            });

            if (
              isCloud &&
              input.cloud?.discountPercentage &&
              input.cloud.discountPercentage > 0
            ) {
              await tx.serviceDiscount.create({
                data: {
                  contractServiceId: createdService.id,
                  percentage: Number(input.cloud.discountPercentage),
                  effectiveFrom: svcStartDate,
                  effectiveTo: svcEndDate,
                },
              });
            }
          }
        }
      }

      // 5. Mark Steps 1 to 5 as Completed in OnboardingStep
      for (let s = 1; s <= 5; s++) {
        const existing = await tx.onboardingStep.findFirst({
          where: { customer_id: customerId, contract_id: contractId, step: s },
        });
        if (existing) {
          await tx.onboardingStep.update({
            where: { id: existing.id },
            data: { status: "COMPLETED", completed: true, completedAt: now },
          });
        } else {
          await tx.onboardingStep.create({
            data: {
              customer_id: customerId,
              contract_id: contractId,
              step: s,
              status: "COMPLETED",
              completed: true,
              completedAt: now,
            },
          });
        }
      }

      // Also ensure any leftover pending steps for this contract are COMPLETED
      await tx.onboardingStep.updateMany({
        where: {
          customer_id: customerId,
          contract_id: contractId,
          status: "PENDING",
        },
        data: {
          status: "COMPLETED",
          completed: true,
          completedAt: now,
        },
      });

      const allSteps = await tx.onboardingStep.findMany({
        where: {
          customer_id: customerId,
          ...(contractId ? { contract_id: contractId } : {}),
        },
        orderBy: { step: "asc" },
      });

      // 4. Retrieve complete customer details
      const fullCustomer = await tx.customer.findUniqueOrThrow({
        where: { id: customerId },
        include: customerInclude,
      });

      return {
        customer: this.formatCustomer(fullCustomer),
        contractId: contractId,
        steps: allSteps.map((s) => this.formatStep(s)),
        cloudAccount: cloudAccountRecord,
        contractSummary: {
          scopeDescription: input.contract.scopeDescription,
          startDate: input.contract.startDate,
          endDate: input.contract.endDate,
          billingFrequency: input.contract.billingFrequency,
          billingTiming: input.contract.billingTiming,
          services: input.services,
          cloudDiscountPercentage: input.cloud?.discountPercentage,
        },
      };
    });
  }
}
