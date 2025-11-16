import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Channel, ChannelWrapper, connect } from 'amqp-connection-manager';

import { ConfigService } from '@/config';

import { RabbitSetupConfig } from './types';

type AmqpConnection = ReturnType<typeof connect>;

/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
@Injectable()
export class RabbitmqService implements OnModuleDestroy {
  private readonly logger = new Logger(RabbitmqService.name);

  private channels = new Map<string, ChannelWrapper>();
  private connection: AmqpConnection | null = null;

  constructor(private readonly configService: ConfigService) {}

  /**
   * Initialize RabbitMQ connection and setup.
   */
  async initialize(config: RabbitSetupConfig): Promise<void> {
    this.logger.log('Initializing RabbitMQ...');

    await this.setupRabbit(config);

    this.logger.log('RabbitMQ initialization complete');
  }

  /**
   * Setup RabbitMQ configuration (exchange, queues, bindings).
   */
  private async setupRabbit(config: RabbitSetupConfig): Promise<void> {
    const { url, timeConfig } = this.configService.rabbitmq;

    this.logger.log('Setting up RabbitMQ...');

    // Create connection
    this.connection = connect([url], {
      reconnectTimeInSeconds: timeConfig.reconnectTimeInSeconds,
      heartbeatIntervalInSeconds: timeConfig.heartbeatIntervalInSeconds,
    });

    this.registerConnectionLogging(this.connection);

    // Create channel
    const channelWrapper = this.connection.createChannel({
      setup: (channel: Channel, done: (error?: Error) => void) => {
        this.setupChannel(channel, config)
          .then(() => done())
          .catch(done);
      },
    });

    // Wait for channel to be ready
    await this.waitForChannelReady(
      channelWrapper,
      timeConfig.waitForChannelReadyTimeoutMs,
    );

    // Store primary channel
    this.channels.set('primary', channelWrapper);

    this.logger.log('RabbitMQ setup complete');
  }

  /**
   * Setup channel (exchanges, queues, bindings).
   */
  private async setupChannel(
    channel: Channel,
    config: RabbitSetupConfig,
  ): Promise<void> {
    // Create exchanges
    for (const exchange of config.exchanges) {
      await channel.assertExchange(exchange.name, exchange.type, {
        durable: exchange.durable ?? true,
        autoDelete: exchange.autoDelete ?? false,
      });
      this.logger.log(`Exchange created: ${exchange.name} (${exchange.type})`);
    }

    // Create queues
    for (const queue of config.queues) {
      await channel.assertQueue(queue.name, {
        durable: queue.durable ?? true,
        exclusive: queue.exclusive ?? false,
        autoDelete: queue.autoDelete ?? false,
        arguments: queue.arguments,
      });
      this.logger.log(`Queue created: ${queue.name}`);
    }

    // Create bindings
    for (const binding of config.bindings) {
      await channel.bindQueue(
        binding.queue,
        binding.exchange,
        binding.routingKey,
      );
      this.logger.log(
        `Binding created: ${binding.queue} <- ${binding.exchange} (${binding.routingKey})`,
      );
    }
  }

  /**
   * Register connection logging.
   */
  private registerConnectionLogging(connection: AmqpConnection): void {
    connection.on('connect', () => {
      this.logger.log('RabbitMQ connected');
    });

    connection.on('disconnect', (err: { err?: Error }) => {
      this.logger.error(
        `RabbitMQ disconnected: ${err?.err?.message ?? 'unknown'}`,
      );
    });

    connection.on('connectFailed', (err: { err?: Error }) => {
      this.logger.error(
        `RabbitMQ connection failed: ${err.err?.message ?? 'unknown'}`,
      );
    });
  }

  /**
   * Wait for channel to be ready.
   */
  private async waitForChannelReady(
    channel: ChannelWrapper,
    timeoutMs: number,
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(
          new Error('Timeout while waiting for RabbitMQ channel to connect'),
        );
      }, timeoutMs);

      channel
        .waitForConnect()
        .then(() => {
          clearTimeout(timer);
          resolve();
        })
        .catch((err: Error) => {
          clearTimeout(timer);
          reject(err);
        });
    });
  }

  /**
   * Get the primary channel.
   */
  getChannel(): ChannelWrapper | undefined {
    return this.channels.get('primary');
  }

  /**
   * Get a channel by name.
   */
  getChannelByName(name: string): ChannelWrapper | undefined {
    return this.channels.get(name);
  }

  /**
   * Get the connection.
   */

  getConnection(): AmqpConnection | null {
    return this.connection;
  }

  /**
   * Cleanup on module destroy.
   */
  async onModuleDestroy() {
    this.logger.log('Closing RabbitMQ connections...');

    // Close all channels
    for (const [name, channel] of this.channels) {
      try {
        await channel.close();
        this.logger.log(`Closed channel: ${name}`);
      } catch (error) {
        this.logger.error(`Error closing channel ${name}:`, error as Error);
      }
    }

    // Close connection
    if (this.connection) {
      try {
        await this.connection.close();
        this.logger.log('Closed RabbitMQ connection');
      } catch (error) {
        this.logger.error('Error closing RabbitMQ connection:', error as Error);
      }
    }
  }
}
