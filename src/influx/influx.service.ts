// import { Injectable } from '@nestjs/common';
// import { InfluxDB, Point } from '@influxdata/influxdb-client';
// import { ConfigService } from '@nestjs/config';

// @Injectable()
// export class InfluxService {
//   private influxDB;
//   private writeApi;

//   constructor(private configService: ConfigService) {
//     const influxUrl = this.configService.get('INFLUX_URL');
//     const token = this.configService.get('INFLUX_TOKEN');
//     const org = this.configService.get('INFLUX_ORG');
//     const bucket = this.configService.get('INFLUX_BUCKET');

//     console.log('Influx URL from .env:', influxUrl);

//     this.influxDB = new InfluxDB({
//       url: influxUrl || 'http://localhost:8086',
//       token: token || '',
//     });

//     this.writeApi = this.influxDB.getWriteApi(
//       org || '',
//       bucket || '',
//       'ns',
//     );

//     this.writeApi.useDefaultTags({ app: 'patrion-backend' });
//   }

//   async writeSensorData(sensorData: {
//     sensor_id: string;
//     temperature: number;
//     humidity: number;
//     timestamp: number;
//   }) {
//     try {
//       const point = new Point('sensor_data')
//         .tag('sensor_id', sensorData.sensor_id)
//         .floatField('temperature', sensorData.temperature)
//         .floatField('humidity', sensorData.humidity)
//         .timestamp(new Date(sensorData.timestamp * 1000)); // epoch to Date

//       this.writeApi.writePoint(point);
//       await this.writeApi.flush();

//       console.log(`Influx: Veri yazıldı → ${sensorData.sensor_id}`);
//     } catch (error) {
//       console.error('InfluxDB yazım hatası:', error);
//     }
//   }
// }

import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InfluxDB, Point } from '@influxdata/influxdb-client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InfluxService implements OnModuleInit {
  private readonly logger = new Logger(InfluxService.name);
  private writeApi;

  constructor(private configService: ConfigService) {
    const influxUrl = this.configService.get('INFLUX_URL');
    const token = this.configService.get('INFLUX_TOKEN');
    const org = this.configService.get('INFLUX_ORG');
    const bucket = this.configService.get('INFLUX_BUCKET');

    const client = new InfluxDB({ url: influxUrl, token });
    this.writeApi = client.getWriteApi(org, bucket, 'ns');
    this.writeApi.useDefaultTags({ app: 'patrion-backend' });
  }

  async onModuleInit() {
    // Başlangıçta test verisi yaz
    await this.writeSensorData({
      sensor_id: 'test_sensor_init',
      temperature: 25.5,
      humidity: 60,
      timestamp: Math.floor(Date.now() / 1000),
    });
  }

  async writeSensorData(sensorData: {
    sensor_id: string;
    temperature: number;
    humidity: number;
    timestamp: number;
  }) {
    try {
      const point = new Point('sensor_data')
        .tag('sensor_id', sensorData.sensor_id)
        .floatField('temperature', sensorData.temperature)
        .floatField('humidity', sensorData.humidity)
        .timestamp(sensorData.timestamp * 1e9); // Saniye → nanosaniye

      this.writeApi.writePoint(point);
      await this.writeApi.flush(); // Veriyi hemen gönder

      this.logger.log(`Veri yazıldı: ${sensorData.sensor_id}`);
    } catch (error) {
      this.logger.error('InfluxDB yazma hatası:', error);
      throw error;
    }
  }
}
