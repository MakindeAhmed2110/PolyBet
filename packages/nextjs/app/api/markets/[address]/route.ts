import { NextRequest, NextResponse } from "next/server";
import { prisma } from "~~/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ address: string }> }) {
  try {
    const { address } = await params;

    const market = await prisma.market.findUnique({
      where: { address },
      include: {
        category: true,
        trades: {
          orderBy: { createdAt: "desc" },
          take: 10, // Latest 10 trades
        },
        liquidityEvents: {
          orderBy: { createdAt: "desc" },
          take: 10, // Latest 10 liquidity events
        },
      },
    });

    if (!market) {
      return NextResponse.json({ error: "Market not found" }, { status: 404 });
    }

    return NextResponse.json(market);
  } catch (error) {
    console.error("Error fetching market:", error);
    return NextResponse.json({ error: "Failed to fetch market" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ address: string }> }) {
  try {
    const { address } = await params;
    const body = await request.json();

    const market = await prisma.market.update({
      where: { address },
      data: body,
      include: {
        category: true,
      },
    });

    return NextResponse.json(market);
  } catch (error) {
    console.error("Error updating market:", error);
    return NextResponse.json({ error: "Failed to update market" }, { status: 500 });
  }
}
