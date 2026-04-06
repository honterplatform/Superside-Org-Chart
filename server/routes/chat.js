const router = require('express').Router();
const Anthropic = require('@anthropic-ai/sdk');
const auth = require('../middleware/auth');
const { buildSummary } = require('../services/aiContext');

const client = new Anthropic.default();

router.post('/', auth, async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;
    const summary = await buildSummary();

    const systemPrompt = `You are an AI assistant for Spark Studio Creative Team's org chart tool. You answer questions about the team structure, account assignments, capabilities, and resource allocation.

Answer concisely and accurately based ONLY on the provided data. Format names exactly as they appear. When listing people, include their seniority and region. When discussing accounts, include MRR when relevant.

TEAM DATA (${summary.peopleCount} people):
${summary.peopleSummary}

ACCOUNTS DATA (${summary.accountsCount} accounts):
${summary.accountsSummary}`;

    const messages = [
      ...history.map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message }
    ];

    // Set up SSE
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    if (!res.headersSent) {
      next(err);
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  }
});

module.exports = router;
