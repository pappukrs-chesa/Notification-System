# ADR-0001: Hexagonal architecture (ports & adapters)

Date: 2026-07-09 · Status: Accepted

## Context

The service integrates with volatile externals: SMTP provider, two Firebase projects, Redis, MySQL, and a future WhatsApp provider. Chesa has previously suffered from vendor code (nodemailer, firebase-admin) spread through business logic, making changes risky and testing impossible without live credentials.

## Decision

Structure the codebase as a hexagon: pure `domain` (entities + ports), thin `application` use-cases, all vendors confined to `infrastructure` adapters, wired in a single composition root.

## Consequences

- (+) Channels, queue, and DB are swappable without touching business rules — WhatsApp is a planned 1-class addition.
- (+) Core logic unit-tests with in-memory fakes; no credentials or containers needed in CI.
- (+) The dependency rule is mechanically checkable (domain imports nothing external).
- (−) More files/indirection than a flat Express app; new contributors need the map in LLD.md.
- (−) Manual DI container to maintain (accepted: it is ~50 lines and explicit beats framework magic at this scale).
