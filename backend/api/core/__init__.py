"""
API Core Package

This package contains the foundational infrastructure components that the entire FastAPI application depends on.
These are shared, essential modules used across all API routes and services.

Modules:
- config.py: Application-wide configuration settings (database, JWT, CORS)
- middleware.py: Request/response processing middleware (error handling, logging)

Purpose:
The 'core' represents the technical foundation that enables the API to function,
separate from the business logic found in routes. Think of it as the plumbing
that makes everything else work.
"""
