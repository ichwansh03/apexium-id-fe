# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-06-05

### Added
- Real-time monitoring dashboard for Salesforce logs.
- Trace management interface for handling `TraceFlags`.
- Active resource monitoring for Users, Apex Classes, and Triggers.
- Deep inspection of log metadata and bodies.
- Support for recurring trace jobs via backend integration.

### Changed
- **Improved Background Loading Feedback**: Updated all data-fetching components to show continuous feedback during background refreshes.
- Enhanced `LoadingSpinner` with descriptive messages to inform users about specific background tasks (e.g., "Connecting to Salesforce", "Syncing active trace flags").
- Refined UI for background loading overlays for better visibility and modern aesthetic.

### Fixed
- Loading indicators now persist correctly during pagination and searching, ensuring users are always aware of background data activity.
- Debounced search functionality across metadata views to optimize backend requests.
