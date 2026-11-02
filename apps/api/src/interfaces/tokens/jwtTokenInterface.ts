interface IJwtTokenService {
  createToken(user_id: string, role: string): Promise<string>;
  verifyToken(token: string): Promise<{ user_id: string; role: string }>;
}

export default IJwtTokenService;
