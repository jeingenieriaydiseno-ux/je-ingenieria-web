# JE Ingeniería & Diseño — Sitio web

Landing page de JE Ingeniería & Diseño S.A.S., publicada en GitHub Pages:
https://jeingenieriaydiseno-ux.github.io/je-ingenieria-web/

## Estructura

```
index.html      Marcado y contenido de la página
css/styles.css  Estilos
js/main.js      Interactividad (nav, tabs, contadores, formulario)
images/         Logos e imágenes del sitio
robots.txt      Directivas para crawlers
sitemap.xml     Mapa del sitio para SEO
```

## Desarrollo local

Es un sitio estático sin build step. Para verlo localmente, sirve la carpeta con cualquier servidor estático, por ejemplo:

```bash
npx serve .
```

y abre la URL que indique en el navegador.

## Publicación

El sitio se despliega automáticamente vía GitHub Pages desde la rama `main`. Cualquier cambio en `index.html`, `css/` o `js/` se refleja al hacer push.
