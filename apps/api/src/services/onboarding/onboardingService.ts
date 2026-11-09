import StatusCode from "../../constants/statusCodes.js";
import {
  ICompleteOnboardingInput,
  IOnboardingResult,
  IOnboardingStepRecord,
  ISaveOnboardingStepInput,
} from "../../interfaces/onboarding/commonInterface.js";
import { IOnboardingRepository } from "../../interfaces/onboarding/repositoryInterface.js";
import { IOnboardingService } from "../../interfaces/onboarding/serviceInterface.js";
import CustomError from "../../utils/customError.js";

export class OnboardingService implements IOnboardingService {
  private onboardingRepository: IOnboardingRepository;

  constructor(onboardingRepository: IOnboardingRepository) {
    this.onboardingRepository = onboardingRepository;
  }

  async getSteps(customerId: string, contractId?: string | null): Promise<IOnboardingStepRecord[]> {
    if (!customerId?.trim()) {
      throw new CustomError("Customer ID is required", StatusCode.BAD_REQUEST);
    }
    return this.onboardingRepository.getStepsByCustomerId(customerId.trim(), contractId ?? null);
  }

  async saveStep(
    input: ISaveOnboardingStepInput,
  ): Promise<IOnboardingStepRecord> {
    if (!input.customerId?.trim()) {
      throw new CustomError("Customer ID is required", StatusCode.BAD_REQUEST);
    }
    if (
      typeof input.step !== "number" ||
      input.step < 1 ||
      input.step > 5 ||
      !Number.isInteger(input.step)
    ) {
      throw new CustomError(
        "Step must be an integer between 1 and 5",
        StatusCode.BAD_REQUEST,
      );
    }

    if (input.step === 2 && input.contract) {
      if (!input.contract.scopeDescription?.trim()) {
        throw new CustomError(
          "Contract scope description is required for Step 2",
          StatusCode.BAD_REQUEST,
        );
      }
      if (!input.contract.startDate || !input.contract.endDate) {
        throw new CustomError(
          "Contract start and end dates are required for Step 2",
          StatusCode.BAD_REQUEST,
        );
      }
      if (input.contract.startDate > input.contract.endDate) {
        throw new CustomError(
          "Contract start date cannot be after end date",
          StatusCode.BAD_REQUEST,
        );
      }
    }

    return this.onboardingRepository.upsertStep({
      customerId: input.customerId.trim(),
      contractId: input.contractId ?? null,
      step: input.step,
      completed: input.completed ?? true,
      contract: input.contract,
      services: input.services,
      cloud: input.cloud,
    });
  }

  async completeOnboarding(
    input: ICompleteOnboardingInput,
  ): Promise<IOnboardingResult> {
    // 1. Customer validation
    const hasCustomerId = Boolean(input.customerId?.trim());
    const hasCustomerName = Boolean(input.customerName?.trim());

    if (!hasCustomerId && !hasCustomerName) {
      throw new CustomError(
        "Either customerId or customerName is required",
        StatusCode.BAD_REQUEST,
      );
    }

    if (!hasCustomerId && input.contacts && input.contacts.length > 0) {
      const primaryContact =
        input.contacts.find((c) => c.isPrimary) ?? input.contacts[0];
      if (!primaryContact.name?.trim()) {
        throw new CustomError(
          "Primary contact must have a name",
          StatusCode.BAD_REQUEST,
        );
      }
    }

    // 2. Contract terms validation
    if (!input.contract) {
      throw new CustomError(
        "Contract terms are required",
        StatusCode.BAD_REQUEST,
      );
    }
    if (!input.contract.scopeDescription?.trim()) {
      throw new CustomError(
        "Contract scope description is required",
        StatusCode.BAD_REQUEST,
      );
    }
    if (!input.contract.startDate || !input.contract.endDate) {
      throw new CustomError(
        "Contract start and end dates are required",
        StatusCode.BAD_REQUEST,
      );
    }
    if (input.contract.startDate > input.contract.endDate) {
      throw new CustomError(
        "Contract start date cannot be after end date",
        StatusCode.BAD_REQUEST,
      );
    }

    // 3. Services validation
    if (!Array.isArray(input.services) || input.services.length === 0) {
      throw new CustomError(
        "Contract must include at least one service component",
        StatusCode.BAD_REQUEST,
      );
    }

    for (let i = 0; i < input.services.length; i++) {
      const s = input.services[i];
      if (!s.serviceTypeName?.trim()) {
        throw new CustomError(
          `Service name is missing on item ${i + 1}`,
          StatusCode.BAD_REQUEST,
        );
      }
      if (!s.startDate || !s.endDate) {
        throw new CustomError(
          `Start and end dates are required for service "${s.serviceTypeName}"`,
          StatusCode.BAD_REQUEST,
        );
      }
      if (s.startDate > s.endDate) {
        throw new CustomError(
          `Start date cannot be after end date for service "${s.serviceTypeName}"`,
          StatusCode.BAD_REQUEST,
        );
      }
    }

    // 4. Cloud details validation
    if (input.cloud) {
      if (!["AWS", "AZURE"].includes(input.cloud.provider)) {
        throw new CustomError(
          "Cloud provider must be AWS or AZURE",
          StatusCode.BAD_REQUEST,
        );
      }
      if (!input.cloud.externalAccountId?.trim()) {
        throw new CustomError(
          "Cloud account / subscription ID is required",
          StatusCode.BAD_REQUEST,
        );
      }
      if (
        input.cloud.discountPercentage !== undefined &&
        (isNaN(input.cloud.discountPercentage) ||
          input.cloud.discountPercentage < 0 ||
          input.cloud.discountPercentage > 100)
      ) {
        throw new CustomError(
          "Discount percentage must be between 0 and 100",
          StatusCode.BAD_REQUEST,
        );
      }
    }

    return this.onboardingRepository.completeOnboarding(input);
  }
}
