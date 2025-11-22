# Source Fetching & Validation Logic Review

## Current Architecture Overview

### Flow Diagram
```
Priority Calculator (Cron: every 5 min)
    ↓
Orchestrator Queue (source-fetcher-orchestrator)
    ↓
Orchestrator Processor (routes & enriches)
    ↓
    ├─→ Instagram Queue → Instagram Processor (NestJS)
    ├─→ Telegram Queue → Telegram Processor (NestJS)
    ├─→ Twitter Queue → Twitter Processor (NestJS)
    └─→ RSS Queue → RSS Processor (NestJS)

Then processors add result jobs in results queue

Results Queue (fetch-results)
    ↓
Result Processor → Sources Result Service
    ↓
    ├─→ Store posts (RawPostsService)
    ├─→ Update cache (Redis)
    └─→ Update source metadata
```

## Issues Identified

### 1. **Overcomplicated Collector Strategy Pattern**

**Current State:**
- Two-level factory pattern:
  - `SourceCollectorsFactory` → `ApiSourceCollectorStrategy` → `AvailableApiSourceCollectorsFactory` → `TelegramApiSourceCollectorStrategy`
  - `SourceCollectorsFactory` → `RssSourceCollectorStrategy` (throws `NotImplementedException`)
  - `SourceCollectorsFactory` → `ScraperSourceCollectorStrategy` (throws `NotImplementedException`)

**Problem:**
- Unnecessary abstraction layers for simple routing
- RSS and Scraper collectors are not implemented but still registered
- Makes code harder to understand and maintain

### 2. **Mismatch Between Processors and Collectors**

**Current State:**
- **Instagram Processor** exists in NestJS, but Instagram uses `Collector.SCRAPER` (likely external Python script)
- **Twitter Processor** exists in NestJS, but Twitter is not even routed in orchestrator
- **RSS Processor** exists in NestJS, but `RssSourceCollectorStrategy` throws `NotImplementedException`
- **Telegram Processor** exists and works correctly (uses `Collector.API`)

**Problem:**
- Processors exist for collectors that aren't actually implemented in NestJS
- Instagram and RSS likely use external Python scripts, but NestJS processors try to use them
- Creates confusion about what actually runs where

### 3. **Synchronous Collector Service Dependency**

**Current State:**
- `SourcesCollectorQueueService.processCollectorJob()` calls `SourcesCollectorService.collect(source)` synchronously
- `SourcesCollectorService` uses factory pattern to find and execute collector strategies
- This creates a synchronous dependency on collectors that might be external scripts

**Problem:**
- Violates the goal of "interact with source fetching logic only through asynchronous jobs"
- If Instagram/RSS use external Python scripts, they can't be called synchronously from NestJS
- Makes it impossible to have external processors that consume jobs independently

### 4. **Validation Logic Issues**

**Current State:**
- `SourcesValidationService.processValidationJob()` calls `SourcesCollectorService.collect(source)` directly
- This means validation requires all collectors to be available synchronously

**Problem:**
- Validation can't work for external collectors (Instagram, RSS) if they're Python scripts
- Creates tight coupling between validation and collection logic
- Should post a job and wait for result instead

### 5. **Unused/Incomplete Code**

**Current State:**
- Twitter queue and processor exist but Twitter is not routed in orchestrator
- RSS and Scraper collectors throw `NotImplementedException`
- Multiple collector strategies registered but not all are used

**Problem:**
- Dead code that adds complexity
- Unclear what's actually supposed to work

## Recommended Architecture

### Goal
**Interact with source fetching logic only through asynchronous jobs. NestJS should only contain collectors used by NestJS processors (like Telegram).**

### Proposed Flow
```
Priority Calculator (Cron: every 5 min)
    ↓
Orchestrator Queue (source-fetcher-orchestrator)
    ↓
Orchestrator Processor (routes & enriches)
    ↓
    ├─→ Instagram Queue → External Python Script (consumes job, posts result)
    ├─→ Telegram Queue → Telegram Processor (NestJS) → Posts result job
    ├─→ Twitter Queue → External Script (if needed)
    └─→ RSS Queue → External Script (consumes job, posts result)

All processors (NestJS or external) post result jobs to:
    ↓
Results Queue (fetch-results)
    ↓
Result Processor → Sources Result Service
    ↓
    ├─→ Store posts (RawPostsService)
    ├─→ Update cache (Redis)
    └─→ Update source metadata
```

## Recommendations

### 1. **Simplify Collector Architecture**

**Remove:**
- `SourcesCollectorService` (synchronous service)
- `SourceCollectorsFactory` (unnecessary abstraction)
- `RssSourceCollectorStrategy` (not implemented, likely external)
- `ScraperSourceCollectorStrategy` (not implemented, likely external)
- `ApiSourceCollectorStrategy` wrapper (unnecessary layer)
- `AvailableApiSourceCollectorsFactory` (unnecessary abstraction)

**Keep:**
- `TelegramCollectorProcessor` - directly implements Telegram collection logic
- `TelegramApiSourceCollectorStrategy` - can be moved into processor or kept as simple service

### 2. **Refactor Collector Processors**

**For NestJS Processors (Telegram):**
- Remove dependency on `SourcesCollectorQueueService`
- Implement collection logic directly in processor
- Post result job directly to results queue

**For External Processors (Instagram, RSS):**
- Remove NestJS processors (they're not actually used)
- External scripts consume jobs from queues directly
- External scripts post result jobs to results queue

### 3. **Fix Validation Logic**

**Current:** Validation calls collector service synchronously

**Proposed:**
- Post a validation job to the appropriate collector queue
- Wait for result job in results queue
- Check if result is successful
- Update source status accordingly

**Alternative (Simpler):**
- For validation, post a job to collector queue with `limit: 1`
- Validation processor listens to results queue
- When result arrives, check if it's for validation job
- Mark source as validated or failed

### 4. **Clean Up Unused Code**

**Remove:**
- `TwitterCollectorProcessor` (not routed in orchestrator)
- `InstagramCollectorProcessor` (if Instagram is external Python script)
- `RssCollectorProcessor` (if RSS is external script)
- All collector strategy classes except Telegram
- Factory classes

**Keep:**
- `TelegramCollectorProcessor` (only NestJS collector)
- Queue definitions (external scripts need them)
- Result processor (handles all results)

### 5. **Update Orchestrator**

**Current:** Routes to queues that have NestJS processors

**Proposed:**
- Keep routing logic (external scripts consume from same queues)
- Remove assumption that processors are NestJS
- Document which queues are handled by external scripts

## Implementation Plan

### Phase 1: Simplify Telegram Collector
1. Move Telegram collection logic directly into `TelegramCollectorProcessor`
2. Remove dependency on `SourcesCollectorQueueService`
3. Processor posts result job directly to results queue

### Phase 2: Remove Unused Collectors
1. Remove `InstagramCollectorProcessor` (if external)
2. Remove `RssCollectorProcessor` (if external)
3. Remove `TwitterCollectorProcessor` (not used)
4. Remove all collector strategy classes
5. Remove factory classes
6. Remove `SourcesCollectorService`

### Phase 3: Fix Validation
1. Update validation to post job to collector queue
2. Add validation result tracking
3. Update validation processor to handle async results

### Phase 4: Documentation
1. Document which collectors are NestJS vs external
2. Document queue contracts for external scripts
3. Update architecture diagrams

## Questions to Clarify

1. **Instagram**: Is it handled by external Python script or NestJS?
   - If external: Remove `InstagramCollectorProcessor`
   - If NestJS: Implement `ScraperSourceCollectorStrategy` properly

2. **RSS**: Is it handled by external script or NestJS?
   - If external: Remove `RssCollectorProcessor`
   - If NestJS: Implement `RssSourceCollectorStrategy` properly

3. **Twitter**: Is it needed at all?
   - If not: Remove `TwitterCollectorProcessor` and queue
   - If yes: Clarify how it should work

4. **Validation**: Should it be synchronous or async?
   - Current: Synchronous (calls collector directly)
   - Proposed: Async (posts job, waits for result)

## Files to Review/Modify

### High Priority
- `server/src/sources/service/sources-collector-service/source-collector.service.ts` - Remove or simplify
- `server/src/sources/service/sources-collector-queue/sources-collector-queue.service.ts` - Simplify or remove
- `server/src/sources/service/sources-validation/source-validation.service.ts` - Fix to use async jobs
- `server/src/sources/operation/processors/telegram-collector.processor.ts` - Refactor to be self-contained

### Medium Priority
- `server/src/sources/service/service.module.ts` - Remove unused collectors and factories
- `server/src/sources/operation/processors/instagram-collector.processor.ts` - Remove if external
- `server/src/sources/operation/processors/rss-collector.processor.ts` - Remove if external
- `server/src/sources/operation/processors/twitter-collector.processor.ts` - Remove if unused

### Low Priority
- `server/src/sources/service/source-collectors/` - Remove entire directory if not needed
- `server/src/sources/service/api-source-collectors/` - Simplify or remove

