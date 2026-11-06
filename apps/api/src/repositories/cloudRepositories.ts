import { PrismaClient } from "@prisma/client/extension";
import { ICloudRepository } from "../interfaces/cloud/repositoriesInterface.js";
import {
  IBaseCloudAccountBody,
  ICloudAccountResponse,
} from "../interfaces/cloud/commonInterface.js";

export class CloudRepositories implements ICloudRepository {
  private prisma: PrismaClient;
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  createCloudDetails = async (
    body: IBaseCloudAccountBody,
  ): Promise<ICloudAccountResponse> => {
    const cloudAccount = await this.prisma.cloudAccount.create({
      data: {
        customer: {
          connect: {
            id: body.customerId,
          },
        },
        provider: body.provider,
        externalAccountId: body.externalAccountId,
        isActive: body.isActive ?? true,

        // awsCredentialsSecretArn:
        //   body.provider === "AWS"
        //     ? body.awsCredentialsSecretArn
        //     : null,

        // awsSecretsRegion:
        //   body.provider === "AWS"
        //     ? body.awsSecretsRegion
        //     : null,
      },

      select: {
        id: true,
        customerId: true,
        provider: true,
        externalAccountId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return cloudAccount as ICloudAccountResponse;
  };
}
