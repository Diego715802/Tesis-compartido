# Editor CMC reutilizado

Origen: proyecto existente `cirsanet-recreada-animada` de CometaLink, revisado el
12 de octubre de 2026. Esta carpeta es una copia adicional: ningún archivo del
frontend original se movió o eliminó.

- `ContentEditor.tsx`: sección de contenido de `CentralManagementConsole.tsx`,
  adaptada a propiedades y controles accesibles, con textos por sección plegables.
- `CmcPublicThemeEditor.tsx`: editor existente de doce ruedas y ocho colores.
  La vista previa recibe la dirección local; publicar llama al controlador ERP.
- `shared`: modelo público, textos y funciones de temas existentes, con imports
  relativos. Su validación se conserva además en el servidor CMC original.
- `palette.css`: estilos del editor de ruedas delimitados bajo `.erp-cmc`;
  no cambia el CSS global del ERP ni el sitio público.

No copiar el login, sesiones, MFA o administración de cuentas del CMC aquí.
La página y BFF utilizan la identidad verificada del ERP. Cambios posteriores
al catálogo o contrato del sitio deben reconciliar estas copias con el origen
y comprobar la publicación real antes de incorporarse.
