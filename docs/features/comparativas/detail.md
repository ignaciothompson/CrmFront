# Detalle de Comparativa (Público)

Ruta: `/comparacion/:id` (pública)

- Componente: `features/comparativas/pages/comparativa-detail/comparativa-detail.ts`
- Servicio: `ComparativaService`
- Mapas: `@angular/google-maps`

## Datos

- Lee `id` desde `ActivatedRoute.paramMap`
- Suscribe a `getComparativa(id)`
- `comparativa` contiene `contacto` (opcional) y `unidades` (snapshot denormalizado)

## UI

- Header con datos de contacto (si existe)
- Tabla de unidades: nombre, ciudad, barrio, cuartos, baños, tamaño, precio, expensas
- Lista de extras por unidad
- Mapa con marcadores (si hay coordenadas)

## Mapa

- Calcula el centro promedio de coordenadas válidas
- `markers` con `position: {lat, lng}` y `label` (nombre)
- Si no hay coordenadas, muestra mensaje

## Snippet

```ts
private computeMap(): void {
  const units = Array.isArray(this.comparativa?.unidades) ? this.comparativa.unidades : [];
  const withCoords = units.filter(u => typeof u?.lat === 'number' && typeof u?.lng === 'number');
  if (withCoords.length) {
    const avgLat = withCoords.reduce((sum, u) => sum + u.lat, 0) / withCoords.length;
    const avgLng = withCoords.reduce((sum, u) => sum + u.lng, 0) / withCoords.length;
    this.mapCenter = { lat: avgLat, lng: avgLng };
    this.markers = withCoords.map(u => ({ position: { lat: u.lat, lng: u.lng }, label: u?.nombre || '' }));
  } else {
    this.mapCenter = null;
    this.markers = [];
  }
}
```

## Consideraciones

- Asegurar permisos de Google Maps API en el dominio público
- Manejar comparativas inexistentes (id inválido)
