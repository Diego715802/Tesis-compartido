# Monitor MikroTik y gráficas ECharts

Actualizado: 16 de octubre de 2026. Entorno validado: desarrollo local.

## Dónde está y qué muestra

El monitor está integrado en **Paneles de Control → Básico / Servidores** y en
**Servidores → MikroTik**, con el mismo componente y los permisos de red existentes.
No se movieron módulos ni se modificó el login. Los resúmenes administrativos que
todavía son demostrativos mantienen su identificación independiente.

| Gráfica | Datos y unidades |
| --- | --- |
| CPU y memoria | Porcentaje; bandas visuales de CPU en 50/80 %, sin implicar una alarma configurada |
| Tráfico RX/TX | Diferencia de contadores entre lecturas consecutivas, en Mbps |
| Evolución de temperatura | Serie individual por sensor de temperatura, en °C |
| Mapa de calor del equipo | Sensores × tiempo; color por °C. No es una termografía física |
| Tráfico por interfaz | Última medición RX + TX, hasta 12 interfaces |
| Intensidad por interfaz | Historial de hasta 12 interfaces, elegidas por su máximo observado, en Mbps |
| Consumo y alimentación | Potencia W y voltaje V, cada magnitud con su eje |
| Velocidad de ventiladores | Serie por ventilador, en RPM; no presión sonora |

Se adaptaron las referencias de Apache ECharts del usuario: línea con `visualMap`,
línea temporal con área/zoom y mapa de calor. No se descarga el ejemplo de calidad
del aire de Beijing ni se usa ruido Perlin o números aleatorios en el monitor.
Un ISP opera todo el día: se conserva el tiempo continuo y se interrumpen las
líneas cuando faltan lecturas, sin ocultar noches o cortes como si fueran cierres
bursátiles. La escala térmica visual parte de 0–100 °C y se amplía si hay una lectura
fuera de ese intervalo; no define la temperatura segura de ningún modelo.

## Lecturas y controles

- Consulta cada 15 segundos después de terminar la anterior, solo con la pestaña
  visible; pausa/reanudar y actualización manual. No hay solicitudes superpuestas
  en una misma vista.
- El backend comparte una lectura SSH en curso entre espectadores y conserva un
  caché de 10 segundos, incluso de errores; no abre una conexión por cada gráfico.
- Las primeras tasas, los contadores reiniciados y los intervalos superiores a
  60 segundos aparecen sin tasa válida, nunca como tráfico cero confirmado.
- Hasta 360 muestras en memoria de la vista, aproximadamente 90 minutos al ritmo
  nominal. Hay ventanas de 15/30/90 minutos, zoom, restauración y exportación PNG.
  Pausas, pestaña oculta y tiempo de consulta pueden modificar la duración real.
- El historial se reinicia al salir/desmontar el monitor o cambiar de equipo.
  **Todavía no hay histórico permanente de telemetría en PostgreSQL.**
- Los sensores ausentes no se inventan. La disponibilidad y formato real se
  deben contrastar con `/system health print` del equipo conectado.
- La suma de interfaces puede contar varias veces un mismo flujo (p. ej. bridge,
  puerto físico y VLAN). No debe interpretarse como consumo del enlace WAN.

## Conectar un equipo físico

Mantener los secretos únicamente en `apps/backend/.env` o en el gestor de secretos
del despliegue. No introducirlos en el navegador, Obsidian, Git o capturas.

```dotenv
MIKROTIK_HOST=
MIKROTIK_ORGANIZATION_ID=
MIKROTIK_SSH_PORT=22
MIKROTIK_USERNAME=
MIKROTIK_PASSWORD=
# Alternativa a contraseña: ruta de una llave privada protegida, en el servidor.
MIKROTIK_PRIVATE_KEY_PATH=
# SHA-256 hexadecimal de 64 caracteres de la clave pública SSH verificada.
MIKROTIK_SSH_HOST_HASH=
```

El host debe ser accesible desde el **backend**, no solamente desde la Mac del
operador. Usar red privada/VPN y una cuenta RouterOS limitada a lectura y SSH;
comprobar sus permisos en esa versión/modelo. Verificar la huella por un canal
independiente. No se desactiva la comprobación de host ni se abre SSH a Internet.
Reiniciar el backend después de configurar las variables. El proceso valida la
organización propietaria y la huella antes de habilitar la conexión.

Consultas permitidas por el lector:

```routeros
:put [/system identity get name]
/system resource print as-value
/system health print as-value
/interface print stats as-value
```

El lector tiene un límite total de 12 s y límites de tamaño de respuesta. Si el
modelo no tiene `/system health`, las mediciones restantes pueden funcionar.
El navegador consulta un BFF de Next.js; el backend verifica sesión, MFA,
`red:read`, gateway y organización propietaria. Las gráficas no modifican RouterOS.
Los tooltips usan texto enriquecido de canvas, sin insertar nombres del router
como HTML ejecutable. ECharts se carga por módulos y conserva el zoom al actualizar.

## Verificación realizada y alcance

- 73 pruebas backend y 13 frontend aprobaron en esta iteración; las 13 incluyen
  renderizado ECharts de las ocho gráficas, actualización, huecos y conservación
  del zoom. El lector SSH se probó con un servidor local sintético, contadores,
  caché/concurrencia y rechazo de una huella incorrecta.
- La guarda de red existente se volvió a probar con MFA y otra organización:
  la segunda se rechaza antes de ejecutar el servicio.
- Builds de backend y frontend y verificaciones estáticas de los archivos
  modificados. Las comprobaciones HTTP de rutas protegidas se registran en la
  bitácora con su resultado real.
- Recorrido en Chrome: login con una cuenta **temporal**, MFA real, ocho gráficos
  de canvas con identidad **QA SINTÉTICO — NO ES UN ROUTER FÍSICO**, pausa y ventana
  de tiempo. Escritorio 1440 px y móvil 390 px sin desbordamiento horizontal ni
  errores de consola durante el recorrido.
- Las capturas en `apps/frontend/.impeccable/review/mikrotik/` son evidencia de QA
  sintética. No documentan mediciones de CometaLink ni conexión a hardware real.

Herramientas QA locales optativas: `scripts/qa-monitor-session.mjs prepare`,
`scripts/qa-mikrotik-ssh.mjs` y `scripts/qa-monitor-session.mjs cleanup`. La segunda
necesita libre el puerto local 3001; reemplaza **temporalmente** el backend mientras
se ejecuta. Al terminar, detenerla, iniciar el backend normal y limpiar la cuenta.
Nunca usarlas para una demostración presentada como lectura de un equipo físico.

Pendientes: conexión y comparación con el RouterOS/modelo del usuario, frecuencia
adecuada al hardware, selección explícita de WAN, umbrales y alarmas por modelo,
histórico persistente y recolección continua independiente del navegador. No se
afirma aceptación de producción, HTTPS/proxy público ni respaldo de telemetría.

## Fuentes primarias consultadas

- [Apache ECharts: visualMap](https://echarts.apache.org/handbook/en/concepts/visual-map/).
- [Apache ECharts: ejes y zoom](https://apache.github.io/echarts-handbook/en/concepts/axis/).
- [MikroTik: sensores de salud](https://manual.mikrotik.com/docs/cli-reference/system/health/).
- [MikroTik: estadísticas de interfaces](https://help.mikrotik.com/docs/spaces/ROS/pages/139526175/Interface+stats+and+monitor-traffic).
