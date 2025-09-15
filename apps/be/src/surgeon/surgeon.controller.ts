import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { SurgeonService } from './surgeon.service';
import { SurgeonDto } from './surgeon.dto';

@Controller('surgeons')
export class SurgeonController {
  constructor(private readonly surgeonService: SurgeonService) {}

  @Get()
  async findAll(): Promise<SurgeonDto[]> {
    return this.surgeonService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<SurgeonDto | null> {
    return this.surgeonService.findOne(id);
  }
}