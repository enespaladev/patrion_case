import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { UserRepository } from '../user/user.repository';

@Module({
  imports: [UserModule, JwtModule.register({ secret: process.env.JWT_SECRET })],
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
