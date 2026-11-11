export interface IServiceType {
  id: string;
  name: string;
  monthlyPrice: number | null;
  isVariable?: boolean;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateServiceTypeInput {
  name: string;
  monthlyPrice?: number;
  isVariable?: boolean;
  isActive?: boolean;
}

export interface IUpdateServiceTypeInput {
  name?: string;
  monthlyPrice?: number;
  isVariable?: boolean;
  isActive?: boolean;
}
