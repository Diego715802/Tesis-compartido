# Cliente ficticio y mapas de Google

Fecha: 16 de octubre de 2026. Entorno: desarrollo local.

## Expediente disponible

En **Clientes**, buscar **CCPRUEBA001** o **Cliente Ficticio ComeCore - PRUEBAS**.
Se conserva en PostgreSQL en la organización local seleccionada; no depende del almacenamiento del navegador.

| Escenario | Datos de prueba |
| --- | --- |
| Identificación | CCPRUEBA001 / FICTICIO-001 |
| Contacto | cliente.comecore@example.invalid / +1 202 555 0123 (número ficticio) |
| Ubicación | Punto ilustrativo de Teotihuacán; no es domicilio de un abonado |
| Planes | PRUEBA - Fibra 50 Mbps ($349), PRUEBA - Enlace 20 Mbps ($199), mensuales |
| Contratos | DEMO-CTR-001 habilitado, DEMO-CTR-002 suspendido |
| Comprobantes | Uno pagado y dos pendientes, todos ficticios y sin timbrado |
| Cuenta | Cuatro movimientos; saldo $548 MXN; dos impagas; crédito $0 |
| Soporte | Un ticket cerrado y uno abierto, ambos ficticios |
| Android | Referencia de dispositivo sin token ni conexión a una app |

No crea usuarios ni contraseñas de acceso. Comunicaciones, portal, pasarelas,
CFDI y provisión de red están desactivados. Las IP 192.0.2.50/51 son de documentación.
Los planes están ocultos y no tienen estrategia de aprovisionamiento.
No se asigna un router ni se simula consumo real.

El núcleo de cliente/contacto/domicilio/asignación/cuenta/perfil de facturación y
contratos/planes usa las tablas relacionadas. Tickets, comprobantes, movimientos y
referencia Android son escenarios dentro de la extensión cifrada del expediente;
no equivalen a operaciones en los módulos independientes de soporte, cobro o app.

## Repetir la carga local

Compilar el backend. Ejecutar desde la raíz del repositorio:

```sh
node scripts/seed-demo-customer.mjs --organization CODIGO --operator-id UUID_PROPIETARIO
node scripts/test-demo-customer.mjs
```

Requiere acceso administrativo local por socket, organización activa y propietario
real activo con MFA configurado y sin cambio de contraseña pendiente. La escritura
se hace con `comecore_runtime`, contexto de organización, RLS y los validadores del
ERP. Planes, núcleo relacionado y extensión cifrada se confirman en una transacción.
La semilla rechaza despliegues públicos y bases remotas; no añade una API de acceso
alternativo ni altera cuentas o sesiones. Si el expediente existe, conserva sus
cambios: no lo reinicia ni lo duplica. Un conflicto revierte la operación.

## Mapas cubiertos

- Clientes: alta/edición, pestaña Mapa y ficha integral accesible en móvil.
- Contratos: formulario de cliente y detalle del contrato con coordenadas.
- Nodos: ubicación y radios en la vista con API JavaScript.
- CMC: vista previa de emisoras dentro de Contenido, con selector de punto cuando
  se usa el mapa incrustado. No publica cambios automáticamente.

Todos reutilizan `src/components/maps/google-map.tsx`. Sin clave, se muestra Google
Maps incrustado y un enlace para abrirlo; al editar, los campos de latitud y longitud
siguen disponibles. El selector permite consultar cada punto sin presentar radios
inexistentes en la vista incrustada. La selección por clic/arrastre, los marcadores
simultáneos y círculos requieren la API JavaScript configurada.

La CSP ahora admite los frames y recursos de Maps manteniendo nonce por respuesta,
`strict-dynamic`, bloqueo de objetos, formularios externos y enmarcado del ERP.
La carga del script copia el nonce. Hay espera máxima de 15 s y alternativa ante
fallos de red/autenticación del proveedor. El referrer externo incluye solo origen,
sin rutas, identificadores ni consultas del expediente.

### Configuración pendiente de Google

En `apps/frontend/.env.local`:

```dotenv
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

Configurar una clave de navegador restringida por sitios autorizados y por API;
habilitar Maps JavaScript API y su facturación/cuotas en Google Cloud. Recompilar
Next después de establecerla. No se proporcionó una clave y no se habilitó ningún
servicio de pago. La API JavaScript con clave, sus radios y su interacción quedan
pendientes de aceptación con esa configuración real. La vista incrustada sí se
comprobó en navegador. Google recibe las coordenadas mostradas y la conexión del
navegador, conforme al uso del mapa solicitado.

Referencias oficiales consultadas:
[Maps y CSP](https://developers.google.com/maps/documentation/javascript/content-security-policy),
[carga de la API](https://developers.google.com/maps/documentation/javascript/load-maps-js-api),
[URLs de Maps](https://developers.google.com/maps/documentation/urls/get-started).

## Comprobaciones

- Semilla ejecutada y repetida: un solo cliente; no se sobrescriben cambios.
- Ocho controles de coherencia de saldo, recibos, estados y ausencia de efectos externos.
- 34 controles HTTP/BFF/PostgreSQL de clientes, contratos, permisos, aislamiento,
  versiones, transacciones y cierre de sesión; fixtures temporales retiradas.
- 18 controles de rutas/API protegidas, CSRF/origen y cabeceras, incluida CSP.
- Build de producción del frontend y lint de los archivos modificados.
- Sesión real del propietario: listado, dos contratos, cuenta corriente,
  comprobantes y tickets visibles. Mapas del cliente y cobertura CMC cargados
  en escritorio y móvil. Prueba de coordenadas del CMC revertida sin publicar.
- La revisión visual detectó overflow en la ficha móvil; se corrigió el mínimo
  intrínseco de las pistas de grid y se mantiene scroll únicamente en tablas.

No es aceptación de infraestructura pública ni de servicios de Google con clave.
