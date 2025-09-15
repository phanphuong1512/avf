import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  hello() {
    return this.appService.getHello();
  }

  @Get('patients')
  patients() {
    return this.appService.getPatients();
  }

  @Get('surgeons')
  surgeons() {
    return this.appService.getSurgeons();
  }

  @Get('info')
  info() {
    return {
      message: 'AVF Booking System API',
      patients: '/patients',
      surgeons: '/surgeons',
      bookings: '/bookings',
      slots: '/slots',
    };
  }
}