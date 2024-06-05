import { PrismaClient, Prisma } from "@prisma/client";
import { faker } from "@faker-js/faker";

faker.seed(42);

const N_ACCOUNTS = 5_000_000;
const N_EDGES = 5_000_000;
const N_COMPANIES = 15;
const N_SCENARIOS = 15;

async function seed() {
  const prisma = new PrismaClient();

  console.log("Seeding accounts...");
  await seedAccounts(prisma);

  console.log("Seeding edges...");
  await seedEdges(prisma);

  await prisma.$disconnect();
}

seed()
  .then(() => console.log("Done!"))
  .catch((err) => console.error(err));

async function seedAccounts(prisma: PrismaClient) {
  let accounts: Prisma.AccountUncheckedCreateInput[] = [];

  for (let i = 1; i <= N_ACCOUNTS; i++) {
    accounts.push({
      id: i,
      companyId: faker.number.int({ min: 1, max: N_COMPANIES }),
      scenarioId: faker.number.int({ min: 1, max: N_SCENARIOS }),
      isDeleted: faker.datatype.boolean(),
    });

    if (i % 1_000_000 === 0) {
      console.log(`Seeding ${i}th accounts`);

      await prisma.account.createMany({
        data: accounts,
      });

      accounts = [];
    }
  }
}

async function seedEdges(prisma: PrismaClient) {
  let edges: Prisma.EdgeUncheckedCreateInput[] = [];

  console.log("fetching accounts...");
  const accounts = await prisma.account.findMany({
    orderBy: { id: "asc" },
    select: { companyId: true, scenarioId: true },
  });
  console.log("accounts fetched!");

  for (let i = 1; i <= N_EDGES; i++) {
    let childParentId = faker.number.int({ min: 1, max: N_ACCOUNTS });
    let parentParentId = faker.number.int({ min: 1, max: N_ACCOUNTS });

    edges.push({
      parentId: i,
      parentAccountId: parentParentId,
      childAccountId: childParentId,
      companyId: accounts[parentParentId - 1].companyId!,
      scenarioId: accounts[parentParentId - 1].scenarioId!,
    });

    if (i % 1_000_000 === 0) {
      console.log(`Seeding ${i}th edges`);

      await prisma.edge.createMany({
        data: edges,
      });

      edges = [];
    }
  }
}
