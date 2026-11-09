import {
  IContractRecord,
  IContractFilter,
  ContractStatus,
} from "./commonInterface.js";

export interface IContractService {
  getAllContracts(filter?: IContractFilter): Promise<IContractRecord[]>;
  getContractById(id: string): Promise<IContractRecord>;
  updateContractStatus(id: string, status: ContractStatus): Promise<IContractRecord>;
  deleteContract(id: string): Promise<boolean>;
}
