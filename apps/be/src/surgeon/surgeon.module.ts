import { Module } from '@nestjs/common';
import { SurgeonController } from './surgeon.controller';
import { SurgeonService } from './surgeon.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SurgeonController],
  providers: [SurgeonService],
  exports: [SurgeonService],
})
export class SurgeonModule {}