import {
  IContractRecord,
  IContractFilter,
  ContractStatus,
} from "./commonInterface.js";

export interface IContractRepository {
  getAll(filter?: IContractFilter): Promise<IContractRecord[]>;
  getById(id: string): Promise<IContractRecord | null>;
  updateStatus(id: string, status: ContractStatus): Promise<IContractRecord>;
  delete(id: string): Promise<boolean>;
}
