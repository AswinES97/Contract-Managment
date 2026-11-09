import { NextFunction, Request, Response } from "express";
import StatusCode from "../constants/statusCodes.js";
import { IOnboardingService } from "../interfaces/onboarding/serviceInterface.js";
import {
  ICompleteOnboardingInput,
  ISaveOnboardingStepInput,
} from "../interfaces/onboarding/commonInterface.js";

export class OnboardingController {
  private onboardingService: IOnboardingService;

  constructor(onboardingService: IOnboardingService) {
    this.onboardingService = onboardingService;
  }

  complete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.onboardingService.completeOnboarding(
        req.body as ICompleteOnboardingInput,
      );
      return res.status(StatusCode.CREATED).json({
        message: "Customer onboarding completed successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getSteps = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = String(req.params.customerId);
      const contractId = req.query.contractId
        ? String(req.query.contractId)
        : null;
      const steps = await this.onboardingService.getSteps(customerId, contractId);
      return res.status(StatusCode.OK).json({
        message: "Onboarding steps retrieved successfully",
        data: steps,
      });
    } catch (error) {
      next(error);
    }
  };

  saveStep = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = req.params.customerId || req.body.customerId;
      const stepInput: ISaveOnboardingStepInput = {
        ...req.body,
        customerId: String(customerId),
        contractId: req.body.contractId ?? null,
      };
      const step = await this.onboardingService.saveStep(stepInput);
      return res.status(StatusCode.OK).json({
        message: "Onboarding step saved successfully",
        data: step,
      });
    } catch (error) {
      next(error);
    }
  };
}
