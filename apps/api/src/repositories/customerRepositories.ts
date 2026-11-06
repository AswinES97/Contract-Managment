import { Prisma, PrismaClient } from "../generated/prisma/client.js";
import {
  IContactRecord,
  // IContactUpdate,
  IContactWrite,
  ICreateCustomerInput,
  ICustomerListFilter,
  CustomerMutationResult,
  ICustomerRecord,
  CustomerStatus,
  IUpdateCustomerInput,
  StoredCustomer,
  IOnboardingSteps,
} from "../interfaces/customer/commonInterface.js";
import { ICustomerRepository } from "../interfaces/customer/repositoryInterface.js";

// function toCustomer(customer: StoredCustomer): ICustomerRecord {
//   return {
//     id: customer.id,
//     name: customer.name,
//     billingAddress: customer.billingAddress,
//     notes: customer.notes,
//     status: customer.status,
//     createdAt: customer.createdAt.toISOString(),
//     updatedAt: customer.updatedAt.toISOString(),
//   };
// }

export class CustomerRepositories implements ICustomerRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findById(id: string): Promise<ICustomerRecord | null> {
    const customer: unknown = this.prisma.customer.findUnique({
      where: {
        id,
      },
      include: {
        contacts: {
          orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
          omit: { customerId: true },
        },

        cloudAccounts: {
          select: {
            id: true,
            // customerId: true,
            provider: true,
            externalAccountId: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },

        onboardingSteps: {
          orderBy: {
            step: "asc",
          },
        },
      },
    });

    return customer as ICustomerRecord;
  }

  async create(input: ICreateCustomerInput): Promise<ICustomerRecord> {
    const customer: unknown = await this.prisma.customer.create({
      data: {
        name: input.name,
        billingAddress: input.billingAddress,
        notes: input.notes,
        status: input.status,
      },
      select: {
        id: true,
        name: true,
        billingAddress: true,
        notes: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return customer as ICustomerRecord;
  }

  async addContact(input: IContactWrite): Promise<CustomerMutationResult> {
    return this.prisma.$transaction(async (tx) => {
      if (!(await this.lockCustomer(tx, input.customerId))) {
        return { status: "customer_not_found" };
      }

      const primaryCount = await tx.contact.count({
        where: { customerId: input.customerId, isPrimary: true },
      });
      const isPrimary = primaryCount === 0 ? true : input.isPrimary;

      if (isPrimary) {
        await tx.contact.updateMany({
          where: { customerId: input.customerId, isPrimary: true },
          data: { isPrimary: false },
        });
      }

      const contact: unknown = await tx.contact.create({
        data: {
          customerId: input.customerId,
          name: input.name,
          role: input.role,
          email: input.email,
          phone: input.phone,
          isPrimary,
        },
        select: {
          id: true,
          customerId: true,
          name: true,
          role: true,
          email: true,
          phone: true,
          isPrimary: true,
        },
      });

      return {
        status: "ok",
        contact: contact as IContactRecord,
      };
    });
  }

  // async list(filter: CustomerListFilter): Promise<CustomerRecord[]> {
  //   const customers = await this.prisma.customer.findMany({
  //     where: {
  //       ...(filter.status ? { status: filter.status } : {}),
  //       ...(filter.name
  //         ? { name: { contains: filter.name, mode: "insensitive" } }
  //         : {}),
  //     },
  //     include: customerInclude,
  //     orderBy: { name: "asc" },
  //   });

  //   return customers.map(toCustomer);
  // }

  // async update(
  //   id: string,
  //   input: UpdateCustomerInput,
  // ): Promise<CustomerRecord | null> {
  //   const existing = await this.prisma.customer.findUnique({
  //     where: { id },
  //     select: { id: true },
  //   });
  //   if (!existing) return null;

  //   const customer = await this.prisma.customer.update({
  //     where: { id },
  //     data: {
  //       ...(input.name !== undefined ? { name: input.name } : {}),
  //       ...(input.billingAddress !== undefined
  //         ? { billingAddress: input.billingAddress }
  //         : {}),
  //       ...(input.notes !== undefined ? { notes: input.notes } : {}),
  //       ...(input.status !== undefined ? { status: input.status } : {}),
  //     },
  //     include: customerInclude,
  //   });

  //   return toCustomer(customer);
  // }

  // async updateContact(
  //   customerId: string,
  //   contactId: string,
  //   input: ContactUpdate,
  // ): Promise<CustomerMutationResult> {
  //   return this.prisma.$transaction(async (tx) => {
  //     if (!(await this.lockCustomer(tx, customerId))) {
  //       return { status: "customer_not_found" };
  //     }

  //     const contact = await tx.contact.findFirst({
  //       where: { id: contactId, customerId },
  //       select: { id: true, isPrimary: true },
  //     });
  //     if (!contact) return { status: "contact_not_found" };

  //     if (input.isPrimary === false && contact.isPrimary) {
  //       const otherPrimary = await tx.contact.count({
  //         where: { customerId, isPrimary: true, id: { not: contactId } },
  //       });
  //       if (otherPrimary === 0) return { status: "primary_required" };
  //     }

  //     if (input.isPrimary === true) {
  //       await tx.contact.updateMany({
  //         where: { customerId, isPrimary: true, id: { not: contactId } },
  //         data: { isPrimary: false },
  //       });
  //     }

  //     await tx.contact.update({
  //       where: { id: contactId },
  //       data: {
  //         ...(input.name !== undefined ? { name: input.name } : {}),
  //         ...(input.role !== undefined ? { role: input.role } : {}),
  //         ...(input.email !== undefined ? { email: input.email } : {}),
  //         ...(input.phone !== undefined ? { phone: input.phone } : {}),
  //         ...(input.isPrimary !== undefined
  //           ? { isPrimary: input.isPrimary }
  //           : {}),
  //       },
  //     });

  //     return {
  //       status: "ok",
  //       customer: await this.readCustomer(tx, customerId),
  //     };
  //   });
  // }

  // async removeContact(
  //   customerId: string,
  //   contactId: string,
  // ): Promise<CustomerMutationResult> {
  //   return this.prisma.$transaction(async (tx) => {
  //     if (!(await this.lockCustomer(tx, customerId))) {
  //       return { status: "customer_not_found" };
  //     }

  //     const contact = await tx.contact.findFirst({
  //       where: { id: contactId, customerId },
  //       select: { id: true, isPrimary: true },
  //     });
  //     if (!contact) return { status: "contact_not_found" };

  //     const contactCount = await tx.contact.count({ where: { customerId } });
  //     if (contactCount <= 1) return { status: "last_contact" };
  //     if (contact.isPrimary) return { status: "primary_required" };

  //     await tx.contact.delete({ where: { id: contactId } });

  //     return {
  //       status: "ok",
  //       customer: await this.readCustomer(tx, customerId),
  //     };
  //   });
  // }

  // Serializes contact writes for one customer so two requests cannot both
  // leave a customer with two primary contacts, or with none.

  private async lockCustomer(
    tx: Prisma.TransactionClient,
    customerId: string,
  ): Promise<boolean> {
    const rows = await tx.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM "customers" WHERE id = CAST(${customerId} AS uuid) FOR UPDATE
    `;
    return rows.length > 0;
  }

  // private async readCustomer(
  //   tx: Prisma.TransactionClient,
  //   customerId: string,
  // ): Promise<CustomerRecord> {
  //   const customer = await tx.customer.findUniqueOrThrow({
  //     where: { id: customerId },
  //     include: customerInclude,
  //   });
  //   return toCustomer(customer);
  // }
}
