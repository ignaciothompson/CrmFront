# Dashboard

Ruta: `/dashboard` (protegida)

- Componente: `features/dashboard/dashboard.ts`
- Librerías: `@fullcalendar/angular`
- Servicios: `UnidadService`, `ContactoService`, `EntrevistaService`, Firestore (`eventos`)

## Tarjetas (cards)

- Unidades Totales: cantidad de unidades
- Contactos: cantidad total de contactos
- Unidades Disponibles: unidades no vendidas
- Meets pendientes: entrevistas con `pendiente=true`

## Calendario de entrevistas

- Vista por mes/semana/día, con botones Hoy/Prev/Sig
- Eventos construidos desde `EntrevistaService.getEntrevistas()` usando `fecha` y `hora`
- Click en evento abre `MeetModal` (detalle del contacto/meet)

## Actividad reciente

- Fuente: colección `eventos`
- Filtra solo los del día actual, ordenados por `fecha` desc
- Mapea icono, texto y tono según `categoria`/`tipo`
- Click navega a la entidad (contacto/unidad/entrevistas) o al Monitor de Eventos

## Consideraciones

- Altura del calendario y scroll en actividad controlados por CSS inline en la vista
- Si se usan emuladores, los eventos deben estar poblados para ver actividad
