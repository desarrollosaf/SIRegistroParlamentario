import { Component, ElementRef, inject, QueryList, ViewChildren, ViewChild, TemplateRef } from '@angular/core';
import { FormArray, FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ColumnMode, DatatableComponent, NgxDatatableModule } from '@siemens/ngx-datatable';
import { AfterViewInit } from '@angular/core';
@Component({
  selector: 'app-agenda',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule, RouterLink,NgxDatatableModule],
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.scss'
})
export class AgendaComponent {
  originalData: any[] = []; 
  temp: any[] = [];   
  rows: any[] = [];
  page: number = 0;
  pageSize: number = 10;
  filteredCount: number = 0;
  loading: boolean = true;
  @ViewChild('table') table: DatatableComponent;

  constructor() {
  }

  ngOnInit(): void {
  // this._solicitudService.getsolicitudes().subscribe({
  //     next: (response: any) => {
    const response = [
    { id: '0', fecha: '06/02/2025', quien:'Sesión de la Diputación Permanente 02/07/2025', ubicacion:'Salón de Protocolos' },
    { id: '1', fecha: '07/02/2025', quien:'Sesión deliberante 26/06/2025', ubicacion:'Salón de Plenos "José María Morelos y Pavón"' },
    { id: '2', fecha: '08/02/2025', quien:'	DESARROLLO DE LA JUNTA DE ELECCIÓN DEL 26-06-2025', ubicacion:'Salón de Plenos "José María Morelos y Pavón"' },
    { id: '3', fecha: '09/02/2025', quien:'PROTOCOLO DE LA SESIÓN SOLEMNE DE APERTURA 26-06-25', ubicacion:'	Salón de Plenos "José María Morelos y Pavón"' },
    { id: '4', fecha: '10/02/2025', quien:'	23/06/2025 Sesión de la Diputación Permanente', ubicacion:'Salón "Benito Juárez"' },
  ];
        console.log(response)
        this.originalData = [...response];
        this.temp = [...this.originalData];
        this.filteredCount = this.temp.length;
        this.setPage({ offset: 0 });
        this.loading = false;
        
    //   },
    //   error: (e: HttpErrorResponse) => {
    //     const msg = e.error?.msg || 'Error desconocido';
    //     console.error('Error del servidor:', msg);
    //   }
    // });

}
    setPage(pageInfo: any) {
    this.page = pageInfo.offset;
    const start = this.page * this.pageSize;
    const end = start + this.pageSize;
    this.rows = this.temp.slice(start, end); 
  }

  updateFilter(event: any) {
    const val = (event.target?.value || '').toLowerCase();
    this.temp = this.originalData.filter((row: any) => {
      return Object.values(row).some((field) => {
        return field && field.toString().toLowerCase().includes(val);
      });
    });

    this.filteredCount = this.temp.length;
    this.setPage({ offset: 0 }); 
  }
}
