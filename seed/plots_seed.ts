import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const organizationId = 'GZuIMsha8PoqO2eUnNvYZ82T7pwHyv2L';

  await prisma.plots.createMany({
    data: [
      {
        organizationId,
        number: 1,
        status: 'sold',
        color: 'red',
        customerName: 'John Doe',
        soldTo: 'Jane Smith',
        soldOn: new Date('2024-12-01'),
        amountCollected: 50000,
        amountCollectedTillDate: 30000,
        pendingAmount: 20000,
        nextInstallmentDate: new Date('2025-06-10'),
        nextInstallmentAmount: 5000,
        amountGivenTo: 'Builder A',
        amountGivenOn: new Date('2024-12-15'),
        documents: [
          '/docs/agreement.pdf',
          '/docs/invoice.pdf',
        ],
      },
      {
        organizationId,
        number: 2,
        status: 'sold',
        color: 'blue',
        customerName: 'Alice Brown',
        soldTo: 'Bob Smith',
        soldOn: new Date('2025-01-10'),
        amountCollected: 80000,
        amountCollectedTillDate: 40000,
        pendingAmount: 40000,
        nextInstallmentDate: new Date('2025-07-15'),
        nextInstallmentAmount: 10000,
        amountGivenTo: 'Builder B',
        amountGivenOn: new Date('2025-01-20'),
        documents: [
          '/docs/sale-deed.pdf',
          '/docs/payment-receipt.pdf',
        ],
      },
    ],
  });

  console.log('Seed data inserted successfully.');
}

main()
  .catch((e) => {
    console.error('Error while seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
