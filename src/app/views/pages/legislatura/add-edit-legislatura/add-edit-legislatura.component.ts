import { Component, ElementRef, inject, QueryList, ViewChildren, ViewChild, TemplateRef } from '@angular/core';
import { FormArray, FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-edit-legislatura',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule, RouterLink],
  templateUrl: './add-edit-legislatura.component.html',
  styleUrl: './add-edit-legislatura.component.scss'
})
export class AddEditLegislaturaComponent {
  formLegislatura: FormGroup;
  idLegislatura: any;
  operacion: string = 'Registrar';

  constructor(private fb: FormBuilder, private aRouter: ActivatedRoute, private router: Router, private modalService: NgbModal) {
    this.formLegislatura = this.fb.group({
      numero_legislatura: ['', Validators.required],
      nombre_legislatura: ['', Validators.required],
      inicio_funciones: ['', Validators.required],
      termino_funciones: ['', Validators.required],
      distritos_uninominales: ['', Validators.required],
      distritos_plurinominales: ['', Validators.required],
    });
    this.idLegislatura = aRouter.snapshot.paramMap.get('id');


  }


  enviarDatos(): void {
    const data = {
      ...this.formLegislatura.value
    };
    console.log(data);

  }



  volver(): void {
    if (this.formLegislatura.dirty) {
      Swal.fire({
        title: '¿Estás seguro?',
        text: "Los cambios no guardados se perderán",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, salir',
        cancelButtonText: 'Permanecer'
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/legislatura']);
        }
      });
    } else {
      this.router.navigate(['/legislatura']);
    }
  }

}
