import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MqttService } from './mqtt/mqtt.service';
import { MqttModule } from './mqtt/mqtt.module';
import { InfluxService } from './influx/influx.service';
import { InfluxModule } from './influx/influx.module';

dotenv.config();

console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USERNAME:', process.env.DB_USERNAME);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_NAME:', process.env.DB_NAME);

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: '.env', 
    }),
    
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT!) || 5432,
      username: process.env.DB_USERNAME || 'enes',
      password: process.env.DB_PASSWORD || 'enes123',
      database: process.env.DB_NAME || 'patrion',
      synchronize: true,  // Yalnızca geliştirme aşamasında açın
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      logging: true,      // Hata ayıklamak için
    }),
    UserModule,
    AuthModule,
    MqttModule,
    InfluxModule,
  ],
  controllers: [AppController],
  providers: [AppService, MqttService, InfluxService],
})
export class AppModule {}
