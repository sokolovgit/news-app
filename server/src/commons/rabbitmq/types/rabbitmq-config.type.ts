/**
 * RabbitMQ exchange configuration.
 */
export interface RabbitExchangeConfig {
  /**
   * Exchange name.
   */
  name: string;

  /**
   * Exchange type (direct, topic, fanout, headers).
   */
  type: 'direct' | 'topic' | 'fanout' | 'headers';

  /**
   * Whether the exchange is durable (survives broker restart).
   */
  durable?: boolean;

  /**
   * Whether the exchange auto-deletes when all queues unbind.
   */
  autoDelete?: boolean;
}

/**
 * RabbitMQ queue configuration.
 */
export interface RabbitQueueConfig {
  /**
   * Queue name.
   */
  name: string;

  /**
   * Whether the queue is durable (survives broker restart).
   */
  durable?: boolean;

  /**
   * Whether the queue is exclusive (only accessible by creating connection).
   */
  exclusive?: boolean;

  /**
   * Whether the queue auto-deletes when no consumers.
   */
  autoDelete?: boolean;

  /**
   * Queue arguments (e.g., x-queue-type, x-message-ttl).
   */
  arguments?: Record<string, unknown>;
}

/**
 * RabbitMQ binding configuration.
 */
export interface RabbitBindingConfig {
  /**
   * Queue name to bind.
   */
  queue: string;

  /**
   * Exchange name to bind to.
   */
  exchange: string;

  /**
   * Routing key (pattern for topic exchanges).
   */
  routingKey: string;
}

/**
 * Complete RabbitMQ setup configuration.
 */
export interface RabbitSetupConfig {
  /**
   * Exchanges to create.
   */
  exchanges: RabbitExchangeConfig[];

  /**
   * Queues to create.
   */
  queues: RabbitQueueConfig[];

  /**
   * Bindings between queues and exchanges.
   */
  bindings: RabbitBindingConfig[];
}
