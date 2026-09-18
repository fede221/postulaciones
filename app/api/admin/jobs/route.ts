import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminRoute, optionalBoolean, readJson } from "@/lib/adminApi";
import { parseJobFields } from "@/lib/jobFields";

export const POST = adminRoute(async (req) => {
  const body = await readJson(req);
  const job = await prisma.job.create({
    data: { ...parseJobFields(body), isActive: optionalBoolean(body.isActive) ?? true },
  });
  return NextResponse.json(job);
});
