#!/bin/bash

echo "Starting all services!!!"

# Start MCP server
cd apps/mcp
PORT=3000 npm run serve &
MCP_PID=$!

# Start web app
cd ../web
npm run serve &
WEB_PID=$!

# Wait for both processes
wait $MCP_PID $WEB_PID
