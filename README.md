# Nuxt Minimal Starter

Consulta la [documentación de Nuxt](https://nuxt.com/docs/getting-started/introduction) para aprender más.

## Configuración

Asegúrate de instalar las dependencias:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Servidor de Desarrollo

Inicia el servidor de desarrollo en `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Formato y Lint

```bash
# Formatear todos los archivos
bunx biome format --write

# Formatear archivos específicos
bunx biome format --write <archivos>

# Lint y aplicar correcciones seguras a todos los archivos
bunx biome lint --write

# Lint y aplicar correcciones seguras a archivos específicos
bunx biome lint --write <archivos>

# Formatear, hacer lint y organizar imports en todos los archivos
bunx biome check --write

# Formatear, hacer lint y organizar imports en archivos específicos
bunx biome check --write <archivos>
```

## Producción

Compila la aplicación para producción:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Previsualiza la compilación de producción localmente:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Consulta la [documentación de despliegue](https://nuxt.com/docs/getting-started/deployment) para más información.