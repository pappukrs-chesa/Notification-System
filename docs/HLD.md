# High-Level Design — Chesa Notification Service

## 1. Problem

Chesa runs 6+ frontends (sales dashboard, service dashboard, technician PWA, superapp, dealer app, expense portal) and several backends that each send notifications their own way: inline nodemailer calls, two separate FCM lanes, ad-hoc WhatsApp calls. Consequences: no retries (SMTP hiccup = lost email), no audit trail ("did the customer get it?" is unanswerable), duplicated integration code in every repo, and adding a channel means touching every caller.

## 2. Solution

One standalone notification service that owns **delivery** as a domain. Callers describe *what* to send (channel, recipient, template, data); the service owns *how* (rendering, provider APIs, retries, auditing).

```
Clients ──HTTP──▶ notify-api ──persist──▶ MySQL
                      │
                      └──enqueue──▶ Redis (BullMQ)
                                       │
                              notify-worker ──▶ Email (SMTP)
                                       │        FCM (firebase-admin)
                                       │        WhatsApp (future)
                                       └──status/attempts──▶ MySQL
```

## 3. Key decisions

| Decision | Rationale |
|---|---|
| **Async via queue** (202 Accepted) | Callers return in ms; provider latency/outages never block or lose sends; worker scales independently of API |
| **Persist before enqueue** | A notification accepted by the API is never lost, even if Redis dies right after — the DB row is the source of truth |
| **Idempotency keys** | Callers can retry safely; duplicate order-confirmation emails are structurally impossible |
| **Channels as plugins** (Strategy) | Email/FCM today; WhatsApp = one new class + registry line; callers unchanged |
| **Templates in DB** | Content/copy changes without deploys; per-channel variants of the same logical message |
| **Own MySQL database** | Clean service boundary; extraction to its own instance = repoint 2 env vars |
| **API-key per client app** | Attribution (which app sent what), revocation, future rate limits per client |

## 4. Delivery lifecycle

```
PENDING ──worker picks up──▶ PROCESSING ──success──▶ SENT
                                  │
                                  └─failure──▶ FAILED ──retry (5x, exp backoff 30s→8m)──▶ PROCESSING…
                                                  │
                                                  └─retries exhausted──▶ DEAD (kept for post-mortem)
```

Every attempt is recorded in `notification_attempts` (audit trail: when, outcome, provider message id, error).

## 5. Deployment (Chesa EC2 reality)

- Runs at `/var/www/html/notification-service`, port **4600**, behind Apache: `ProxyPass /notify/ http://localhost:4600/` in `api-gateway.conf` (see Server-Setup/deploy-a-microservice.md playbook).
- Two pm2 processes from one `ecosystem.config.cjs`: `notify-api` and `notify-worker`, both `max_memory_restart: 300M`.
- Reuses the box's local Redis (BullMQ under its own `notify` key prefix) and local MySQL (dedicated `notification_service` database).
- Docker/compose included for local dev and future migration to a dedicated instance/ECS (see ADR-0003).

## 6. Non-goals (Phase 1)

Recipient resolution from business identities (callers pass concrete email/tokens/phone), user preferences/opt-out, scheduling/digests, delivery webhooks. All are designed-for (ports exist to slot them in) but deliberately out of scope until the core is proven in production.
