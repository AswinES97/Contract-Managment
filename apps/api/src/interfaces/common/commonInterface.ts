export interface AuthData {
  id: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      authData?: AuthData;
    }
  }
}
