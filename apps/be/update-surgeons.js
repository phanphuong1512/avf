const { PrismaClient } = require('@prisma/client');

async function updateSurgeons() {
  const prisma = new PrismaClient();
  
  try {
    // Cập nhật bác sĩ với ID = 1 (Phan Lạc Tuấn Cường)
    await prisma.surgeon.update({
      where: { id: 1 },
      data: { startedYear: 2015 } // 10 năm kinh nghiệm 
    });

    // Cập nhật bác sĩ với ID = 2 (Phan Công)
    await prisma.surgeon.update({
      where: { id: 2 },
      data: { startedYear: 2018 } // 7 năm kinh nghiệm
    });

    console.log('✅ Đã cập nhật startedYear cho các bác sĩ');
    
    // Kiểm tra kết quả
    const surgeons = await prisma.surgeon.findMany();
    console.log('📋 Danh sách bác sĩ:');
    surgeons.forEach(surgeon => {
      const experienceYears = surgeon.startedYear ? new Date().getFullYear() - surgeon.startedYear : 0;
      console.log(`- ${surgeon.name}: ${experienceYears} năm kinh nghiệm (bắt đầu ${surgeon.startedYear})`);
    });
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateSurgeons();