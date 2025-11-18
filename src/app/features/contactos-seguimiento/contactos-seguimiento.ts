import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ContactoService } from '../../core/services/contacto';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SubheaderComponent, FilterConfig } from '../../shared/components/subheader/subheader';
import { ContactoForm } from '../contactos/contacto-form/contacto-form';

@Component({
  selector: 'app-contactos-seguimiento',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, SubheaderComponent],
  templateUrl: './contactos-seguimiento.html',
  styleUrl: './contactos-seguimiento.css'
})
export class ContactosSeguimiento implements OnInit, OnDestroy {
  constructor(
    private contactoService: ContactoService,
    private modal: NgbModal
  ) {}

  // Filter configurations for subheader
  subheaderFilters: FilterConfig[] = [];

  // Tabs
  activeTab: 'proximos' | 'todos' = 'proximos';

  // Filters
  estadoFilter: string = '';

  all: any[] = [];
  filtered: any[] = [];
  upcomingContacts: any[] = []; // Contacts with proximoContacto in next 3 days
  
  // Card statistics
  totalSeguimiento: number = 0;
  upcomingThisWeek: number = 0;
  overdueContacts: number = 0;

  private sub?: Subscription;

  ngOnInit(): void {
    this.updateFilterConfigs();
    
    this.sub = this.contactoService.getContactos().subscribe(list => {
      this.all = list || [];
      this.computeStatistics();
      this.applyFilters();
    });
  }

  private updateFilterConfigs(): void {
    this.subheaderFilters = [
      {
        id: 'estado',
        type: 'select',
        label: 'Estado',
        values: [
          { value: '', label: 'Todos' },
          { value: 'Activo', label: 'Activo' },
          { value: 'Interesado', label: 'Interesado' },
          { value: 'Pendiente', label: 'Pendiente' },
          { value: 'Abandonado', label: 'Abandonado' }
        ],
        columnClass: 'col-xs-12 col-sm-6 col-md-3'
      }
    ];
  }

  onFilterSubmit(values: Record<string, any>): void {
    this.estadoFilter = values['estado'] || '';
    this.applyFilters();
  }

  private computeStatistics(): void {
    const seguimientoContacts = this.all.filter(c => c.tipoContacto === 'Seguimiento');
    this.totalSeguimiento = seguimientoContacts.length;

    const now = new Date();
    now.setHours(0, 0, 0, 0); // Normalize to start of day
    
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(now.getDate() + 3);
    
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(now.getDate() + 7);

    // Contacts with proximoContacto in next 3 days
    this.upcomingContacts = seguimientoContacts.filter(c => {
      if (!c.proximoContacto) return false;
      const proximoDate = new Date(c.proximoContacto);
      proximoDate.setHours(0, 0, 0, 0); // Normalize to start of day
      return proximoDate >= now && proximoDate <= threeDaysFromNow;
    });

    // Contacts with proximoContacto in next 7 days
    this.upcomingThisWeek = seguimientoContacts.filter(c => {
      if (!c.proximoContacto) return false;
      const proximoDate = new Date(c.proximoContacto);
      proximoDate.setHours(0, 0, 0, 0); // Normalize to start of day
      return proximoDate >= now && proximoDate <= sevenDaysFromNow;
    }).length;

    // Overdue contacts (proximoContacto is in the past)
    this.overdueContacts = seguimientoContacts.filter(c => {
      if (!c.proximoContacto) return false;
      const proximoDate = new Date(c.proximoContacto);
      proximoDate.setHours(0, 0, 0, 0); // Normalize to start of day
      return proximoDate < now;
    }).length;
  }

  applyFilters(): void {
    this.filtered = this.all.filter(c => {
      // Only show contacts with tipoContacto === 'Seguimiento'
      if (c.tipoContacto !== 'Seguimiento') return false;

      if (this.estadoFilter && c.estado !== this.estadoFilter) return false;

      return true;
    });
  }


  formatDate(timestamp: number | undefined): string {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleDateString('es-UY');
  }

  getEstadoLabelClass(estado: string): string {
    switch (estado) {
      case 'Activo':
        return 'label-success';
      case 'Interesado':
        return 'label-info';
      case 'Pendiente':
        return 'label-warning';
      case 'Abandonado':
        return 'label-danger';
      default:
        return 'label-default';
    }
  }

  editContacto(id: string): void {
    const modalRef = this.modal.open(ContactoForm, { size: 'xl', backdrop: 'static', keyboard: false });
    const component = modalRef.componentInstance as ContactoForm;
    component.contactoId = String(id);
    modalRef.result.then((result: any) => {
      // If saved successfully, reload contacts
      if (result === true) {
        this.computeStatistics();
        this.applyFilters();
      }
    }).catch(() => {
      // Modal closed without saving
    });
  }

  setActiveTab(tab: 'proximos' | 'todos'): void {
    this.activeTab = tab;
  }

  verContacto(c: any): void {
    this.editContacto(c.id);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}

