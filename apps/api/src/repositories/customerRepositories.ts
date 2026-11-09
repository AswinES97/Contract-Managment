import { Prisma, PrismaClient } from "../generated/prisma/client.js";
import {
  IContactRecord,
  IContactWrite,
  ICreateCustomerInput,
  ICustomerListFilter,
  CustomerMutationResult,
  ICustomerRecord,
  CustomerStatus,
  IUpdateCustomerInput,
} from "../interfaces/customer/commonInterface.js";
import { ICustomerRepository } from "../interfaces/customer/repositoryInterface.js";

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

export class CustomerRepositories implements ICustomerRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  private formatCustomer = (customer: {
    id: string;
    name: string;
    billingAddress: string | null;
    notes: string | null;
    status: CustomerStatus;
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
  }): ICustomerRecord => {
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
  };

  async findById(id: string): Promise<ICustomerRecord | null> {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: customerInclude,
    });

    if (!customer) return null;
    return this.formatCustomer(customer);
  }

  async getAll(filter?: ICustomerListFilter): Promise<ICustomerRecord[]> {
    const customers = await this.prisma.customer.findMany({
      where: {
        ...(filter?.status ? { status: filter.status } : {}),
        ...(filter?.name
          ? { name: { contains: filter.name, mode: "insensitive" } }
          : {}),
      },
      include: customerInclude,
      orderBy: { createdAt: "desc" },
    });

    return customers.map((c) => this.formatCustomer(c));
  }

  async create(input: ICreateCustomerInput): Promise<ICustomerRecord> {
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

    const customer = await this.prisma.customer.create({
      data: {
        name: input.name,
        billingAddress: input.billingAddress || null,
        notes: input.notes || null,
        status: input.status || "ACTIVE",
        contacts:
          contactsData.length > 0 ? { create: contactsData } : undefined,
      },
      include: customerInclude,
    });

    return this.formatCustomer(customer);
  }

  async update(
    id: string,
    input: IUpdateCustomerInput,
  ): Promise<ICustomerRecord | null> {
    const existing = await this.prisma.customer.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) return null;

    return this.prisma.$transaction(async (tx) => {
      if (input.contacts !== undefined) {
        await tx.contact.deleteMany({ where: { customerId: id } });
        let hasPrimary = false;
        const contactsToCreate = input.contacts.map((c) => {
          const isPrimary = !hasPrimary && Boolean(c.isPrimary);
          if (isPrimary) hasPrimary = true;
          return {
            customerId: id,
            name: c.name,
            role: c.role || "",
            email: c.email || null,
            phone: c.phone || null,
            isPrimary,
          };
        });
        if (contactsToCreate.length > 0 && !hasPrimary) {
          contactsToCreate[0].isPrimary = true;
        }
        if (contactsToCreate.length > 0) {
          await tx.contact.createMany({ data: contactsToCreate });
        }
      }

      const updated = await tx.customer.update({
        where: { id },
        data: {
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.billingAddress !== undefined
            ? { billingAddress: input.billingAddress }
            : {}),
          ...(input.notes !== undefined ? { notes: input.notes } : {}),
          ...(input.status !== undefined ? { status: input.status } : {}),
        },
        include: customerInclude,
      });

      return this.formatCustomer(updated);
    });
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

      const contact = await tx.contact.create({
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
        contact: {
          id: contact.id,
          customerId: contact.customerId,
          name: contact.name,
          role: contact.role || "",
          email: contact.email,
          phone: contact.phone,
          isPrimary: contact.isPrimary,
        },
      };
    });
  }

  private async lockCustomer(
    tx: Prisma.TransactionClient,
    customerId: string,
  ): Promise<boolean> {
    const rows = await tx.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM "customers" WHERE id = CAST(${customerId} AS uuid) FOR UPDATE
    `;
    return rows.length > 0;
  }
}
