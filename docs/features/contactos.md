# Contactos

Rutas: `/contactos` (lista), `/contactos/form`, `/contactos/form/:id`

## Lista de contactos

- Componente: `features/contactos/contactos.ts`
- Filtros:
  - Nombre/Apellido (typeahead por id)
  - Ciudad (`norte|sur|este` → etiquetas Montevideo/Canelones/Maldonado)
  - Barrio (dependiente de Ciudad)
  - Tipo de residencia (preferencia)
  - Cuartos (preferencia; 4 = 4+)
- Acciones: Nuevo, Editar, Eliminar
- Datos: `ContactoService.getContactos()`

Snippet filtro por nombre:
```html
<typeahead [(ngModel)]="nameSelectedId"
          [items]="nameItems"
          idKey="id"
          labelKey="label"
          placeholder="Escriba para filtrar...">
</typeahead>
```

## Formulario de contacto

- Componente: `features/contactos/contacto-form/contacto-form.ts`
- Modelo básico: Nombre, Apellido, Celular, Mail, Pareja, Familia
- Dirección: Ciudad (desbloquea Barrio) con catálogo por ciudad
- Preferencia: Ciudad, Barrio, Tipo de residencia, Cuartos
- Carga por id cuando hay `:id`; si `Pareja=false`, fuerza `familia=false`
- Guardar: `addContacto` o `updateContacto` y redirige a `/contactos`

Barrios dependientes:
```ts
private recomputeBarrios(): void {
  const dirCity = this.model.direccion.Ciudad;
  const prefCity = this.model.preferencia.Ciudad;
  const curatedDir = new Set<string>(this.barriosCatalog[dirCity] || []);
  const curatedPref = new Set<string>(this.barriosCatalog[prefCity] || []);
  this.barriosDireccion = Array.from(curatedDir).sort();
  this.barriosPreferencia = Array.from(curatedPref).sort();
}
```

## Consideraciones

- Normalizar nombres propios para soportar datos legados (Nombre/nombre, Apellido/apellido)
- Confirmación con `confirm()` antes de eliminar
