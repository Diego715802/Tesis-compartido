---
proyecto: ComeCore
tipo: planificacion
fecha_base: 2026-10-09
estado: planeado
---

> Actualización del 14 de octubre de 2026: esta nota conserva el análisis histórico. El modelo 007–011 ya se aplicó y probó; las cifras y pantallas vigentes están en [[11-Modelo-ERP-Completo]], [[12-Seguridad-y-Verificacion]] y [[13-Cobertura-de-Acciones]]. La existencia de tablas sigue sin equivaler a integración de todas las pantallas.


# Dominios planeados

El ERP contiene interfaces y módulos adicionales, pero `database/migrations/001_customer_domain.sql` solo define IAM, CRM y auditoría de clientes. La existencia de una pantalla no demuestra persistencia, tablas o integraciones de backend para su dominio.

| Dominio | Alcance que debe diseñarse | Dependencias a evaluar |
| --- | --- | --- |
| Autenticación de operadores | Proveedor mantenido, sesiones, recuperación y protección de operaciones del ERP. | Identidad externa y `iam.app_users`; membresías y autorización por organización. |
| Contratos | Contratación, vigencias, estados, servicios, cargos y vínculos operativos. | Clientes, organización y catálogo de servicios por definir. |
| Facturación y cobros | Facturas, pagos, ajustes, saldo basado en movimientos y conciliación. | Clientes, contratos y reglas fiscales; hoy solo existe el perfil fiscal y el resumen `customer_accounts`. |
| Inventario | Productos, almacenes, existencias, movimientos y asignaciones. | Organización, contratos y operación de red según reglas acordadas. |
| Red | Nodos, equipos, enlaces y su relación con servicios; integraciones de telemetría. | Organización, inventario y contratos según el diseño posterior. |

No se asignan nombres de tablas, columnas ni cardinalidades a estos dominios todavía. Cada uno requiere revisar la interfaz actual, acordar reglas, proponer una migración independiente y documentar el ERD correspondiente antes de afirmar que está implementado.

## Entrega esperada para cada dominio

1. Alcance, reglas y relación con los dominios existentes.
2. Migración revisable con restricciones, índices, autorización por organización y auditoría apropiada.
3. ERD con nombres reales y cardinalidades verificadas; actualización del [[05-Mapa-General|mapa general]].
4. Integración del backend y frontend, seguida de pruebas con evidencia del entorno.
5. Entrada de [[Cambio-Tecnico|bitácora técnica]] y sincronización de las notas a Obsidian.

Los cambios a diagramas no deben adelantarse al modelo real ni usar datos personales o secretos como ejemplos.
