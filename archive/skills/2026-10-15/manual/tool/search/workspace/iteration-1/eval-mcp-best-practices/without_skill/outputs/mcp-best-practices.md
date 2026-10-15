# Best Practices for Building MCP Servers in 2026

> A comprehensive guide based on the official Model Context Protocol specification (protocol version 2025-06-18) and ecosystem documentation.

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Choosing the Right Primitives](#2-choosing-the-right-primitives)
3. [Transport Selection](#3-transport-selection)
4. [Tool Design Best Practices](#4-tool-design-best-practices)
5. [Resource Design Best Practices](#5-resource-design-best-practices)
6. [Prompt Design Best Practices](#6-prompt-design-best-practices)
7. [Lifecycle Management](#7-lifecycle-management)
8. [Security Best Practices](#8-security-best-practices)
9. [Authorization and Authentication](#9-authorization-and-authentication)
10. [Error Handling](#10-error-handling)
11. [SDK Selection](#11-sdk-selection)
12. [Development Workflow](#12-development-workflow)
13. [Production Deployment Checklist](#13-production-deployment-checklist)

---

## 1. Architecture Overview

MCP follows a client-server architecture where an **MCP host** (an AI application like Claude Code or Claude Desktop) connects to one or more **MCP servers** through **MCP clients**.

### Key Architectural Principles

- **Separation of concerns**: MCP focuses solely on the protocol for context exchange. It does not dictate how AI applications use LLMs or manage the provided context.
- **Two-layer design**: MCP consists of a **data layer** (JSON-RPC 2.0 protocol, primitives, lifecycle) and a **transport layer** (communication mechanisms like stdio or Streamable HTTP).
- **Stateful protocol**: MCP requires lifecycle management with initialization, operation, and shutdown phases.
- **Capability negotiation**: Clients and servers declare supported features during initialization, ensuring efficient communication.

### Participant Roles

| Participant | Role |
|-------------|------|
| **MCP Host** | AI application that coordinates and manages MCP clients (e.g., VS Code, Claude Desktop) |
| **MCP Client** | Component maintaining a connection to an MCP server, obtaining context for the host |
| **MCP Server** | Program that provides context (tools, resources, prompts) to MCP clients |

---

## 2. Choosing the Right Primitives

MCP defines three core server primitives. Selecting the right one for each use case is critical.

### Tools (Model-Controlled)

**Use when**: The LLM needs to perform actions or computations dynamically.

- Executable functions the AI can invoke (e.g., database queries, API calls, file operations)
- Model discovers and invokes tools automatically based on context
- Always have a human in the loop with the ability to deny invocations

### Resources (Application-Driven)

**Use when**: You need to expose data or context to the AI application.

- Data sources providing contextual information (e.g., file contents, database schemas, API responses)
- Host application determines how to incorporate context
- Support subscriptions for real-time updates

### Prompts (User-Controlled)

**Use when**: You want to provide reusable interaction templates.

- Structured templates for language model interactions (e.g., system prompts, few-shot examples)
- Intended to be explicitly selected by users (e.g., via slash commands)
- Support parameterization through arguments

### Decision Matrix

| Criterion | Tools | Resources | Prompts |
|-----------|-------|-----------|---------|
| Control model | Model-controlled | Application-driven | User-controlled |
| Purpose | Perform actions | Provide data/context | Structure interactions |
| Dynamic | Yes (executable) | Yes (subscribable) | Yes (parameterized) |
| Example | Run SQL query | Expose DB schema | Code review template |

---

## 3. Transport Selection

### stdio Transport

**Best for**: Local MCP servers, single-client scenarios, development and testing.

- Client launches server as a subprocess
- Communication via stdin/stdout
- No network overhead, optimal performance
- Messages delimited by newlines (must not contain embedded newlines)
- Server may write logs to stderr
- Server must not write non-MCP content to stdout

**Best practices**:
- Prefer stdio for local integrations where the server runs on the same machine
- Use stderr for logging, never stdout
- Clients should support stdio whenever possible

### Streamable HTTP Transport

**Best for**: Remote MCP servers, multi-client scenarios, production deployments.

- Server operates as an independent process handling multiple client connections
- Uses HTTP POST for client-to-server messages
- Optional Server-Sent Events (SSE) for streaming
- Supports session management via `Mcp-Session-Id` header
- Supports resumability and redelivery of messages

**Best practices**:
- Validate the `Origin` header on all incoming connections to prevent DNS rebinding attacks
- When running locally, bind only to `127.0.0.1`, not `0.0.0.0`
- Implement proper authentication for all connections
- Use cryptographically secure session IDs (e.g., securely generated UUIDs or JWTs)
- Include the `MCP-Protocol-Version` header on all requests
- Support SSE event IDs for resumability when reliability is important

---

## 4. Tool Design Best Practices

### Naming and Documentation

- Use clear, namespaced tool names (e.g., `calculator_arithmetic` rather than `calculate`)
- Provide a human-readable `title` for display purposes
- Write detailed `description` fields explaining what the tool does and when to use it
- Define comprehensive `inputSchema` using JSON Schema for type validation
- Optionally provide `outputSchema` for structured result validation

### Input Validation

- **Validate all tool inputs** before processing
- Define `required` fields in the input schema
- Use enums for constrained parameters (e.g., `"enum": ["metric", "imperial"]`)
- Provide `default` values for optional parameters

### Output Design

- Return results in the `content` array with appropriate content types (text, image, audio, resource links)
- For structured data, use `structuredContent` alongside a serialized JSON `TextContent` block for backward compatibility
- Use `outputSchema` to enable client-side validation of structured results
- Use annotations (`audience`, `priority`) to help clients understand how to use results

### Error Handling

- Use `isError: true` in tool results for business logic errors (API failures, invalid input data)
- Use JSON-RPC protocol errors for structural issues (unknown tools, invalid arguments)
- Provide clear, actionable error messages

### Security

- Implement proper access controls per tool
- Rate limit tool invocations
- Sanitize tool outputs to prevent injection
- Use `annotations` to describe tool behavior (but note: clients must treat annotations as untrusted unless from trusted servers)

### Human-in-the-Loop

- Applications should provide UI showing which tools are exposed to the AI model
- Insert clear visual indicators when tools are invoked
- Present confirmation prompts for sensitive operations

---

## 5. Resource Design Best Practices

### URI Design

- Use standard URI schemes where appropriate (`file://`, `https://`, `git://`)
- Custom URI schemes must conform to RFC 3986
- Use `https://` only when the client can fetch the resource directly from the web
- For server-mediated content, prefer `file://` or custom schemes even if the server downloads content over the internet

### Resource Metadata

- Provide `name`, `title`, and `description` for all resources
- Include accurate `mimeType` values
- Include `size` when known to help clients plan context usage
- Use annotations for `audience`, `priority`, and `lastModified`

### Subscriptions and Updates

- Support `subscribe` capability for resources that change frequently
- Emit `notifications/resources/list_changed` when the resource list changes
- Emit `notifications/resources/updated` for subscribed resource changes

### Resource Templates

- Use URI templates (RFC 6570) for parameterized resources
- Support argument auto-completion through the completion API
- Support pagination for large resource lists

### Security

- Validate all resource URIs
- Implement access controls for sensitive resources
- Properly encode binary data (base64)
- Check resource permissions before operations

---

## 6. Prompt Design Best Practices

### Structure

- Give prompts unique, descriptive `name` identifiers
- Provide a human-readable `title` for display
- Write clear `description` fields
- Define `arguments` with descriptions and `required` flags
- Validate arguments before processing

### Content

- Support multiple content types in prompt messages (text, image, audio, embedded resources)
- Use embedded resources to incorporate server-managed content (documentation, code samples)
- Use appropriate `role` values (`user` or `assistant`) for each message
- Support argument auto-completion via the completion API

### Change Notifications

- Declare `listChanged: true` capability if the prompt list can change
- Send `notifications/prompts/list_changed` when prompts are added, modified, or removed

---

## 7. Lifecycle Management

### Initialization

1. Client sends `initialize` request with protocol version, capabilities, and client info
2. Server responds with its protocol version, capabilities, server info, and optional `instructions`
3. Client sends `notifications/initialized` notification
4. Both parties must respect negotiated capabilities during operation

**Best practices**:
- Always negotiate the latest supported protocol version
- Only declare capabilities you actually support
- Use the `instructions` field to provide guidance to the client about how to use the server
- Do not send non-ping requests before initialization completes

### Version Negotiation

- Client sends the latest protocol version it supports
- Server responds with the same version if supported, or its latest supported version
- If versions are incompatible, the client should disconnect

### Shutdown

**stdio**:
1. Close stdin to the server process
2. Wait for server to exit
3. Send `SIGTERM` if server does not exit in reasonable time
4. Send `SIGKILL` as last resort

**HTTP**:
- Client sends HTTP DELETE with session ID to explicitly terminate
- Close associated HTTP connections

### Timeouts

- Implement timeouts for all sent requests to prevent hung connections
- Allow per-request timeout configuration
- Issue cancellation notifications when timeouts are reached
- Optionally reset timeout on progress notifications, but always enforce a maximum

---

## 8. Security Best Practices

### Input and Output Validation

- Validate all tool inputs against their schemas
- Sanitize tool outputs before returning them
- Validate all resource URIs
- Validate prompt arguments before processing

### Rate Limiting

- Implement rate limiting on tool invocations
- Prevent resource exhaustion from excessive requests

### DNS Rebinding Prevention

- Validate the `Origin` header on all incoming HTTP connections
- Bind local servers to `127.0.0.1` only
- Block requests to private IP ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.0.0/16`)

### SSRF Prevention (for clients fetching OAuth URLs)

- Require HTTPS for all OAuth-related URLs in production
- Block requests to private and reserved IP address ranges
- Validate redirect targets
- Use egress proxies for server-side deployments
- Be aware of DNS rebinding / TOCTOU issues

### Session Security

- Use secure, non-deterministic session IDs (cryptographically secure random UUIDs)
- Bind session IDs to user-specific information (e.g., `<user_id>:<session_id>`)
- Do not use sessions for authentication; verify authorization on every request
- Rotate and expire session IDs

### Local Server Security

- Display exact commands before executing local MCP servers (no truncation)
- Require explicit user consent before running server processes
- Highlight potentially dangerous command patterns (`sudo`, `rm -rf`, network operations)
- Execute MCP server commands in sandboxed environments when possible
- Use platform-appropriate sandboxing (containers, chroot, etc.)
- Use stdio transport to limit access to just the MCP client
- If using HTTP transport locally, require an authorization token or use unix domain sockets

### Scope Minimization

- Start with minimal, low-risk scopes (e.g., `mcp:tools-basic`)
- Implement incremental elevation via targeted `WWW-Authenticate` challenges
- Accept reduced-scope tokens (down-scoping tolerance)
- Avoid wildcard or omnibus scopes (`*`, `all`, `full-access`)
- Log elevation events with correlation IDs

---

## 9. Authorization and Authentication

### OAuth 2.1 Integration

MCP uses OAuth 2.1 for HTTP-based transports. Key requirements:

- **MCP servers** act as OAuth 2.1 resource servers
- **MCP clients** act as OAuth 2.1 clients
- Authorization servers must implement OAuth 2.1 with appropriate security measures
- Use PKCE (Proof Key for Code Exchange) for all authorization code flows

### Discovery Flow

1. MCP server returns `401 Unauthorized` with `WWW-Authenticate` header
2. Client fetches Protected Resource Metadata (`/.well-known/oauth-protected-resource`)
3. Client fetches Authorization Server Metadata (`/.well-known/oauth-authorization-server`)
4. Client performs OAuth 2.1 authorization flow
5. Client includes `Authorization: Bearer <token>` on every subsequent request

### Token Handling

- Include `Authorization: Bearer <token>` in every HTTP request (even within the same session)
- Never include tokens in URI query strings
- Validate that tokens were specifically issued for your MCP server (audience validation)
- Never pass through tokens to downstream APIs (token passthrough is explicitly forbidden)
- Issue short-lived access tokens to reduce leak impact
- Rotate refresh tokens for public clients

### Resource Indicators (RFC 8707)

- Include the `resource` parameter in both authorization and token requests
- Use the canonical URI of the MCP server as the resource identifier
- This binds tokens to their intended audience

### Dynamic Client Registration (RFC 7591)

- Support dynamic client registration for seamless connection to new servers
- This eliminates manual registration friction
- Authorization servers can implement their own registration policies

### stdio Transport Authentication

- For stdio, retrieve credentials from the environment rather than OAuth
- Do not implement the OAuth flow for stdio-based servers

---

## 10. Error Handling

### Protocol Errors (JSON-RPC)

| Code | Meaning | Usage |
|------|---------|-------|
| `-32602` | Invalid params | Unknown tool, missing required arguments, unsupported protocol version |
| `-32603` | Internal error | Server-side failures |
| `-32002` | Custom | Resource not found |

### Tool Execution Errors

- Return `isError: true` in tool results for runtime failures
- Include descriptive error text in the content array
- Distinguish between protocol errors and tool execution errors

### HTTP Authorization Errors

| Status | Description | Usage |
|--------|-------------|-------|
| `400` | Bad Request | Malformed authorization request |
| `401` | Unauthorized | Authorization required or token invalid |
| `403` | Forbidden | Invalid scopes or insufficient permissions |
| `404` | Not Found | Session expired or terminated |

### General Guidelines

- Be prepared to handle protocol version mismatches
- Handle capability negotiation failures gracefully
- Implement request timeouts with cancellation notifications
- Log errors for audit and debugging purposes

---

## 11. SDK Selection

### Tier 1 SDKs (Recommended for Production)

Full feature completeness, protocol support, and active maintenance:

| SDK | Repository |
|-----|------------|
| **TypeScript** | [modelcontextprotocol/typescript-sdk](https://github.com/modelcontextprotocol/typescript-sdk) |
| **Python** | [modelcontextprotocol/python-sdk](https://github.com/modelcontextprotocol/python-sdk) |
| **C#** | [modelcontextprotocol/csharp-sdk](https://github.com/modelcontextprotocol/csharp-sdk) |
| **Go** | [modelcontextprotocol/go-sdk](https://github.com/modelcontextprotocol/go-sdk) |

### Tier 2 SDKs (Stable)

| SDK | Repository |
|-----|------------|
| **Java** | [modelcontextprotocol/java-sdk](https://github.com/modelcontextprotocol/java-sdk) |
| **Rust** | [modelcontextprotocol/rust-sdk](https://github.com/modelcontextprotocol/rust-sdk) |

### Tier 3 SDKs (Emerging)

| SDK | Repository |
|-----|------------|
| **Swift** | [modelcontextprotocol/swift-sdk](https://github.com/modelcontextprotocol/swift-sdk) |
| **Ruby** | [modelcontextprotocol/ruby-sdk](https://github.com/modelcontextprotocol/ruby-sdk) |
| **PHP** | [modelcontextprotocol/php-sdk](https://github.com/modelcontextprotocol/php-sdk) |

### All SDKs Support

- Creating MCP servers with tools, resources, and prompts
- Building MCP clients
- Local (stdio) and remote (Streamable HTTP) transports
- Protocol compliance with type safety

---

## 12. Development Workflow

### Getting Started

1. **Choose your SDK** based on your language preference and tier requirements
2. **Start with core functionality**, then iterate to add features
3. **Use the MCP Inspector** (`github.com/modelcontextprotocol/inspector`) for testing and debugging
4. **Reference the specification** at `modelcontextprotocol.io/specification/latest`

### Using LLMs to Accelerate Development

- Feed the full MCP documentation (`modelcontextprotocol.io/llms-full.txt`) to an LLM
- Provide SDK README and documentation for your chosen language
- Describe your server clearly: what resources, tools, and prompts it should expose
- Break down complex servers into smaller pieces
- Test each component thoroughly before moving on

### Testing

- Test with the MCP Inspector tool before connecting to real clients
- Test lifecycle management (initialization, operation, shutdown)
- Verify capability negotiation works correctly
- Test error handling paths
- Validate tool inputs and outputs against schemas
- Test with multiple transport types if supporting both

### Iteration

- Connect to real MCP clients (Claude Desktop, VS Code, etc.) for integration testing
- Iterate based on real usage and feedback
- Document your code well for future maintenance
- Follow MCP protocol specifications carefully

---

## 13. Production Deployment Checklist

### Protocol Compliance

- [ ] Implement proper lifecycle management (initialize, operate, shutdown)
- [ ] Negotiate capabilities correctly during initialization
- [ ] Support the latest protocol version (2025-06-18)
- [ ] Use JSON-RPC 2.0 message format with UTF-8 encoding
- [ ] Handle pagination for tool, resource, and prompt listings

### Security

- [ ] Validate all inputs (tool arguments, resource URIs, prompt arguments)
- [ ] Implement rate limiting on tool invocations
- [ ] Sanitize all outputs
- [ ] For HTTP: validate `Origin` header on all connections
- [ ] For HTTP: implement OAuth 2.1 authorization with PKCE
- [ ] For HTTP: validate token audience (never accept tokens meant for other services)
- [ ] For HTTP: never pass through client tokens to downstream APIs
- [ ] For HTTP: use HTTPS for all endpoints in production
- [ ] For HTTP: use secure, non-deterministic session IDs
- [ ] For local servers: bind to `127.0.0.1` only
- [ ] Implement scope minimization (least-privilege model)

### Reliability

- [ ] Implement request timeouts with cancellation support
- [ ] Handle graceful shutdown (close streams, clean up resources)
- [ ] Support SSE event IDs for resumability (Streamable HTTP)
- [ ] Emit `listChanged` notifications when tools/resources/prompts change
- [ ] Log operations for audit and debugging

### Documentation

- [ ] Document all exposed tools with clear descriptions and input schemas
- [ ] Document all resources with URIs, MIME types, and descriptions
- [ ] Document all prompts with argument descriptions
- [ ] Provide `instructions` in the server info during initialization
- [ ] Document authentication requirements

---

## Sources

- [MCP Architecture Overview](https://modelcontextprotocol.io/docs/concepts/architecture)
- [MCP Tools Specification](https://modelcontextprotocol.io/docs/concepts/tools)
- [MCP Resources Specification](https://modelcontextprotocol.io/docs/concepts/resources)
- [MCP Prompts Specification](https://modelcontextprotocol.io/docs/concepts/prompts)
- [MCP Transports Specification](https://modelcontextprotocol.io/docs/concepts/transports)
- [MCP Lifecycle Specification](https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle)
- [MCP Authorization Specification](https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization)
- [MCP Security Best Practices](https://modelcontextprotocol.io/specification/2025-06-18/basic/security_best_practices)
- [MCP SDKs](https://modelcontextprotocol.io/docs/sdk)
- [Building MCP with LLMs](https://modelcontextprotocol.io/tutorials/building-mcp-with-llms)
