---
title: Download
---

## Run The Gateway

### Download The Binary

The latest version is `v0.1.4` - you can download a binary for your architecture below:

{{< list-files-for-version version = v0.1.4 >}}

### Quickstart

After you extract the downloaded file, you should see a binary, and a config.yaml. The basic config connects to the Github MCP server and exposes it on http://localhost:8080/mcp with basic rules in place. It will log any tool calls to `./audit.log`. This requires two secrets to operate:

```bash
export OPENAI_API_KEY="Insert your API key here for AI rule validations"
export MCP_GATEWAY_CLIENT_HTTP_HEADERS_AUTHORIZATION="$GITHUB_TOKEN" # This is your github token, which will be used to authenticate the gateway to the Github MCP server.
```

Now you can connect to the local gateway as an MCP server. There are a couple ways to do this.

#### MCP Inspector
If you just want to inspect what is exposed, I like to use the [MCP Inspector](https://github.com/modelcontextprotocol/inspector).

```bash
npx @modelcontextprotocol/inspector
```

Then open your browser to http://localhost:6274, set the transport to `Streamable HTTP`, and put `http://localhost:8080/mcp` as the URL. Then you can go to the `Tools` tab and list the tools available, and even test them out.

### Container (Docker, Podman, etc.)

The latest container image is available at `ghcr.io/maybedont/maybe-dont:v0.1.4`. You can run it with something like:

```bash
podman run \
  -e MCP_GATEWAY_CLIENT_HTTP_HEADERS_AUTHORIZATION \
  -e OPENAI_API_KEY \
  -v $(pwd)/config.yaml:/config.yaml \
  -p 8080:8080 \
  ghcr.io/maybedont/maybe-dont:v0.1.4 start
```

NOTE:
- Make sure the config.yaml is listening on `0.0.0.0:8080` for this particular command to work.
- You may want to change the config.yaml to send the audit log to stdout, rather than a file. Or mount the audit log locally, up to you.

## Configuration

This guide explains how to configure both the client and server portions of the MCP Security Gateway for enterprise-grade security controls.

### Overview

The MCP Security Gateway acts as a transparent middleware between MCP clients and servers, enforcing security policies and providing audit logging. Configuration is managed through YAML files with support for select environment variables and command-line overrides.

### Server Configuration

The server configuration defines how the gateway accepts connections from MCP clients.

#### Basic Server Settings

### Server Types

#### 1. STDIO Server
For direct process communication:

```yaml
server:
  type: stdio
```

#### 2. HTTP Server

For HTTP-based MCP communication:

```yaml
server:
  type: http
  listen_addr: "0.0.0.0:8080"
```

#### 3. SSE Server (Server-Sent Events)

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
  command: "uvx"
  command_args: ["awslabs.aws-documentation-mcp-server@latest"]

  # For http/sse: downstream server URL
  # downstream_url: ""
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
  # Optional: path to custom rules file otherwise default rules will be used.
  rules_file: "cel_rules.yaml"
```

##### Built-in CEL Rules

The gateway includes default rules that block dangerous operations:

- **kubectl delete namespace** - Prevents namespace deletion when using an mcp server that provides kubectl access.

##### Custom CEL Rules

Set the config file `policy_validation.rules_file` to the name of the rules file, like `cel_rules.yaml`.

Add your own rules to `cel_rules.yaml`:

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
    get(request.params, "name", "") != "kubectl"
  action: deny
  message: Tool is not in allowed list
```

Note that if there are no matches for CEL policies, they will pass by default.

### AI Policy Validation

AI-powered validation using OpenAI-compatible APIs:

```yaml
ai_validation:
  enabled: true
  endpoint: "https://api.openai.com/v1/chat/completions"
  model: "gpt-4o-mini"
  # Optional: path to custom AI rules file. If not set, default rules will be used.
  rules_file: "ai_rules.yaml"
  # API key (can also be set via OPENAI_API_KEY env var)
  api_key: "${OPENAI_API_KEY}"
```

#### Built-in AI Rules

The gateway includes AI rules for detecting:

- **Mass Deletion Prevention**: Blocks wildcard/recursive file deletions and dangerous flags
- **System Directory Protection**: Prevents access to critical system paths (/etc/, /sys/, /proc/, etc.)
- **Command Execution Control**: Blocks dangerous command tools (bash, shell, powershell, etc.)
- **Credential File Protection**: Prevents access to credential files (.env, .key, .pem, .ssh/, etc.)
- **External Network Restrictions**: Blocks HTTP requests to external domains (except approved ones)
- **Executable File Prevention**: Blocks creation of executable files outside approved directories
- **Large File Operation Limits**: Prevents operations on files >100MB or content >10MB

#### Custom AI Rules

First set `ai_validation.rules_file` to the name of your file, like `ai_rules.yaml`.

Then write your own AI rules in `ai_rules.yaml`:

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

client:
  type: stdio
  command: "./kubectl-ai"
  command_args: ["--mcp-server"]

policy_validation:
  enabled: true

ai_validation:
  enabled: false

audit:
  path: "audit.log"
```

#### Example 2: Production HTTP Setup

```yaml
server:
  type: http
  listen_addr: "0.0.0.0:8080"

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
```

### Best Practices

1. **Use environment variables for secrets** - Never hardcode API keys or tokens in your config unless it's stored as a secret.
1. **Enable both CEL and AI validation** - Use CEL for deterministic rules and AI for complex scenarios
