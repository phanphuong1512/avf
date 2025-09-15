import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SurgeonDto } from './surgeon.dto';

@Injectable()
export class SurgeonService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<SurgeonDto[]> {
    const surgeons = await this.prisma.surgeon.findMany({
      orderBy: { id: 'asc' },
    });
    
    return surgeons.map(surgeon => ({
      id: surgeon.id,
      name: surgeon.name,
    }));
  }

  async findOne(id: number): Promise<SurgeonDto | null> {
    const surgeon = await this.prisma.surgeon.findUnique({
      where: { id },
    });
    
    if (!surgeon) return null;
    
    return {
      id: surgeon.id,
      name: surgeon.name,
    };
  }
}