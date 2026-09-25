FROM node:22-alpine AS validate
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY frontend/dist ./frontend/dist
COPY frontend/scripts/check-source.mjs ./frontend/scripts/check-source.mjs
COPY server ./server
COPY admin ./admin
RUN npm run build
RUN find frontend admin server -type d -exec chmod 755 {} + \
    && find frontend admin server -type f -exec chmod 644 {} + \
    && chmod 644 package.json package-lock.json

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000 DATA_DIR=/app/data
COPY --from=validate /app /app
RUN mkdir -p /app/data && chown node:node /app/data
USER node
EXPOSE 3000
CMD ["node", "server/server.mjs"]
