import { Component, inject, signal, ViewChild, TemplateRef, ChangeDetectorRef, NgZone, ChangeDetectionStrategy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ColumnMode, DatatableComponent, isNullOrUndefined, NgxDatatableModule } from '@siemens/ngx-datatable';
import { Router, RouterLink, RouterModule, ActivatedRoute  } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CatalogosService } from '../../../../service/catalogos.service';


interface Categoria {
  id: number;
  valor: string;
}

interface Proponente {
  id: number;
  valor: string;
  categorias: Categoria[];
}

export interface TipoProponente {
  id: string;
  id_original: number;
  proponente_id: number;
  proponente_valor: string;
  tipo: string;
  valor: string;
}


@Component({
  selector: 'app-edit-catalogos',
  imports: [NgxDatatableModule, CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './edit-catalogos.html',
  styleUrl: './edit-catalogos.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})



export class EditCatalogos { 

  

  private _catalogoService = inject(CatalogosService);
  id: string | null = null;
 
  proponente = signal<Proponente | null>(null);
  tiposProponentes = signal<TipoProponente[]>([]);



  categoriasDisponibles: any[] = []; 
  categoriaSeleccionada: number | null = null; 

  titular = {
    nombre: '',
    fechaInicio: '',
    fechaFin: ''
  };



  constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router) {
      this.id = route.snapshot.paramMap.get('id') ;
    }

  ngOnInit(): void {
   this._catalogoService.getCatalogo(this.id!).subscribe({ 
    next: (response: any) => {
      console.log(response);
      this.tiposProponentes.set(response.tiposProponentes)
      this.proponente.set(response.data); 
      this.categoriasDisponibles = response.categoriasInciativas;
      console.log(this.tiposProponentes());
    },
    error: (e: HttpErrorResponse) => console.error(e)
  });
    
  }

  trackById(index: number, item: any) {
  return item.id;
}
  
  cargarCategoriasDisponibles() {
    // this._catalogoService.getCategorias().subscribe({
    //   next: (res: any) => this.categoriasDisponibles = res.data,
    //   error: (e: HttpErrorResponse) => console.error(e)
    // });
  }

  agregarCategoria() {
    if (!this.categoriaSeleccionada) return;

    const data = {
      proponete: this.proponente()?.id,
      categoria: this.categoriaSeleccionada
    }
    this._catalogoService.agregarCategoriaProponente(data)
      .subscribe({
        next: (res: any) => {
         this.proponente.set(res.data);
          console.log(this.proponente())
          this.categoriaSeleccionada = null; 
        },
        error: (e: HttpErrorResponse) => console.error(e)
      });
  }


  eliminarCategoria(catId: number) {
    const proponenteId = this.proponente()?.id;
    if (!proponenteId) return;

    const data = {
      proponete: this.proponente()?.id,
      categoria: catId
    }
    this._catalogoService.eliminarCategoriaProponente(data)
      .subscribe({
        next: (res: any) => {
          this.proponente.set(res.data);
        },
        error: (e: HttpErrorResponse) => console.error(e)
      });
  }

  agregarTitular() {
    if (!this.titular.nombre || !this.titular.fechaInicio) return;

    const payload = {
      proponenteId: this.proponente()?.id,
      nombre: this.titular.nombre,
      fecha_inicio: this.titular.fechaInicio,
      fecha_fin: this.titular.fechaFin
    };
    console.log(payload)

    // this._catalogoService.agregarTitular(payload).subscribe({
    //   next: (res: any) => {
    //     // sincroniza estado
    //     this.proponente.set(res.data);

    //     // limpia formulario
    //     this.titular = {
    //       nombre: '',
    //       fechaInicio: '',
    //       fechaFin: ''
    //     };
    //   },
    //   error: err => console.error(err)
    // });
  } 



}
