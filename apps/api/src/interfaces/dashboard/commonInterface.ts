export interface IDashboardRecentContract {
  id: string;
  customerId: string;
  customerName: string;
  scopeDescription: string;
  status: string;
  startDate: string;
  endDate: string;
  billingFrequency: string;
  billingTiming: string;
  onboardingCompleted: boolean;
  createdAt: string;
}

export interface IDashboardRecentCustomer {
  id: string;
  name: string;
  status: string;
  contractCount: number;
  createdAt: string;
}

export interface IDashboardCloudUsageItem {
  id: string;
  provider: string;
  externalAccountId: string;
  customerName: string;
  billingMonth: string;
  amount: number;
  currency: string;
}

export interface IDashboardStats {
  totalCustomers: number;
  activeCustomers: number;
  totalContracts: number;
  activeContracts: number;
  draftContracts: number;
  monthlyRecurringRevenue: number;
  onboardingInProgress: number;
  recentContracts: IDashboardRecentContract[];
  recentCustomers: IDashboardRecentCustomer[];
  recentCloudUsage: IDashboardCloudUsageItem[];
}
