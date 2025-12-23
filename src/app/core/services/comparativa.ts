import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Observable, from } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ComparativaService {
	private supabase = inject(SupabaseService);

	getComparativas(): Observable<any[]> {
		return from(
			this.supabase.client
				.from('comparativas')
				.select('*')
				.then(response => {
					if (response.error) throw response.error;
					return response.data || [];
				})
		);
	}

	getComparativa(id: string): Observable<any> {
		return from(
			this.supabase.client
				.from('comparativas')
				.select('*')
				.eq('id', id)
				.single()
				.then(response => {
					if (response.error) throw response.error;
					return response.data;
				})
		);
	}

	async addComparativa(payload: any) {
		const { data, error } = await this.supabase.client
			.from('comparativas')
			.insert(payload)
			.select()
			.single();
		if (error) throw error;
		return { id: data.id };
	}

	async deleteComparativa(id: string) {
		const { error } = await this.supabase.client
			.from('comparativas')
			.delete()
			.eq('id', id);
		if (error) throw error;
	}
}
