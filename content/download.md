---
title: Download
---

## What is Maybe Don't?

Maybe Don't is a security gateway that sits between AI assistants (like Claude) and external tools/servers. It monitors and blocks potentially dangerous AI actions before they can affect your system. Think of it as a firewall for AI tool calls - it logs everything and stops risky operations like deleting files or accessing sensitive data.

**Why use it?** When AI assistants interact with your systems through MCP (Model Context Protocol) servers, you want protection against unintended consequences. Maybe Don't gives you that safety net with real-time monitoring and intelligent blocking.

## Run The Gateway

### Download The Binary

The latest version is `v0.5.0` - you can download a binary for your architecture below:

{{< list-files-for-version version = v0.5.0 >}}

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
  path: /Users/user/maybe-dont_0.5.0_Darwin_arm64/audit.log
```

In this instance, we have the binary and the config located in the user's Downloads directory on OSX (replace user with your username). You may need to click through some system prompts, and then approve the binary in the Security and Privacy settings.

```json
# claude_desktop_config.json
{
  "mcpServers": {
    "maybe-dont": {
      "command": "/Users/user/Downloads/maybe-dont_0.5.0_Darwin_arm64/maybe-dont",
      "args": [
        "start",
        "--config-path=/Users/user/Downloads/maybe-dont_0.5.0_Darwin_arm64"
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

The latest container image is available at `ghcr.io/maybedont/maybe-dont:v0.5.0`. You can run it with something like:

```bash
podman run \
  -e GITHUB_TOKEN \
  -e OPENAI_API_KEY \
  -v $(pwd)/gateway-config.yaml:/gateway-config.yaml \
  -p 8080:8080 \
  ghcr.io/maybedont/maybe-dont:v0.5.0 start
```

NOTE:
- Make sure the gateway-config.yaml is listening on `0.0.0.0:8080` for this particular command to work.
- You may want to change the gateway-config.yaml to send the audit log to stdout, rather than a file. Or mount the audit log locally, up to you.

For detailed configuration instructions, see our [Documentation](/docs/) section.
