import { PrismaClient } from "@prisma/client/extension";
import { ICustomerRepository } from "../interfaces/customer/repositoryInterface.js";

export class CustomerRepositories implements ICustomerRepository {
  private prisma: PrismaClient;
  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }
}
