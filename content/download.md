---
title: Download
---

## What is Maybe Don't?

Maybe Don't is a security gateway that sits between AI assistants (like Claude) and external tools/servers. It monitors and blocks potentially dangerous AI actions before they can affect your system. Think of it as a firewall for AI tool calls - it logs everything and stops risky operations like deleting files or accessing sensitive data.

**Why use it?** When AI assistants interact with your systems through MCP (Model Context Protocol) servers, you want protection against unintended consequences. Maybe Don't gives you that safety net with real-time monitoring and intelligent blocking.

## Run The Gateway

### Download The Binary

The latest version is `v0.5.7` - you can download a binary for your architecture below:

{{< list-files-for-version version = v0.5.7 >}}

**Not sure which file to download?**
- **Mac (Apple Silicon):** `Darwin_arm64` (most common)
- **Mac (Intel):** `Darwin_x86_64`
- **Windows:** `Windows_x86_64`
- **Linux:** `Linux_x86_64`

### Prerequisites

Before starting, you'll need:
- **OpenAI account with billing enabled** - The gateway uses OpenAI's API which requires a payment method on file
  - If you want to skip AI validation, you can set `ai_validation.enabled: false` in the config
  - You can also use any openAI-compatible API, but you'll need to override the URL via config
  - Currently we find that OpenAI's API is much more reliable for running checks than Anthropic
- A [**GitHub Personal Access Token (PAT)**](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
  - Used to authenticate requests to GitHub via the MCP server
  - Can be a fine-grained token with minimal permissions (really anything you want to give it)

### Quickstart

After you extract the downloaded file, you should see a binary and a `gateway-config.yaml`. The default configuration connects to both the GitHub MCP server and AWS documentation server, exposing them on `http://localhost:8080/mcp` with security rules in place. All tool calls are logged to `./audit.log`.

You'll need to set your OpenAI API key as an [environment variable](https://en.wikipedia.org/wiki/Environment_variable):

```bash
# An OpenAI API key for AI-based rule validation
export OPENAI_API_KEY="Insert Key Here"
```

_Need help getting your key?_ [_Get OpenAI API Key_](https://platform.openai.com/docs/quickstart)

### Running Maybe Don't

1. **Start the gateway:**
   ```bash
   ./maybe-dont start
   ```

2. **Connect with Claude Code:**
   - [Install Claude Code](https://code.claude.com/docs/en/get-started/installation) if you haven't already
   - Set your GitHub PAT as an environment variable:
   ```bash
   export GITHUB_TOKEN="YOUR_GITHUB_PAT_HERE"
   ```
   - Add the MCP server to Claude Code:
   ```bash
   claude mcp add maybe-dont http://localhost:8080/mcp --transport http --header "X-GitHub-Token: $GITHUB_TOKEN"
   ```

3. **Verify the connection:**
   ```bash
   claude mcp list
   ```
   This will attempt to connect to the server and show you the configured MCP servers.

4. **Start Claude Code** and you can now access both GitHub and AWS documentation MCP servers securely through the gateway with AI guardrails.
   - You can also verify it's working from within Claude by running `/mcp` to see available MCP tools

**Need More?** See our [full documentation](/docs/) for additional configuration.

---

For detailed configuration instructions, including custom rules, Docker/Podman deployment, and advanced setups, see our [Documentation](/docs/) section.
