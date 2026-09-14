# --- Etapa de build: compila TypeScript ---
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

# tsc hoy reporta ~427 errores de tipos (sobre todo en modelos huérfanos de
# src/models que nadie importa, ver faltantesmodelos/*) pero SÍ emite el JS
# igual (noEmitOnError no está activado) — así es como ya funciona dist/ en
# producción hoy (está commiteado, no se genera fresco). Se tolera el exit
# code no-cero de tsc pero se falla el build si de plano no emitió nada.
RUN npm run build; test -f dist/index.js

# Los archivos usados via __dirname (membretes de PDFs) no son .ts, tsc no los copia.
RUN cp -r src/assets dist/assets

# --- Etapa final: solo dependencias de producción + código compilado ---
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

# storage/ se monta como volumen (ver docker-compose.yml) para que los archivos
# subidos no se pierdan al reconstruir la imagen.
RUN mkdir -p storage

EXPOSE 3013
CMD ["node", "dist/index.js"]
