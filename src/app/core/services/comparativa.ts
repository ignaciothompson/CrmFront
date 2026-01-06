import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Observable, from } from 'rxjs';
import { generateComparativaToken } from '../utils/comparativa-token.util';

@Injectable({ providedIn: 'root' })
export class ComparativaService {
	private supabase = inject(SupabaseService);

	getComparativas(): Observable<any[]> {
		return from(
			this.supabase.client
				.from('comparativas')
				.select(`
					*,
					contactos:contacto_id (
						id,
						nombre,
						apellido,
						telefono,
						mail
					),
					comparativa_items (
						id,
						unidad_id,
						unidades:unidad_id (
							id,
							nombre,
							tipo_unidad,
							estado_comercial,
							proyecto_id,
							ciudad_id,
							barrio_id,
							dormitorios,
							banos,
							orientacion,
							distribucion,
							m2_totales,
							m2_internos,
							superficie_edificada,
							superficie_terreno,
							piso,
							plantas,
							hectareas,
							altura,
							precio,
							responsable,
							comision,
							entrega,
							terraza,
							garage,
							tamano_terraza,
							tamano_garage,
							precio_garage,
							amenities,
							ciudades:ciudad_id (
								id,
								nombre
							),
							barrios:barrio_id (
								id,
								nombre
							),
							proyectos:proyecto_id (
								id,
								nombre
							)
						)
					)
				`)
				.then(response => {
					console.log('getComparativas - Raw response:', response);
					if (response.error) {
						console.error('getComparativas - Error:', response.error);
						throw response.error;
					}
					console.log('getComparativas - Data:', response.data);
					// Transform to app format
					const transformed = (response.data || []).map(c => {
						console.log('getComparativas - Transforming:', c);
						return this.transformComparativa(c);
					});
					console.log('getComparativas - Transformed:', transformed);
					return transformed;
				})
		);
	}

	getComparativa(idOrToken: string): Observable<any> {
		return from(
			(async () => {
				// Build the select query with all necessary fields
				const selectQuery = `
					*,
					contactos:contacto_id (
						id,
						nombre,
						apellido,
						telefono,
						mail
					),
					comparativa_items (
						id,
						unidad_id,
						unidades:unidad_id (
							id,
							nombre,
							tipo_unidad,
							estado_comercial,
							proyecto_id,
							ciudad_id,
							barrio_id,
							dormitorios,
							banos,
							orientacion,
							distribucion,
							m2_totales,
							m2_internos,
							superficie_edificada,
							superficie_terreno,
							piso,
							plantas,
							hectareas,
							altura,
							precio,
							responsable,
							comision,
							entrega,
							terraza,
							garage,
							tamano_terraza,
							tamano_garage,
							precio_garage,
							amenities,
							ciudades:ciudad_id (
								id,
								nombre
							),
							barrios:barrio_id (
								id,
								nombre
							),
							proyectos:proyecto_id (
								id,
								nombre
							)
						)
					)
				`;

				// Try by token first (if it looks like a token - alphanumeric and longer than 10 chars)
				const looksLikeToken = /^[A-Za-z0-9]{20,}$/.test(idOrToken);
				
				let response: any;
				
				if (looksLikeToken) {
					response = await this.supabase.client
						.from('comparativas')
						.select(selectQuery)
						.eq('share_token', idOrToken)
						.maybeSingle();
					
					if (!response.error && response.data) {
						console.log('Found by token:', response.data);
						return this.transformComparativa(response.data);
					}
					
					if (response.error && response.error.code !== 'PGRST116') {
						// If it's not a "not found" error, throw it
						throw response.error;
					}
				}

				// Fallback: try by ID (numeric or UUID)
				response = await this.supabase.client
					.from('comparativas')
					.select(selectQuery)
					.eq('id', idOrToken)
					.single();
				
				if (response.error) {
					console.error('Error fetching comparativa:', response.error);
					throw response.error;
				}
				
				console.log('Found by ID:', response.data);
				return this.transformComparativa(response.data);
			})()
		);
	}

	getComparativaByToken(token: string): Observable<any> {
		return from(
			this.supabase.client
				.from('comparativas')
				.select(`
					*,
					contactos:contacto_id (
						id,
						nombre,
						apellido,
						telefono,
						mail
					),
					comparativa_items (
						id,
						unidad_id,
						unidades:unidad_id (
							id,
							nombre,
							tipo_unidad,
							estado_comercial,
							proyecto_id,
							ciudad_id,
							barrio_id,
							dormitorios,
							banos,
							orientacion,
							distribucion,
							m2_totales,
							m2_internos,
							superficie_edificada,
							superficie_terreno,
							piso,
							plantas,
							hectareas,
							altura,
							precio,
							responsable,
							comision,
							entrega,
							terraza,
							garage,
							tamano_terraza,
							tamano_garage,
							precio_garage,
							amenities,
							ciudades:ciudad_id (
								id,
								nombre
							),
							barrios:barrio_id (
								id,
								nombre
							),
							proyectos:proyecto_id (
								id,
								nombre
							)
						)
					)
				`)
				.eq('share_token', token)
				.single()
				.then(response => {
					if (response.error) throw response.error;
					return this.transformComparativa(response.data);
				})
		);
	}

	async addComparativa(payload: any) {
		// Extract data from payload
		const contactoId = payload?.contacto?.id || payload?.contactoId || null;
		const unidades = Array.isArray(payload?.unidades) ? payload.unidades : [];
		const fecha = payload?.fecha || payload?.createdAt ? new Date(payload.fecha || payload.createdAt).toISOString() : new Date().toISOString();
		
		// Generate unique share token
		const shareToken = generateComparativaToken();

		// Insert comparativa
		const { data: comparativaData, error: comparativaError } = await this.supabase.client
			.from('comparativas')
			.insert({
				contacto_id: contactoId,
				fecha: fecha,
				share_token: shareToken
			})
			.select()
			.single();

		if (comparativaError) throw comparativaError;
		if (!comparativaData?.id) throw new Error('Error al crear la comparativa');

		const comparativaId = comparativaData.id;

		// Insert comparativa_items
		if (unidades.length > 0) {
			const items = unidades.map((u: any) => ({
				comparativa_id: comparativaId,
				unidad_id: String(u.id)
			}));

			const { error: itemsError } = await this.supabase.client
				.from('comparativa_items')
				.insert(items);

			if (itemsError) {
				// Rollback: delete comparativa if items insert fails
				await this.supabase.client
					.from('comparativas')
					.delete()
					.eq('id', comparativaId);
				throw itemsError;
			}
		}

		return { id: comparativaId, token: shareToken };
	}

	async deleteComparativa(id: string) {
		// Delete items first (foreign key constraint)
		const { error: itemsError } = await this.supabase.client
			.from('comparativa_items')
			.delete()
			.eq('comparativa_id', id);

		if (itemsError) throw itemsError;

		// Delete comparativa
		const { error } = await this.supabase.client
			.from('comparativas')
			.delete()
			.eq('id', id);

		if (error) throw error;
	}

	/**
	 * Transform database format to app format
	 */
	private transformComparativa(dbRow: any): any {
		if (!dbRow) {
			console.warn('transformComparativa: dbRow is null or undefined');
			return dbRow;
		}

		console.log('transformComparativa - dbRow:', dbRow);
		console.log('transformComparativa - comparativa_items:', dbRow.comparativa_items);

		// Transform contacto
		const contacto = dbRow.contactos ? {
			id: dbRow.contactos.id,
			nombre: dbRow.contactos.nombre || '',
			apellido: dbRow.contactos.apellido || '',
			telefono: dbRow.contactos.telefono || '',
			mail: dbRow.contactos.mail || ''
		} : null;

		// Transform unidades from comparativa_items
		let unidades: any[] = [];
		
		if (Array.isArray(dbRow.comparativa_items)) {
			console.log('comparativa_items is array, length:', dbRow.comparativa_items.length);
			unidades = dbRow.comparativa_items
				.filter((item: any) => {
					const hasUnidad = !!item.unidades;
					if (!hasUnidad) {
						console.warn('Item without unidad:', item);
					}
					return hasUnidad;
				})
				.map((item: any) => {
					const u = item.unidades;
					console.log('Processing unidad:', u);
					return {
						id: u.id,
						nombre: u.nombre || '',
						tipo: u.tipo_unidad || '',
						estadoComercial: u.estado_comercial || '',
						proyectoId: u.proyecto_id || null,
						proyectoNombre: u.proyectos?.nombre || '',
						ciudad: u.ciudades?.nombre || '',
						barrio: u.barrios?.nombre || '',
						dormitorios: u.dormitorios ?? null,
						banos: u.banos ?? null,
						orientacion: u.orientacion || null,
						distribucion: u.distribucion || null,
						m2Totales: u.m2_totales ?? null,
						m2Internos: u.m2_internos ?? null,
						superficieEdificada: u.superficie_edificada ?? null,
						superficieTerreno: u.superficie_terreno ?? null,
						piso: u.piso ?? null,
						plantas: u.plantas ?? null,
						hectareas: u.hectareas ?? null,
						altura: u.altura || null,
						tamanoM2: u.m2_totales ?? u.m2_internos ?? u.superficie_edificada ?? u.superficie_terreno ?? null,
						precioUSD: u.precio ?? null,
						responsable: u.responsable || null,
						comision: u.comision ?? null,
						entrega: u.entrega || null,
						terraza: u.terraza || null,
						garage: u.garage || null,
						tamanoTerraza: u.tamano_terraza ?? null,
						tamanoGarage: u.tamano_garage ?? null,
						precioGarage: u.precio_garage ?? null,
						expensasUSD: null, // Expensas no están almacenadas en la tabla unidades
						extras: Array.isArray(u.amenities) 
							? u.amenities.map((a: any) => typeof a === 'string' ? a : (a?.name || a?.label || ''))
							: [],
						imagenUrl: null, // Imagen no está almacenada en la tabla unidades
						lat: null, // Coordenadas no están almacenadas en la tabla unidades
						lng: null // Coordenadas no están almacenadas en la tabla unidades
					};
				});
		} else {
			console.warn('comparativa_items is not an array:', dbRow.comparativa_items);
		}

		console.log('Transformed unidades:', unidades);

		// Transform fecha to createdAt timestamp for compatibility
		const fecha = dbRow.fecha ? new Date(dbRow.fecha).getTime() : Date.now();

		const result = {
			id: dbRow.id,
			token: dbRow.share_token || null,
			contactoId: dbRow.contacto_id,
			fecha: dbRow.fecha,
			createdAt: fecha, // For compatibility with existing code
			contacto: contacto,
			unidades: unidades
		};

		console.log('Final transformed comparativa:', result);
		return result;
	}
}
