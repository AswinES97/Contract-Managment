import StatusCode from "../constants/statusCodes.js";

class CustomError extends Error {
  public statusCode: number;

  constructor(
    message: string,
    statusCode: number = StatusCode.INTERNAL_SERVER_ERROR,
  ) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export default CustomError;
