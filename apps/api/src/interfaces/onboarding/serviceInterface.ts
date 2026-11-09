import {
  IOnboardingStepRecord,
  ISaveOnboardingStepInput,
  ICompleteOnboardingInput,
  IOnboardingResult,
} from "./commonInterface.js";

export interface IOnboardingService {
  getSteps(customerId: string, contractId?: string | null): Promise<IOnboardingStepRecord[]>;
  saveStep(input: ISaveOnboardingStepInput): Promise<IOnboardingStepRecord>;
  completeOnboarding(input: ICompleteOnboardingInput): Promise<IOnboardingResult>;
}
