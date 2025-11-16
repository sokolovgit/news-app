# Optimizing source fetching and caching
_Exported on 16/11/2025 at 20:10:03 EET from Cursor (2.0.77)_

---

**User**

i am thinking system that will do the following:

each fetch result for each source will be stored in redis with some TTL. if cache expires – fetch sources. 

the problem is there will be no point in fetching all sources. and there are many sources and logic how posts are being fetched (like we have some in nestjs app, some in python scripts)

1. we need some mechanism to fetch only needed sources (like those, that are used by currently active users)
2. we need a unified way of fething sources logic that connects all places from where posts can be fetched

and also we need to manage pagination logic (like we won't fetch all posts  from source ever, we need to fetch only new ones)

i can see two options here. 1 – bullmq cron job that will fetch posts from currenlt active users
2 – add jobs to fetch for each user 

what do you think? what your view of this problem? maybe you can think of better way? 

---

**Cursor**

Looking at your requirements and the architecture, I'd suggest a **hybrid approach that's neither of your two options**, but combines the best of both. Let me break down my thinking:

## The Core Problem

You have multiple issues to solve:
1. **Deduplication**: Multiple users following the same source shouldn't trigger multiple fetches
2. **Prioritization**: Active users' sources should be fetched, inactive ones shouldn't
3. **Unified interface**: Different scrapers (NestJS, Python) need a common contract
4. **Pagination**: Track what's already been fetched per source

## Recommended Architecture: **Job per Source** (not per user)

Here's why this is better than both your options:

### **Source-Centric Approach:**

```typescript
// Job structure
{
  sourceId: string,
  lastFetchedAt: Date,
  lastPostId: string,
  priority: number, // Based on how many active users follow it
  fetchStrategy: 'instagram' | 'twitter' | 'rss'
}
```

**Flow:**
1. **Activity Tracker**: Track user activity (last seen, last feed fetch)
2. **Priority Calculator**: Periodically calculate which sources need fetching based on:
   - Number of active users following the source
   - Time since last fetch
   - Source update frequency
3. **Job Scheduler**: Create/update jobs per source (not per user)
4. **Workers**: Process jobs using appropriate scraper

### **Benefits:**
- ✅ **Deduplication**: 100 users following same Instagram account = 1 fetch job
- ✅ **Smart scheduling**: Popular sources get fetched more frequently
- ✅ **Efficient caching**: Cache key = `source:{sourceId}:posts`, shared by all users
- ✅ **Resource optimization**: Don't fetch sources with no active followers

## Proposed Implementation

### 1. **Job Queue Structure (BullMQ)**

```typescript
// server/src/sources/infrastructure/queue/source-fetcher.queue.ts
export interface SourceFetchJob {
  sourceId: string;
  sourceType: 'instagram' | 'twitter' | 'rss';
  priority: number;
  lastFetchedAt?: Date;
  lastPostId?: string;
  cursor?: string;
}

// Repeatable job per source
// High priority sources: every 5 minutes
// Medium priority: every 15 minutes  
// Low priority: every hour
// No active followers: paused
```

### 2. **Unified Fetcher Interface**

```typescript
// server/src/sources/domain/fetcher.interface.ts
export interface ISourceFetcher {
  fetch(params: FetchParams): Promise<FetchResult>;
  supports(sourceType: SourceType): boolean;
}

export interface FetchParams {
  sourceId: string;
  cursor?: string;
  since?: Date;
  limit?: number;
}

export interface FetchResult {
  posts: Post[];
  nextCursor?: string;
  hasMore: boolean;
}
```

### 3. **Fetcher Implementations**

```typescript
// For Python Instagram scraper
export class InstagramFetcher implements ISourceFetcher {
  async fetch(params: FetchParams): Promise<FetchResult> {
    // Call Python script via RabbitMQ or HTTP
    // Python script returns standardized response
  }
}

// For native NestJS scrapers
export class RssFetcher implements ISourceFetcher {
  async fetch(params: FetchParams): Promise<FetchResult> {
    // Native implementation
  }
}
```

### 4. **Priority Calculator Service**

```typescript
// Cron job runs every 5 minutes
export class SourcePriorityCalculator {
  async calculatePriorities() {
    // 1. Get all sources
    // 2. For each source, count active users (last seen < 24h)
    // 3. Calculate priority:
    //    - HIGH: 10+ active users
    //    - MEDIUM: 2-9 active users
    //    - LOW: 1 active user
    //    - PAUSED: 0 active users
    // 4. Update job schedules accordingly
  }
}
```

### 5. **Cache Strategy**

```redis
# Cache structure
source:{sourceId}:posts -> List of post IDs (with TTL)
source:{sourceId}:data:{postId} -> Post data (with TTL)
source:{sourceId}:cursor -> Pagination cursor
source:{sourceId}:last_fetch -> Timestamp

# User sees aggregated feed from multiple sources
user:{userId}:feed -> Sorted set of post IDs from all their sources
```

## Answer to Your Specific Questions

**Option 1 (Single cron for active users)**: 
- ❌ Doesn't handle source deduplication
- ❌ Fetches too much at once

**Option 2 (Job per user)**:
- ❌ Massive duplication if users share sources
- ❌ Harder to manage

**My Recommendation**:
- ✅ **Job per source** with dynamic priority
- ✅ **Separate cron** to calculate priorities and adjust job frequencies
- ✅ **Unified fetcher interface** that different implementations (Python, NestJS) conform to
- ✅ **Message queue** (RabbitMQ/BullMQ) for communication between NestJS and Python

## Implementation Steps

1. **Create unified message format** for fetch requests/responses
2. **Wrap Python scraper** to consume jobs from RabbitMQ
3. **Implement priority calculator** service in NestJS
4. **Create source fetcher** workers (can scale horizontally)
5. **Implement pagination tracking** per source in Redis
6. **Add monitoring** for job success/failure rates

Would you like me to start implementing this architecture? I can begin with:
1. The unified fetcher interface and queue setup
2. The priority calculator service
3. Integration between NestJS and Python via message queue

What do you think about this approach?

```typescript
// Job structure
{
  sourceId: string,
  lastFetchedAt: Date,
  lastPostId: string,
  priority: number, // Based on how many active users follow it
  fetchStrategy: 'instagram' | 'twitter' | 'rss'
}
```

```typescript
// server/src/sources/infrastructure/queue/source-fetcher.queue.ts
export interface SourceFetchJob {
  sourceId: string;
  sourceType: 'instagram' | 'twitter' | 'rss';
  priority: number;
  lastFetchedAt?: Date;
  lastPostId?: string;
  cursor?: string;
}

// Repeatable job per source
// High priority sources: every 5 minutes
// Medium priority: every 15 minutes  
// Low priority: every hour
// No active followers: paused
```

```typescript
// server/src/sources/domain/fetcher.interface.ts
export interface ISourceFetcher {
  fetch(params: FetchParams): Promise<FetchResult>;
  supports(sourceType: SourceType): boolean;
}

export interface FetchParams {
  sourceId: string;
  cursor?: string;
  since?: Date;
  limit?: number;
}

export interface FetchResult {
  posts: Post[];
  nextCursor?: string;
  hasMore: boolean;
}
```

```typescript
// For Python Instagram scraper
export class InstagramFetcher implements ISourceFetcher {
  async fetch(params: FetchParams): Promise<FetchResult> {
    // Call Python script via RabbitMQ or HTTP
    // Python script returns standardized response
  }
}

// For native NestJS scrapers
export class RssFetcher implements ISourceFetcher {
  async fetch(params: FetchParams): Promise<FetchResult> {
    // Native implementation
  }
}
```

```typescript
// Cron job runs every 5 minutes
export class SourcePriorityCalculator {
  async calculatePriorities() {
    // 1. Get all sources
    // 2. For each source, count active users (last seen < 24h)
    // 3. Calculate priority:
    //    - HIGH: 10+ active users
    //    - MEDIUM: 2-9 active users
    //    - LOW: 1 active user
    //    - PAUSED: 0 active users
    // 4. Update job schedules accordingly
  }
}
```

```plaintext
# Cache structure
source:{sourceId}:posts -> List of post IDs (with TTL)
source:{sourceId}:data:{postId} -> Post data (with TTL)
source:{sourceId}:cursor -> Pagination cursor
source:{sourceId}:last_fetch -> Timestamp

# User sees aggregated feed from multiple sources
user:{userId}:feed -> Sorted set of post IDs from all their sources
```

---

**User**

seems nice to me.

how do we connect nest app with python scripts using rmq? what pattern we will use? (dont mind current rmq config)

---

**Cursor**

Let me check your current RabbitMQ setup to understand what you already have:

Great! I can see you already have a topology set up. Now let me explain the **Work Queue + Result Queue Pattern** we'll use:

## RabbitMQ Pattern: **Competing Consumers with Async Results**

This is a combination of two patterns:
1. **Work Queue Pattern** (Command Queue)
2. **Publisher-Subscriber Pattern** (Result Queue)

### Architecture Overview

```
┌─────────────┐                    ┌──────────────┐
│   NestJS    │                    │    Python    │
│  Publisher  │                    │   Workers    │
└─────────────┘                    └──────────────┘
       │                                   │
       │ 1. Publish Job                    │
       ├──────────────────────────────────►│
       │   (FETCH_INSTAGRAM)               │
       │   routing_key: fetch.instagram    │
       │   queue: requests                 │
       │                                   │
       │                          2. Process │
       │                                   │
       │                         3. Publish Result
       │◄──────────────────────────────────┤
       │   (FETCH_RESPONSE)                │
       │   routing_key: fetch.response     │
       │   queue: responses                │
       │                                   │
  4. Consume & Cache                       │
```

### Message Format

```typescript
// Command message (NestJS → Python)
interface FetchCommandMessage {
  jobId: string;                    // Unique job ID for tracking
  sourceId: string;                 // Source identifier
  sourceType: 'instagram' | 'twitter' | 'rss';
  externalId: string;               // Instagram username, Twitter handle, etc.
  params: {
    cursor?: string;                // Pagination cursor
    since?: string;                 // ISO date string
    limit?: number;                 // Max posts to fetch
  };
  timestamp: string;                // When job was created
  metadata?: Record<string, any>;   // Additional context
}

// Result message (Python → NestJS)
interface FetchResultMessage {
  jobId: string;                    // Same as command jobId
  sourceId: string;
  status: 'success' | 'error';
  data?: {
    posts: Array<{
      externalId: string;
      content: string;
      mediaUrls: string[];
      publishedAt: string;
      author: {
        username: string;
        displayName: string;
        avatarUrl?: string;
      };
    }>;
    nextCursor?: string;            // For pagination
    hasMore: boolean;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  processingTime: number;           // Milliseconds
}
```

## Implementation Details

### 1. **NestJS Side - Publishing Commands**

```typescript
// server/src/sources/infrastructure/queue/source-fetch-publisher.service.ts

@Injectable()
export class SourceFetchPublisher {
  constructor(
    @Inject('RABBITMQ_CLIENT') private readonly rmqClient: ClientProxy,
  ) {}

  async publishFetchJob(command: FetchCommandMessage): Promise<void> {
    const routingKey = this.getRoutingKey(command.sourceType);
    
    await this.rmqClient.emit(routingKey, command).toPromise();
    
    // Log for monitoring
    this.logger.log(`Published fetch job ${command.jobId} for source ${command.sourceId}`);
  }

  private getRoutingKey(sourceType: string): string {
    const routingKeyMap = {
      instagram: SourceFetcherEvents.FETCH_INSTAGRAM,
      twitter: SourceFetcherEvents.FETCH_TWITTER,
      rss: SourceFetcherEvents.FETCH_RSS,
    };
    return routingKeyMap[sourceType];
  }
}
```

### 2. **NestJS Side - Consuming Results**

```typescript
// server/src/sources/infrastructure/queue/source-fetch-consumer.controller.ts

@Controller()
export class SourceFetchConsumerController {
  constructor(
    private readonly cacheService: CacheService,
    private readonly postsService: PostsService,
  ) {}

  @MessagePattern(SourceFetcherEvents.FETCH_RESPONSE)
  async handleFetchResponse(@Payload() message: FetchResultMessage): Promise<void> {
    this.logger.log(`Received fetch result for job ${message.jobId}`);

    if (message.status === 'success') {
      // 1. Store posts in database
      await this.postsService.bulkCreate(message.sourceId, message.data.posts);

      // 2. Update cache
      await this.cacheService.setSourcePosts(
        message.sourceId,
        message.data.posts,
        { cursor: message.data.nextCursor }
      );

      // 3. Update source metadata (last fetch time, cursor, etc.)
      await this.sourcesService.updateFetchMetadata(message.sourceId, {
        lastFetchedAt: new Date(),
        lastCursor: message.data.nextCursor,
      });
    } else {
      // Handle error
      this.logger.error(
        `Fetch failed for source ${message.sourceId}: ${message.error.message}`,
        message.error.details
      );
      
      // Maybe update source status, send alert, etc.
    }
  }
}
```

### 3. **Python Side - Consuming Commands**

```python
# instagram-scrapper/src/queue/consumer.py

import pika
import json
from typing import Dict, Any
from datetime import datetime
from ..scraper.instagram import InstagramScraper

class FetchCommandConsumer:
    def __init__(self, rabbitmq_url: str):
        self.connection = pika.BlockingConnection(
            pika.URLParameters(rabbitmq_url)
        )
        self.channel = self.connection.channel()
        self.scraper = InstagramScraper()
        
    def start_consuming(self):
        """Start consuming messages from requests queue"""
        self.channel.basic_qos(prefetch_count=1)  # Process one at a time
        
        self.channel.basic_consume(
            queue='source.fetcher.requests',
            on_message_callback=self.on_message,
            auto_ack=False  # Manual acknowledgment
        )
        
        print('Waiting for messages...')
        self.channel.start_consuming()
    
    def on_message(self, ch, method, properties, body):
        """Handle incoming fetch command"""
        start_time = datetime.now()
        
        try:
            command = json.loads(body)
            print(f"Processing job {command['jobId']}")
            
            # Only handle Instagram
            if command['sourceType'] != 'instagram':
                ch.basic_ack(delivery_tag=method.delivery_tag)
                return
            
            # Fetch posts
            result = self.scraper.fetch_posts(
                username=command['externalId'],
                cursor=command['params'].get('cursor'),
                limit=command['params'].get('limit', 50)
            )
            
            # Calculate processing time
            processing_time = (datetime.now() - start_time).total_seconds() * 1000
            
            # Build success response
            response = {
                'jobId': command['jobId'],
                'sourceId': command['sourceId'],
                'status': 'success',
                'data': result,
                'timestamp': datetime.now().isoformat(),
                'processingTime': processing_time
            }
            
            # Publish result
            self.publish_result(response)
            
            # Acknowledge message
            ch.basic_ack(delivery_tag=method.delivery_tag)
            print(f"Job {command['jobId']} completed successfully")
            
        except Exception as e:
            # Build error response
            processing_time = (datetime.now() - start_time).total_seconds() * 1000
            
            response = {
                'jobId': command.get('jobId', 'unknown'),
                'sourceId': command.get('sourceId', 'unknown'),
                'status': 'error',
                'error': {
                    'code': 'FETCH_ERROR',
                    'message': str(e),
                    'details': {'type': type(e).__name__}
                },
                'timestamp': datetime.now().isoformat(),
                'processingTime': processing_time
            }
            
            self.publish_result(response)
            
            # Acknowledge anyway (don't retry indefinitely)
            # Or use basic_nack with requeue=True for transient errors
            ch.basic_ack(delivery_tag=method.delivery_tag)
            print(f"Job {command.get('jobId')} failed: {e}")
    
    def publish_result(self, result: Dict[str, Any]):
        """Publish result back to NestJS"""
        self.channel.basic_publish(
            exchange='source.fetcher',
            routing_key='fetch.response',
            body=json.dumps(result),
            properties=pika.BasicProperties(
                delivery_mode=2,  # Persistent
                content_type='application/json'
            )
        )
```

### 4. **Python Side - Main Entry Point**

```python
# instagram-scrapper/src/main.py

from .queue.consumer import FetchCommandConsumer
from .config import settings

def main():
    consumer = FetchCommandConsumer(settings.rabbitmq_url)
    
    try:
        consumer.start_consuming()
    except KeyboardInterrupt:
        print('Interrupted')
        consumer.connection.close()

if __name__ == '__main__':
    main()
```

## Key Benefits of This Pattern

1. **Decoupling**: NestJS and Python are completely independent
2. **Scalability**: Can run multiple Python workers competing for jobs
3. **Reliability**: 
   - Messages are persistent (survive broker restart)
   - Manual acknowledgment (only ack after successful processing)
   - Can add Dead Letter Queue for failed messages
4. **Flexibility**: Easy to add more worker types (Twitter, RSS scrapers)
5. **Async**: NestJS doesn't wait for Python, gets results when ready

## Additional Enhancements

### Add Dead Letter Queue (DLQ)

```typescript
// Update topology to add DLQ
{
  name: queues.deadLetter,
  durable: true,
  arguments: {
    'x-queue-type': queueType,
  },
}

// Add to requests queue
arguments: {
  'x-queue-type': queueType,
  'x-message-ttl': 3600000,
  'x-max-length': 10000,
  'x-dead-letter-exchange': exchangeName,
  'x-dead-letter-routing-key': 'fetch.dead-letter',
}
```

### Add Retry Logic with Exponential Backoff

```python
# In Python consumer
def on_message(self, ch, method, properties, body):
    try:
        # ... process message
    except TransientError as e:
        # Requeue with delay
        retry_count = properties.headers.get('x-retry-count', 0)
        
        if retry_count < 3:
            # Requeue with delay
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)
        else:
            # Give up, send to DLQ
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
```

## Summary

- **Pattern**: Work Queue for commands + Pub/Sub for results
- **NestJS**: Publishes commands, consumes results
- **Python**: Consumes commands, publishes results  
- **Routing**: Direct exchange with specific routing keys per source type
- **Reliability**: Durable queues, persistent messages, manual acks
- **Scalability**: Multiple Python workers can compete for jobs

Want me to implement this complete integration between NestJS and Python?

```plaintext
┌─────────────┐                    ┌──────────────┐
│   NestJS    │                    │    Python    │
│  Publisher  │                    │   Workers    │
└─────────────┘                    └──────────────┘
       │                                   │
       │ 1. Publish Job                    │
       ├──────────────────────────────────►│
       │   (FETCH_INSTAGRAM)               │
       │   routing_key: fetch.instagram    │
       │   queue: requests                 │
       │                                   │
       │                          2. Process │
       │                                   │
       │                         3. Publish Result
       │◄──────────────────────────────────┤
       │   (FETCH_RESPONSE)                │
       │   routing_key: fetch.response     │
       │   queue: responses                │
       │                                   │
  4. Consume & Cache                       │
```

```typescript
// Command message (NestJS → Python)
interface FetchCommandMessage {
  jobId: string;                    // Unique job ID for tracking
  sourceId: string;                 // Source identifier
  sourceType: 'instagram' | 'twitter' | 'rss';
  externalId: string;               // Instagram username, Twitter handle, etc.
  params: {
    cursor?: string;                // Pagination cursor
    since?: string;                 // ISO date string
    limit?: number;                 // Max posts to fetch
  };
  timestamp: string;                // When job was created
  metadata?: Record<string, any>;   // Additional context
}

// Result message (Python → NestJS)
interface FetchResultMessage {
  jobId: string;                    // Same as command jobId
  sourceId: string;
  status: 'success' | 'error';
  data?: {
    posts: Array<{
      externalId: string;
      content: string;
      mediaUrls: string[];
      publishedAt: string;
      author: {
        username: string;
        displayName: string;
        avatarUrl?: string;
      };
    }>;
    nextCursor?: string;            // For pagination
    hasMore: boolean;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  processingTime: number;           // Milliseconds
}
```

```typescript
// server/src/sources/infrastructure/queue/source-fetch-publisher.service.ts

@Injectable()
export class SourceFetchPublisher {
  constructor(
    @Inject('RABBITMQ_CLIENT') private readonly rmqClient: ClientProxy,
  ) {}

  async publishFetchJob(command: FetchCommandMessage): Promise<void> {
    const routingKey = this.getRoutingKey(command.sourceType);
    
    await this.rmqClient.emit(routingKey, command).toPromise();
    
    // Log for monitoring
    this.logger.log(`Published fetch job ${command.jobId} for source ${command.sourceId}`);
  }

  private getRoutingKey(sourceType: string): string {
    const routingKeyMap = {
      instagram: SourceFetcherEvents.FETCH_INSTAGRAM,
      twitter: SourceFetcherEvents.FETCH_TWITTER,
      rss: SourceFetcherEvents.FETCH_RSS,
    };
    return routingKeyMap[sourceType];
  }
}
```

```typescript
// server/src/sources/infrastructure/queue/source-fetch-consumer.controller.ts

@Controller()
export class SourceFetchConsumerController {
  constructor(
    private readonly cacheService: CacheService,
    private readonly postsService: PostsService,
  ) {}

  @MessagePattern(SourceFetcherEvents.FETCH_RESPONSE)
  async handleFetchResponse(@Payload() message: FetchResultMessage): Promise<void> {
    this.logger.log(`Received fetch result for job ${message.jobId}`);

    if (message.status === 'success') {
      // 1. Store posts in database
      await this.postsService.bulkCreate(message.sourceId, message.data.posts);

      // 2. Update cache
      await this.cacheService.setSourcePosts(
        message.sourceId,
        message.data.posts,
        { cursor: message.data.nextCursor }
      );

      // 3. Update source metadata (last fetch time, cursor, etc.)
      await this.sourcesService.updateFetchMetadata(message.sourceId, {
        lastFetchedAt: new Date(),
        lastCursor: message.data.nextCursor,
      });
    } else {
      // Handle error
      this.logger.error(
        `Fetch failed for source ${message.sourceId}: ${message.error.message}`,
        message.error.details
      );
      
      // Maybe update source status, send alert, etc.
    }
  }
}
```

```python
# instagram-scrapper/src/queue/consumer.py

import pika
import json
from typing import Dict, Any
from datetime import datetime
from ..scraper.instagram import InstagramScraper

class FetchCommandConsumer:
    def __init__(self, rabbitmq_url: str):
        self.connection = pika.BlockingConnection(
            pika.URLParameters(rabbitmq_url)
        )
        self.channel = self.connection.channel()
        self.scraper = InstagramScraper()
        
    def start_consuming(self):
        """Start consuming messages from requests queue"""
        self.channel.basic_qos(prefetch_count=1)  # Process one at a time
        
        self.channel.basic_consume(
            queue='source.fetcher.requests',
            on_message_callback=self.on_message,
            auto_ack=False  # Manual acknowledgment
        )
        
        print('Waiting for messages...')
        self.channel.start_consuming()
    
    def on_message(self, ch, method, properties, body):
        """Handle incoming fetch command"""
        start_time = datetime.now()
        
        try:
            command = json.loads(body)
            print(f"Processing job {command['jobId']}")
            
            # Only handle Instagram
            if command['sourceType'] != 'instagram':
                ch.basic_ack(delivery_tag=method.delivery_tag)
                return
            
            # Fetch posts
            result = self.scraper.fetch_posts(
                username=command['externalId'],
                cursor=command['params'].get('cursor'),
                limit=command['params'].get('limit', 50)
            )
            
            # Calculate processing time
            processing_time = (datetime.now() - start_time).total_seconds() * 1000
            
            # Build success response
            response = {
                'jobId': command['jobId'],
                'sourceId': command['sourceId'],
                'status': 'success',
                'data': result,
                'timestamp': datetime.now().isoformat(),
                'processingTime': processing_time
            }
            
            # Publish result
            self.publish_result(response)
            
            # Acknowledge message
            ch.basic_ack(delivery_tag=method.delivery_tag)
            print(f"Job {command['jobId']} completed successfully")
            
        except Exception as e:
            # Build error response
            processing_time = (datetime.now() - start_time).total_seconds() * 1000
            
            response = {
                'jobId': command.get('jobId', 'unknown'),
                'sourceId': command.get('sourceId', 'unknown'),
                'status': 'error',
                'error': {
                    'code': 'FETCH_ERROR',
                    'message': str(e),
                    'details': {'type': type(e).__name__}
                },
                'timestamp': datetime.now().isoformat(),
                'processingTime': processing_time
            }
            
            self.publish_result(response)
            
            # Acknowledge anyway (don't retry indefinitely)
            # Or use basic_nack with requeue=True for transient errors
            ch.basic_ack(delivery_tag=method.delivery_tag)
            print(f"Job {command.get('jobId')} failed: {e}")
    
    def publish_result(self, result: Dict[str, Any]):
        """Publish result back to NestJS"""
        self.channel.basic_publish(
            exchange='source.fetcher',
            routing_key='fetch.response',
            body=json.dumps(result),
            properties=pika.BasicProperties(
                delivery_mode=2,  # Persistent
                content_type='application/json'
            )
        )
```

```python
# instagram-scrapper/src/main.py

from .queue.consumer import FetchCommandConsumer
from .config import settings

def main():
    consumer = FetchCommandConsumer(settings.rabbitmq_url)
    
    try:
        consumer.start_consuming()
    except KeyboardInterrupt:
        print('Interrupted')
        consumer.connection.close()

if __name__ == '__main__':
    main()
```

```typescript
// Update topology to add DLQ
{
  name: queues.deadLetter,
  durable: true,
  arguments: {
    'x-queue-type': queueType,
  },
}

// Add to requests queue
arguments: {
  'x-queue-type': queueType,
  'x-message-ttl': 3600000,
  'x-max-length': 10000,
  'x-dead-letter-exchange': exchangeName,
  'x-dead-letter-routing-key': 'fetch.dead-letter',
}
```

```python
# In Python consumer
def on_message(self, ch, method, properties, body):
    try:
        # ... process message
    except TransientError as e:
        # Requeue with delay
        retry_count = properties.headers.get('x-retry-count', 0)
        
        if retry_count < 3:
            # Requeue with delay
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)
        else:
            # Give up, send to DLQ
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
```

---

**User**

is this the best solution? what rmq topology do we need? 

---

**Cursor**

Good question! Let me reconsider this more carefully. I think we can do **better** than my initial proposal.

## The Real Problem: Two Concerns

We're mixing two different concerns:
1. **Job Scheduling** (when to fetch, priorities, retries)
2. **Inter-service Communication** (NestJS ↔ Python)

Let me propose a **better architecture**:

## Recommended Solution: BullMQ + RabbitMQ Hybrid

```
┌─────────────────────────────────────────────────────────┐
│                       NestJS App                        │
│                                                         │
│  ┌──────────────┐         ┌─────────────────────────┐ │
│  │   BullMQ     │────────►│   BullMQ Workers        │ │
│  │  Scheduler   │         │  (Job Processors)       │ │
│  │              │         │                         │ │
│  │ - Priorities │         │  ┌─────────────────┐   │ │
│  │ - Retries    │         │  │ RSS Worker      │   │ │
│  │ - Cron       │         │  │ (Native NestJS) │   │ │
│  │ - Delays     │         │  └─────────────────┘   │ │
│  └──────────────┘         │                         │ │
│                           │  ┌─────────────────┐   │ │
│                           │  │Instagram Worker │   │ │
│                           │  │(Proxy to Python)│   │ │
│                           │  └────────┬────────┘   │ │
│                           └───────────┼────────────┘ │
└───────────────────────────────────────┼──────────────┘
                                        │
                                   RabbitMQ
                                        │
                            ┌───────────┼──────────┐
                            ▼           ▼          ▼
                    ┌───────────┐ ┌──────────┐ ┌─────┐
                    │  Python   │ │  Python  │ │ ... │
                    │ Worker #1 │ │ Worker #2│ │     │
                    └───────────┘ └──────────┘ └─────┘
```

### Why This Is Better

1. **BullMQ** handles all job orchestration (in NestJS)
   - Scheduling, priorities, retries
   - Single source of truth for jobs
   - Great monitoring/dashboard

2. **RabbitMQ** is just for NestJS → Python communication
   - Python workers don't need to know about scheduling
   - Python is a "dumb" executor
   - Can scale Python workers independently

## Optimal RabbitMQ Topology

Given this architecture, here's the **best topology**:

### Option A: Topic Exchange (Most Flexible) ✅

```typescript
// Topology
Exchange: 'source.fetcher' (topic)
Queues:
  - 'fetch.instagram.requests'  (binding: 'fetch.instagram.request')
  - 'fetch.instagram.responses' (binding: 'fetch.instagram.response')
  - 'fetch.twitter.requests'    (binding: 'fetch.twitter.request')
  - 'fetch.twitter.responses'   (binding: 'fetch.twitter.response')

// Pattern-based routing
Routing keys:
  - 'fetch.instagram.request'  → instagram.requests
  - 'fetch.instagram.response' → instagram.responses
  - 'fetch.twitter.request'    → twitter.requests
  - 'fetch.twitter.response'   → twitter.responses
  - 'fetch.*.response'         → Can subscribe to ALL responses if needed
```

**Benefits:**
- Separate queues per source type (clean separation)
- Python workers only consume their queue
- Can use wildcard patterns for monitoring
- Easy to add new source types

### Option B: Direct Exchange with Request-Response Pattern (Simpler) ✅

If we use **RPC-style** with `replyTo` and `correlationId`:

```typescript
// Topology
Exchange: 'source.fetcher' (direct)
Queues:
  - 'fetch.instagram' (durable)
  - 'fetch.twitter'   (durable)
  - 'fetch.rss'       (durable)
  - Per-worker reply queues (exclusive, auto-delete)

// RPC Pattern
NestJS → Publish to 'fetch.instagram' with:
  - correlationId: jobId
  - replyTo: 'amq.rabbitmq.reply-to' (direct reply-to)

Python → Reply to replyTo queue with same correlationId
```

**Benefits:**
- Built-in request-response pattern
- No need for persistent response queues
- Automatic correlation via correlationId
- Cleaner code

## My Recommendation: **Option B (RPC with Direct Exchange)**

Here's the complete implementation:

### 1. Updated Topology

```typescript
// server/src/commons/rabbitmq/rabbitmq.topology.ts

export function buildRabbitTopology(config: ConfigService): RabbitSetupConfig {
  const { exchangeName, queueType } = config.rabbitmq;

  return {
    exchanges: [
      {
        name: exchangeName,
        type: 'direct',  // Simple and efficient
        durable: true,
      },
    ],
    queues: [
      // Separate queue per source type
      {
        name: 'fetch.instagram',
        durable: true,
        arguments: {
          'x-queue-type': queueType,
          'x-message-ttl': 600000, // 10 minutes (job timeout)
          'x-max-length': 5000,
          // Dead letter queue for failed jobs
          'x-dead-letter-exchange': exchangeName,
          'x-dead-letter-routing-key': 'fetch.dlq',
        },
      },
      {
        name: 'fetch.twitter',
        durable: true,
        arguments: {
          'x-queue-type': queueType,
          'x-message-ttl': 600000,
          'x-max-length': 5000,
          'x-dead-letter-exchange': exchangeName,
          'x-dead-letter-routing-key': 'fetch.dlq',
        },
      },
      {
        name: 'fetch.rss',
        durable: true,
        arguments: {
          'x-queue-type': queueType,
          'x-message-ttl': 300000, // RSS is faster
          'x-max-length': 5000,
          'x-dead-letter-exchange': exchangeName,
          'x-dead-letter-routing-key': 'fetch.dlq',
        },
      },
      // Dead letter queue for failed jobs
      {
        name: 'fetch.dlq',
        durable: true,
        arguments: {
          'x-queue-type': queueType,
        },
      },
    ],
    bindings: [
      // Direct bindings
      {
        queue: 'fetch.instagram',
        exchange: exchangeName,
        routingKey: SourceFetcherEvents.FETCH_INSTAGRAM,
      },
      {
        queue: 'fetch.twitter',
        exchange: exchangeName,
        routingKey: SourceFetcherEvents.FETCH_TWITTER,
      },
      {
        queue: 'fetch.rss',
        exchange: exchangeName,
        routingKey: SourceFetcherEvents.FETCH_RSS,
      },
      {
        queue: 'fetch.dlq',
        exchange: exchangeName,
        routingKey: 'fetch.dlq',
      },
    ],
  };
}
```

### 2. NestJS BullMQ Worker (RPC Caller)

```typescript
// server/src/sources/infrastructure/queue/instagram-fetch.worker.ts

@Processor('source-fetcher')
export class InstagramFetchWorker {
  constructor(
    @Inject('RABBITMQ_CLIENT') private readonly rmqClient: ClientProxy,
  ) {}

  @Process('fetch-instagram')
  async processFetch(job: Job<SourceFetchJob>): Promise<void> {
    const { sourceId, externalId, cursor, limit } = job.data;

    job.log(`Fetching Instagram source ${sourceId}`);

    try {
      // RPC call to Python via RabbitMQ
      const result = await this.rmqClient
        .send<FetchResultMessage, FetchCommandMessage>(
          SourceFetcherEvents.FETCH_INSTAGRAM,
          {
            jobId: job.id,
            sourceId,
            sourceType: 'instagram',
            externalId,
            params: { cursor, limit },
            timestamp: new Date().toISOString(),
          }
        )
        .toPromise();

      // Process result
      if (result.status === 'success') {
        await this.processSuccess(sourceId, result.data);
        job.log(`Successfully fetched ${result.data.posts.length} posts`);
      } else {
        throw new Error(result.error.message);
      }
    } catch (error) {
      job.log(`Failed: ${error.message}`);
      throw error; // BullMQ will handle retry
    }
  }

  private async processSuccess(sourceId: string, data: any): Promise<void> {
    // Store in DB, update cache, etc.
  }
}
```

### 3. Python Worker (RPC Server)

```python
# instagram-scrapper/src/queue/rpc_server.py

import pika
import json
from typing import Dict, Any
from datetime import datetime
from ..scraper.instagram import InstagramScraper

class InstagramRPCServer:
    def __init__(self, rabbitmq_url: str):
        self.connection = pika.BlockingConnection(
            pika.URLParameters(rabbitmq_url)
        )
        self.channel = self.connection.channel()
        self.scraper = InstagramScraper()
        
    def start(self):
        """Start RPC server"""
        self.channel.basic_qos(prefetch_count=1)
        
        self.channel.basic_consume(
            queue='fetch.instagram',
            on_message_callback=self.on_request
        )
        
        print('Instagram RPC Server waiting for requests...')
        self.channel.start_consuming()
    
    def on_request(self, ch, method, props, body):
        """Handle RPC request"""
        start_time = datetime.now()
        
        try:
            command = json.loads(body)
            print(f"Processing request: {command['jobId']}")
            
            # Fetch posts
            result = self.scraper.fetch_posts(
                username=command['externalId'],
                cursor=command['params'].get('cursor'),
                limit=command['params'].get('limit', 50)
            )
            
            processing_time = (datetime.now() - start_time).total_seconds() * 1000
            
            # Build success response
            response = {
                'jobId': command['jobId'],
                'sourceId': command['sourceId'],
                'status': 'success',
                'data': result,
                'timestamp': datetime.now().isoformat(),
                'processingTime': processing_time
            }
            
        except Exception as e:
            processing_time = (datetime.now() - start_time).total_seconds() * 1000
            
            response = {
                'jobId': command.get('jobId', 'unknown'),
                'sourceId': command.get('sourceId', 'unknown'),
                'status': 'error',
                'error': {
                    'code': 'FETCH_ERROR',
                    'message': str(e),
                    'details': {'type': type(e).__name__}
                },
                'timestamp': datetime.now().isoformat(),
                'processingTime': processing_time
            }
        
        finally:
            # Send RPC response
            ch.basic_publish(
                exchange='',
                routing_key=props.reply_to,
                properties=pika.BasicProperties(
                    correlation_id=props.correlation_id,
                    delivery_mode=2
                ),
                body=json.dumps(response)
            )
            
            # Acknowledge
            ch.basic_ack(delivery_tag=method.delivery_tag)
            print(f"Request {command.get('jobId')} completed")
```

## Summary: Best Topology

**Choice: Direct Exchange with RPC Pattern**

✅ **Exchanges:**
- 1 direct exchange: `source.fetcher`

✅ **Queues:**
- `fetch.instagram` (durable, with DLQ)
- `fetch.twitter` (durable, with DLQ)
- `fetch.rss` (durable, with DLQ)
- `fetch.dlq` (dead letter queue)
- Reply queues (automatic via RabbitMQ's direct-reply-to)

✅ **Why This Works:**
- **BullMQ**: Handles scheduling, priorities, retries (in NestJS)
- **RabbitMQ**: Just for NestJS ↔ Python RPC calls
- **Separate queues**: Each source type has its own queue
- **RPC pattern**: Request-response with correlation IDs
- **Dead letter queue**: Failed messages for debugging
- **Scalability**: Add more Python workers per queue

This is cleaner and more maintainable than my first proposal. What do you think?

```plaintext
┌─────────────────────────────────────────────────────────┐
│                       NestJS App                        │
│                                                         │
│  ┌──────────────┐         ┌─────────────────────────┐ │
│  │   BullMQ     │────────►│   BullMQ Workers        │ │
│  │  Scheduler   │         │  (Job Processors)       │ │
│  │              │         │                         │ │
│  │ - Priorities │         │  ┌─────────────────┐   │ │
│  │ - Retries    │         │  │ RSS Worker      │   │ │
│  │ - Cron       │         │  │ (Native NestJS) │   │ │
│  │ - Delays     │         │  └─────────────────┘   │ │
│  └──────────────┘         │                         │ │
│                           │  ┌─────────────────┐   │ │
│                           │  │Instagram Worker │   │ │
│                           │  │(Proxy to Python)│   │ │
│                           │  └────────┬────────┘   │ │
│                           └───────────┼────────────┘ │
└───────────────────────────────────────┼──────────────┘
                                        │
                                   RabbitMQ
                                        │
                            ┌───────────┼──────────┐
                            ▼           ▼          ▼
                    ┌───────────┐ ┌──────────┐ ┌─────┐
                    │  Python   │ │  Python  │ │ ... │
                    │ Worker #1 │ │ Worker #2│ │     │
                    └───────────┘ └──────────┘ └─────┘
```

```typescript
// Topology
Exchange: 'source.fetcher' (topic)
Queues:
  - 'fetch.instagram.requests'  (binding: 'fetch.instagram.request')
  - 'fetch.instagram.responses' (binding: 'fetch.instagram.response')
  - 'fetch.twitter.requests'    (binding: 'fetch.twitter.request')
  - 'fetch.twitter.responses'   (binding: 'fetch.twitter.response')

// Pattern-based routing
Routing keys:
  - 'fetch.instagram.request'  → instagram.requests
  - 'fetch.instagram.response' → instagram.responses
  - 'fetch.twitter.request'    → twitter.requests
  - 'fetch.twitter.response'   → twitter.responses
  - 'fetch.*.response'         → Can subscribe to ALL responses if needed
```

```typescript
// Topology
Exchange: 'source.fetcher' (direct)
Queues:
  - 'fetch.instagram' (durable)
  - 'fetch.twitter'   (durable)
  - 'fetch.rss'       (durable)
  - Per-worker reply queues (exclusive, auto-delete)

// RPC Pattern
NestJS → Publish to 'fetch.instagram' with:
  - correlationId: jobId
  - replyTo: 'amq.rabbitmq.reply-to' (direct reply-to)

Python → Reply to replyTo queue with same correlationId
```

```typescript
// server/src/commons/rabbitmq/rabbitmq.topology.ts

export function buildRabbitTopology(config: ConfigService): RabbitSetupConfig {
  const { exchangeName, queueType } = config.rabbitmq;

  return {
    exchanges: [
      {
        name: exchangeName,
        type: 'direct',  // Simple and efficient
        durable: true,
      },
    ],
    queues: [
      // Separate queue per source type
      {
        name: 'fetch.instagram',
        durable: true,
        arguments: {
          'x-queue-type': queueType,
          'x-message-ttl': 600000, // 10 minutes (job timeout)
          'x-max-length': 5000,
          // Dead letter queue for failed jobs
          'x-dead-letter-exchange': exchangeName,
          'x-dead-letter-routing-key': 'fetch.dlq',
        },
      },
      {
        name: 'fetch.twitter',
        durable: true,
        arguments: {
          'x-queue-type': queueType,
          'x-message-ttl': 600000,
          'x-max-length': 5000,
          'x-dead-letter-exchange': exchangeName,
          'x-dead-letter-routing-key': 'fetch.dlq',
        },
      },
      {
        name: 'fetch.rss',
        durable: true,
        arguments: {
          'x-queue-type': queueType,
          'x-message-ttl': 300000, // RSS is faster
          'x-max-length': 5000,
          'x-dead-letter-exchange': exchangeName,
          'x-dead-letter-routing-key': 'fetch.dlq',
        },
      },
      // Dead letter queue for failed jobs
      {
        name: 'fetch.dlq',
        durable: true,
        arguments: {
          'x-queue-type': queueType,
        },
      },
    ],
    bindings: [
      // Direct bindings
      {
        queue: 'fetch.instagram',
        exchange: exchangeName,
        routingKey: SourceFetcherEvents.FETCH_INSTAGRAM,
      },
      {
        queue: 'fetch.twitter',
        exchange: exchangeName,
        routingKey: SourceFetcherEvents.FETCH_TWITTER,
      },
      {
        queue: 'fetch.rss',
        exchange: exchangeName,
        routingKey: SourceFetcherEvents.FETCH_RSS,
      },
      {
        queue: 'fetch.dlq',
        exchange: exchangeName,
        routingKey: 'fetch.dlq',
      },
    ],
  };
}
```

```typescript
// server/src/sources/infrastructure/queue/instagram-fetch.worker.ts

@Processor('source-fetcher')
export class InstagramFetchWorker {
  constructor(
    @Inject('RABBITMQ_CLIENT') private readonly rmqClient: ClientProxy,
  ) {}

  @Process('fetch-instagram')
  async processFetch(job: Job<SourceFetchJob>): Promise<void> {
    const { sourceId, externalId, cursor, limit } = job.data;

    job.log(`Fetching Instagram source ${sourceId}`);

    try {
      // RPC call to Python via RabbitMQ
      const result = await this.rmqClient
        .send<FetchResultMessage, FetchCommandMessage>(
          SourceFetcherEvents.FETCH_INSTAGRAM,
          {
            jobId: job.id,
            sourceId,
            sourceType: 'instagram',
            externalId,
            params: { cursor, limit },
            timestamp: new Date().toISOString(),
          }
        )
        .toPromise();

      // Process result
      if (result.status === 'success') {
        await this.processSuccess(sourceId, result.data);
        job.log(`Successfully fetched ${result.data.posts.length} posts`);
      } else {
        throw new Error(result.error.message);
      }
    } catch (error) {
      job.log(`Failed: ${error.message}`);
      throw error; // BullMQ will handle retry
    }
  }

  private async processSuccess(sourceId: string, data: any): Promise<void> {
    // Store in DB, update cache, etc.
  }
}
```

```python
# instagram-scrapper/src/queue/rpc_server.py

import pika
import json
from typing import Dict, Any
from datetime import datetime
from ..scraper.instagram import InstagramScraper

class InstagramRPCServer:
    def __init__(self, rabbitmq_url: str):
        self.connection = pika.BlockingConnection(
            pika.URLParameters(rabbitmq_url)
        )
        self.channel = self.connection.channel()
        self.scraper = InstagramScraper()
        
    def start(self):
        """Start RPC server"""
        self.channel.basic_qos(prefetch_count=1)
        
        self.channel.basic_consume(
            queue='fetch.instagram',
            on_message_callback=self.on_request
        )
        
        print('Instagram RPC Server waiting for requests...')
        self.channel.start_consuming()
    
    def on_request(self, ch, method, props, body):
        """Handle RPC request"""
        start_time = datetime.now()
        
        try:
            command = json.loads(body)
            print(f"Processing request: {command['jobId']}")
            
            # Fetch posts
            result = self.scraper.fetch_posts(
                username=command['externalId'],
                cursor=command['params'].get('cursor'),
                limit=command['params'].get('limit', 50)
            )
            
            processing_time = (datetime.now() - start_time).total_seconds() * 1000
            
            # Build success response
            response = {
                'jobId': command['jobId'],
                'sourceId': command['sourceId'],
                'status': 'success',
                'data': result,
                'timestamp': datetime.now().isoformat(),
                'processingTime': processing_time
            }
            
        except Exception as e:
            processing_time = (datetime.now() - start_time).total_seconds() * 1000
            
            response = {
                'jobId': command.get('jobId', 'unknown'),
                'sourceId': command.get('sourceId', 'unknown'),
                'status': 'error',
                'error': {
                    'code': 'FETCH_ERROR',
                    'message': str(e),
                    'details': {'type': type(e).__name__}
                },
                'timestamp': datetime.now().isoformat(),
                'processingTime': processing_time
            }
        
        finally:
            # Send RPC response
            ch.basic_publish(
                exchange='',
                routing_key=props.reply_to,
                properties=pika.BasicProperties(
                    correlation_id=props.correlation_id,
                    delivery_mode=2
                ),
                body=json.dumps(response)
            )
            
            # Acknowledge
            ch.basic_ack(delivery_tag=method.delivery_tag)
            print(f"Request {command.get('jobId')} completed")
```

---

**User**

i like second option more. 



can you give more detailed overview? 

---

**Cursor**

Let me give you a comprehensive detailed overview of the **BullMQ + RabbitMQ RPC Architecture**.

## Complete Architecture Overview

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            NestJS Application                               │
│                                                                             │
│  ┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐  │
│  │  HTTP Request   │    │  Priority Cron   │    │  BullMQ Dashboard   │  │
│  │  (User action)  │    │  (Calculate)     │    │  (Monitoring)       │  │
│  └────────┬────────┘    └────────┬─────────┘    └─────────────────────┘  │
│           │                      │                                         │
│           ▼                      ▼                                         │
│  ┌─────────────────────────────────────────────────────────────┐          │
│  │              Source Priority Service                        │          │
│  │  - Calculate active users per source                        │          │
│  │  - Determine fetch frequency                                │          │
│  │  - Add/update jobs to BullMQ                                │          │
│  └─────────────────────────┬───────────────────────────────────┘          │
│                            │                                               │
│                            ▼                                               │
│  ┌──────────────────────────────────────────────────────────────┐         │
│  │                    Redis (BullMQ)                            │         │
│  │                                                              │         │
│  │  Queue: "source-fetcher"                                    │         │
│  │  ┌────────────────────────────────────────────────────┐    │         │
│  │  │ Job 1: instagram/user1  Priority: 1  Repeat: 5m   │    │         │
│  │  │ Job 2: twitter/user2    Priority: 2  Repeat: 15m  │    │         │
│  │  │ Job 3: rss/feed1        Priority: 3  Repeat: 1h   │    │         │
│  │  │ Job 4: instagram/user2  Priority: 1  Delay: 10m   │    │         │
│  │  └────────────────────────────────────────────────────┘    │         │
│  └────────────────────────┬─────────────────────────────────────┘         │
│                            │                                               │
│                            ▼                                               │
│  ┌──────────────────────────────────────────────────────────────┐         │
│  │               BullMQ Workers (Processors)                    │         │
│  │                                                              │         │
│  │  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐ │         │
│  │  │ RSS Worker     │  │Instagram Worker│  │Twitter Worker│ │         │
│  │  │ (Native)       │  │ (RPC Proxy)    │  │(RPC Proxy)   │ │         │
│  │  │                │  │                │  │              │ │         │
│  │  │ Fetch RSS      │  │ Call Python    │  │Call Python   │ │         │
│  │  │ Parse XML      │  │ via RabbitMQ   │  │via RabbitMQ  │ │         │
│  │  │ Store in DB    │  │ Wait for reply │  │Wait for reply│ │         │
│  │  └────────────────┘  └───────┬────────┘  └──────┬───────┘ │         │
│  └─────────────────────────────┼──────────────────┼───────────┘         │
│                                 │                  │                      │
└─────────────────────────────────┼──────────────────┼──────────────────────┘
                                  │                  │
                            RabbitMQ (RPC Layer)
                                  │                  │
                    ┌─────────────┴──────────┐       │
                    ▼                        ▼       ▼
         ┌──────────────────┐    ┌──────────────────┐
         │                  │    │                  │
         │  Python Worker   │    │  Python Worker   │
         │  (Instagram #1)  │    │  (Instagram #2)  │
         │                  │    │                  │
         │  - Instaloader   │    │  - Instaloader   │
         │  - Selenium      │    │  - Selenium      │
         │  - Return posts  │    │  - Return posts  │
         └──────────────────┘    └──────────────────┘
```

---

## Part 1: Job Scheduling Layer (BullMQ)

### 1.1 Priority Calculator Service

This runs periodically to determine what needs to be fetched.

```typescript
// server/src/sources/services/source-priority-calculator.service.ts

interface SourcePriority {
  sourceId: string;
  sourceType: 'instagram' | 'twitter' | 'rss';
  externalId: string;
  activeFollowers: number;
  priority: number;
  repeatInterval: number; // milliseconds
}

@Injectable()
export class SourcePriorityCalculator {
  constructor(
    private readonly sourcesRepository: SourcesRepository,
    private readonly usersRepository: UsersRepository,
    @InjectQueue('source-fetcher') private readonly fetchQueue: Queue,
  ) {}

  /**
   * Calculate priorities for all sources based on active users
   * Runs every 5 minutes via cron
   */
  @Cron('*/5 * * * *')
  async calculateAndSchedule(): Promise<void> {
    this.logger.log('Starting priority calculation...');

    // 1. Get all sources
    const sources = await this.sourcesRepository.findAll();

    // 2. For each source, count active followers
    const priorities: SourcePriority[] = await Promise.all(
      sources.map(async (source) => {
        // Count users who follow this source AND were active in last 24h
        const activeFollowers = await this.usersRepository.countActiveFollowers(
          source.id,
          new Date(Date.now() - 24 * 60 * 60 * 1000)
        );

        return {
          sourceId: source.id,
          sourceType: source.type,
          externalId: source.externalId,
          activeFollowers,
          priority: this.calculatePriority(activeFollowers),
          repeatInterval: this.calculateInterval(activeFollowers),
        };
      })
    );

    // 3. Schedule/update jobs in BullMQ
    await this.scheduleJobs(priorities);

    this.logger.log(`Scheduled ${priorities.length} sources`);
  }

  /**
   * Priority: 1 (highest) to 10 (lowest)
   */
  private calculatePriority(activeFollowers: number): number {
    if (activeFollowers >= 100) return 1;
    if (activeFollowers >= 50) return 2;
    if (activeFollowers >= 20) return 3;
    if (activeFollowers >= 10) return 4;
    if (activeFollowers >= 5) return 5;
    if (activeFollowers >= 2) return 6;
    if (activeFollowers >= 1) return 7;
    return 10; // No active followers (paused)
  }

  /**
   * Repeat interval in milliseconds
   */
  private calculateInterval(activeFollowers: number): number {
    const MINUTE = 60 * 1000;
    
    if (activeFollowers >= 100) return 3 * MINUTE;   // Every 3 minutes
    if (activeFollowers >= 50) return 5 * MINUTE;    // Every 5 minutes
    if (activeFollowers >= 20) return 10 * MINUTE;   // Every 10 minutes
    if (activeFollowers >= 10) return 15 * MINUTE;   // Every 15 minutes
    if (activeFollowers >= 5) return 30 * MINUTE;    // Every 30 minutes
    if (activeFollowers >= 2) return 60 * MINUTE;    // Every hour
    if (activeFollowers >= 1) return 120 * MINUTE;   // Every 2 hours
    return 0; // Paused (0 means don't schedule)
  }

  private async scheduleJobs(priorities: SourcePriority[]): Promise<void> {
    for (const priority of priorities) {
      if (priority.repeatInterval === 0) {
        // Remove job if no active followers
        await this.fetchQueue.removeRepeatable(`fetch-${priority.sourceType}`, {
          jobId: priority.sourceId,
        });
        continue;
      }

      // Add or update repeatable job
      await this.fetchQueue.add(
        `fetch-${priority.sourceType}`,
        {
          sourceId: priority.sourceId,
          sourceType: priority.sourceType,
          externalId: priority.externalId,
          cursor: null, // Will be loaded from metadata
        },
        {
          jobId: priority.sourceId, // Unique per source
          priority: priority.priority,
          repeat: {
            every: priority.repeatInterval,
          },
          removeOnComplete: 100, // Keep last 100 completed jobs
          removeOnFail: 1000, // Keep last 1000 failed jobs
          attempts: 3, // Retry 3 times
          backoff: {
            type: 'exponential',
            delay: 5000, // Start with 5s delay
          },
        }
      );
    }
  }
}
```

### 1.2 Job Structure

```typescript
// server/src/sources/infrastructure/queue/types/source-fetch-job.type.ts

export interface SourceFetchJob {
  // Source identification
  sourceId: string;
  sourceType: 'instagram' | 'twitter' | 'rss';
  externalId: string; // Username, handle, URL
  
  // Pagination
  cursor?: string;
  lastPostId?: string;
  
  // Fetch parameters
  limit?: number;
  
  // Metadata
  scheduledBy?: 'cron' | 'user' | 'webhook';
  userId?: string; // If triggered by user action
}

export interface SourceFetchJobResult {
  status: 'success' | 'partial' | 'error';
  postsCount: number;
  newPostsCount: number;
  nextCursor?: string;
  error?: string;
}
```

---

## Part 2: Worker Layer (BullMQ Processors)

### 2.1 Instagram Worker (RPC Proxy)

```typescript
// server/src/sources/infrastructure/queue/workers/instagram-fetch.worker.ts

@Processor('source-fetcher')
export class InstagramFetchWorker {
  constructor(
    @Inject('RABBITMQ_CLIENT') private readonly rmqClient: ClientProxy,
    private readonly sourcesRepository: SourcesRepository,
    private readonly postsService: PostsService,
    private readonly cacheService: CacheService,
  ) {}

  @Process('fetch-instagram')
  async processFetch(
    job: Job<SourceFetchJob>
  ): Promise<SourceFetchJobResult> {
    const { sourceId, externalId } = job.data;

    job.log(`[${job.id}] Starting Instagram fetch for ${externalId}`);
    
    // 1. Load pagination state from database
    const source = await this.sourcesRepository.findById(sourceId);
    const cursor = source.metadata?.cursor;
    
    job.updateProgress(10);

    try {
      // 2. Make RPC call to Python via RabbitMQ
      job.log(`[${job.id}] Calling Python worker via RabbitMQ...`);
      
      const result = await firstValueFrom(
        this.rmqClient
          .send<FetchResultMessage, FetchCommandMessage>(
            SourceFetcherEvents.FETCH_INSTAGRAM,
            {
              jobId: job.id as string,
              sourceId,
              sourceType: 'instagram',
              externalId,
              params: {
                cursor,
                limit: 50,
              },
              timestamp: new Date().toISOString(),
            }
          )
          .pipe(
            timeout(300000), // 5 minute timeout
            retry({
              count: 2,
              delay: 5000,
            })
          )
      );

      job.updateProgress(50);

      // 3. Handle result
      if (result.status === 'error') {
        throw new Error(result.error.message);
      }

      job.log(`[${job.id}] Received ${result.data.posts.length} posts`);

      // 4. Process and store posts
      const { newPostsCount } = await this.storePosts(
        sourceId,
        result.data.posts
      );

      job.updateProgress(80);

      // 5. Update cache
      await this.cacheService.setSourcePosts(sourceId, result.data.posts, {
        ttl: 300, // 5 minutes
        cursor: result.data.nextCursor,
      });

      // 6. Update source metadata
      await this.sourcesRepository.update(sourceId, {
        lastFetchedAt: new Date(),
        metadata: {
          cursor: result.data.nextCursor,
          lastFetchSuccess: true,
          lastError: null,
        },
      });

      job.updateProgress(100);
      job.log(`[${job.id}] Completed successfully. ${newPostsCount} new posts`);

      return {
        status: 'success',
        postsCount: result.data.posts.length,
        newPostsCount,
        nextCursor: result.data.nextCursor,
      };

    } catch (error) {
      job.log(`[${job.id}] Error: ${error.message}`);
      
      // Update source with error
      await this.sourcesRepository.update(sourceId, {
        metadata: {
          lastFetchSuccess: false,
          lastError: error.message,
        },
      });

      throw error; // BullMQ will handle retry
    }
  }

  private async storePosts(
    sourceId: string,
    posts: any[]
  ): Promise<{ newPostsCount: number }> {
    let newPostsCount = 0;

    for (const post of posts) {
      const exists = await this.postsService.existsByExternalId(
        post.externalId
      );

      if (!exists) {
        await this.postsService.create({
          sourceId,
          externalId: post.externalId,
          content: post.content,
          mediaUrls: post.mediaUrls,
          publishedAt: new Date(post.publishedAt),
          author: post.author,
        });
        newPostsCount++;
      }
    }

    return { newPostsCount };
  }
}
```

### 2.2 RSS Worker (Native)

```typescript
// server/src/sources/infrastructure/queue/workers/rss-fetch.worker.ts

@Processor('source-fetcher')
export class RssFetchWorker {
  constructor(
    private readonly rssParser: RssParserService,
    private readonly postsService: PostsService,
  ) {}

  @Process('fetch-rss')
  async processFetch(
    job: Job<SourceFetchJob>
  ): Promise<SourceFetchJobResult> {
    const { sourceId, externalId } = job.data;

    job.log(`[${job.id}] Fetching RSS feed: ${externalId}`);

    try {
      // Native implementation - no RabbitMQ needed
      const feed = await this.rssParser.parseFeed(externalId);
      
      // Store posts
      const { newPostsCount } = await this.storePosts(sourceId, feed.items);

      return {
        status: 'success',
        postsCount: feed.items.length,
        newPostsCount,
      };
    } catch (error) {
      job.log(`[${job.id}] Error: ${error.message}`);
      throw error;
    }
  }
}
```

---

## Part 3: RabbitMQ RPC Layer

### 3.1 Message Formats

```typescript
// server/src/sources/infrastructure/queue/types/fetch-messages.type.ts

/**
 * Command message: NestJS → Python
 */
export interface FetchCommandMessage {
  // Job identification
  jobId: string;           // BullMQ job ID
  sourceId: string;        // Database source ID
  sourceType: 'instagram' | 'twitter' | 'rss';
  externalId: string;      // Instagram username, Twitter handle
  
  // Fetch parameters
  params: {
    cursor?: string;       // Pagination cursor
    since?: string;        // ISO date - fetch posts after this
    limit?: number;        // Max posts to fetch
  };
  
  // Metadata
  timestamp: string;       // ISO timestamp
  timeout?: number;        // Max processing time (ms)
}

/**
 * Result message: Python → NestJS
 */
export interface FetchResultMessage {
  // Correlation
  jobId: string;
  sourceId: string;
  
  // Status
  status: 'success' | 'error';
  
  // Success data
  data?: {
    posts: FetchedPost[];
    nextCursor?: string;
    hasMore: boolean;
    metadata?: {
      totalAvailable?: number;
      fetchedCount: number;
      skippedCount?: number;
    };
  };
  
  // Error data
  error?: {
    code: string;
    message: string;
    details?: any;
    retryable?: boolean;  // Can this be retried?
  };
  
  // Metrics
  timestamp: string;
  processingTime: number;  // Milliseconds
}

export interface FetchedPost {
  externalId: string;
  content: string;
  mediaUrls: string[];
  publishedAt: string;     // ISO date
  author: {
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  metrics?: {
    likes?: number;
    comments?: number;
    shares?: number;
  };
}
```

### 3.2 RabbitMQ Configuration

```typescript
// server/src/commons/rabbitmq/rabbitmq.module.ts

@Module({})
export class RabbitmqModule {
  static register(): DynamicModule {
    return {
      module: RabbitmqModule,
      providers: [
        {
          provide: 'RABBITMQ_CLIENT',
          useFactory: (config: ConfigService) => {
            return ClientProxyFactory.create({
              transport: Transport.RMQ,
              options: {
                urls: [config.rabbitmq.url],
                queue: 'fetch.instagram', // Default queue
                queueOptions: {
                  durable: true,
                  arguments: {
                    'x-queue-type': config.rabbitmq.queueType,
                  },
                },
                // Enable RPC (request-response)
                noAck: false,
                persistent: true,
                // Use direct-reply-to for responses
                replyQueue: '',
                socketOptions: {
                  heartbeatIntervalInSeconds: 30,
                  reconnectTimeInSeconds: 5,
                },
              },
            });
          },
          inject: [ConfigService],
        },
      ],
      exports: ['RABBITMQ_CLIENT'],
    };
  }
}
```

### 3.3 Topology Setup

```typescript
// server/src/commons/rabbitmq/enums/events.enum.ts

export enum SourceFetcherEvents {
  FETCH_INSTAGRAM = 'fetch.instagram',
  FETCH_TWITTER = 'fetch.twitter',
  FETCH_RSS = 'fetch.rss',
  FETCH_DLQ = 'fetch.dlq',
}
```

```typescript
// server/src/commons/rabbitmq/rabbitmq.topology.ts

export function buildRabbitTopology(config: ConfigService): RabbitSetupConfig {
  const exchangeName = config.rabbitmq.exchangeName; // e.g., 'source.fetcher'
  const queueType = config.rabbitmq.queueType; // 'classic' or 'quorum'

  return {
    exchanges: [
      {
        name: exchangeName,
        type: 'direct',
        durable: true,
      },
    ],
    queues: [
      // Instagram fetch queue
      {
        name: 'fetch.instagram',
        durable: true,
        arguments: {
          'x-queue-type': queueType,
          'x-message-ttl': 600000, // 10 min timeout
          'x-max-length': 5000,
          'x-dead-letter-exchange': exchangeName,
          'x-dead-letter-routing-key': SourceFetcherEvents.FETCH_DLQ,
        },
      },
      
      // Twitter fetch queue
      {
        name: 'fetch.twitter',
        durable: true,
        arguments: {
          'x-queue-type': queueType,
          'x-message-ttl': 600000,
          'x-max-length': 5000,
          'x-dead-letter-exchange': exchangeName,
          'x-dead-letter-routing-key': SourceFetcherEvents.FETCH_DLQ,
        },
      },
      
      // RSS fetch queue (might not need RabbitMQ, but included for consistency)
      {
        name: 'fetch.rss',
        durable: true,
        arguments: {
          'x-queue-type': queueType,
          'x-message-ttl': 300000, // 5 min timeout (RSS is faster)
          'x-max-length': 5000,
          'x-dead-letter-exchange': exchangeName,
          'x-dead-letter-routing-key': SourceFetcherEvents.FETCH_DLQ,
        },
      },
      
      // Dead letter queue for failed jobs
      {
        name: 'fetch.dlq',
        durable: true,
        arguments: {
          'x-queue-type': queueType,
          // No TTL - keep failed messages for debugging
        },
      },
    ],
    bindings: [
      {
        queue: 'fetch.instagram',
        exchange: exchangeName,
        routingKey: SourceFetcherEvents.FETCH_INSTAGRAM,
      },
      {
        queue: 'fetch.twitter',
        exchange: exchangeName,
        routingKey: SourceFetcherEvents.FETCH_TWITTER,
      },
      {
        queue: 'fetch.rss',
        exchange: exchangeName,
        routingKey: SourceFetcherEvents.FETCH_RSS,
      },
      {
        queue: 'fetch.dlq',
        exchange: exchangeName,
        routingKey: SourceFetcherEvents.FETCH_DLQ,
      },
    ],
  };
}
```

---

## Part 4: Python Workers

### 4.1 RPC Server

```python
# instagram-scrapper/src/queue/rpc_server.py

import pika
import json
import logging
from typing import Dict, Any, Optional
from datetime import datetime
from dataclasses import dataclass, asdict

from ..scraper.instagram_scraper import InstagramScraper
from ..config import settings

logger = logging.getLogger(__name__)


@dataclass
class FetchCommand:
    """Parsed command from NestJS"""
    job_id: str
    source_id: str
    source_type: str
    external_id: str
    cursor: Optional[str] = None
    limit: int = 50
    timestamp: Optional[str] = None


@dataclass
class FetchResult:
    """Result to send back to NestJS"""
    job_id: str
    source_id: str
    status: str  # 'success' or 'error'
    data: Optional[Dict[str, Any]] = None
    error: Optional[Dict[str, Any]] = None
    timestamp: str = None
    processing_time: float = 0.0


class InstagramRPCServer:
    """RPC server for Instagram fetching"""
    
    def __init__(self, rabbitmq_url: str, queue_name: str = 'fetch.instagram'):
        self.rabbitmq_url = rabbitmq_url
        self.queue_name = queue_name
        self.connection = None
        self.channel = None
        self.scraper = InstagramScraper()
        
    def connect(self):
        """Connect to RabbitMQ"""
        logger.info(f"Connecting to RabbitMQ: {self.rabbitmq_url}")
        
        self.connection = pika.BlockingConnection(
            pika.URLParameters(self.rabbitmq_url)
        )
        self.channel = self.connection.channel()
        
        # Set QoS - process one message at a time
        self.channel.basic_qos(prefetch_count=1)
        
        logger.info(f"Connected. Listening on queue: {self.queue_name}")
        
    def start(self):
        """Start consuming messages"""
        if not self.channel:
            self.connect()
            
        self.channel.basic_consume(
            queue=self.queue_name,
            on_message_callback=self.on_request,
            auto_ack=False  # Manual ACK
        )
        
        logger.info('Instagram RPC Server ready. Waiting for requests...')
        
        try:
            self.channel.start_consuming()
        except KeyboardInterrupt:
            logger.info('Interrupted by user')
            self.stop()
            
    def stop(self):
        """Stop and cleanup"""
        if self.connection and not self.connection.is_closed:
            self.connection.close()
        logger.info('Connection closed')
        
    def on_request(self, ch, method, props, body):
        """Handle incoming RPC request"""
        start_time = datetime.now()
        command = None
        
        try:
            # 1. Parse command
            raw_command = json.loads(body)
            command = FetchCommand(
                job_id=raw_command['jobId'],
                source_id=raw_command['sourceId'],
                source_type=raw_command['sourceType'],
                external_id=raw_command['externalId'],
                cursor=raw_command['params'].get('cursor'),
                limit=raw_command['params'].get('limit', 50),
                timestamp=raw_command.get('timestamp'),
            )
            
            logger.info(f"Processing request {command.job_id} for {command.external_id}")
            
            # 2. Fetch posts
            fetch_result = self.scraper.fetch_posts(
                username=command.external_id,
                cursor=command.cursor,
                limit=command.limit
            )
            
            # 3. Calculate processing time
            processing_time = (datetime.now() - start_time).total_seconds() * 1000
            
            # 4. Build success response
            result = FetchResult(
                job_id=command.job_id,
                source_id=command.source_id,
                status='success',
                data=fetch_result,
                timestamp=datetime.now().isoformat(),
                processing_time=processing_time
            )
            
            logger.info(
                f"Request {command.job_id} completed successfully. "
                f"Fetched {len(fetch_result['posts'])} posts in {processing_time:.0f}ms"
            )
            
        except Exception as e:
            # Handle error
            processing_time = (datetime.now() - start_time).total_seconds() * 1000
            
            logger.error(f"Request {command.job_id if command else 'unknown'} failed: {e}", exc_info=True)
            
            result = FetchResult(
                job_id=command.job_id if command else 'unknown',
                source_id=command.source_id if command else 'unknown',
                status='error',
                error={
                    'code': self._get_error_code(e),
                    'message': str(e),
                    'details': {
                        'type': type(e).__name__,
                    },
                    'retryable': self._is_retryable(e),
                },
                timestamp=datetime.now().isoformat(),
                processing_time=processing_time
            )
        
        finally:
            # 5. Send response back via RPC
            self._send_response(ch, props, result)
            
            # 6. Acknowledge message
            ch.basic_ack(delivery_tag=method.delivery_tag)
            
    def _send_response(self, ch, props, result: FetchResult):
        """Send RPC response"""
        ch.basic_publish(
            exchange='',
            routing_key=props.reply_to,
            properties=pika.BasicProperties(
                correlation_id=props.correlation_id,
                content_type='application/json',
                delivery_mode=2,  # Persistent
            ),
            body=json.dumps(asdict(result))
        )
        
    def _get_error_code(self, error: Exception) -> str:
        """Map exception to error code"""
        error_type = type(error).__name__
        
        error_map = {
            'ConnectionError': 'NETWORK_ERROR',
            'TimeoutError': 'TIMEOUT_ERROR',
            'LoginRequired': 'AUTH_ERROR',
            'PrivateProfileNotAllowed': 'PRIVATE_PROFILE',
            'ProfileNotFound': 'NOT_FOUND',
        }
        
        return error_map.get(error_type, 'UNKNOWN_ERROR')
        
    def _is_retryable(self, error: Exception) -> bool:
        """Determine if error is retryable"""
        retryable_errors = (
            'ConnectionError',
            'TimeoutError',
            'TemporaryServerError',
        )
        return type(error).__name__ in retryable_errors


# Entry point
if __name__ == '__main__':
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    server = InstagramRPCServer(
        rabbitmq_url=settings.rabbitmq_url,
        queue_name='fetch.instagram'
    )
    
    server.start()
```

### 4.2 Instagram Scraper

```python
# instagram-scrapper/src/scraper/instagram_scraper.py

from typing import Dict, List, Any, Optional
from datetime import datetime
import instaloader

class InstagramScraper:
    """Instagram posts scraper"""
    
    def __init__(self):
        self.loader = instaloader.Instaloader(
            download_pictures=False,
            download_videos=False,
            download_video_thumbnails=False,
            download_geotags=False,
            download_comments=False,
            save_metadata=False,
            compress_json=False,
        )
        
    def fetch_posts(
        self,
        username: str,
        cursor: Optional[str] = None,
        limit: int = 50
    ) -> Dict[str, Any]:
        """
        Fetch posts for an Instagram user
        
        Returns:
            {
                'posts': [...],
                'nextCursor': '...',
                'hasMore': True/False,
                'metadata': {...}
            }
        """
        try:
            # Get profile
            profile = instaloader.Profile.from_username(
                self.loader.context,
                username
            )
            
            posts = []
            post_iterator = profile.get_posts()
            
            # Skip to cursor if provided
            if cursor:
                # Implement cursor-based pagination
                # This depends on your cursor format
                pass
            
            # Fetch posts
            count = 0
            last_post_id = None
            
            for post in post_iterator:
                if count >= limit:
                    break
                    
                posts.append(self._serialize_post(post))
                last_post_id = post.shortcode
                count += 1
            
            has_more = count == limit
            
            return {
                'posts': posts,
                'nextCursor': last_post_id if has_more else None,
                'hasMore': has_more,
                'metadata': {
                    'totalAvailable': profile.mediacount,
                    'fetchedCount': len(posts),
                    'skippedCount': 0,
                }
            }
            
        except instaloader.exceptions.ProfileNotExistsException:
            raise ProfileNotFound(f"Profile {username} not found")
        except instaloader.exceptions.PrivateProfileNotAllowedException:
            raise PrivateProfileNotAllowed(f"Profile {username} is private")
        except Exception as e:
            raise FetchError(f"Failed to fetch posts: {e}")
    
    def _serialize_post(self, post) -> Dict[str, Any]:
        """Convert Instaloader Post to our format"""
        return {
            'externalId': post.shortcode,
            'content': post.caption or '',
            'mediaUrls': [post.url] if not post.is_video else [post.video_url],
            'publishedAt': post.date_utc.isoformat(),
            'author': {
                'username': post.owner_username,
                'displayName': post.owner_profile.full_name or post.owner_username,
                'avatarUrl': post.owner_profile.profile_pic_url,
            },
            'metrics': {
                'likes': post.likes,
                'comments': post.comments,
                'shares': None,  # Instagram doesn't expose shares
            }
        }


# Custom exceptions
class ProfileNotFound(Exception):
    pass

class PrivateProfileNotAllowed(Exception):
    pass

class FetchError(Exception):
    pass
```

### 4.3 Configuration

```python
# instagram-scrapper/src/config.py

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # RabbitMQ
    rabbitmq_url: str = "amqp://guest:guest@localhost:5672/"
    rabbitmq_exchange: str = "source.fetcher"
    
    # Instagram
    instagram_username: str = ""
    instagram_password: str = ""
    
    # Logging
    log_level: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
```

---

## Part 5: Complete Flow Example

### Scenario: User follows a new Instagram source

```
1. User Action (Web → NestJS)
   POST /api/sources/follow
   {
     "type": "instagram",
     "username": "nasa"
   }

2. NestJS creates source in DB
   - sourceId: "uuid-123"
   - type: "instagram"
   - externalId: "nasa"
   - followers: [userId]

3. Priority Calculator runs (cron every 5 min)
   - Finds source "nasa" has 1 active follower
   - Priority: 7
   - Interval: 2 hours
   - Adds BullMQ job

4. BullMQ schedules job
   Queue: "source-fetcher"
   Job: {
     name: "fetch-instagram",
     data: {
       sourceId: "uuid-123",
       sourceType: "instagram",
       externalId: "nasa",
       cursor: null
     },
     opts: {
       priority: 7,
       repeat: { every: 7200000 } // 2 hours
     }
   }

5. Instagram Worker picks up job (immediately, then every 2h)
   - Loads source metadata (cursor)
   - Makes RPC call via RabbitMQ

6. RabbitMQ routes message
   Exchange: "source.fetcher"
   Routing Key: "fetch.instagram"
   Queue: "fetch.instagram"
   Message: {
     jobId: "bullmq-job-123",
     sourceId: "uuid-123",
     sourceType: "instagram",
     externalId: "nasa",
     params: { cursor: null, limit: 50 }
   }

7. Python Worker #1 picks up message
   - Fetches posts from Instagram
   - Processes ~10 seconds
   - Replies via props.reply_to with correlation_id

8. RabbitMQ delivers response back to NestJS worker
   Message: {
     jobId: "bullmq-job-123",
     sourceId: "uuid-123",
     status: "success",
     data: {
       posts: [...50 posts...],
       nextCursor: "abc123",
       hasMore: true
     },
     processingTime: 10234
   }

9. Instagram Worker processes result
   - Stores 50 posts in DB (only new ones)
   - Updates cache in Redis
   - Updates source metadata (cursor, lastFetchedAt)
   - Marks BullMQ job as complete

10. User refreshes feed
    - Reads from cache (fast!)
    - Cache TTL: 5 minutes
    - If expired, trigger immediate fetch (add BullMQ job with high priority)
```

---

## Part 6: Monitoring & Observability

### 6.1 BullMQ Dashboard

```bash
# Install bull-board
npm install @bull-board/api @bull-board/nestjs
```

```typescript
// server/src/queue/queue-dashboard.module.ts

@Module({})
export class QueueDashboardModule {
  static register(): DynamicModule {
    return {
      module: QueueDashboardModule,
      imports: [
        BullBoardModule.forRoot({
          route: '/admin/queues',
          adapter: ExpressAdapter,
        }),
        BullBoardModule.forFeature({
          name: 'source-fetcher',
          adapter: BullMQAdapter,
        }),
      ],
    };
  }
}

// Access at: http://localhost:3000/admin/queues
```

### 6.2 Metrics Collection

```typescript
// server/src/sources/infrastructure/queue/metrics.service.ts

@Injectable()
export class QueueMetricsService {
  constructor(
    @InjectQueue('source-fetcher') private readonly queue: Queue,
  ) {}

  @Cron('*/1 * * * *') // Every minute
  async collectMetrics(): Promise<void> {
    const counts = await this.queue.getJobCounts();
    
    // Send to monitoring system (Prometheus, Datadog, etc.)
    this.metricsService.gauge('queue.waiting', counts.waiting);
    this.metricsService.gauge('queue.active', counts.active);
    this.metricsService.gauge('queue.completed', counts.completed);
    this.metricsService.gauge('queue.failed', counts.failed);
    this.metricsService.gauge('queue.delayed', counts.delayed);
  }
}
```

---

## Summary

This architecture provides:

✅ **Separation of Concerns**
- BullMQ = Job scheduling, priorities, retries
- RabbitMQ = Inter-service communication
- Python = Just execution

✅ **Scalability**
- Horizontal: Add more Python workers
- Vertical: Adjust priorities and intervals

✅ **Reliability**
- Retries at both layers (BullMQ + RabbitMQ)
- Dead letter queues
- Job persistence

✅ **Observability**
- BullMQ dashboard
- Metrics collection
- Structured logging

✅ **Efficiency**
- One fetch per source (shared by all users)
- Smart caching (Redis)
- Dynamic priorities based on activity

Want me to start implementing this?

```plaintext
┌─────────────────────────────────────────────────────────────────────────────┐
│                            NestJS Application                               │
│                                                                             │
│  ┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐  │
│  │  HTTP Request   │    │  Priority Cron   │    │  BullMQ Dashboard   │  │
│  │  (User action)  │    │  (Calculate)     │    │  (Monitoring)       │  │
│  └────────┬────────┘    └────────┬─────────┘    └─────────────────────┘  │
│           │                      │                                         │
│           ▼                      ▼                                         │
│  ┌─────────────────────────────────────────────────────────────┐          │
│  │              Source Priority Service                        │          │
│  │  - Calculate active users per source                        │          │
│  │  - Determine fetch frequency                                │          │
│  │  - Add/update jobs to BullMQ                                │          │
│  └─────────────────────────┬───────────────────────────────────┘          │
│                            │                                               │
│                            ▼                                               │
│  ┌──────────────────────────────────────────────────────────────┐         │
│  │                    Redis (BullMQ)                            │         │
│  │                                                              │         │
│  │  Queue: "source-fetcher"                                    │         │
│  │  ┌────────────────────────────────────────────────────┐    │         │
│  │  │ Job 1: instagram/user1  Priority: 1  Repeat: 5m   │    │         │
│  │  │ Job 2: twitter/user2    Priority: 2  Repeat: 15m  │    │         │
│  │  │ Job 3: rss/feed1        Priority: 3  Repeat: 1h   │    │         │
│  │  │ Job 4: instagram/user2  Priority: 1  Delay: 10m   │    │         │
│  │  └────────────────────────────────────────────────────┘    │         │
│  └────────────────────────┬─────────────────────────────────────┘         │
│                            │                                               │
│                            ▼                                               │
│  ┌──────────────────────────────────────────────────────────────┐         │
│  │               BullMQ Workers (Processors)                    │         │
│  │                                                              │         │
│  │  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐ │         │
│  │  │ RSS Worker     │  │Instagram Worker│  │Twitter Worker│ │         │
│  │  │ (Native)       │  │ (RPC Proxy)    │  │(RPC Proxy)   │ │         │
│  │  │                │  │                │  │              │ │         │
│  │  │ Fetch RSS      │  │ Call Python    │  │Call Python   │ │         │
│  │  │ Parse XML      │  │ via RabbitMQ   │  │via RabbitMQ  │ │         │
│  │  │ Store in DB    │  │ Wait for reply │  │Wait for reply│ │         │
│  │  └────────────────┘  └───────┬────────┘  └──────┬───────┘ │         │
│  └─────────────────────────────┼──────────────────┼───────────┘         │
│                                 │                  │                      │
└─────────────────────────────────┼──────────────────┼──────────────────────┘
                                  │                  │
                            RabbitMQ (RPC Layer)
                                  │                  │
                    ┌─────────────┴──────────┐       │
                    ▼                        ▼       ▼
         ┌──────────────────┐    ┌──────────────────┐
         │                  │    │                  │
         │  Python Worker   │    │  Python Worker   │
         │  (Instagram #1)  │    │  (Instagram #2)  │
         │                  │    │                  │
         │  - Instaloader   │    │  - Instaloader   │
         │  - Selenium      │    │  - Selenium      │
         │  - Return posts  │    │  - Return posts  │
         └──────────────────┘    └──────────────────┘
```

```typescript
// server/src/sources/services/source-priority-calculator.service.ts

interface SourcePriority {
  sourceId: string;
  sourceType: 'instagram' | 'twitter' | 'rss';
  externalId: string;
  activeFollowers: number;
  priority: number;
  repeatInterval: number; // milliseconds
}

@Injectable()
export class SourcePriorityCalculator {
  constructor(
    private readonly sourcesRepository: SourcesRepository,
    private readonly usersRepository: UsersRepository,
    @InjectQueue('source-fetcher') private readonly fetchQueue: Queue,
  ) {}

  /**
   * Calculate priorities for all sources based on active users
   * Runs every 5 minutes via cron
   */
  @Cron('*/5 * * * *')
  async calculateAndSchedule(): Promise<void> {
    this.logger.log('Starting priority calculation...');

    // 1. Get all sources
    const sources = await this.sourcesRepository.findAll();

    // 2. For each source, count active followers
    const priorities: SourcePriority[] = await Promise.all(
      sources.map(async (source) => {
        // Count users who follow this source AND were active in last 24h
        const activeFollowers = await this.usersRepository.countActiveFollowers(
          source.id,
          new Date(Date.now() - 24 * 60 * 60 * 1000)
        );

        return {
          sourceId: source.id,
          sourceType: source.type,
          externalId: source.externalId,
          activeFollowers,
          priority: this.calculatePriority(activeFollowers),
          repeatInterval: this.calculateInterval(activeFollowers),
        };
      })
    );

    // 3. Schedule/update jobs in BullMQ
    await this.scheduleJobs(priorities);

    this.logger.log(`Scheduled ${priorities.length} sources`);
  }

  /**
   * Priority: 1 (highest) to 10 (lowest)
   */
  private calculatePriority(activeFollowers: number): number {
    if (activeFollowers >= 100) return 1;
    if (activeFollowers >= 50) return 2;
    if (activeFollowers >= 20) return 3;
    if (activeFollowers >= 10) return 4;
    if (activeFollowers >= 5) return 5;
    if (activeFollowers >= 2) return 6;
    if (activeFollowers >= 1) return 7;
    return 10; // No active followers (paused)
  }

  /**
   * Repeat interval in milliseconds
   */
  private calculateInterval(activeFollowers: number): number {
    const MINUTE = 60 * 1000;
    
    if (activeFollowers >= 100) return 3 * MINUTE;   // Every 3 minutes
    if (activeFollowers >= 50) return 5 * MINUTE;    // Every 5 minutes
    if (activeFollowers >= 20) return 10 * MINUTE;   // Every 10 minutes
    if (activeFollowers >= 10) return 15 * MINUTE;   // Every 15 minutes
    if (activeFollowers >= 5) return 30 * MINUTE;    // Every 30 minutes
    if (activeFollowers >= 2) return 60 * MINUTE;    // Every hour
    if (activeFollowers >= 1) return 120 * MINUTE;   // Every 2 hours
    return 0; // Paused (0 means don't schedule)
  }

  private async scheduleJobs(priorities: SourcePriority[]): Promise<void> {
    for (const priority of priorities) {
      if (priority.repeatInterval === 0) {
        // Remove job if no active followers
        await this.fetchQueue.removeRepeatable(`fetch-${priority.sourceType}`, {
          jobId: priority.sourceId,
        });
        continue;
      }

      // Add or update repeatable job
      await this.fetchQueue.add(
        `fetch-${priority.sourceType}`,
        {
          sourceId: priority.sourceId,
          sourceType: priority.sourceType,
          externalId: priority.externalId,
          cursor: null, // Will be loaded from metadata
        },
        {
          jobId: priority.sourceId, // Unique per source
          priority: priority.priority,
          repeat: {
            every: priority.repeatInterval,
          },
          removeOnComplete: 100, // Keep last 100 completed jobs
          removeOnFail: 1000, // Keep last 1000 failed jobs
          attempts: 3, // Retry 3 times
          backoff: {
            type: 'exponential',
            delay: 5000, // Start with 5s delay
          },
        }
      );
    }
  }
}
```

```typescript
// server/src/sources/infrastructure/queue/types/source-fetch-job.type.ts

export interface SourceFetchJob {
  // Source identification
  sourceId: string;
  sourceType: 'instagram' | 'twitter' | 'rss';
  externalId: string; // Username, handle, URL
  
  // Pagination
  cursor?: string;
  lastPostId?: string;
  
  // Fetch parameters
  limit?: number;
  
  // Metadata
  scheduledBy?: 'cron' | 'user' | 'webhook';
  userId?: string; // If triggered by user action
}

export interface SourceFetchJobResult {
  status: 'success' | 'partial' | 'error';
  postsCount: number;
  newPostsCount: number;
  nextCursor?: string;
  error?: string;
}
```

```typescript
// server/src/sources/infrastructure/queue/workers/instagram-fetch.worker.ts

@Processor('source-fetcher')
export class InstagramFetchWorker {
  constructor(
    @Inject('RABBITMQ_CLIENT') private readonly rmqClient: ClientProxy,
    private readonly sourcesRepository: SourcesRepository,
    private readonly postsService: PostsService,
    private readonly cacheService: CacheService,
  ) {}

  @Process('fetch-instagram')
  async processFetch(
    job: Job<SourceFetchJob>
  ): Promise<SourceFetchJobResult> {
    const { sourceId, externalId } = job.data;

    job.log(`[${job.id}] Starting Instagram fetch for ${externalId}`);
    
    // 1. Load pagination state from database
    const source = await this.sourcesRepository.findById(sourceId);
    const cursor = source.metadata?.cursor;
    
    job.updateProgress(10);

    try {
      // 2. Make RPC call to Python via RabbitMQ
      job.log(`[${job.id}] Calling Python worker via RabbitMQ...`);
      
      const result = await firstValueFrom(
        this.rmqClient
          .send<FetchResultMessage, FetchCommandMessage>(
            SourceFetcherEvents.FETCH_INSTAGRAM,
            {
              jobId: job.id as string,
              sourceId,
              sourceType: 'instagram',
              externalId,
              params: {
                cursor,
                limit: 50,
              },
              timestamp: new Date().toISOString(),
            }
          )
          .pipe(
            timeout(300000), // 5 minute timeout
            retry({
              count: 2,
              delay: 5000,
            })
          )
      );

      job.updateProgress(50);

      // 3. Handle result
      if (result.status === 'error') {
        throw new Error(result.error.message);
      }

      job.log(`[${job.id}] Received ${result.data.posts.length} posts`);

      // 4. Process and store posts
      const { newPostsCount } = await this.storePosts(
        sourceId,
        result.data.posts
      );

      job.updateProgress(80);

      // 5. Update cache
      await this.cacheService.setSourcePosts(sourceId, result.data.posts, {
        ttl: 300, // 5 minutes
        cursor: result.data.nextCursor,
      });

      // 6. Update source metadata
      await this.sourcesRepository.update(sourceId, {
        lastFetchedAt: new Date(),
        metadata: {
          cursor: result.data.nextCursor,
          lastFetchSuccess: true,
          lastError: null,
        },
      });

      job.updateProgress(100);
      job.log(`[${job.id}] Completed successfully. ${newPostsCount} new posts`);

      return {
        status: 'success',
        postsCount: result.data.posts.length,
        newPostsCount,
        nextCursor: result.data.nextCursor,
      };

    } catch (error) {
      job.log(`[${job.id}] Error: ${error.message}`);
      
      // Update source with error
      await this.sourcesRepository.update(sourceId, {
        metadata: {
          lastFetchSuccess: false,
          lastError: error.message,
        },
      });

      throw error; // BullMQ will handle retry
    }
  }

  private async storePosts(
    sourceId: string,
    posts: any[]
  ): Promise<{ newPostsCount: number }> {
    let newPostsCount = 0;

    for (const post of posts) {
      const exists = await this.postsService.existsByExternalId(
        post.externalId
      );

      if (!exists) {
        await this.postsService.create({
          sourceId,
          externalId: post.externalId,
          content: post.content,
          mediaUrls: post.mediaUrls,
          publishedAt: new Date(post.publishedAt),
          author: post.author,
        });
        newPostsCount++;
      }
    }

    return { newPostsCount };
  }
}
```

```typescript
// server/src/sources/infrastructure/queue/workers/rss-fetch.worker.ts

@Processor('source-fetcher')
export class RssFetchWorker {
  constructor(
    private readonly rssParser: RssParserService,
    private readonly postsService: PostsService,
  ) {}

  @Process('fetch-rss')
  async processFetch(
    job: Job<SourceFetchJob>
  ): Promise<SourceFetchJobResult> {
    const { sourceId, externalId } = job.data;

    job.log(`[${job.id}] Fetching RSS feed: ${externalId}`);

    try {
      // Native implementation - no RabbitMQ needed
      const feed = await this.rssParser.parseFeed(externalId);
      
      // Store posts
      const { newPostsCount } = await this.storePosts(sourceId, feed.items);

      return {
        status: 'success',
        postsCount: feed.items.length,
        newPostsCount,
      };
    } catch (error) {
      job.log(`[${job.id}] Error: ${error.message}`);
      throw error;
    }
  }
}
```

```typescript
// server/src/sources/infrastructure/queue/types/fetch-messages.type.ts

/**
 * Command message: NestJS → Python
 */
export interface FetchCommandMessage {
  // Job identification
  jobId: string;           // BullMQ job ID
  sourceId: string;        // Database source ID
  sourceType: 'instagram' | 'twitter' | 'rss';
  externalId: string;      // Instagram username, Twitter handle
  
  // Fetch parameters
  params: {
    cursor?: string;       // Pagination cursor
    since?: string;        // ISO date - fetch posts after this
    limit?: number;        // Max posts to fetch
  };
  
  // Metadata
  timestamp: string;       // ISO timestamp
  timeout?: number;        // Max processing time (ms)
}

/**
 * Result message: Python → NestJS
 */
export interface FetchResultMessage {
  // Correlation
  jobId: string;
  sourceId: string;
  
  // Status
  status: 'success' | 'error';
  
  // Success data
  data?: {
    posts: FetchedPost[];
    nextCursor?: string;
    hasMore: boolean;
    metadata?: {
      totalAvailable?: number;
      fetchedCount: number;
      skippedCount?: number;
    };
  };
  
  // Error data
  error?: {
    code: string;
    message: string;
    details?: any;
    retryable?: boolean;  // Can this be retried?
  };
  
  // Metrics
  timestamp: string;
  processingTime: number;  // Milliseconds
}

export interface FetchedPost {
  externalId: string;
  content: string;
  mediaUrls: string[];
  publishedAt: string;     // ISO date
  author: {
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  metrics?: {
    likes?: number;
    comments?: number;
    shares?: number;
  };
}
```

```typescript
// server/src/commons/rabbitmq/rabbitmq.module.ts

@Module({})
export class RabbitmqModule {
  static register(): DynamicModule {
    return {
      module: RabbitmqModule,
      providers: [
        {
          provide: 'RABBITMQ_CLIENT',
          useFactory: (config: ConfigService) => {
            return ClientProxyFactory.create({
              transport: Transport.RMQ,
              options: {
                urls: [config.rabbitmq.url],
                queue: 'fetch.instagram', // Default queue
                queueOptions: {
                  durable: true,
                  arguments: {
                    'x-queue-type': config.rabbitmq.queueType,
                  },
                },
                // Enable RPC (request-response)
                noAck: false,
                persistent: true,
                // Use direct-reply-to for responses
                replyQueue: '',
                socketOptions: {
                  heartbeatIntervalInSeconds: 30,
                  reconnectTimeInSeconds: 5,
                },
              },
            });
          },
          inject: [ConfigService],
        },
      ],
      exports: ['RABBITMQ_CLIENT'],
    };
  }
}
```

```typescript
// server/src/commons/rabbitmq/enums/events.enum.ts

export enum SourceFetcherEvents {
  FETCH_INSTAGRAM = 'fetch.instagram',
  FETCH_TWITTER = 'fetch.twitter',
  FETCH_RSS = 'fetch.rss',
  FETCH_DLQ = 'fetch.dlq',
}
```

```typescript
// server/src/commons/rabbitmq/rabbitmq.topology.ts

export function buildRabbitTopology(config: ConfigService): RabbitSetupConfig {
  const exchangeName = config.rabbitmq.exchangeName; // e.g., 'source.fetcher'
  const queueType = config.rabbitmq.queueType; // 'classic' or 'quorum'

  return {
    exchanges: [
      {
        name: exchangeName,
        type: 'direct',
        durable: true,
      },
    ],
    queues: [
      // Instagram fetch queue
      {
        name: 'fetch.instagram',
        durable: true,
        arguments: {
          'x-queue-type': queueType,
          'x-message-ttl': 600000, // 10 min timeout
          'x-max-length': 5000,
          'x-dead-letter-exchange': exchangeName,
          'x-dead-letter-routing-key': SourceFetcherEvents.FETCH_DLQ,
        },
      },
      
      // Twitter fetch queue
      {
        name: 'fetch.twitter',
        durable: true,
        arguments: {
          'x-queue-type': queueType,
          'x-message-ttl': 600000,
          'x-max-length': 5000,
          'x-dead-letter-exchange': exchangeName,
          'x-dead-letter-routing-key': SourceFetcherEvents.FETCH_DLQ,
        },
      },
      
      // RSS fetch queue (might not need RabbitMQ, but included for consistency)
      {
        name: 'fetch.rss',
        durable: true,
        arguments: {
          'x-queue-type': queueType,
          'x-message-ttl': 300000, // 5 min timeout (RSS is faster)
          'x-max-length': 5000,
          'x-dead-letter-exchange': exchangeName,
          'x-dead-letter-routing-key': SourceFetcherEvents.FETCH_DLQ,
        },
      },
      
      // Dead letter queue for failed jobs
      {
        name: 'fetch.dlq',
        durable: true,
        arguments: {
          'x-queue-type': queueType,
          // No TTL - keep failed messages for debugging
        },
      },
    ],
    bindings: [
      {
        queue: 'fetch.instagram',
        exchange: exchangeName,
        routingKey: SourceFetcherEvents.FETCH_INSTAGRAM,
      },
      {
        queue: 'fetch.twitter',
        exchange: exchangeName,
        routingKey: SourceFetcherEvents.FETCH_TWITTER,
      },
      {
        queue: 'fetch.rss',
        exchange: exchangeName,
        routingKey: SourceFetcherEvents.FETCH_RSS,
      },
      {
        queue: 'fetch.dlq',
        exchange: exchangeName,
        routingKey: SourceFetcherEvents.FETCH_DLQ,
      },
    ],
  };
}
```

```python
# instagram-scrapper/src/queue/rpc_server.py

import pika
import json
import logging
from typing import Dict, Any, Optional
from datetime import datetime
from dataclasses import dataclass, asdict

from ..scraper.instagram_scraper import InstagramScraper
from ..config import settings

logger = logging.getLogger(__name__)


@dataclass
class FetchCommand:
    """Parsed command from NestJS"""
    job_id: str
    source_id: str
    source_type: str
    external_id: str
    cursor: Optional[str] = None
    limit: int = 50
    timestamp: Optional[str] = None


@dataclass
class FetchResult:
    """Result to send back to NestJS"""
    job_id: str
    source_id: str
    status: str  # 'success' or 'error'
    data: Optional[Dict[str, Any]] = None
    error: Optional[Dict[str, Any]] = None
    timestamp: str = None
    processing_time: float = 0.0


class InstagramRPCServer:
    """RPC server for Instagram fetching"""
    
    def __init__(self, rabbitmq_url: str, queue_name: str = 'fetch.instagram'):
        self.rabbitmq_url = rabbitmq_url
        self.queue_name = queue_name
        self.connection = None
        self.channel = None
        self.scraper = InstagramScraper()
        
    def connect(self):
        """Connect to RabbitMQ"""
        logger.info(f"Connecting to RabbitMQ: {self.rabbitmq_url}")
        
        self.connection = pika.BlockingConnection(
            pika.URLParameters(self.rabbitmq_url)
        )
        self.channel = self.connection.channel()
        
        # Set QoS - process one message at a time
        self.channel.basic_qos(prefetch_count=1)
        
        logger.info(f"Connected. Listening on queue: {self.queue_name}")
        
    def start(self):
        """Start consuming messages"""
        if not self.channel:
            self.connect()
            
        self.channel.basic_consume(
            queue=self.queue_name,
            on_message_callback=self.on_request,
            auto_ack=False  # Manual ACK
        )
        
        logger.info('Instagram RPC Server ready. Waiting for requests...')
        
        try:
            self.channel.start_consuming()
        except KeyboardInterrupt:
            logger.info('Interrupted by user')
            self.stop()
            
    def stop(self):
        """Stop and cleanup"""
        if self.connection and not self.connection.is_closed:
            self.connection.close()
        logger.info('Connection closed')
        
    def on_request(self, ch, method, props, body):
        """Handle incoming RPC request"""
        start_time = datetime.now()
        command = None
        
        try:
            # 1. Parse command
            raw_command = json.loads(body)
            command = FetchCommand(
                job_id=raw_command['jobId'],
                source_id=raw_command['sourceId'],
                source_type=raw_command['sourceType'],
                external_id=raw_command['externalId'],
                cursor=raw_command['params'].get('cursor'),
                limit=raw_command['params'].get('limit', 50),
                timestamp=raw_command.get('timestamp'),
            )
            
            logger.info(f"Processing request {command.job_id} for {command.external_id}")
            
            # 2. Fetch posts
            fetch_result = self.scraper.fetch_posts(
                username=command.external_id,
                cursor=command.cursor,
                limit=command.limit
            )
            
            # 3. Calculate processing time
            processing_time = (datetime.now() - start_time).total_seconds() * 1000
            
            # 4. Build success response
            result = FetchResult(
                job_id=command.job_id,
                source_id=command.source_id,
                status='success',
                data=fetch_result,
                timestamp=datetime.now().isoformat(),
                processing_time=processing_time
            )
            
            logger.info(
                f"Request {command.job_id} completed successfully. "
                f"Fetched {len(fetch_result['posts'])} posts in {processing_time:.0f}ms"
            )
            
        except Exception as e:
            # Handle error
            processing_time = (datetime.now() - start_time).total_seconds() * 1000
            
            logger.error(f"Request {command.job_id if command else 'unknown'} failed: {e}", exc_info=True)
            
            result = FetchResult(
                job_id=command.job_id if command else 'unknown',
                source_id=command.source_id if command else 'unknown',
                status='error',
                error={
                    'code': self._get_error_code(e),
                    'message': str(e),
                    'details': {
                        'type': type(e).__name__,
                    },
                    'retryable': self._is_retryable(e),
                },
                timestamp=datetime.now().isoformat(),
                processing_time=processing_time
            )
        
        finally:
            # 5. Send response back via RPC
            self._send_response(ch, props, result)
            
            # 6. Acknowledge message
            ch.basic_ack(delivery_tag=method.delivery_tag)
            
    def _send_response(self, ch, props, result: FetchResult):
        """Send RPC response"""
        ch.basic_publish(
            exchange='',
            routing_key=props.reply_to,
            properties=pika.BasicProperties(
                correlation_id=props.correlation_id,
                content_type='application/json',
                delivery_mode=2,  # Persistent
            ),
            body=json.dumps(asdict(result))
        )
        
    def _get_error_code(self, error: Exception) -> str:
        """Map exception to error code"""
        error_type = type(error).__name__
        
        error_map = {
            'ConnectionError': 'NETWORK_ERROR',
            'TimeoutError': 'TIMEOUT_ERROR',
            'LoginRequired': 'AUTH_ERROR',
            'PrivateProfileNotAllowed': 'PRIVATE_PROFILE',
            'ProfileNotFound': 'NOT_FOUND',
        }
        
        return error_map.get(error_type, 'UNKNOWN_ERROR')
        
    def _is_retryable(self, error: Exception) -> bool:
        """Determine if error is retryable"""
        retryable_errors = (
            'ConnectionError',
            'TimeoutError',
            'TemporaryServerError',
        )
        return type(error).__name__ in retryable_errors


# Entry point
if __name__ == '__main__':
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    server = InstagramRPCServer(
        rabbitmq_url=settings.rabbitmq_url,
        queue_name='fetch.instagram'
    )
    
    server.start()
```

```python
# instagram-scrapper/src/scraper/instagram_scraper.py

from typing import Dict, List, Any, Optional
from datetime import datetime
import instaloader

class InstagramScraper:
    """Instagram posts scraper"""
    
    def __init__(self):
        self.loader = instaloader.Instaloader(
            download_pictures=False,
            download_videos=False,
            download_video_thumbnails=False,
            download_geotags=False,
            download_comments=False,
            save_metadata=False,
            compress_json=False,
        )
        
    def fetch_posts(
        self,
        username: str,
        cursor: Optional[str] = None,
        limit: int = 50
    ) -> Dict[str, Any]:
        """
        Fetch posts for an Instagram user
        
        Returns:
            {
                'posts': [...],
                'nextCursor': '...',
                'hasMore': True/False,
                'metadata': {...}
            }
        """
        try:
            # Get profile
            profile = instaloader.Profile.from_username(
                self.loader.context,
                username
            )
            
            posts = []
            post_iterator = profile.get_posts()
            
            # Skip to cursor if provided
            if cursor:
                # Implement cursor-based pagination
                # This depends on your cursor format
                pass
            
            # Fetch posts
            count = 0
            last_post_id = None
            
            for post in post_iterator:
                if count >= limit:
                    break
                    
                posts.append(self._serialize_post(post))
                last_post_id = post.shortcode
                count += 1
            
            has_more = count == limit
            
            return {
                'posts': posts,
                'nextCursor': last_post_id if has_more else None,
                'hasMore': has_more,
                'metadata': {
                    'totalAvailable': profile.mediacount,
                    'fetchedCount': len(posts),
                    'skippedCount': 0,
                }
            }
            
        except instaloader.exceptions.ProfileNotExistsException:
            raise ProfileNotFound(f"Profile {username} not found")
        except instaloader.exceptions.PrivateProfileNotAllowedException:
            raise PrivateProfileNotAllowed(f"Profile {username} is private")
        except Exception as e:
            raise FetchError(f"Failed to fetch posts: {e}")
    
    def _serialize_post(self, post) -> Dict[str, Any]:
        """Convert Instaloader Post to our format"""
        return {
            'externalId': post.shortcode,
            'content': post.caption or '',
            'mediaUrls': [post.url] if not post.is_video else [post.video_url],
            'publishedAt': post.date_utc.isoformat(),
            'author': {
                'username': post.owner_username,
                'displayName': post.owner_profile.full_name or post.owner_username,
                'avatarUrl': post.owner_profile.profile_pic_url,
            },
            'metrics': {
                'likes': post.likes,
                'comments': post.comments,
                'shares': None,  # Instagram doesn't expose shares
            }
        }


# Custom exceptions
class ProfileNotFound(Exception):
    pass

class PrivateProfileNotAllowed(Exception):
    pass

class FetchError(Exception):
    pass
```

```python
# instagram-scrapper/src/config.py

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # RabbitMQ
    rabbitmq_url: str = "amqp://guest:guest@localhost:5672/"
    rabbitmq_exchange: str = "source.fetcher"
    
    # Instagram
    instagram_username: str = ""
    instagram_password: str = ""
    
    # Logging
    log_level: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
```

```plaintext
1. User Action (Web → NestJS)
   POST /api/sources/follow
   {
     "type": "instagram",
     "username": "nasa"
   }

2. NestJS creates source in DB
   - sourceId: "uuid-123"
   - type: "instagram"
   - externalId: "nasa"
   - followers: [userId]

3. Priority Calculator runs (cron every 5 min)
   - Finds source "nasa" has 1 active follower
   - Priority: 7
   - Interval: 2 hours
   - Adds BullMQ job

4. BullMQ schedules job
   Queue: "source-fetcher"
   Job: {
     name: "fetch-instagram",
     data: {
       sourceId: "uuid-123",
       sourceType: "instagram",
       externalId: "nasa",
       cursor: null
     },
     opts: {
       priority: 7,
       repeat: { every: 7200000 } // 2 hours
     }
   }

5. Instagram Worker picks up job (immediately, then every 2h)
   - Loads source metadata (cursor)
   - Makes RPC call via RabbitMQ

6. RabbitMQ routes message
   Exchange: "source.fetcher"
   Routing Key: "fetch.instagram"
   Queue: "fetch.instagram"
   Message: {
     jobId: "bullmq-job-123",
     sourceId: "uuid-123",
     sourceType: "instagram",
     externalId: "nasa",
     params: { cursor: null, limit: 50 }
   }

7. Python Worker #1 picks up message
   - Fetches posts from Instagram
   - Processes ~10 seconds
   - Replies via props.reply_to with correlation_id

8. RabbitMQ delivers response back to NestJS worker
   Message: {
     jobId: "bullmq-job-123",
     sourceId: "uuid-123",
     status: "success",
     data: {
       posts: [...50 posts...],
       nextCursor: "abc123",
       hasMore: true
     },
     processingTime: 10234
   }

9. Instagram Worker processes result
   - Stores 50 posts in DB (only new ones)
   - Updates cache in Redis
   - Updates source metadata (cursor, lastFetchedAt)
   - Marks BullMQ job as complete

10. User refreshes feed
    - Reads from cache (fast!)
    - Cache TTL: 5 minutes
    - If expired, trigger immediate fetch (add BullMQ job with high priority)
```

```shellscript
# Install bull-board
npm install @bull-board/api @bull-board/nestjs
```

```typescript
// server/src/queue/queue-dashboard.module.ts

@Module({})
export class QueueDashboardModule {
  static register(): DynamicModule {
    return {
      module: QueueDashboardModule,
      imports: [
        BullBoardModule.forRoot({
          route: '/admin/queues',
          adapter: ExpressAdapter,
        }),
        BullBoardModule.forFeature({
          name: 'source-fetcher',
          adapter: BullMQAdapter,
        }),
      ],
    };
  }
}

// Access at: http://localhost:3000/admin/queues
```

```typescript
// server/src/sources/infrastructure/queue/metrics.service.ts

@Injectable()
export class QueueMetricsService {
  constructor(
    @InjectQueue('source-fetcher') private readonly queue: Queue,
  ) {}

  @Cron('*/1 * * * *') // Every minute
  async collectMetrics(): Promise<void> {
    const counts = await this.queue.getJobCounts();
    
    // Send to monitoring system (Prometheus, Datadog, etc.)
    this.metricsService.gauge('queue.waiting', counts.waiting);
    this.metricsService.gauge('queue.active', counts.active);
    this.metricsService.gauge('queue.completed', counts.completed);
    this.metricsService.gauge('queue.failed', counts.failed);
    this.metricsService.gauge('queue.delayed', counts.delayed);
  }
}
```

