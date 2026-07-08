# ADR-0003: pm2 in production, Docker for development and portability

Date: 2026-07-09 · Status: Accepted

## Context

The Chesa production EC2 (8GB RAM ~50% used, disk ~50% used) runs Apache + MySQL + Redis + ~150 Node processes uniformly under pm2, with an established runbook (`pm2 list/logs/save`). The service ships a Dockerfile and docker-compose.

## Decision

Deploy to production as two pm2 processes (`notify-api`, `notify-worker`, `max_memory_restart: 300M`) following the house microservice playbook (port 4600 + Apache ProxyPass). Docker is used for local development (compose brings up API+worker+Redis+MySQL) and kept as the migration vehicle for a future dedicated instance or ECS.

## Rationale

- The Docker daemon idles at ~300–400MB RAM and its images/logs/build-cache consume disk — real costs on this box for zero functional gain over pm2 for a single service.
- One service on Docker while 150 run on pm2 splits the operational model: different logs, restarts, reboot recovery, and 3am debugging paths.
- Containerizing the *artifact* (Dockerfile in repo, CI-buildable) preserves all portability benefits without running a daemon in production.

## Consequences

- (+) Fits the box's resources and the team's runbook; `pm2 list` still shows the whole company.
- (+) Migration path is pre-built: push image, point Apache at the new host.
- (−) Prod and local dev environments differ (pm2 vs containers); mitigated by 12-factor env config — the code cannot tell the difference.
