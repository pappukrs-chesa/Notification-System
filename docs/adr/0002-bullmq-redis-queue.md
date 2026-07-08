# ADR-0002: BullMQ on the existing Redis for async delivery

Date: 2026-07-09 · Status: Accepted

## Context

Notification delivery must not block API callers and must survive provider outages (SMTP flaps, FCM quota errors). Options considered: (a) synchronous send in the request, (b) MySQL outbox table + polling worker, (c) BullMQ on the Redis already running on the Chesa EC2, (d) managed queue (SQS).

## Decision

BullMQ (option c), behind a `QueuePort` interface.

## Rationale

- Redis already runs on the box for the gateway cache — zero new infrastructure; BullMQ isolates itself under a `notify` key prefix.
- Retries with exponential backoff, delayed jobs, DLQ semantics, and concurrency control come built-in; the outbox option (b) would reimplement all of that.
- SQS (d) adds AWS coupling, per-request latency, and cost for a single-box deployment that doesn't need cross-AZ durability yet.
- The `QueuePort` abstraction keeps (d) available later: an SqsQueueAdapter is a drop-in.

## Consequences

- (+) At-least-once delivery with backoff ×5 and a retained failed-set as DLQ.
- (−) Redis becomes a harder dependency of the notification path; mitigated because the API persists to MySQL *before* enqueueing, so an enqueue failure is visible (500) and replayable, never silent loss.
