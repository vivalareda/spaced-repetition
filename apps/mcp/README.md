### MCP server for Spaced Repetition

This is an MCP server for [Remembr](https://remembr.reda.sh).

To configure the server, generate your API key in the settings of the [Remembr](https://remembr.reda.sh) app.

Then, add the following to your `~/.remembr/config.json` file:

```json
{
 "flashcard-test": {
  "command": "npx",
  "args": [
    "mcp-remote",
    "http://remembr.reda.sh/mcp",
    "--allow-http",
    "--header",
    "Authorization: Bearer ${REMEMBR_API_KEY}"
  ],
  "env": {
    "REMEMBR_API_KEY": ""
    }
  }
}
```

[Demo](./assets/demo.gif)
