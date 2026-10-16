---
proyecto: ComeCore
tipo: cobertura-funcional
fecha: 2026-10-14
estado: revision-estatica-y-recorridos-locales
---

# Acciones del ERP: alcance comprobado

Actualización de persistencia del 16/10/2026: [[Bitacora/2026-10-16-Persistencia-Relacional]]. Se comprobó la integración por HTTP y SQL; el inventario de clicks siguiente conserva sus recorridos de navegador anteriores.

Se revisaron 71 archivos actuales, con **667 controles con eventos y 248 campos** mediante AST TypeScript. El índice `docs/database-model/actions.md` identifica módulo, control, handler y línea; `actions.json` permite repetir el análisis con `node scripts/inventory-erp-actions.cjs`. Incluye componentes reutilizados y código conservado que ya no se renderiza: no equivale a 667 clicks ejecutados.

[[09-Inventario-Funcional-ERP]] conserva el análisis histórico de campos y reglas. El ZIP importado el 12 de octubre sustituyó Inventario y Facturación: actualmente Inventario muestra Stock/Artículos y Facturación Comprobantes de Pago. Las rutas de otras vistas de facturación redirigen, después de validar permisos. Sus tablas siguen siendo útiles para los próximos flujos contables.

## Recorridos realizados

| Superficie | Acciones revisadas en navegador | Persistencia y límites |
|---|---|---|
| Acceso | Login, desafío MFA y código de respaldo; repetido el 14 de octubre con cuenta aislada | Autenticación y MFA reales; no se usaron contraseñas de usuarios reales |
| Paneles | Básico/Facturación/Servidores y navegación | Indicadores demo |
| Clientes | Filtros y limpiar; alta sintética; Básico/Facturación/Pasarela; panel Detalle/Consumo/Mapa/Pagos/App/Auditoría; movimientos | Núcleo CRM conectado el 16/10 por HTTP/SQL; extensión cifrada para campos complementarios. Mapa externo y portal siguen sin verificar como servicios operativos |
| Contratos | Columnas; nuevo y validación vacía; Básico/Facturación/Avanzado; PPPoE/DHCP; opciones OLT | Sin aprovisionar red ni guardar credenciales de equipos |
| Planes | Recorrido de navegador previo: Listado y alta Básico/MikroTik/Código de producto | Desde el 16/10: API y PostgreSQL reales, códigos y contador por relación. Comprobado por HTTP; revalidación de clicks pendiente |
| Nodos | Coberturas, SSID/amplitud/artículo; paginación y tamaño de página | Datos demo; cobertura geográfica/radio no medida |
| Servidores | MikroTik sin configurar; configuración segura; BMU Básico/Conexión/Avanzado | No se conectó un router real; formulario BMU demo |
| Inventario | Stock; agregar filas producto/serie/MAC; Artículos, estado, selección y actualización masiva; detalle | Cambios solo en memoria; el alta heredada de artículos no persiste filas individuales. Antes de conectar debe sustituirse por una transacción validada |
| Facturación | Comprobantes; mostrar filtros, criterio nombre/factura, búsqueda sin resultados y recuperación de resultado, vista previa y movimientos | Documento demo; no pago, timbrado ni correo real |
| CMC | Revisión de handlers y conexión del bridge; pruebas locales de la fase previa; comprobación de denegación a organización ajena | Nueva estructura SQL CMS aún sin adaptar al bridge; sin publicación en internet en esta fase |

El recorrido inicial es del 12 de octubre y se completó/contrastó el 14. No se activaron acciones financieras, correo a terceros, cambio de credenciales reales, subida de archivos personales ni impresión externa para presentar una demostración como funcionamiento real.

## Qué no necesita otra tabla

Cerrar/cancelar, filtros temporales, paginación visual, mostrar contraseña, expandir navegación y vistas de ayuda son estado de interfaz. No se creó una tabla por botón. Las relaciones del negocio están en [[11-Modelo-ERP-Completo]] y [[Modelo/00-Relaciones]].

## Condiciones de cierre de la integración de cada módulo

Un handler debe llamar a una API con sesión/MFA y permiso servidor; la organización se deriva de la identidad; se comprueban entradas y relaciones; se confirma la transacción y auditoría; la respuesta devuelve la versión guardada; recargar debe mostrar el mismo estado. Deben probarse permisos negativos, UUID de otra organización, concurrencia y ausencia de secretos en logs. Hasta cumplirlo, el módulo mantiene su indicación de demostración.
