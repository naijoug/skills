# Best Practices for Building MCP Servers in 2026

> Power Search | 2026-03-13 | Tools: WebFetch, Context7 (denied), WebSearch (denied)

## Summary / 综合摘要

Building MCP (Model Context Protocol / 模型上下文协议) servers in 2026 requires understanding the protocol's architecture, choosing the right SDK, designing clean primitives (tools, resources, prompts), implementing proper security, and following transport-specific guidelines. The protocol has matured significantly, with the latest specification version being **2025-11-25**, and official Tier 1 SDKs now available in TypeScript, Python, C#, and Go.

Below is a comprehensive synthesis of best practices drawn from the official MCP specification, documentation, and server development guides.

### 1. Architecture & Design Principles (架构与设计原则)

- **Follow the client-server model**: MCP uses a host/client/server architecture. The host (AI application) creates one MCP client per MCP server. Each client maintains a dedicated connection.
- **Choose the right transport**: Use **stdio** for local servers (single client, no network overhead) and **Streamable HTTP** for remote servers (multi-client, supports authentication and streaming via SSE).
- **Respect the two-layer architecture**: The **data layer** handles JSON-RPC 2.0 protocol messages, lifecycle management, and primitives. The **transport layer** handles connection establishment, message framing, and authorization.
- **Design for capability negotiation**: During initialization, declare only the capabilities your server actually supports (tools, resources, prompts, logging, completions). Clients will adapt to what you offer.
- **Keep servers focused**: Each server should provide a coherent set of related capabilities. Multiple specialized servers are better than one monolithic server.

### 2. Tool Design Best Practices (工具设计最佳实践)

- **Use clear, descriptive names**: Tool names should be 1-128 characters, case-sensitive, using only `A-Z`, `a-z`, `0-9`, `_`, `-`, `.`. No spaces or special characters. Example: `get_weather`, `DATA_EXPORT_v2`, `admin.tools.list`.
- **Provide comprehensive descriptions**: Write human-readable descriptions that help LLMs understand when and how to use each tool.
- **Define strict input schemas**: Use JSON Schema (defaults to 2020-12) for all tool parameters. Mark required fields. For tools with no parameters, use `{ "type": "object", "additionalProperties": false }`.
- **Define output schemas**: Provide `outputSchema` for structured results to enable strict validation, type safety, and better developer experience.
- **Use structured content**: Return both `structuredContent` (JSON object) and `content` (serialized text fallback) for backward compatibility.
- **Support annotations**: Include `title`, `description`, and `annotations` metadata to help clients display tools properly.
- **Single responsibility**: Each tool should perform one clear operation with well-defined inputs and outputs.

### 3. Resource Implementation (资源实现)

- **Use standard URI schemes**: Prefer `file://` for filesystem-like resources, `https://` only when clients can fetch directly, and `git://` for version control. Custom URI schemes must follow RFC 3986.
- **Support resource templates**: Use URI templates (RFC 6570) for parameterized resources, enabling flexible queries like `weather://forecast/{city}/{date}`.
- **Implement subscriptions**: If your resources change over time, support the `subscribe` capability so clients receive `notifications/resources/updated` events.
- **Emit list change notifications**: When available resources change, send `notifications/resources/list_changed` if you declared `listChanged: true`.
- **Include annotations**: Use `audience` (user/assistant), `priority` (0.0-1.0), and `lastModified` (ISO 8601) to help clients filter and prioritize resources.
- **Validate all resource URIs** and implement proper access controls for sensitive data.

### 4. Lifecycle Management (生命周期管理)

- **Implement proper initialization**: Support the `initialize` / `initialized` handshake. Negotiate protocol version and capabilities before any operations.
- **Handle version negotiation**: Respond with a compatible protocol version. If the client requests an unsupported version, respond with your latest supported version.
- **Implement graceful shutdown**: For stdio, handle stdin closure and respond to SIGTERM. For HTTP, handle connection closure and session termination (HTTP DELETE on session endpoint).
- **Set request timeouts**: Implement timeouts for all requests to prevent hung connections. Allow per-request timeout configuration. Send cancellation notifications when timeouts occur.
- **Handle errors gracefully**: Be prepared for protocol version mismatches, capability negotiation failures, and request timeouts.

### 5. Transport-Specific Guidelines (传输层指南)

#### Stdio Transport
- **Never write non-MCP content to stdout** -- this corrupts JSON-RPC messages. Use stderr for logging.
- Messages are newline-delimited and must not contain embedded newlines.
- Use a logging library that writes to stderr or log files.

#### Streamable HTTP Transport
- **Validate the `Origin` header** on all connections to prevent DNS rebinding attacks.
- **Bind to localhost** (127.0.0.1) for local servers, never 0.0.0.0.
- **Implement authentication** -- MCP recommends OAuth for obtaining auth tokens.
- Include `Mcp-Session-Id` header for stateful sessions. Session IDs should be globally unique and cryptographically secure.
- Include `MCP-Protocol-Version` header on all requests after initialization.
- Support **resumability**: Attach SSE event IDs and handle `Last-Event-ID` for reconnection.
- Return proper HTTP status codes: 202 for accepted notifications, 400 for bad requests, 404 for expired sessions.

### 6. Security Best Practices (安全最佳实践)

**Servers MUST:**
- Validate all tool inputs against the declared JSON Schema
- Implement proper access controls for resources and tools
- Rate limit tool invocations to prevent abuse
- Sanitize tool outputs before returning to clients
- Validate all resource URIs before operations

**Servers SHOULD:**
- Follow the principle of least privilege
- Implement audit logging for tool usage
- Use proper encoding for binary data (base64)
- Treat tool annotations as untrusted unless from verified sources
- Provide clear documentation of security implications

**Key Security Principles:**
1. **User Consent and Control**: Users must explicitly consent to data access and operations
2. **Data Privacy**: Hosts must obtain explicit user consent before exposing user data
3. **Tool Safety**: Tools represent arbitrary code execution -- always require human oversight
4. **LLM Sampling Controls**: Users must approve any LLM sampling requests

### 7. Error Handling (错误处理)

Two error categories must be handled:

1. **Protocol Errors** (JSON-RPC errors): For unknown tools, malformed requests, server errors. Use standard error codes like `-32602` (invalid params), `-32002` (resource not found), `-32603` (internal error).
2. **Tool Execution Errors**: Set `isError: true` in the tool result. Include actionable feedback that LLMs can use to self-correct. Examples: API failures, input validation errors, business logic errors.

```json
{
  "result": {
    "content": [{ "type": "text", "text": "Invalid date: must be in the future." }],
    "isError": true
  }
}
```

### 8. SDK Selection (SDK 选择)

Choose your SDK based on your target language and the tier system:

| Tier | Languages | Feature Completeness |
|------|-----------|---------------------|
| **Tier 1** (Recommended) | TypeScript, Python, C#, Go | Full protocol support, actively maintained |
| **Tier 2** | Java, Rust | Strong support, nearing full compliance |
| **Tier 3** | Swift, Ruby, PHP | Basic support, community-driven |

All SDKs support: creating servers with tools/resources/prompts, local and remote transports, protocol compliance with type safety.

### 9. Development & Testing (开发与测试)

- **Use the MCP Inspector** (`github.com/modelcontextprotocol/inspector`) for testing and debugging servers during development.
- **Study reference implementations** at `github.com/modelcontextprotocol/servers` for patterns and conventions.
- **Use FastMCP** (Python) or equivalent high-level APIs that auto-generate tool definitions from type hints and docstrings.
- **Test with multiple clients**: Verify your server works with Claude Desktop, VS Code, and other MCP hosts.
- **Implement dynamic tool lists**: Support `listChanged` notifications so clients can adapt when your server's capabilities change at runtime.

### 10. Advanced Features (高级特性)

- **Tasks (Experimental)**: For long-running operations, use task-augmented execution with `taskSupport` on tools. This enables deferred result retrieval and status tracking.
- **Elicitation**: Allow your server to request additional information from users via `elicitation/request`.
- **Sampling**: Use `sampling/complete` to request LLM completions from the host without embedding an LLM SDK in your server.
- **Notifications**: Implement real-time notifications for tools, resources, and prompts list changes to keep clients synchronized.
- **Pagination**: Support cursor-based pagination for `tools/list`, `resources/list`, and `prompts/list` when dealing with large collections.

---

## Detailed Results by Source / 各工具搜索结果

### WebSearch
-- search denied -- (Permission was not granted for WebSearch in this environment.)

### Tavily
-- not available --

### Brave Search
-- not available --

### Perplexity
-- not available --

### Open-WebSearch
-- not available --

### Context7
-- search denied -- (Permission was not granted for Context7 resolve-library-id in this environment.)

### WebFetch

Successfully retrieved and synthesized content from the following official MCP documentation pages:

**1. Architecture Overview** (`modelcontextprotocol.io/docs/concepts/architecture`)
- Client-server architecture with host/client/server participants
- Two-layer design: data layer (JSON-RPC 2.0) and transport layer (stdio / Streamable HTTP)
- Core primitives: Tools (model-controlled), Resources (application-controlled), Prompts (user-controlled)
- Client primitives: Sampling, Elicitation, Logging
- Lifecycle management: initialization handshake with capability negotiation

**2. Transports Specification** (`modelcontextprotocol.io/specification/2025-11-25/basic/transports`)
- Stdio transport: newline-delimited JSON-RPC, no stdout pollution
- Streamable HTTP transport: POST for client-to-server, SSE for streaming
- Security: Origin header validation, localhost binding, authentication
- Session management with `Mcp-Session-Id` header
- Resumability with SSE event IDs and `Last-Event-ID`
- Protocol version header requirement (`MCP-Protocol-Version`)
- Backward compatibility with deprecated HTTP+SSE transport

**3. Latest Specification** (`modelcontextprotocol.io/specification/latest`)
- Protocol version: 2025-11-25
- Security principles: user consent, data privacy, tool safety, LLM sampling controls
- Implementation guidelines for consent flows, access controls, and privacy

**4. Server Features Overview** (`modelcontextprotocol.io/specification/2025-11-25/server`)
- Primitives control hierarchy: Prompts (user), Resources (application), Tools (model)

**5. Tools Specification** (`modelcontextprotocol.io/specification/2025-11-25/server/tools`)
- Tool naming conventions (1-128 chars, alphanumeric + `_-. `)
- Input schema (JSON Schema 2020-12 default) and output schema support
- Structured content with `structuredContent` field
- Error handling: protocol errors vs tool execution errors (`isError: true`)
- Security: validate inputs, rate limit, sanitize outputs, implement access controls

**6. Build a Server Tutorial** (`modelcontextprotocol.io/docs/develop/build-server`)
- Practical Python example using FastMCP
- Logging best practices: never write to stdout for stdio servers
- Tool implementation with type hints and docstrings

**7. Server Concepts** (`modelcontextprotocol.io/docs/learn/server-concepts`)
- Tool design patterns with JSON Schema validation
- Resource discovery (direct + templates) with URI patterns
- Prompt templates with structured arguments
- Multi-server composition patterns

**8. Resources Specification** (`modelcontextprotocol.io/specification/2025-11-25/server/resources`)
- URI schemes: file://, https://, git://, custom
- Resource templates with RFC 6570 URI templates
- Subscriptions and list change notifications
- Annotations: audience, priority, lastModified
- Error codes: -32002 (not found), -32603 (internal error)

**9. Lifecycle Specification** (`modelcontextprotocol.io/specification/2025-11-25/basic/lifecycle`)
- Three phases: initialization, operation, shutdown
- Version negotiation protocol
- Capability negotiation table
- Timeout handling and cancellation
- Graceful shutdown procedures for both transports

**10. SDKs Overview** (`modelcontextprotocol.io/docs/sdk`)
- Tier 1: TypeScript, Python, C#, Go
- Tier 2: Java, Rust
- Tier 3: Swift, Ruby, PHP
- All SDKs support tools, resources, prompts, local/remote transports

### Jina AI Reader
-- not available --

### x-reader
-- not available --

### Agent-Reach
-- not available --

---

## All Sources / 信息来源

| # | Title | URL | Source Tool |
|---|-------|-----|------------|
| 1 | MCP Architecture Overview | https://modelcontextprotocol.io/docs/concepts/architecture | WebFetch |
| 2 | MCP Transports Specification | https://modelcontextprotocol.io/specification/2025-11-25/basic/transports | WebFetch |
| 3 | MCP Specification (Latest) | https://modelcontextprotocol.io/specification/latest | WebFetch |
| 4 | MCP Server Features Overview | https://modelcontextprotocol.io/specification/2025-11-25/server | WebFetch |
| 5 | MCP Tools Specification | https://modelcontextprotocol.io/specification/2025-11-25/server/tools | WebFetch |
| 6 | Build an MCP Server Tutorial | https://modelcontextprotocol.io/docs/develop/build-server | WebFetch |
| 7 | Understanding MCP Server Concepts | https://modelcontextprotocol.io/docs/learn/server-concepts | WebFetch |
| 8 | MCP Resources Specification | https://modelcontextprotocol.io/specification/2025-11-25/server/resources | WebFetch |
| 9 | MCP Lifecycle Specification | https://modelcontextprotocol.io/specification/2025-11-25/basic/lifecycle | WebFetch |
| 10 | MCP SDKs Overview | https://modelcontextprotocol.io/docs/sdk | WebFetch |
| 11 | MCP Inspector (Dev Tool) | https://github.com/modelcontextprotocol/inspector | WebFetch |
| 12 | MCP Reference Server Implementations | https://github.com/modelcontextprotocol/servers | WebFetch |
