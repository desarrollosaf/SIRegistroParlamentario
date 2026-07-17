import { Component, inject, signal, ViewChild, TemplateRef, NgZone } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin, Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { AliasDiputadoService } from '../../../service/alias-diputado.service';

@Component({
  selector: 'app-alias-diputado',
  imports: [NgxDatatableModule, CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './alias-diputado.component.html',
  styleUrl: './alias-diputado.component.scss'
})
export class AliasDiputadoComponent {

  originalData = signal<any[]>([]);
  temp = signal<any[]>([]);
  rows = signal<any[]>([]);
  page = signal<number>(0);
  pageSize = signal<number>(10);
  filteredCount = signal<number>(0);
  loading = signal<boolean>(true);
  guardando = signal<boolean>(false);

  diputadoSeleccionado = signal<any>(null);
  form!: FormGroup;
  modalRef!: NgbModalRef;

  @ViewChild('modalEditar') modalEditar!: TemplateRef<any>;

  private _aliasService = inject(AliasDiputadoService);

  constructor(private ngZone: NgZone, private modalService: NgbModal, private fb: FormBuilder) {
    this.form = this.fb.group({
      alias: ['', [Validators.maxLength(255)]],
      name: ['', [Validators.maxLength(255)]],
      email: ['', [Validators.email, Validators.maxLength(255)]],
    });
  }

  ngOnInit(): void {
    this.cargarDiputados();
  }

  cargarDiputados(): void {
    this.loading.set(true);
    this._aliasService.listarDiputados().subscribe({
      next: (response: any) => {
        const data = response.data ?? [];
        this.originalData.set(data);
        this.temp.set(data);
        this.filteredCount.set(data.length);
        this.setPage({ offset: 0 });
        this.loading.set(false);
      },
      error: (e: HttpErrorResponse) => {
        this.loading.set(false);
        Swal.fire('Error', e.error?.msg || 'No se pudieron cargar los diputados', 'error');
      }
    });
  }

  nombreCompleto(row: any): string {
    if (!row) return '';
    return `${row.apaterno ?? ''} ${row.amaterno ?? ''} ${row.nombres ?? ''}`.trim();
  }

  abrirModal(row: any): void {
    this.diputadoSeleccionado.set(row);
    this.form.reset({
      alias: row.alias ?? '',
      name: row.name ?? '',
      email: row.email ?? '',
    });
    // Si no tiene usuario, no se pueden editar name/email.
    if (row.tiene_usuario) {
      this.form.get('name')?.enable();
      this.form.get('email')?.enable();
    } else {
      this.form.get('name')?.disable();
      this.form.get('email')?.disable();
    }
    this.modalRef = this.modalService.open(this.modalEditar, { size: 'lg' });
  }

  guardar(): void {
    if (this.form.invalid) return;
    const dip = this.diputadoSeleccionado();
    if (!dip) return;

    const nuevoAlias: string = (this.form.value.alias ?? '').trim();
    const peticiones: Record<string, Observable<any>> = {
      alias: this._aliasService.actualizarAlias(dip.diputado_id, nuevoAlias || null),
    };

    // Solo actualiza usuario si el diputado tiene uno asignado.
    if (dip.tiene_usuario) {
      peticiones['usuario'] = this._aliasService.actualizarUsuario(dip.integrante_legislatura_id, {
        name: (this.form.get('name')?.value ?? '').trim(),
        email: (this.form.get('email')?.value ?? '').trim(),
      });
    }

    this.guardando.set(true);
    forkJoin(peticiones).subscribe({
      next: (res: any) => {
        const cambios: any = { alias: res.alias?.data?.alias ?? (nuevoAlias || null) };
        if (res.usuario?.data) {
          cambios.name = res.usuario.data.name;
          cambios.email = res.usuario.data.email;
        }
        this.actualizarFila(dip.integrante_legislatura_id, cambios);
        this.guardando.set(false);
        this.modalRef.close();
        Swal.fire('Listo', 'Cambios guardados correctamente', 'success');
      },
      error: (e: HttpErrorResponse) => {
        this.guardando.set(false);
        Swal.fire('Error', e.error?.msg || 'No se pudieron guardar los cambios', 'error');
      }
    });
  }

  resetearPassword(): void {
    const dip = this.diputadoSeleccionado();
    if (!dip || !dip.tiene_usuario) return;

    Swal.fire({
      title: '¿Restablecer contraseña?',
      text: `Se restablecerá la contraseña de ${this.nombreCompleto(dip)} a la contraseña por defecto.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#800048',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, restablecer',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (!result.isConfirmed) return;
      this._aliasService.resetearPassword(dip.integrante_legislatura_id).subscribe({
        next: (res: any) => {
          Swal.fire({
            title: 'Contraseña restablecida',
            html: `Nueva contraseña: <strong>${res.data?.password_default ?? ''}</strong>`,
            icon: 'success',
          });
        },
        error: (e: HttpErrorResponse) => {
          Swal.fire('Error', e.error?.msg || 'No se pudo restablecer la contraseña', 'error');
        }
      });
    });
  }

  // Actualiza una fila en memoria (por integrante_legislatura_id) sin recargar toda la tabla.
  private actualizarFila(integranteId: string, cambios: any): void {
    const aplicar = (lista: any[]) =>
      lista.map((d) => (d.integrante_legislatura_id === integranteId ? { ...d, ...cambios } : d));
    this.originalData.set(aplicar(this.originalData()));
    this.temp.set(aplicar(this.temp()));
    this.setPage({ offset: this.page() });
  }

  setPage(pageInfo: any): void {
    this.page.set(pageInfo.offset);
    const start = this.page() * this.pageSize();
    const end = start + this.pageSize();
    this.rows.set(this.temp().slice(start, end));
  }

  updateFilter(event: any): void {
    const val = (event.target?.value || '').toLowerCase();

    this.ngZone.runOutsideAngular(() => {
      const filtered = this.originalData().filter((row: any) => {
        const nombre = this.nombreCompleto(row).toLowerCase();
        const alias = (row.alias || '').toLowerCase();
        const name = (row.name || '').toLowerCase();
        const email = (row.email || '').toLowerCase();
        return nombre.includes(val) || alias.includes(val) || name.includes(val) || email.includes(val);
      });

      this.ngZone.run(() => {
        this.temp.set(filtered);
        this.filteredCount.set(filtered.length);
        this.setPage({ offset: 0 });
      });
    });
  }
}
