import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, docData, updateDoc, deleteDoc, query, where, setDoc } from '@angular/fire/firestore';
import { Observable, firstValueFrom } from 'rxjs';
import { EventMonitorService } from './event-monitor.service';

export interface UsuarioData {
  id?: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  canDelete?: boolean;
  localidades?: string[]; // Array of localidades: 'norte', 'sur', 'este'
  createdAt?: number;
  updatedAt?: number;
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private firestore = inject(Firestore);
  private events = inject(EventMonitorService);

  getUsuarios(): Observable<UsuarioData[]> {
    const ref = collection(this.firestore, 'usuarios');
    return collectionData(ref, { idField: 'id' }) as Observable<UsuarioData[]>;
  }

  async getUsuarioByEmail(email: string): Promise<UsuarioData | null> {
    try {
      const ref = collection(this.firestore, 'usuarios');
      const q = query(ref, where('email', '==', email));
      const snapshot = await firstValueFrom(collectionData(q, { idField: 'id' }) as Observable<UsuarioData[]>);
      return snapshot.length > 0 ? snapshot[0] : null;
    } catch (error) {
      console.error('Error getting usuario by email:', error);
      return null;
    }
  }

  getUsuarioById(id: string): Observable<UsuarioData | undefined> {
    const ref = doc(this.firestore, 'usuarios', id);
    return docData(ref, { idField: 'id' }) as Observable<UsuarioData | undefined>;
  }

  async addUsuario(usuario: UsuarioData) {
    const ref = collection(this.firestore, 'usuarios');
    const payload = {
      ...usuario,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    const added = await addDoc(ref, payload);
    await this.events.new('Usuarios', { id: added.id, ...payload });
    return added;
  }

  async updateUsuario(id: string, changes: Partial<UsuarioData>) {
    const ref = doc(this.firestore, 'usuarios', id);
    try {
      const previous = await firstValueFrom(docData(ref, { idField: 'id' }));
      if (previous) {
        // Document exists, update it
        const payload = {
          ...changes,
          updatedAt: Date.now()
        };
        await updateDoc(ref, payload);
        const current = { ...(previous as any), ...payload };
        await this.events.edit('Usuarios', previous as any, current);
      } else {
        // Document doesn't exist, create it
        const payload = {
          ...changes,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        await setDoc(ref, payload, { merge: true });
        await this.events.new('Usuarios', { id, ...payload });
      }
    } catch (error: any) {
      // If error occurs, try to create the document
      const payload = {
        ...changes,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      await setDoc(ref, payload, { merge: true });
      await this.events.new('Usuarios', { id, ...payload });
    }
  }

  async deleteUsuario(id: string) {
    const ref = doc(this.firestore, 'usuarios', id);
    const previous = await firstValueFrom(docData(ref, { idField: 'id' }));
    await deleteDoc(ref);
    await this.events.delete('Usuarios', previous as any);
  }
}

