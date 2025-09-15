import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { BookingModule } from './booking/booking.module';
import { SlotModule } from './slot/slot.module';
import { SurgeonModule } from './surgeon/surgeon.module';

@Module({
  imports: [PrismaModule, BookingModule, SlotModule, SurgeonModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
