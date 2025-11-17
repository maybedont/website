---
title: Download
---

## What is Maybe Don't?

Maybe Don't is a security gateway that sits between AI assistants (like Claude) and external tools/servers. It monitors and blocks potentially dangerous AI actions before they can affect your system. Think of it as a firewall for AI tool calls - it logs everything and stops risky operations like deleting files or accessing sensitive data.

**Why use it?** When AI assistants interact with your systems through MCP (Model Context Protocol) servers, you want protection against unintended consequences. Maybe Don't gives you that safety net with real-time monitoring and intelligent blocking.

## Run The Gateway

### Download The Binary

The latest version is `v0.5.1` - you can download a binary for your architecture below:

{{< list-files-for-version version = v0.5.1 >}}

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

2. **Connect with MCP Inspector:**
   ```bash
   npx @modelcontextprotocol/inspector
   ```

3. **Open your browser** to http://localhost:6274, set the transport to `Streamable HTTP`, and use `http://localhost:8080/mcp` as the URL.

4. **Add your GitHub PAT:** In the inspector, add a custom header:
   - **Header name:** `X-GitHub-Token`
   - **Header value:** Your GitHub Personal Access Token

5. **Explore available tools** in the Tools tab - you can now access both GitHub and AWS documentation MCP servers securely through the gateway.

**Using Claude Desktop?** See our [full documentation](/docs/) for stdio configuration.

---

For detailed configuration instructions, including custom rules, Docker/Podman deployment, and advanced setups, see our [Documentation](/docs/) section.
