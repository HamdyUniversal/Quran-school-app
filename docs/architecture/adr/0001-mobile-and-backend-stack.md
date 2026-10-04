# ADR 0001: Mobile and Backend Stack

**Status:** Accepted for V1 stack; future NestJS adoption remains conditional
**Date:** 2026-10-04
**Owner:** Hamdy Abd Elmohsen (Product Owner and Technical Lead, provisional)

## Context

The project needs an Arabic-first Android/iOS application, a secure relational backend, and a practical path for more complex server-side business rules later. The project owner confirmed React Native and approved Expo, TypeScript, and Supabase for V1. NestJS remains a conditional future option.

## Decision

- Use React Native for mobile development.
- Use Expo + TypeScript as the mobile framework/toolchain.
- Use Supabase Auth and PostgreSQL/RLS as the V1 backend.
- Keep provider-specific access behind domain repository interfaces.
- Consider NestJS only when measured business or operational complexity justifies a transition; do not make it a prerequisite for V1.

## Consequences

- The team must establish Expo native build, localization, and platform test practices.
- Supabase RLS and migrations become critical security boundaries and require database-level tests.
- Repository adapters add a small abstraction cost but preserve a path to another API implementation.
- Supabase-specific features must not leak into screen or domain contracts.

## Alternatives Considered

- Flutter: not selected because the project owner confirmed React Native.
- NestJS as the initial backend: deferred to avoid operating a custom API before its business/operational need is demonstrated.
- Direct Supabase calls from screens: rejected because it tightly couples UI and business behavior to the provider.

## Review Gate

React Native + Expo + TypeScript + Supabase are approved for V1. Pin compatible package/tool versions during project setup. Revisit this ADR only if the project owner changes direction or implementation evidence requires a change.