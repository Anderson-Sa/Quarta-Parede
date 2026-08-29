import type { Prisma } from "@/generated/prisma/client";

/**
 * Where-clause for posts visible to the public. A post is only visible once
 * it's marked published AND its publishedAt has actually arrived — this is
 * what makes scheduling a future publishedAt behave as "publish later"
 * instead of "publish immediately".
 */
export function publicPostWhere(): Prisma.PostWhereInput {
  return {
    published: true,
    publishedAt: { lte: new Date() },
    deletedAt: null,
  };
}
