---
version: 1
slug: "src-app-erp-sitio-web-page-tsx"
primary_target: "src/app/(erp)/sitio-web/page.tsx"
related_targets:
  - "src/features/sitio-web/sitio-web-module.tsx"
  - "src/features/sitio-web/sitio-web.css"
  - "src/features/sitio-web/vendor/ContentEditor.tsx"
  - "src/features/sitio-web/vendor/CmcPublicThemeEditor.tsx"
---

# Sitio web y contenido (CMC)

Mode: Operate

Audience: administración del ISP que edita el contenido público de CometaLink.

Job: editar contenido y paleta, previsualizar los colores sobre el contenido publicado, publicar en la copia
local y reconocer qué falta para afectar la web publicada.

Constraints: conservar el shell de ComeCore, MUI, tipografía y geometría compacta;
reutilizar los editores existentes del CMC; idioma español; sesión y MFA del ERP;
no fingir publicación remota ni analítica; evitar pérdida del borrador.

## Direction contract

**THESIS:** El editor CMC se integra en la mesa de operación del ERP, con contenido
y apariencia en dos pestañas y alcance local visible antes de publicar.

**OWN-WORLD:** Extensión del ComeCore existente: superficies rectangulares
blancas, reglas grises, Roboto compacta y azul operativo. Las ruedas de temporada
conservan el editor CMC que el usuario ya utiliza.

**STORY:** Identificar el sitio y entorno, editar, previsualizar la paleta sobre el
contenido publicado, confirmar
publicación y abrir la página local. Los conflictos conservan el borrador y exigen
revisar el contenido vigente.

La vista previa transporta exclusivamente tema y colores. Los textos del borrador,
incluidos los estacionales, requieren publicación local para comprobarse en la página.

**FIRST VIEWPORT:** Encabezado del módulo, enlace al sitio local y CMC original,
alcance de la publicación, pestañas, estado del borrador y acción; primer grupo de
datos públicos o selector de paletas.

**FORM:** Extensión local del sistema visual existente. Ningún cambio global de
identidad ni sustitución del CMC original.

**QUALITY BAR:** Sin overflow global a 390 px; etiquetas y foco visibles;
contenido público real copiado para desarrollo; selección accesible de paletas;
publicación deshabilitada sin cambios; confirmación, carga, error y conflicto claros.

**FINISH:** Revisión con evidencia de escritorio/móvil y documentación de la
integración local y sus límites; conservar DESIGN.md y reportar su deriva histórica.
