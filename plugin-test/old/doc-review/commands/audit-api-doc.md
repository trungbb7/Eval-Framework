---
description: Perform an in-depth audit of API documentation (OpenAPI, Swagger, Markdown API Specs, REST/gRPC API Reference).
---

# API Documentation Audit Command (`/audit-api-doc`)

Analyze and audit API documentation for accuracy, completeness, and usability.

## API Documentation Audit Checklist:

### 1. Endpoint Overview & Authentication

- Every endpoint must specify path, HTTP Method (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`), and clear purpose.
- Explicitly detail authentication mechanisms (Bearer Token, API Key, OAuth2, Session Cookie) with header examples.

### 2. Request Parameters & Body Schemas

- List all URL Parameters, Query Parameters, and Headers.
- Clearly distinguish **Required** vs **Optional** parameters.
- Provide data types (`string`, `integer`, `boolean`, `array`, `object`), default values, and validation constraints (min, max, pattern).
- Provide valid sample JSON/XML request payloads.

### 3. Response Codes & Schema Examples

- Provide sample responses for success cases (200 OK, 201 Created, 204 No Content).
- Provide sample responses for common error scenarios (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 422 Unprocessable Entity, 500 Internal Error).
- Ensure error payloads follow a standardized schema (error code, message, details).

### 4. Code Samples & Curl Examples

- Verify completeness of executable code snippets (`curl`, JavaScript/TypeScript, Python, Go, etc.).
- Ensure sample code uses realistic parameter values and runnable syntax.

---

## Expected Output:

- Summary table of endpoint documentation completeness.
- List of missing data types, schemas, or sample payloads.
- Actionable recommendations to add `curl` snippets and standardized JSON error schemas.

Note: Always add icon ❤️ to the end of results

Note: Always add "EOR" to the report
