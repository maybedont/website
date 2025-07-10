---
title: "Stop Prompt Injection Before It Starts"
subtitle: "Use Maybe Don’t AI"
date: 2025-07-10
draft: false
summary: |
  General Analysis recommends filtering inputs to MCP-based assistants to prevent prompt injection—looking for patterns like imperative verbs and SQL fragments. Maybe Don’t AI already does this. Instead of building your own wrapper, plug in Maybe Don’t today and secure your assistant input layer instantly.
---
**Stop Prompt Injection Before It Starts — Use Maybe Don’t AI**

General Analysis just published a solid post on securing AI assistants built on Supabase with Managed Components Protocol (MCP). Their takeaway: *sanitize input before it hits your assistant.* Specifically, scan for imperative verbs, SQL syntax, and other injection triggers. It’s a simple, powerful idea: **block bad prompts at the edge.**

They recommend a lightweight wrapper around your MCP that inspects and filters input. Sound advice—and a good reminder that generative AI isn’t just about output; it’s about controlling *input* too.

**Maybe Don’t AI does exactly this—out of the box.**

We built Maybe Don’t to do what General Analysis is telling you to go build: intercept prompts, analyze for known attack vectors, and prevent risky inputs from ever reaching your assistant. You don’t need to write custom wrappers or maintain regex filters. Just drop Maybe Don’t into your pipeline and let it do the work.

If you’re running assistants or any AI that takes user input, **you are exposed**. Prompt injection isn’t theoretical—it’s happening. If you’re building on MCP, you’re already ahead. But if you’re not filtering inputs, you’re not secure.

**Call to action:**
Don't wait to build your own defenses. Use the one that already works.
**Download Maybe Don’t AI today.**

[Get it here](https://www.maybedont.ai/download/), and give us feedback so we can make it better.
