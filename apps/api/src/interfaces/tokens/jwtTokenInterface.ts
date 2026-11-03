interface IJwtTokenService {
  createToken(id: string, role: string): Promise<string>;
  verifyToken(token: string): Promise<void>;
}

export default IJwtTokenService;
