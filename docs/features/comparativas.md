# Comparativas

Flujo completo para crear, listar y compartir comparativas de unidades.

- Ruta crear: `/comparativas`
- Ruta listado: `/listado-comparativas`
- Ruta pública: `/comparacion/:id`

Páginas:
- Crear comparativa: ver filtros, selección y confirmación → [Crear](features/comparativas/create.md)
- Listado de comparativas: filtro por contacto, compartir/eliminar → [Listado](features/comparativas/list.md)
- Detalle público con mapa: tabla y extras + markers → [Detalle público](features/comparativas/detail.md)
- Modal de comparación: selección de contacto y ajuste de unidades → [Compare Modal](features/comparativas/modal.md)

Servicios:
- `ComparativaService`: CRUD de comparativas
- `UnidadService`, `ProyectoService`: fuentes de datos para filtros
- `ContactoService`: selector de cliente (typeahead)
