# --- Etapa de build: compila la SPA de Angular ---
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json .npmrc ./
RUN npm ci

COPY . .
# "docker" solo cambia el endpoint del backend a una ruta relativa (ver
# enviroment.docker.ts) — el build real de producción (ng build a secas)
# no se toca ni usa este archivo.
RUN npx ng build --configuration production,docker

# --- Etapa final: sirve los estáticos con nginx ---
FROM nginx:alpine

COPY --from=build /app/dist/demo2/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
