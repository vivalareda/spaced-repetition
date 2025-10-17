#!/bin/bash

# Start MCP server
cd apps/mcp
npm run serve &
MCP_PID=$!

# Start web app
cd ../web
npx serve -s dist -l 3001 &
WEB_PID=$!

# Wait for both processes
wait $MCP_PID $WEB_PID
