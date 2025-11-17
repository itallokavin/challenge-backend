import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  async onModuleInit() {
    this.connection = await amqp.connect('amqp://admin:admin@localhost:5672');
    this.channel = await this.connection.createChannel();

    console.log('RabbitMQ conectado!');
  }

  async onModuleDestroy() {
    await this.channel.close();
    await this.connection.close();
  }

  async publish(queue: string, message: any) {
    await this.channel.assertQueue(queue);
    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
  }

  async consume(queue: string, callback: (msg: any) => Promise<void>) {
    await this.channel.assertQueue(queue);

    this.channel.consume(queue, async (msg) => { 
      if (msg !== null) {
        try {
        const payload = JSON.parse(msg.content.toString());
        
        await callback(payload); 

        this.channel.ack(msg);
        } catch (error) {
            console.error(`Erro no processamento da fila ${queue}:`, error.message);
            this.channel.nack(msg, false, false); 
        }
      }
    });
  }
}
