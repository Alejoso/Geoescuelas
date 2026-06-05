# =============================================================================
#  Frontend Next.js — build de producción y luego `next start` (un proceso).
# =============================================================================

# --- Stage build -------------------------------------------------------------
FROM node:24-bookworm AS build
WORKDIR /app

# La URL pública se "hornea" en build (variables NEXT_PUBLIC_*)
ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Stage runtime -----------------------------------------------------------
FROM node:24-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copiamos el resultado del build. Copiar /app completo evita errores si no
# tenés public/ o next.config (archivos opcionales que romperían un COPY con glob).
COPY --from=build /app ./

EXPOSE 3000
CMD ["npm", "run", "start"]