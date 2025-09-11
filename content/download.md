---
title: Download
---

## What is Maybe Don't?

Maybe Don't is a security gateway that sits between AI assistants (like Claude) and external tools/servers. It monitors and blocks potentially dangerous AI actions before they can affect your system. Think of it as a firewall for AI tool calls - it logs everything and stops risky operations like deleting files or accessing sensitive data.

**Why use it?** When AI assistants interact with your systems through MCP (Model Context Protocol) servers, you want protection against unintended consequences. Maybe Don't gives you that safety net with real-time monitoring and intelligent blocking.

## Run The Gateway

### Download The Binary

The latest version is `v0.3.1` - you can download a binary for your architecture below:

{{< list-files-for-version version = v0.3.1 >}}

**Not sure which file to download?**
- **Mac (Apple Silicon):** `Darwin_arm64` (most common)
- **Mac (Intel):** `Darwin_x86_64`
- **Windows:** `Windows_x86_64`
- **Linux:** `Linux_x86_64`

### Quickstart Prerequisites

Before starting, you'll need:
- **uvx** (Python package runner) - Install with: `pip install uvx` or `pipx install uvx`
  - The quickstart config includes an AWS documentation server that requires uvx to run
  - You can remove the downstream aws-docs if you wish to skip this.
- **OpenAI account with billing enabled** - The gateway uses OpenAI's API which requires a payment method on file
  - If you want to skip AI validation, you can set `ai_validation.enabled: false` in the config
  - You can also use any openAI-compatible api, but you'll need to override the URL via config
  - Currently we find that OpenAI's API is much more reliable for running checks than Anthropic
- A [**GitHub Token**](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
  - The quickstart config uses the Github MCP server, which requires a token to authenticate

### Quickstart

After you extract the downloaded file, you should see a binary, and a gateway-config.yaml. The basic config connects to the Github MCP server and exposes it on http://localhost:8080/mcp with basic rules in place. It will log any tool calls to `./audit.log`. This requires two secrets to operate, which we will export as [environment variables](https://en.wikipedia.org/wiki/Environment_variable) to our shell:

```bash
# An open AI api key for rule validations
export OPENAI_API_KEY="Insert Key Here"

# This is your github token, which will be used to authenticate to downstream MCP servers
export GITHUB_TOKEN="Insert Token Here"
```

_Need help getting these keys?_
- [_Get OpenAI API Key_](https://platform.openai.com/docs/quickstart) - [_Get GitHub Token_](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)

Now you can connect to the local gateway as an MCP server. There are a couple ways to do this.

#### 1. MCP Inspector
If you just want to inspect what is exposed, I like to use the [MCP Inspector](https://github.com/modelcontextprotocol/inspector).

```bash
npx @modelcontextprotocol/inspector
```

Then open your browser to http://localhost:6274, set the transport to `Streamable HTTP`, and put `http://localhost:8080/mcp` as the URL. Then you can go to the `Tools` tab and list the tools available, and even test them out.

#### 2. Claude Desktop

**NOTE:** This requires the server type in the gateway-config.yaml to be stdio, and we need to adjust the audit log location:

```yaml
server:
  type: stdio

downstream_mcp_servers:
  github:
    type: http
    url: "https://api.githubcopilot.com/mcp/"
    http:
      headers:
        Authorization: "Bearer ${GITHUB_TOKEN}"

audit:
  enabled: true
  path: /Users/user/maybe-dont_0.3.1_Darwin_arm64/audit.log
```

In this instance, we have the binary and the config located in the user's Downloads directory on OSX (replace user with your username). You may need to click through some system prompts, and then approve the binary in the Security and Privacy settings.

```json
# claude_desktop_config.json
{
  "mcpServers": {
    "maybe-dont": {
      "command": "/Users/user/Downloads/maybe-dont_0.3.1_Darwin_arm64/maybe-dont",
      "args": [
        "start",
        "--config-path=/Users/user/Downloads/maybe-dont_0.3.1_Darwin_arm64"
      ],
      "env": {
        "GITHUB_TOKEN": "<Insert GITHUB_TOKEN>",
        "OPENAI_API_KEY": "Insert your openAI key"
      }
    }
  }
}
```

Once you've updated the config json, you'll need to restart Claude Desktop.

### Container (Docker, Podman, etc.)

The latest container image is available at `ghcr.io/maybedont/maybe-dont:v0.3.1`. You can run it with something like:

```bash
podman run \
  -e GITHUB_TOKEN \
  -e OPENAI_API_KEY \
  -v $(pwd)/gateway-config.yaml:/gateway-config.yaml \
  -p 8080:8080 \
  ghcr.io/maybedont/maybe-dont:v0.3.1 start
```

NOTE:
- Make sure the gateway-config.yaml is listening on `0.0.0.0:8080` for this particular command to work.
- You may want to change the gateway-config.yaml to send the audit log to stdout, rather than a file. Or mount the audit log locally, up to you.

## Configuration

This guide explains how to configure both the client and server portions of the MCP Security Gateway for enterprise-grade security controls.

### Overview

The MCP Security Gateway acts as a transparent middleware between MCP clients and servers, enforcing security policies and providing audit logging. Configuration is managed through YAML files with support for select environment variables and command-line overrides.

### Server Configuration

The server configuration defines how the gateway accepts connections from MCP clients. It must be in a file called `gateway-config.yaml` which is located in the `--config-path`. The path defaults to either the current directory `./` or `~/.maybe-dont/`

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

## Downstream MCP Servers Configuration

The downstream MCP servers configuration defines how the gateway connects to one or more MCP servers. You can configure multiple servers with different transport types and settings.

### Basic Configuration Structure

```yaml
downstream_mcp_servers:
  github:
    type: http # stdio, sse, or http
    url: "https://api.githubcopilot.com/mcp/"
    http:
      headers:
        Authorization: "Bearer ${GITHUB_TOKEN}"
  aws-docs:
    type: stdio
    command: "uvx"
    args: ["awslabs.aws-documentation-mcp-server@latest"]
```

### Server Types

#### 1. STDIO Server
Execute a local process as the MCP server:
```yaml
downstream_mcp_servers:
  my-local-server:
    type: stdio
    command: "./my-mcp-server"
    args: ["run", "--verbose"]
```

#### 2. HTTP Server
Connect to an HTTP-based MCP server:
```yaml
downstream_mcp_servers:
  api-server:
    type: http
    url: "https://api.example.com/mcp"
    http:
      headers:
        Authorization: "Bearer ${API_TOKEN}"
        X-Custom-Header: "value"
```

#### 3. SSE Server
Connect to an SSE-based MCP server:
```yaml
downstream_mcp_servers:
  streaming-server:
    type: sse
    url: "https://api.example.com/mcp/stream"
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

downstream_mcp_servers:
  kubectl-ai:
    type: stdio
    command: "./kubectl-ai"
    args: ["--mcp-server"]

policy_validation:
  enabled: true

ai_validation:
  enabled: false

audit:
  path: "audit.log"
```

#### Example 2: Production HTTP Setup with Multiple Servers

```yaml
server:
  type: http
  listen_addr: "0.0.0.0:8080"

downstream_mcp_servers:
  github:
    type: http
    url: "https://api.githubcopilot.com/mcp/"
    http:
      headers:
        Authorization: "Bearer ${GITHUB_TOKEN}"
  aws-docs:
    type: stdio
    command: "uvx"
    args: ["awslabs.aws-documentation-mcp-server@latest"]
  api-server:
    type: http
    url: "https://api.example.com/mcp"
    http:
      headers:
        Authorization: "Bearer ${API_TOKEN}"

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
