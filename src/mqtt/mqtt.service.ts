import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { connect, MqttClient } from 'mqtt';
import { InfluxService } from '../influx/influx.service';

@Injectable()
export class MqttService implements OnModuleInit {
  private client: MqttClient;
  private readonly logger = new Logger('MQTT');

  constructor(private readonly influxService: InfluxService) {}

  onModuleInit() {
    this.connectToBroker();
  }

  connectToBroker() {
    this.client = connect('mqtt://patrion_mosquitto:1883'); // Docker'da farklıysa ayarla

    this.client.on('connect', () => {
      this.logger.log('Connected to MQTT broker');

      this.client.subscribe('sensors/#', (err) => {
        if (err) {
          this.logger.error('Subscription error', err);
        } else {
          this.logger.log('Subscribed to sensors/#');
        }
      });
    });

    this.client.on('message', async (topic, payload) => {
      try {
        const message = JSON.parse(payload.toString());

        if (
          !message.sensor_id ||
          !message.timestamp ||
          typeof message.temperature !== 'number'
        ) {
          this.logger.warn(`Invalid payload from topic ${topic}: ${payload}`);
          return;
        }

        // Veri kaydetme ve websocket yayını burada olacak
        this.logger.log(
          `Sensor [${message.sensor_id}] => Temp: ${message.temperature}, Humidity: ${message.humidity}`,
        );

        // InfluxDB’ye yaz
        await this.influxService.writeSensorData({
          sensor_id: message.sensor_id,
          temperature: message.temperature,
          humidity: message.humidity,
          timestamp: message.timestamp,
        });

      } catch (e) {
        this.logger.error(
          `Failed to parse message from ${topic}: ${e.message}`,
        );
      }
    });
  }
}
