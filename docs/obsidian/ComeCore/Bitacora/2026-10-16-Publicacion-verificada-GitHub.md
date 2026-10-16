# 2026-10-16 · Publicación verificada en GitHub

## Cambios

Se publicaron los cuatro commits pendientes del ERP en la rama `main` de
[Diego715802/Tesis-compartido](https://github.com/Diego715802/Tesis-compartido).
Incluyen autenticación, CMC, modelo de datos, persistencia relacional, gráficas
MikroTik, el cliente ficticio CCPRUEBA001 y la integración de Google Maps.

## Comprobaciones

- `git push origin main` completado: `ff8f0b7..9db0676`.
- HEAD local y `refs/heads/main` remoto coinciden:
  `9db06766881c9627bf3406d339df2c982a881797`.
- La API de GitHub confirmó el mismo commit y el árbol
  `bd52135b6a710a4bc0e3ab750ce4c54dcaba715e`.
- El directorio de trabajo estaba limpio y sincronizado tras la publicación.
- Los archivos reales de entorno y los secretos permanecen excluidos de Git.
- Las pruebas funcionales y sus límites están registrados en la bitácora del
  cliente ficticio y en `docs/DEMO_CUSTOMER_AND_MAPS.md`.

## Decisiones y pendientes

La transferencia se completó con Git por HTTPS, después de que el propietario
autorizó GitHub CLI y verificó su identidad en GitHub. No se publicaron parches
temporales del editor web. Esta publicación de código no es un despliegue del ERP
ni una certificación del entorno público. Continúan pendientes la configuración
de Maps JavaScript API, la aceptación con un MikroTik real y las verificaciones
de infraestructura indicadas en la documentación de seguridad.

El cliente ficticio está guardado en la base local. El repositorio contiene su
semilla repetible; no contiene una exportación de la base ni datos de clientes reales.
