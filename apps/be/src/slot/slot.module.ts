import { Module } from '@nestjs/common';
import { SlotService } from './slot.service';
import { SlotController } from './slot.controller';

@Module({
  providers: [SlotService],
  controllers: [SlotController]
})
export class SlotModule {}
