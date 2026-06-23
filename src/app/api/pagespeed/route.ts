import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runPageSpeed } from "@/lib/pagespeed";
import { pageSpeedSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  try {
    const input = pageSpeedSchema.parse(await request.json());
    const result = await runPageSpeed(input.url, input.strategy);

    let audit = null;
    if (input.save || input.leadId) {
      audit = await prisma.audit.create({
        data: {
          leadId: input.leadId || null,
          ...result,
          opportunities: result.opportunities,
        },
      });

      if (input.leadId) {
        await prisma.lead.update({
          where: { id: input.leadId },
          data: {
            websiteScore: result.performance,
            pageSpeedPerformance: result.performance,
            pageSpeedAccessibility: result.accessibility,
            pageSpeedSEO: result.seo,
            pageSpeedBestPractices: result.bestPractices,
          },
        });
      }
    }

    return NextResponse.json({ audit: audit ?? result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "PageSpeed audit failed";
    if (message.includes("GOOGLE_PAGESPEED_API_KEY")) {
      return NextResponse.json({
        audit: {
          url: "https://example.com",
          strategy: "mobile",
          performance: 68,
          accessibility: 89,
          seo: 82,
          bestPractices: 77,
          firstContentfulPaint: "1.8 s",
          largestContentfulPaint: "3.1 s",
          speedIndex: "2.9 s",
          totalBlockingTime: "180 ms",
          cumulativeLayoutShift: "0.08",
          opportunities: [
            { title: "Compress large images", description: "Serve smaller images to reduce load time.", savings: "1.1 s" },
            { title: "Reduce unused JavaScript", description: "Remove scripts that are not needed on the first page load.", savings: "0.6 s" },
          ],
        },
        demo: true,
        warning: "Using demo audit because GOOGLE_PAGESPEED_API_KEY is not configured.",
      });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
