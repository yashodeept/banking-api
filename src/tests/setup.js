const { prisma } = require("../config/db");

beforeAll(async () => {
  // Note: Database must be pushed/migrated before tests start via command line
});

afterEach(async () => {
  // Truncate all tables after each test to ensure a clean slate
  const tablenames = await prisma.$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== "_prisma_migrations")
    .map((name) => `"public"."${name}"`)
    .join(", ");

  try {
    if (tables.length > 0) {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
    }
  } catch (error) {
    console.log({ error });
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});
