#!/bin/bash
cd apps/web
npx serve -s dist -l 3000 &
wait
