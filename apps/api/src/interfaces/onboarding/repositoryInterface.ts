import {
  IOnboardingStepRecord,
  ISaveOnboardingStepInput,
  ICompleteOnboardingInput,
  IOnboardingResult,
} from "./commonInterface.js";

export interface IOnboardingRepository {
  getStepsByCustomerId(customerId: string, contractId?: string | null): Promise<IOnboardingStepRecord[]>;
  upsertStep(input: ISaveOnboardingStepInput): Promise<IOnboardingStepRecord>;
  completeOnboarding(input: ICompleteOnboardingInput): Promise<IOnboardingResult>;
}
