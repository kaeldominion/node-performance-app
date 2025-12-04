const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const email = 'spencertarring@gmail.com';
  
  const user = await prisma.user.update({
    where: { email },
    data: { isAdmin: true },
  });

  console.log(`✅ User ${email} is now an admin!`);
  console.log(`User ID: ${user.id}`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

