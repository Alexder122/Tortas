---
name: nuxt-expert
description: 'Conviertete en experto en Nuxt moderno (Nuxt 3/4): arquitectura, SSR/SSG/hibrido, rutas y API de Nitro, composables, estado, rendimiento, SEO, testing y despliegue. Usalo cuando necesites disenar, implementar, depurar o auditar funcionalidades en Nuxt de forma profesional y consistente.'
argument-hint: 'Describe tu objetivo en Nuxt: feature, bug, performance, SEO, testing o deploy.'
user-invocable: true
---

# Nuxt Expert Workflow

## Objetivo
Este skill guia una metodologia completa para trabajar con Nuxt de forma robusta: entender el problema, elegir estrategia de rendering, implementar con convenciones de Nuxt, validar calidad y dejar resultados listos para produccion.

## Cuando usarlo
- Disenar una feature nueva en Nuxt (paginas, componentes, server routes, middleware).
- Corregir bugs de hidratacion, data fetching, estado o navegacion.
- Optimizar performance web (TTFB, LCP, payload, caching).
- Mejorar SEO tecnico, metadata y social cards.
- Preparar pruebas, CI y despliegue en produccion.

## Flujo de trabajo
1. Definir resultado y restricciones
- Objetivo de negocio, alcance funcional y criterios de aceptacion.
- Restricciones tecnicas: SSR, SSG, hibrido, autenticacion, multi-tenant, i18n.
- Riesgos: breaking changes de Nuxt, compatibilidad de modulos, deuda tecnica.

2. Elegir estrategia de rendering y datos
- Seleccionar SSR, SSG o hibrido por ruta segun UX, SEO y costo.
- Decidir `useFetch`, `useAsyncData` o server route en `server/api`.
- Definir cache (`stale-while-revalidate`, headers, invalidacion).
- Asegurar manejo de errores (`error.vue`, `createError`, estados de carga).

3. Disenar arquitectura Nuxt-first
- Separar capas: `app/pages`, `app/components`, `app/composables`, `server/api`.
- Establecer naming consistente y auto-imports sin ambiguedad.
- Elegir estado global (Pinia o composables) y fronteras de responsabilidad.
- Centralizar configuracion en `nuxt.config.ts` y runtime config.

4. Implementar en incrementos pequenos
- Construir primero flujo feliz y luego edge cases.
- Tipar contratos (request/response) con TypeScript.
- Mantener componentes presentacionales simples y logica en composables.
- En APIs de Nitro: validar entrada, controlar errores y retornar payload estable.

5. Verificar calidad tecnica
- Revisar hidratacion y render mismatch (cliente vs servidor).
- Confirmar navegacion, middleware y manejo de auth.
- Validar accesibilidad basica (estructura semantica, focus, labels).
- Ejecutar lint, typecheck y pruebas relevantes.

6. Optimizar performance y SEO
- Reducir JS cliente, dividir componentes pesados y usar lazy loading.
- Auditar imagenes, fuentes y carga diferida.
- Configurar metadata con `useSeoMeta` y canonical.
- Revisar robots, sitemap y senales de indexacion.

7. Cerrar con checklist de produccion
- Errores y loading states cubiertos.
- Logs y observabilidad suficientes para incidentes.
- Variables de entorno documentadas.
- Plan de rollback y validacion post-deploy.

## Decisiones clave (branching)
- Si la pagina depende de SEO fuerte: priorizar SSR/SSG sobre CSR puro.
- Si los datos cambian frecuentemente: preferir SSR con cache controlada.
- Si la logica se repite en multiples vistas: extraer a composable.
- Si una API es critica: anadir validacion estricta y contratos tipados.
- Si hay mismatch de hidratacion: mover logica no determinista a cliente (`onMounted`) y estabilizar datos iniciales.

## Criterios de finalizacion
- Funcionalidad cumple criterios de aceptacion.
- Sin errores de tipo ni lint criticos.
- SEO/meta y estados de error revisados.
- Rendimiento aceptable para la ruta objetivo.
- Cambios documentados con riesgos y siguientes pasos.

## Prompts sugeridos
- "Usa nuxt-expert para disenar una pagina de catalogo SSR con filtros y paginacion."
- "Usa nuxt-expert para depurar un error de hidratacion en mi layout."
- "Usa nuxt-expert para optimizar LCP y payload en la home de Nuxt."
- "Usa nuxt-expert para proponer arquitectura de server/api y composables para POS."
