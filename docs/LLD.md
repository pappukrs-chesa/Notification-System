# Low-Level Design — Chesa Notification Service

## 1. Architecture style: Hexagonal (Ports & Adapters)

```
src/
├─ domain/           pure business rules — ZERO imports from outside this folder
│  ├─ entities/      Notification (invariants: recipient must match channel, etc.)
│  ├─ value-objects/ ChannelType, NotificationStatus, Recipient
│  ├─ ports/         interfaces the domain NEEDS: NotificationChannel, NotificationRepository,
│  │                 QueuePort, TemplateRenderer, TemplateRepository
│  └─ errors/        typed domain errors (mapped to HTTP codes at the edge)
├─ application/      use-cases — orchestration, no I/O details
│  ├─ SendNotificationUseCase        (API side: dedupe → persist → enqueue)
│  ├─ ProcessNotificationUseCase     (worker side: render → send → record)
│  └─ GetNotificationStatusUseCase
├─ infrastructure/   adapters — the ONLY place vendors live
│  ├─ repositories/  MySql* implementations of the repository ports
│  ├─ queue/         BullMqQueueAdapter implements QueuePort
│  ├─ channels/      EmailChannel, FcmChannel implement NotificationChannel; ChannelRegistry (factory)
│  └─ templates/     HandlebarsRenderer implements TemplateRenderer
├─ interfaces/http/  Fastify routes, zod validation, API-key auth hook
├─ composition/      container.ts — manual dependency injection, single wiring point
├─ server.ts         API entrypoint
└─ worker.ts         queue consumer entrypoint
```

**Dependency rule:** source code dependencies point *inward*. `domain` imports nothing; `application` imports only `domain`; `infrastructure` implements domain ports; `composition` wires it all. Swapping BullMQ for SQS or MySQL for Postgres touches only `infrastructure` + one line in the container.

## 2. SOLID mapping

- **S**ingle responsibility: each channel sends on one medium; each use-case is one operation; the entity owns only its invariants.
- **O**pen/closed: `ChannelRegistry.register(new WhatsAppChannel(env))` adds a channel with zero modification of existing classes (proven by a unit test).
- **L**iskov: every `NotificationChannel` is substitutable — the worker calls `send()` without knowing which one it has.
- **I**nterface segregation: five small ports instead of one god-interface; the API process never sees `TemplateRenderer`, the worker never sees `QueuePort`.
- **D**ependency inversion: use-cases receive ports via constructor; concrete adapters appear only in `composition/container.ts`.

## 3. Design patterns in play

| Pattern | Where | Why |
|---|---|---|
| Strategy | `NotificationChannel` implementations | interchangeable delivery algorithms |
| Factory/Registry | `ChannelRegistry` | runtime resolution of strategy by type |
| Repository | `MySql*Repository` | persistence behind an interface; unit tests use in-memory fakes |
| Dependency Injection | `composition/container.ts` | explicit wiring, no framework magic |
| Producer/Consumer | server.ts / worker.ts over BullMQ | decouple acceptance from delivery |

## 4. Data model

```
notifications           id(uuid) client_id channel recipient(json) template_key data(json)
                        idempotency_key status attempts last_error created_at updated_at
                        UNIQUE(client_id, idempotency_key)
notification_attempts   notification_id attempt_no status error provider_message_id created_at
templates               template_key channel subject body active  UNIQUE(template_key, channel)
api_clients             name api_key_hash(sha256) active
```

## 5. Reliability semantics

- **Idempotency:** `findByIdempotencyKey` before create; DB UNIQUE constraint as the race-condition backstop.
- **At-least-once delivery:** BullMQ retries (attempts=5, exponential backoff base 30s) with `jobId = notification id` so re-enqueueing the same notification can't double-queue.
- **Poison messages:** after 5 failures the worker's `failed` handler marks the row DEAD; the BullMQ failed set is retained (`removeOnFail: false`) as the DLQ for inspection/replay.
- **Crash safety:** status transitions are written to MySQL at each step; a worker crash mid-send leaves PROCESSING + a retryable job, never a silent loss.
- **Dry-run mode:** `NOTIFY_DRY_RUN=1` makes channels log instead of send — full-pipeline testing in any environment without spamming anyone.

## 6. API contract

```
POST /api/v1/notifications          (X-API-Key required)
  { "channel": "email" | "fcm" | "whatsapp",
    "to": {"email": "..."} | {"tokens": ["..."]} | {"phone": "..."},
    "templateKey": "order-confirmed",
    "data": { "orderId": 123, ... },
    "idempotencyKey": "order-123-confirmed"   // optional but recommended
  }
  → 202 { id, status: "PENDING", deduplicated: false }
  → 200 { id, status, deduplicated: true }     // idempotent replay
  → 400 validation / 401 auth / 422 domain rule violation

GET  /api/v1/notifications/:id      (X-API-Key; only own client's rows)
  → { id, channel, templateKey, status, attempts: [...], lastError, createdAt, updatedAt }

GET  /health          liveness
GET  /health/ready    readiness (MySQL ping + registered channels)
```

## 7. Testing strategy

Unit tests target the hexagon's core with fake ports (no DB/Redis needed): entity invariants, use-case ordering (persist-before-enqueue), idempotency behavior, registry open/closed. Integration happens via docker-compose (`npm run migrate` + real Redis/MySQL) or on the EC2 with `NOTIFY_DRY_RUN=1`.
