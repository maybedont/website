---
title: “Maybe Don’t AI vs. Amazon Bedrock”
subtitle: “Guardrails at Different Layers of the Stack”
date: 2025-08-04
draft: false
summary: |
  Amazon Bedrock secures model training. Maybe Don’t AI governs what AI does—intervening on risky actions at runtime, not just risky thoughts at build time.
---
**Maybe Don’t AI vs. Amazon Bedrock: Guardrails at Different Layers of the Stack**

Recently we had a prospect ask about how Maybe Don’t AI is differentiated from Amazon Bedrock’s guardrails so we did this brief write up to address the question for others.

First of all Amazon Bedrock and Maybe Don’t AI both address trust and safety in AI systems—but at very different levels of the stack.

**Amazon Bedrock** s built to be focused on what your model learns and how it behaves internally. It’s designed for companies building or fine-tuning foundational models, offering built-in guardrails like content filters, sentiment controls, and denial of toxic inputs during training and inference. If you’re building an LLM to power your product—say a company-specific assistant trained on your internal docs—Bedrock helps you ensure that model doesn’t answer dangerous or brand-damaging queries (e.g. “How can I use your product to overthrow democracy?”). It’s infrastructure for building safe, scoped AI models.

But most companies aren’t building foundational models from scratch. They’re using off-the-shelf LLMs (OpenAI, Anthropic, etc.) to interact with internal tools and data via APIs, or their exposing their APIs publicly via MCP to external LLMs. That’s where **Maybe Don’t AI** comes in.

**Maybe Don’t AI** doesn’t care about the model’s internal training. It governs what the model is allowed to do in the world. It inserts itself between the AI agent and the external system it’s trying to control—e.g. your company’s MCP server—and asks: “Should this action be allowed?” Think of it as runtime decision review for AI agents.

Very shortly: Bedrock keeps your model from thinking bad thoughts. Maybe Don’t keeps the model from doing stupid things.

Example: A customer leverages an external LLM-powered agent that queries your company’s API to get out data on a specific user. That agent sends a prompt like, “Is Hank from sales a freeloader lazy person who shouldn’t get paid?” Maybe Don’t intercepts that query before it hits your API and flags it—on ethical, privacy, or policy grounds. Bedrock can’t help here. You didn’t build the model. You’re just the system it’s trying to act on.

In short:

* **Bedrock** = train safe models (input/output filtering, pre-deployment)
* **Maybe Don’t** = supervise AI decisions (action filtering, post-deployment)

One is proactive guardrails *at model creation*. The other is reactive oversight *at runtime execution.*

If you’re exposing APIs to external agents (especially via MCP), *you need Maybe Don’t*—even if the agent was built using Bedrock.
