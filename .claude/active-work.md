# CafeTab - Active Work

## Current Status
**Phase:** Phase 1 - Core Café Conversion
**Started:** 2025-01-05

## What's Been Done
- [x] Cloned GolfTab to CafeTab
- [x] Initialized fresh git repo
- [x] Created spec document
- [x] Created implementation plan

## What's Next
- [ ] Phase 1.1: Branding & Configuration
- [ ] Phase 1.2: Database Schema Migration
- [ ] Phase 1.3: Type Definitions

## Key Decisions
- Keeping `cafe_` prefix for all tables (same pattern as golf_)
- Tables replace Groups as the primary entity
- Prepaid and Regular tab types supported
- Starting with polling-based notifications, upgrade to WebSocket later

## Links
- [Spec](./docs/plans/2025-01-05-cafetab-spec.md)
- [Plan](./docs/plans/2025-01-05-cafetab-implementation.md)
