# Source Fetching System

## Overview

The Source Fetching System is an intelligent content aggregation architecture that efficiently collects posts from various social media platforms (Instagram, Twitter, RSS feeds) and delivers them to users in real-time.

### Key Principles

1. **Efficiency First**: Fetch each source only once, regardless of how many users follow it
2. **Smart Prioritization**: Popular sources are updated more frequently than unpopular ones
3. **Resource Optimization**: Inactive sources are not fetched, saving computing resources
4. **Real-time Delivery**: Users see fresh content within minutes of it being posted
5. **Reliability**: Failed fetches are automatically retried without user intervention

---

## System Architecture

```mermaid
graph TB
    subgraph "User Layer"
        U1[User 1<br/>Follows: NASA, SpaceX]
        U2[User 2<br/>Follows: NASA, Tesla]
        U3[User 3<br/>Follows: SpaceX]
    end

    subgraph "Intelligence Layer"
        PC[Priority Calculator<br/>Runs every 5 minutes]
        PC --> |Analyzes| DB[(Database<br/>Users & Sources)]
        PC --> |Calculates| CALC{How many active<br/>users follow<br/>this source?}
    end

    subgraph "Scheduling Layer"
        CALC --> |100+ users| P1[High Priority<br/>Fetch every 3 minutes]
        CALC --> |10-99 users| P2[Medium Priority<br/>Fetch every 15 minutes]
        CALC --> |1-9 users| P3[Low Priority<br/>Fetch every 2 hours]
        CALC --> |0 users| P4[Paused<br/>Don't fetch]
        
        P1 & P2 & P3 --> QUEUE[Job Queue]
    end

    subgraph "Execution Layer"
        QUEUE --> W1[Worker 1<br/>Processes Instagram]
        QUEUE --> W2[Worker 2<br/>Processes Twitter]
        QUEUE --> W3[Worker 3<br/>Processes RSS]
        
        W1 --> PY1[Python Script<br/>Instagram Scraper]
        W2 --> PY2[Python Script<br/>Twitter Scraper]
    end

    subgraph "Storage Layer"
        W1 & W2 & W3 --> CACHE[Cache<br/>5 min TTL]
        W1 & W2 & W3 --> DB2[(Database<br/>Permanent Storage)]
    end

    subgraph "Delivery Layer"
        CACHE --> FEED[User Feed API]
        DB2 --> FEED
        FEED --> U1 & U2 & U3
    end

    style PC fill:#e1f5ff
    style QUEUE fill:#fff4e1
    style CACHE fill:#e8f5e9
    style DB fill:#f3e5f5
    style DB2 fill:#f3e5f5
```

---

## Business Flow

### 1. Source Discovery & Prioritization

**What happens:**
Every 5 minutes, the system analyzes all sources and determines which ones need to be fetched.

**Decision Logic:**

```mermaid
flowchart TD
    START([Priority Calculator Runs]) --> COUNT[Count Active Users<br/>per Source]
    COUNT --> CHECK{How many<br/>active users?}
    
    CHECK -->|100+ users| SET1[Priority: HIGHEST<br/>Frequency: Every 3 min<br/>Example: NASA, BBC]
    CHECK -->|50-99 users| SET2[Priority: HIGH<br/>Frequency: Every 5 min<br/>Example: TechCrunch]
    CHECK -->|20-49 users| SET3[Priority: MEDIUM<br/>Frequency: Every 10 min<br/>Example: Local News]
    CHECK -->|10-19 users| SET4[Priority: MEDIUM-LOW<br/>Frequency: Every 15 min<br/>Example: Niche Blogs]
    CHECK -->|5-9 users| SET5[Priority: LOW<br/>Frequency: Every 30 min<br/>Example: Small Creators]
    CHECK -->|2-4 users| SET6[Priority: VERY LOW<br/>Frequency: Every 1 hour<br/>Example: Personal Accounts]
    CHECK -->|1 user| SET7[Priority: MINIMAL<br/>Frequency: Every 2 hours]
    CHECK -->|0 users| SET8[Status: PAUSED<br/>No fetching]
    
    SET1 & SET2 & SET3 & SET4 & SET5 & SET6 & SET7 --> SCHEDULE[Schedule in Job Queue]
    SET8 --> REMOVE[Remove from Queue]
    
    SCHEDULE --> END([Repeat in 5 minutes])
    REMOVE --> END

    style SET1 fill:#ff6b6b
    style SET2 fill:#ff9f43
    style SET3 fill:#ffd93d
    style SET4 fill:#a8e6cf
    style SET5 fill:#87ceeb
    style SET6 fill:#b4a7d6
    style SET7 fill:#d3d3d3
    style SET8 fill:#f0f0f0
```

**Active User Definition:**
A user is considered "active" if they have logged in or viewed their feed within the last 24 hours.

---

### 2. Content Fetching Process

**What happens:**
When it's time to fetch a source, the system retrieves the latest posts and stores them.

```mermaid
sequenceDiagram
    participant Clock as System Clock
    participant Queue as Job Queue
    participant Worker as Fetch Worker
    participant External as External Service<br/>(Instagram, Twitter, etc.)
    participant DB as Database
    participant Cache as Cache<br/>(5 min TTL)
    participant User as User

    Note over Clock,Queue: Every 3-120 minutes<br/>(depending on priority)
    Clock->>Queue: Time to fetch NASA's Instagram
    Queue->>Worker: Execute fetch job
    
    Worker->>DB: Get last cursor position<br/>(where we left off)
    DB-->>Worker: Cursor: "post_12345"
    
    Worker->>External: Fetch new posts since cursor
    Note over External: Takes 5-30 seconds
    External-->>Worker: 50 new posts
    
    Worker->>Worker: Filter: Keep only new posts<br/>(skip already stored)
    
    Worker->>DB: Store 23 new posts<br/>(27 were duplicates)
    Worker->>Cache: Update cached feed<br/>(expires in 5 min)
    Worker->>DB: Update cursor: "post_67890"
    
    User->>Cache: Request feed
    Cache-->>User: Fresh posts (instant!)
    
    Note over Queue,Worker: Job complete.<br/>Schedule next fetch based on priority.
```

**Deduplication Logic:**
- Each post has a unique external ID (e.g., Instagram post ID)
- Before storing, check if post already exists
- Only store new posts to avoid duplicates
- Update cursor to remember where we stopped

---

### 3. Smart Caching Strategy

**What happens:**
Recently fetched posts are stored in a fast cache to provide instant access to users.

```mermaid
graph LR
    subgraph "User Request Flow"
        U[User opens feed] --> CHECK{Is data<br/>in cache?}
        
        CHECK -->|Yes, < 5 min old| C1[Return from Cache<br/>⚡ Instant response]
        CHECK -->|No or expired| C2[Read from Database<br/>🔄 Slightly slower]
        
        C2 --> TRIGGER{Should we<br/>fetch now?}
        TRIGGER -->|Last fetch > 10 min| URGENT[Trigger urgent fetch<br/>High priority job]
        TRIGGER -->|Last fetch < 10 min| WAIT[Wait for scheduled fetch]
    end

    subgraph "Background Fetch"
        URGENT --> BG[Background Worker]
        BG --> UPDATE[Fetch new posts]
        UPDATE --> STORE[Update cache & DB]
    end

    style C1 fill:#a8e6cf
    style C2 fill:#ffd93d
    style URGENT fill:#ff6b6b
    style WAIT fill:#87ceeb
```

**Cache Benefits:**
- **Speed**: Cache responses are 10-100x faster than database queries
- **Reduced Load**: Popular sources read from cache by many users
- **Fresh Data**: 5-minute TTL ensures data doesn't get too stale
- **Fallback**: If cache fails, database is always available

---

### 4. Error Handling & Reliability

**What happens when something goes wrong:**

```mermaid
flowchart TD
    START([Fetch Job Starts]) --> ATTEMPT1[Attempt 1:<br/>Try to fetch posts]
    
    ATTEMPT1 --> CHECK1{Success?}
    CHECK1 -->|Yes ✓| STORE[Store posts<br/>Update cache]
    CHECK1 -->|No ✗| ERROR1[Error occurred]
    
    ERROR1 --> CLASSIFY{Error Type?}
    
    CLASSIFY -->|Network timeout<br/>Rate limit<br/>Temporary issue| RETRY1[Wait 5 seconds]
    CLASSIFY -->|Invalid credentials<br/>Account suspended<br/>Permanent issue| ALERT[Alert administrators]
    
    RETRY1 --> ATTEMPT2[Attempt 2:<br/>Try again]
    ATTEMPT2 --> CHECK2{Success?}
    CHECK2 -->|Yes ✓| STORE
    CHECK2 -->|No ✗| WAIT2[Wait 15 seconds]
    
    WAIT2 --> ATTEMPT3[Attempt 3:<br/>Final attempt]
    ATTEMPT3 --> CHECK3{Success?}
    CHECK3 -->|Yes ✓| STORE
    CHECK3 -->|No ✗| FAIL[Mark as failed<br/>Send to Dead Letter Queue]
    
    STORE --> SCHEDULE[Schedule next fetch]
    ALERT --> MANUAL[Manual investigation required]
    FAIL --> MANUAL
    
    SCHEDULE --> END([Complete])
    MANUAL --> END

    style STORE fill:#a8e6cf
    style ALERT fill:#ff6b6b
    style FAIL fill:#ff9f43
    style RETRY1 fill:#ffd93d
    style WAIT2 fill:#ffd93d
```

**Error Categories:**

| Error Type | Retryable? | Action |
|------------|------------|--------|
| Network timeout | ✅ Yes | Retry with exponential backoff |
| Rate limit exceeded | ✅ Yes | Wait and retry after specified time |
| Authentication failed | ❌ No | Alert admin, pause source |
| Account not found | ❌ No | Mark source as invalid |
| Private account | ❌ No | Notify user, pause fetching |
| Server error (5xx) | ✅ Yes | Retry up to 3 times |

---

## User-Facing Scenarios

### Scenario 1: New User Follows Popular Source

```mermaid
sequenceDiagram
    participant User
    participant System
    participant Queue
    participant NASA as NASA Instagram<br/>(100+ followers)

    User->>System: Follow NASA
    System->>System: Add to user's sources
    Note over System: NASA already being fetched<br/>every 3 minutes
    System-->>User: Followed successfully
    
    User->>System: View feed
    System->>System: Check cache
    Note over System: Cache hit!<br/>NASA fetched 2 min ago
    System-->>User: Show NASA posts (instant)
    
    Note over Queue,NASA: 1 minute later<br/>(3 min since last fetch)
    Queue->>NASA: Fetch new posts
    NASA-->>Queue: 5 new posts
    Queue->>System: Update cache & database
    
    User->>System: Refresh feed
    System-->>User: Show 5 new NASA posts
```

**Key Points:**
- User sees existing posts immediately (from cache)
- No additional fetch triggered (NASA already on schedule)
- New posts appear within 3 minutes
- Cost: 1 fetch serves 100+ users

---

### Scenario 2: New User Follows Niche Source

```mermaid
sequenceDiagram
    participant User
    participant System
    participant Priority as Priority Calculator
    participant Queue
    participant Niche as Small Blog<br/>(0 followers → 1 follower)

    User->>System: Follow "TechBlog123"
    System->>System: Add to user's sources
    System-->>User: Followed successfully
    
    Note over Priority: 3 minutes later<br/>(next calculation cycle)
    Priority->>System: Analyze sources
    Priority->>Priority: TechBlog123: 1 active follower
    Priority->>Queue: Schedule job<br/>Priority: LOW<br/>Frequency: Every 2 hours
    
    Queue->>Niche: Fetch posts (first time)
    Niche-->>Queue: 20 posts
    Queue->>System: Store posts & cache
    
    User->>System: View feed
    System-->>User: Show TechBlog123 posts
    
    Note over Queue,Niche: 2 hours later
    Queue->>Niche: Fetch new posts
```

**Key Points:**
- First fetch happens within 5 minutes of following
- Subsequent fetches every 2 hours (low priority)
- If user stops viewing feed, priority drops further
- If user unfollows, fetching stops completely

---

### Scenario 3: Source Gains Popularity

```mermaid
graph TD
    START[TechBlog123<br/>1 follower] --> F1[User 2 follows]
    F1 --> STATE1[2 followers<br/>Fetch every 1 hour]
    
    STATE1 --> F2[3 more users follow]
    F2 --> STATE2[5 followers<br/>Fetch every 30 minutes]
    
    STATE2 --> F3[5 more users follow]
    F3 --> STATE3[10 followers<br/>Fetch every 15 minutes]
    
    STATE3 --> F4[10 more users follow]
    F4 --> STATE4[20 followers<br/>Fetch every 10 minutes]
    
    STATE4 --> F5[80 more users follow]
    F5 --> STATE5[100+ followers<br/>Fetch every 3 minutes]

    style START fill:#d3d3d3
    style STATE1 fill:#b4a7d6
    style STATE2 fill:#87ceeb
    style STATE3 fill:#a8e6cf
    style STATE4 fill:#ffd93d
    style STATE5 fill:#ff6b6b
```

**Automatic Adaptation:**
The system automatically adjusts fetch frequency as popularity changes, without any manual intervention.

---

## Business Benefits

### 1. Cost Efficiency

**Traditional Approach:**
```
100 users follow NASA
Each user requests feed every 5 minutes
= 100 fetches × 12 times/hour = 1,200 fetches/hour
```

**Our Approach:**
```
100 users follow NASA
System fetches NASA once every 3 minutes
= 1 fetch × 20 times/hour = 20 fetches/hour
```

**Savings: 98.3% reduction in API calls**

### 2. Resource Allocation

```mermaid
pie title Computing Resources Distribution
    "Popular sources (10+ followers)" : 70
    "Medium sources (3-9 followers)" : 20
    "Niche sources (1-2 followers)" : 8
    "Inactive sources (0 followers)" : 0
    "Error handling & retries" : 2
```

**Smart Resource Allocation:**
- 70% of resources go to sources that serve the most users
- 0% wasted on sources nobody follows
- Automatic rebalancing as user behavior changes

### 3. User Experience

| Metric | Value | Notes |
|--------|-------|-------|
| **Average Feed Load Time** | < 100ms | Thanks to caching |
| **Content Freshness** | 3-120 min | Based on source popularity |
| **Feed Availability** | 99.9% | Multiple retry mechanisms |
| **New Post Delay** | 3-120 min | Popular sources update fastest |

### 4. Scalability

```mermaid
graph LR
    subgraph "Current Scale"
        U1[1,000 users]
        S1[500 sources]
        F1[~1,000 fetches/hour]
    end
    
    subgraph "10x Growth"
        U2[10,000 users]
        S2[2,000 sources]
        F2[~3,000 fetches/hour<br/>Only 3x increase!]
    end
    
    subgraph "100x Growth"
        U3[100,000 users]
        S3[10,000 sources]
        F3[~15,000 fetches/hour<br/>Only 15x increase!]
    end
    
    U1 --> U2 --> U3
    S1 --> S2 --> S3
    F1 --> F2 --> F3

    style F1 fill:#a8e6cf
    style F2 fill:#ffd93d
    style F3 fill:#ff9f43
```

**Why Sub-Linear Scaling?**
- Multiple users share the same sources
- Popular sources (most users) are fetched once
- Only unique niche sources add fetch cost

---

## Operational Metrics

### Key Performance Indicators

```mermaid
graph TB
    subgraph "Efficiency Metrics"
        M1[Fetch Deduplication Rate:<br/>How many users share fetches?]
        M2[Cache Hit Rate:<br/>% of requests served from cache]
        M3[Resource Utilization:<br/>Computing power used vs. available]
    end
    
    subgraph "Quality Metrics"
        M4[Fetch Success Rate:<br/>% of successful fetches]
        M5[Average Post Freshness:<br/>Time from post creation to delivery]
        M6[Error Recovery Time:<br/>Time to recover from failures]
    end
    
    subgraph "Business Metrics"
        M7[API Cost per User:<br/>External API charges / active users]
        M8[Feed Load Performance:<br/>Average time to load user feed]
        M9[User Engagement:<br/>Feed views and refresh rate]
    end

    style M1 fill:#e1f5ff
    style M2 fill:#e1f5ff
    style M3 fill:#e1f5ff
    style M4 fill:#fff4e1
    style M5 fill:#fff4e1
    style M6 fill:#fff4e1
    style M7 fill:#e8f5e9
    style M8 fill:#e8f5e9
    style M9 fill:#e8f5e9
```

**Target Values:**
- Fetch Deduplication Rate: > 80%
- Cache Hit Rate: > 90%
- Fetch Success Rate: > 98%
- Average Post Freshness: < 10 minutes (popular sources)
- Feed Load Time: < 200ms
- API Cost per User: < $0.01/month

---

## Priority Adjustment Examples

### Real-World Example: Daily Patterns

```mermaid
gantt
    title NASA Instagram - Daily Fetch Frequency
    dateFormat HH:mm
    axisFormat %H:%M
    
    section Night (Low Activity)
    Low Priority (Every 2h) :00:00, 06:00
    
    section Morning (Rising)
    Medium Priority (Every 30m) :06:00, 09:00
    
    section Peak Hours
    High Priority (Every 5m) :09:00, 18:00
    
    section Evening (Declining)
    Medium Priority (Every 30m) :18:00, 22:00
    
    section Night (Low Activity)
    Low Priority (Every 2h) :22:00, 24:00
```

**Adaptive Behavior:**
- System detects user activity patterns
- Adjusts fetch frequency throughout the day
- Saves resources during low-activity periods
- Ensures freshness during peak hours

---

## Failure Recovery Example

### Real Scenario: Instagram API Rate Limit

```mermaid
sequenceDiagram
    participant Queue as Job Queue
    participant Worker as Fetch Worker
    participant Insta as Instagram API
    participant Monitor as Monitoring System
    participant Admin as Administrator

    Queue->>Worker: Fetch popular_account
    Worker->>Insta: Request posts
    Insta-->>Worker: Error 429: Rate Limit Exceeded<br/>Retry after 15 minutes
    
    Worker->>Worker: Mark as retriable error
    Worker->>Queue: Requeue with 15-min delay
    Worker->>Monitor: Log rate limit event
    
    Note over Worker,Monitor: If rate limits persist...
    Monitor->>Monitor: Detect pattern:<br/>5+ rate limits in 1 hour
    Monitor->>Admin: Alert: Instagram rate limiting
    
    Note over Queue,Worker: 15 minutes later
    Queue->>Worker: Retry fetch
    Worker->>Insta: Request posts
    Insta-->>Worker: Success: 50 posts
    Worker->>Queue: Store posts, mark success
    Worker->>Monitor: Log successful recovery
```

**Self-Healing:**
- Automatic retry with appropriate delays
- No user impact (cache serves stale data)
- Administrator alerted only if issue persists
- System learns optimal retry timing

---

## Summary

The Source Fetching System is designed to:

✅ **Maximize Efficiency**: One fetch serves many users  
✅ **Optimize Resources**: Focus on popular sources  
✅ **Ensure Freshness**: Frequent updates for active sources  
✅ **Guarantee Reliability**: Automatic error recovery  
✅ **Scale Effortlessly**: Sub-linear growth with user base  
✅ **Minimize Costs**: Reduced external API calls  
✅ **Deliver Speed**: Cache-first architecture  

### Business Value Proposition

| Traditional Approach | Our System | Improvement |
|---------------------|------------|-------------|
| Fetch on every user request | Shared, scheduled fetching | **98% fewer API calls** |
| Fixed update frequency | Dynamic prioritization | **Better resource usage** |
| User waits for fetch | Instant from cache | **10-100x faster** |
| Manual scaling needed | Auto-adjusts to demand | **Zero-touch scaling** |
| No deduplication | Smart deduplication | **Sub-linear cost growth** |

---

## Next Steps

1. **Monitoring Dashboard**: View real-time fetch status and metrics
2. **Admin Panel**: Manually trigger fetches or adjust priorities
3. **User Settings**: Let users boost priority for favorite sources
4. **Analytics**: Track which sources drive most engagement
5. **Cost Optimization**: Identify expensive sources and optimize fetch strategy

