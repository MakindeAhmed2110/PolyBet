import { NextRequest, NextResponse } from "next/server";
import { prisma } from "~~/lib/prisma";

export async function POST(request: NextRequest, { params }: { params: Promise<{ address: string }> }) {
  try {
    const { address } = await params;
    const body = await request.json();
    const { winningOutcome } = body;

    if (!winningOutcome || !["YES", "NO"].includes(winningOutcome)) {
      return NextResponse.json({ error: "Invalid winning outcome" }, { status: 400 });
    }

    // Update the market status to REPORTED
    const market = await prisma.market.update({
      where: { address },
      data: {
        status: "REPORTED",
        isReported: true,
        winningOutcome: winningOutcome as "YES" | "NO",
        updatedAt: new Date(),
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(market);
  } catch (error) {
    console.error("Error updating market report:", error);
    return NextResponse.json({ error: "Failed to update market report" }, { status: 500 });
  }
}
