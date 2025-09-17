# ---------- Build ----------
FROM node:22-alpine AS build
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY package*.json ./
RUN npm ci

# copia o restante do código + .env.production
COPY . .

# build de produção (lê NEXT_PUBLIC_API_URL do .env.production)
RUN npm run build

# ---------- Runtime ----------
FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# apenas dependências de runtime
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev

# artefatos necessários para "next start"
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.js ./next.config.js

EXPOSE 3000

# força bind no 0.0.0.0 e porta 3000
CMD ["npm","run","start","--","-H","0.0.0.0","-p","3000"]

