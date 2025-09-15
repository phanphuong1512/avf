import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  getHello(): string {
    return 'AVF Booking System API - Backend is running!';
  }

  async getPatients() {
    return this.prisma.patient.findMany();
  }

  async getSurgeons() {
    return this.prisma.surgeon.findMany();
  }
}