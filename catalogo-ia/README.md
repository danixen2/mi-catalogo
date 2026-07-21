# Catálogo de Packs IA — Guía de instalación

## Qué es esto
- `index.html` → el catálogo público. Este es el link que le das a tus seguidores.
- `admin.html` → tu panel privado para agregar/editar/borrar packs. **No lo compartas.**
- `products.json` → la "base de datos" de tus productos.
- `assets/` → estilos y lógica.

## Paso 1 — Crear el repositorio en GitHub
1. Creá una cuenta en https://github.com si no tenés.
2. Andá a "New repository". Nombre sugerido: `mi-catalogo`. Marcalo como **público** (GitHub Pages gratis requiere que el repo sea público, aunque `admin.html` no va a aparecer en ningún buscador si no lo enlazás desde ningún lado).
3. Subí **todos** los archivos de esta carpeta (arrastralos en la sección "Add file → Upload files").

## Paso 2 — Activar GitHub Pages
1. En el repositorio: **Settings → Pages**.
2. En "Branch" elegí `main` y carpeta `/ (root)`. Guardá.
3. Esperá 1-2 minutos. Tu catálogo va a estar en:
   `https://TU-USUARIO.github.io/mi-catalogo/`
   Este es el link fijo que le vas a dar a tus seguidores. **Nunca cambia**, aunque actualices el contenido mil veces.

## Paso 3 — Crear tu token de acceso (para el panel admin)
1. Andá a GitHub → foto de perfil → **Settings → Developer settings → Personal access tokens → Fine-grained tokens**.
2. "Generate new token".
3. En "Repository access" elegí **"Only select repositories"** y seleccioná solo tu repo del catálogo.
4. En "Permissions" → "Repository permissions" → **Contents: Read and write**.
5. Generá el token y copialo (empieza con `github_pat_...`). Guardalo en un lugar seguro — solo se muestra una vez.

## Paso 4 — Usar el panel admin
1. Abrí `https://TU-USUARIO.github.io/mi-catalogo/admin.html` (vos, en privado).
2. Completá: tu usuario de GitHub, nombre del repo, rama (`main`), ruta (`products.json`) y pegá el token.
3. Agregá tus packs con nombre, descripción, tags, imagen y links.
4. Tocá **"Guardar cambios en GitHub"**. En 1-2 minutos el catálogo público ya se actualiza solo, mismo link de siempre.

El token queda guardado solo en tu navegador (localStorage), nunca se sube a ningún repositorio ni se comparte con nadie.

## Sobre las imágenes
El campo "URL de imagen" necesita un link directo a la imagen. Podés:
- Subir tus imágenes a una carpeta `images/` dentro del mismo repo (arrastrándolas por la web de GitHub) y usar una ruta relativa, ej: `images/pack-01.jpg`.
- O alojarlas en cualquier otro servicio de imágenes y pegar esa URL.

## Nada de esto depende de mí (Claude) ni de Anthropic
Todo el código es tuyo. Podés moverlo a cualquier otro hosting (Netlify, Vercel, tu propio dominio) en cualquier momento — es HTML/CSS/JS puro, sin dependencias raras.
