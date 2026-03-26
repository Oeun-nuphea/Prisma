FROM node:20-alpine AS base
WORKDIR /app
ARG DATABASE_URL=postgresql://note:note@localhost:5432/note_db
ENV DATABASE_URL=$DATABASE_URL

FROM base AS deps
COPY package*.json ./
RUN npm ci

FROM deps AS build
COPY tsconfig.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src
RUN npm run prisma:generate && npm run build

FROM base AS production
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY prisma ./prisma
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
EXPOSE 4000
CMD ["sh", "-c", "npm run prisma:generate && npm run prisma:deploy && npm run start"]
