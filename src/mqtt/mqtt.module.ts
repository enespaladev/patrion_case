import { Module } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { InfluxModule } from 'src/influx/influx.module';

@Module({
  imports: [InfluxModule],
  providers: [MqttService],
})
export class MqttModule {}
