FROM node:22-alpine AS validate
WORKDIR /app
COPY frontend/dist ./dist
COPY frontend/scripts/check-source.mjs ./scripts/check-source.mjs
RUN node scripts/check-source.mjs

FROM nginx:stable-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=validate /app/dist /usr/share/nginx/html
# Git checkouts created with a restrictive umask must remain readable by nginx.
RUN find /usr/share/nginx/html -type d -exec chmod 755 {} + \
    && find /usr/share/nginx/html -type f -exec chmod 644 {} +
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
