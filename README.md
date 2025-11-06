# Syncora

Real-time boards/tasks with GraphQL, WebSockets, and DynamoDB.

## Setup
1. Copy env file:
   cp .env.example .env
2. Install deps:
   npm install
3. Create DynamoDB table (if needed):
   npx ts-node scripts/createTable.ts
4. Start dev:
   npm run dev

## Tech
- Node.js, TypeScript, Express
- GraphQL (express-graphql)
- WebSockets
- AWS DynamoDB (@aws-sdk v3)