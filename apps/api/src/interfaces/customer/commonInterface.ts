export const CUSTOMER_STATUSES = ["ACTIVE", "INACTIVE"] as const;

export type CustomerStatus = (typeof CUSTOMER_STATUSES)[number];

export interface ICreateContactInput {
  id?: string;
  name: string;
  role?: string;
  email?: string | null;
  phone?: string | null;
  isPrimary?: boolean;
}

export interface ICreateCustomerInput {
  name: string;
  billingAddress?: string | null;
  notes?: string | null;
  status?: CustomerStatus;
  contacts?: ICreateContactInput[];
}

export interface IContactWrite {
  customerId: string;
  name: string;
  role: string;
  email: string | null;
  phone: string | null;
  isPrimary: boolean;
}

export interface IIContactUpdate {
  name?: string;
  role?: string;
  email?: string | null;
  phone?: string | null;
  isPrimary?: boolean;
}

export interface IUpdateCustomerInput {
  name?: string;
  billingAddress?: string | null;
  notes?: string | null;
  status?: CustomerStatus;
  contacts?: ICreateContactInput[];
}

export interface ICustomerListFilter {
  status?: CustomerStatus;
  name?: string;
}

export interface IContactRecord {
  id: string;
  customerId: string;
  name: string;
  role: string;
  email: string | null;
  phone: string | null;
  isPrimary: boolean;
}

export interface ICloudAccountRecord {
  id: string;
  provider: string;
  externalAccountId: string;
}

export interface ICustomerRecord {
  id: string;
  name: string;
  billingAddress: string | null;
  notes: string | null;
  status: CustomerStatus;
  onboardingSteps?: IOnboardingSteps;
  createdAt: string;
  updatedAt: string;
  contacts?: IContactRecord[];
  cloudAccounts?: ICloudAccountRecord[];
}

export interface IOnboardingSteps{
  id: string,
  customerId?: string,
  steps: number,
  completed: boolean,
  completedAt: string,
}

export type StoredCustomer = {
  id: string;
  name: string;
  billingAddress: string | null;
  notes: string | null;
  status: CustomerStatus;
  createdAt: Date;
  updatedAt: Date;
  contacts?: IContactRecord[];
};

export type CustomerMutationResult =
  | { status: "ok"; contact: IContactRecord }
  | { status: "customer_not_found" }
  | { status: "contact_not_found" }
  | { status: "primary_required" }
  | { status: "last_contact" };
