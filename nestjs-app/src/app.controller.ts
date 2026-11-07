import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): { message: string; docs: Record<string, string> } {
    return {
      message: this.appService.getHello(),
      docs: {
        public: 'GET /',
        login: 'POST /auth/login { username, password }',
        refresh: 'POST /auth/refresh { refresh_token }',
        profile: 'GET /auth/profile (Bearer token required)',
        admin: 'GET /auth/admin (Bearer token + admin role)',
      },
    };
  }

  @Get('health')
  health() {
    return { status: 'ok' };
  }
}
