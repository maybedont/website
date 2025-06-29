---
title: Download
---

## Try The Gateway

The latest version is `v0.1.0` - you can download a binary for your architecture below:

{{< list-files-for-version version = v0.1.0 >}}

## Configuration

This guide explains how to configure both the client and server portions of the MCP Security Gateway for enterprise-grade security controls.

### Overview

The MCP Security Gateway acts as a transparent middleware between MCP clients and servers, enforcing security policies and providing audit logging. Configuration is managed through YAML files with support for environment variables and command-line overrides.

### Server Configuration

The server configuration defines how the gateway accepts connections from MCP clients.

#### Basic Server Settings

```yaml
server:
  # Server type: stdio, http, or sse
  type: sse

  # Address to listen on (for http/sse)
  listen_addr: "127.0.0.1:8080"

  # Logging configuration
  log_level: "info"  # debug, info, warn, error
  log_format: "json" # json or text
```

### Server Types

#### 1. STDIO Server
For direct process communication:
```yaml
server:
  type: stdio
  # No listen_addr needed for stdio
```

#### 2. HTTP Server
For HTTP-based MCP communication:
```yaml
server:
  type: http
  listen_addr: "0.0.0.0:8080"
```

#### 3. SSE Server (Server-Sent Events)
For real-time streaming communication:
```yaml
server:
  type: sse
  listen_addr: "127.0.0.1:8080"
  sse:
    tls:
      enabled: true
      cert_file: "/path/to/cert.pem"
      key_file: "/path/to/key.pem"
```

## Client Configuration

The client configuration defines how the gateway connects to downstream MCP servers.

### Basic Client Settings

```yaml
client:
  # Transport type: stdio, sse, or http
  type: stdio

  # For stdio: command to execute
  command: "./kubectl-ai"
  command_args: ["--mcp-server"]

  # For http/sse: downstream server URL
  downstream_url: "http://localhost:9090"
```

### Client Types

#### 1. STDIO Client
Execute a local process as the MCP server:
```yaml
client:
  type: stdio
  command: "./my-mcp-server"
  command_args: ["--config", "server-config.yaml"]
```

#### 2. HTTP Client
Connect to an HTTP-based MCP server:
```yaml
client:
  type: http
  downstream_url: "https://api.example.com/mcp"
```

#### 3. SSE Client
Connect to an SSE-based MCP server:
```yaml
client:
  type: sse
  downstream_url: "https://api.example.com/mcp/stream"
  sse:
    headers:
      Authorization: "Bearer ${API_TOKEN}"
      X-Custom-Header: "value"
```

### Policy Configuration

The gateway supports two types of policy validation: CEL-based rules and AI-powered validation.

#### CEL Policy Validation

Common Expression Language (CEL) rules for deterministic policy enforcement:

```yaml
policy_validation:
  enabled: true
  # Optional: path to custom rules file
  rules_file: "cel_rules.yaml"
```

##### Built-in CEL Rules

The gateway includes default rules that block dangerous operations:

- **kubectl delete namespace** - Prevents namespace deletion
- **kubectl delete pod** - Prevents pod deletion
- **kubectl delete deployment** - Prevents deployment deletion
- **kubectl delete service** - Prevents service deletion
- **kubectl delete configmap** - Prevents configmap deletion
- **kubectl delete secret** - Prevents secret deletion

##### Custom CEL Rules

Create your own rules in `cel_rules.yaml`:

```yaml
rules:
- name: deny-kubectl-delete-namespace
  description: Deny kubectl delete namespace
  expression: |-
    get(request, "method", "") == "tools/call" &&
    get(request.params, "name", "") == "kubectl" &&
    has(request.params, "arguments") &&
    has(request.params.arguments, "command") &&
    request.params.arguments.command.contains("delete") &&
    request.params.arguments.command.contains("namespace")
  action: deny
  message: Denied access to kubectl delete namespace

- name: allow-specific-tools
  description: Allow only specific tools
  expression: |-
    get(request, "method", "") == "tools/call" &&
    get(request.params, "name", "") in ["git", "docker", "kubectl"]
  action: allow
  message: Tool is in allowed list
```

### AI Policy Validation

AI-powered validation using OpenAI-compatible APIs:

```yaml
ai_validation:
  enabled: true
  endpoint: "https://api.openai.com/v1/chat/completions"
  model: "gpt-4o-mini"
  # Optional: path to custom AI rules file
  rules_file: "ai_rules.yaml"
  # API key (can also be set via OPENAI_API_KEY env var)
  api_key: "${OPENAI_API_KEY}"
```

#### Built-in AI Rules

The gateway includes AI rules for detecting:

- **Destructive actions** - Blocks commands like `rm -rf`, disk formatting, etc.
- **System file modification** - Prevents changes to system directories
- **Path traversal attacks** - Blocks directory traversal attempts

#### Custom AI Rules

Create your own AI rules in `ai_rules.yaml`:

```yaml
rules:
- name: block-destructive-actions
  description: Block destructive actions
  prompt: |
    Analyze the following tool call and determine if it contains any destructive actions.
    Destructive actions include:
    - Deleting files or directories (rm, rm -rf)
    - Formatting disks or partitions
    - Dropping databases
    - Uninstalling critical software

    Tool call:
    %s

    Respond with a JSON object:
    {
      "allowed": boolean,
      "message": "string explaining the decision"
    }
  message: Blocked potentially destructive action
```

### Configuration Examples

#### Example 1: Local Development Setup

```yaml
server:
  type: stdio
  log_level: debug
  log_format: text

client:
  type: stdio
  command: "./kubectl-ai"
  command_args: ["--mcp-server"]

policy_validation:
  enabled: true

ai_validation:
  enabled: false

audit:
  path: stdout
  format: text
```

#### Example 2: Production HTTP Setup

```yaml
server:
  type: http
  listen_addr: "0.0.0.0:8080"
  log_level: info
  log_format: json

client:
  type: http
  downstream_url: "https://api.example.com/mcp"

policy_validation:
  enabled: true
  rules_file: "production_rules.yaml"

ai_validation:
  enabled: true
  endpoint: "https://api.openai.com/v1/chat/completions"
  model: "gpt-4o-mini"

audit:
  path: "/var/log/mcp-gateway/audit.log"
  format: json
```

### Best Practices

1. **Use environment variables for secrets** - Never hardcode API keys or tokens
1. **Enable both CEL and AI validation** - Use CEL for deterministic rules and AI for complex scenarios
