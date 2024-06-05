import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient({
    log: ["query"],
  });

  const companyId = 2;
  const scenarioId = 4;

  console.time("bench");
  const res = await prisma.account.findMany({
    where: {
      isDeleted: false,
      companyId,
      scenarioId,
    },
    select: {
      parentEdges: {
  
        where: {
          companyId,
          scenarioId,
        },
        select: {
          childAccountId: true,
        },
      },
    },
  });

  console.log(res.length);

  console.timeEnd("bench");
  await prisma.$disconnect();
}

main()
  .then(() => console.log("Done!"))
  .catch((err) => console.error(err));
