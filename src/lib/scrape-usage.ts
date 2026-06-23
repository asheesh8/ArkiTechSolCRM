import { prisma } from "@/lib/prisma";

export const DAILY_SCRAPE_LIMIT = 200;
export const MONTHLY_FREE_SEARCH_ESTIMATE = 5000;
const TIME_ZONE = "America/New_York";

function dateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  const dateKey = `${value("year")}-${value("month")}-${value("day")}`;
  const monthKey = `${value("year")}-${value("month")}`;
  return { dateKey, monthKey };
}

export async function getScrapeUsage(userId: string) {
  const { dateKey, monthKey } = dateParts();
  const [today, monthRows, teamMonthRows] = await Promise.all([
    prisma.scrapeUsage.findUnique({
      where: { userId_dateKey: { userId, dateKey } },
    }),
    prisma.scrapeUsage.findMany({
      where: { userId, monthKey },
      select: { count: true },
    }),
    prisma.scrapeUsage.findMany({
      where: { monthKey },
      select: { count: true },
    }),
  ]);

  const usedToday = today?.count ?? 0;
  const usedThisMonth = monthRows.reduce((total, row) => total + row.count, 0);
  const teamUsedThisMonth = teamMonthRows.reduce((total, row) => total + row.count, 0);

  return {
    dateKey,
    monthKey,
    usedToday,
    dailyLimit: DAILY_SCRAPE_LIMIT,
    remainingToday: Math.max(0, DAILY_SCRAPE_LIMIT - usedToday),
    usedThisMonth,
    teamUsedThisMonth,
    monthlyFreeEstimate: MONTHLY_FREE_SEARCH_ESTIMATE,
    estimatedFreeRemainingThisMonth: Math.max(0, MONTHLY_FREE_SEARCH_ESTIMATE - usedThisMonth),
    teamEstimatedFreeRemainingThisMonth: Math.max(0, MONTHLY_FREE_SEARCH_ESTIMATE - teamUsedThisMonth),
  };
}

export async function recordScrapeUsage(userId: string) {
  const { dateKey, monthKey } = dateParts();
  await prisma.scrapeUsage.upsert({
    where: { userId_dateKey: { userId, dateKey } },
    update: { count: { increment: 1 }, monthKey },
    create: { userId, dateKey, monthKey, count: 1 },
  });

  return getScrapeUsage(userId);
}
