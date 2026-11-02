import morgan from "morgan";
import chalk from "chalk";
import { Request, Response } from "express";

function formatTime(): string {
  const now = new Date();
  const date = now.toLocaleDateString("en-GB").replace(/\//g, "-");
  const time = now
    .toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })
    .toLowerCase();
  return `${date} ${time}`;
}

morgan.token("timestamp", () => chalk.magenta(formatTime()));

morgan.token("colored-method", (req) => chalk.cyan(req.method));
// morgan.token("colored-url", (req) => chalk.blue(req.url));
morgan.token("colored-url", (req: Request) => {
  const fullUrl = req.originalUrl || req.url;
  return chalk.blue(fullUrl);
});

morgan.token("colored-status", (req, res) => {
  const status = res.statusCode;
  if (status >= 500) return chalk.red(status);
  if (status >= 400) return chalk.yellow(status);
  if (status >= 300) return chalk.cyan(status);
  return chalk.green(status);
});
morgan.token("colored-response-time", (_req, res, arg) =>
  chalk.whiteBright(`${res.getHeader("X-Response-Time") || arg} ms`)
);

const logFormat = `:colored-method :colored-url :colored-status :response-time ms - :res[content-length] :timestamp`;

const morganLogger = morgan(logFormat);

export default morganLogger;
