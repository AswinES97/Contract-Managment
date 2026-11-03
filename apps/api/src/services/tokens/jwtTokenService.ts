import jwt from "jsonwebtoken";
import { env } from "../../config/envConfig.js";
import CustomError from "../../utils/customError.js";
import StatusCode from "../../constants/statusCodes.js";
import IJwtTokenService from "../../interfaces/tokens/jwtTokenInterface.js";

class JwtTokenService implements IJwtTokenService {
  createToken = async (id: string, role: string): Promise<string> => {
    try {
      let payload = {
        id,
        role,
      };

      const token = jwt.sign(payload, env.JWT_TOKEN_SECRET, {
        expiresIn: "7d",
      });

      return token;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        `Error in Authentication ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        StatusCode.INTERNAL_SERVER_ERROR,
      );
    }
  };

  verifyToken = async (
    token: string,
  ): Promise<{ id: string; role: string }> => {
    try {
      const payload = jwt.verify(token, env.JWT_TOKEN_SECRET) as {
        id: string;
        role: string;
      };
      return payload;
    } catch (error) {
      throw new CustomError(
        "Invalid or expired token",
        StatusCode.UNAUTHORIZED,
      );
    }
  };
}

export default JwtTokenService;
