import { NextRequest, NextResponse } from "next/server";
import { prisma } from "~~/lib/prisma";

export async function POST(request: NextRequest, { params }: { params: { address: string } }) {
  try {
    const { address } = params;

    // Update the market status to RESOLVED
    const market = await prisma.market.update({
      where: { address },
      data: {
        status: "RESOLVED",
        resolvedAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(market);
  } catch (error) {
    console.error("Error updating market resolution:", error);
    return NextResponse.json({ error: "Failed to update market resolution" }, { status: 500 });
  }
}
