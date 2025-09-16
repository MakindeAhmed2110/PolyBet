import { NextRequest, NextResponse } from "next/server";
import { prisma } from "~~/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (category) {
      where.category = { name: category };
    }

    if (status) {
      where.status = status.toUpperCase();
    }

    if (search) {
      where.OR = [
        { question: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Build orderBy clause
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [markets, total] = await Promise.all([
      prisma.market.findMany({
        where,
        include: {
          category: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.market.count({ where }),
    ]);

    return NextResponse.json({
      markets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching markets:", error);
    return NextResponse.json({ error: "Failed to fetch markets" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      address,
      question,
      description,
      categoryId,
      creatorAddress,
      oracleAddress,
      initialTokenValue,
      initialYesProbability,
      percentageToLock,
      expirationTime,
      initialLiquidity,
    } = body;

    // Validate required fields
    if (!address || !question || !categoryId || !creatorAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const market = await prisma.market.create({
      data: {
        address,
        question,
        description,
        categoryId,
        creatorAddress,
        oracleAddress,
        initialTokenValue: initialTokenValue.toString(),
        initialYesProbability,
        percentageToLock,
        expirationTime: new Date(expirationTime),
        initialLiquidity: initialLiquidity.toString(),
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(market, { status: 201 });
  } catch (error) {
    console.error("Error creating market:", error);

    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json({ error: "Market with this address already exists" }, { status: 409 });
    }

    return NextResponse.json({ error: "Failed to create market" }, { status: 500 });
  }
}
