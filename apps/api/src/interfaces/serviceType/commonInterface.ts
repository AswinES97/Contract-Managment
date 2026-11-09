export interface IServiceType {
  id: string;
  name: string;
  monthlyPrice: number | null;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateServiceTypeInput {
  name: string;
  monthlyPrice?: number;
  isActive?: boolean;
}

export interface IUpdateServiceTypeInput {
  name?: string;
  monthlyPrice?: number;
  isActive?: boolean;
}
