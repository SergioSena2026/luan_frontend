// ============================================================================
// POSTCSS.CONFIG.JS - Configuración del procesador de CSS
// ============================================================================
// PostCSS es una herramienta que transforma CSS con plugins de JavaScript.
// Vite lo usa automáticamente por detrás.
// 
// En Tailwind CSS v4, el plugin de PostCSS se movió a su propio paquete:
// @tailwindcss/postcss. Aquí le decimos a PostCSS que lo use.
// ============================================================================

export default {
  plugins: {
    // Usamos el nuevo plugin de Tailwind v4 para PostCSS
    '@tailwindcss/postcss': {},
  },
}