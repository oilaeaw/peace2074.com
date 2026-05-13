# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ai-panel.spec.ts >> AI assistant flow >> AI API responds with assistant content
- Location: tests/ai-panel.spec.ts:45:5

# Error details

```
Error: page.evaluate: SyntaxError: Failed to execute 'json' on 'Response': Unexpected end of JSON input
    at eval (eval at evaluate (:302:30), <anonymous>:18:33)
    at async <anonymous>:328:30
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e4]: Peace2074
  - generic [ref=e5]: Loading...
```