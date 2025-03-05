# Documentation Guide

## Overview

This documentation system is designed to maintain a comprehensive understanding of the project's architecture, decisions, and progress. It serves both human developers and AI assistants in maintaining context and making informed decisions.

## Directory Structure

```
docs/
├── architecture/           # System architecture and technical decisions
│   ├── decisions/         # Architecture Decision Records (ADRs)
│   ├── diagrams/         # System architecture diagrams
│   └── tech-stack.md     # Technology choices and rationale
├── features/             # Feature-specific documentation
│   ├── media/           # Media handling features
│   ├── spots/           # Spot management features
│   ├── auth/            # Authentication features
│   └── chat/            # Chat features
├── sprints/             # Sprint planning and retrospectives
├── api/                 # API documentation
├── database/           # Database schema and migrations
└── project/            # Project management documents
    ├── goals.md        # High-level project goals
    ├── roadmap.md      # Project roadmap
    ├── status.md       # Current project status
    └── decisions.md    # Product decisions log
```

## Documentation Types

### 1. Architecture Decision Records (ADRs)

Located in `architecture/decisions/`, ADRs capture important architectural decisions:

- Format: `XXX-title.md` (e.g., `001-media-optimization.md`)
- Includes: Context, Decision, Consequences, Implementation Plan
- Status: Proposed, Accepted, Deprecated, Superseded

### 2. Feature Documentation

Located in `features/`, each feature has:

- README.md with overview
- Component documentation
- Implementation status
- Usage examples
- Performance considerations

### 3. Sprint Documentation

Located in `sprints/`, includes:

- Sprint goals and timeline
- Task breakdown
- Success metrics
- Bug fixes
- Retrospective

### 4. Project Status

Located in `project/status.md`:

- Current sprint status
- Active development items
- Technical debt
- Key metrics
- Blockers
- Recent achievements

## Maintenance Guidelines

### For Humans

1. Update documentation alongside code changes
2. Keep ADRs immutable once accepted
3. Maintain status.md for current project state
4. Add retrospectives after each sprint

### For AI Assistants

1. Reference relevant documentation in responses
2. Update status.md when making changes
3. Create new ADRs for significant decisions
4. Link related documentation across sections

## Best Practices

1. Use markdown for consistency
2. Include code examples where relevant
3. Maintain clear status indicators
4. Cross-reference related documents
5. Keep performance metrics updated

## Versioning

- Documentation versions align with app versions
- ADRs are numbered sequentially
- Sprints are numbered sequentially
- Feature docs maintain changelog

## Tools

- Cursor IDE for documentation editing
- Markdown for formatting
- Mermaid for diagrams (planned)
- Git for version control

## Contributing

1. Create feature branch for documentation changes
2. Follow existing format and structure
3. Update related documents
4. Cross-reference new documentation

## Search and Navigation

- Use relative links between documents
- Maintain table of contents in each section
- Keep file names descriptive and consistent
- Use standard markdown headers for structure
