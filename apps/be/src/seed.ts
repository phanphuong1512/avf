import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Tạo 2 bác sĩ
  const surgeon1 = await prisma.surgeon.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Phan Thế Cường',
      specialization: 'Thận Nhân Tạo và Thủ Thuật AVF'
    }
  });

  const surgeon2 = await prisma.surgeon.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      name: 'Phan Lạc Tuấn Công',
      specialization: 'Thận Nhân Tạo và Thủ Thuật AVF'
    }
  });

  console.log('Created surgeons:', { surgeon1, surgeon2 });

  // Tạo một số bệnh nhân mẫu
  const patient1 = await prisma.patient.create({
    data: {
      name: 'Nguyễn Văn A',
      phone: '0912345678',
      diagnosis: 'Cần kiểm tra chức năng thận'
    }
  });

  const patient2 = await prisma.patient.create({
    data: {
      name: 'Trần Thị B',
      phone: '0987654321',
      diagnosis: 'Theo dõi AVF'
    }
  });

  console.log('Created patients:', { patient1, patient2 });

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
