#!/bin/bash
cd apps/web
npx serve -s dist -l 3001 &
WEB_PID=$!

cd apps/mcp
PORT=3000 npm run serve &
MCP_PID=$!

wait $MCP_PID $WEB_PID
