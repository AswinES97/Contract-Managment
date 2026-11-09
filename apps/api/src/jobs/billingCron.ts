import cron, { type ScheduledTask } from "node-cron";
import prisma from "../config/prismaConfig.js";
import { BillingRepository } from "../repositories/billingRepository.js";
import { BillingService } from "../services/billing/billingService.js";
import { log, logErr } from "../config/logger.js";
import { env } from "../config/envConfig.js";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export async function runMonthlyBillingJob(): Promise<void> {
  const now = new Date();

  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEndDate = new Date(now.getFullYear(), now.getMonth(), 0);
  const billingMonthName = `${MONTH_NAMES[prevMonthDate.getMonth()]} ${prevMonthDate.getFullYear()}`;

  log(
    `⏳ [Billing Cron] Running monthly billing job on day ${now.getDate()} for period: ${billingMonthName} (${prevMonthDate.toISOString().slice(0, 10)} to ${prevMonthEndDate.toISOString().slice(0, 10)})...`,
  );

  try {
    const billingRepository = new BillingRepository(prisma);
    const billingService = new BillingService(billingRepository, prisma);

    const result = await billingService.calculateBills({
      billingMonth: billingMonthName,
      periodStart: prevMonthDate,
      periodEnd: prevMonthEndDate,
    });

    log(
      `✅ [Billing Cron] Monthly bill generation complete: ${result.generatedCount} bill(s) calculated and saved to DB for active onboarded customers.`,
    );
  } catch (err) {
    logErr("❌ [Billing Cron] Error executing monthly billing cron job:", err);
  }
}

export function initBillingCron(): ScheduledTask {
  const cronExpression = env.CRON;

  log(
    `[Billing Cron]: Initializing monthly billing cron job scheduled for "${cronExpression}"`,
  );

  const task = cron.schedule(
    cronExpression,
    async () => {
      await runMonthlyBillingJob();
    },
    {
      timezone: "Asia/Kolkata",
    },
  );

  log(
    `[Billing Cron] Monthly billing cron job successfully scheduled and active.`,
  );
  return task;
}
