// NOTE: This is an example template for Prisma v7+ configurations.
// Consult https://pris.ly/d/config-datasource for exact schema and options required by your Prisma version.
export default {
  // Example: map datasource names to runtime URLs
  datasources: {
    db: {
      provider: 'mongodb',
      url: process.env.DATABASE_URL, // used by migrations / runtime as configured by Prisma 7
    },
  },

  // If you use Prisma Accelerate, provide accelerateUrl here:
  // accelerate: { url: process.env.PRISMA_ACCELERATE_URL }
};