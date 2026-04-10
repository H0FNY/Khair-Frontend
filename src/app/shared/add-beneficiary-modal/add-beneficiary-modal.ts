import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CaseService } from '../../core/services/case.service';
import { CaseEntityAddDTO } from '../../core/models/case.model';

@Component({
  selector: 'app-add-beneficiary-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-beneficiary-modal.html',
  styleUrl: './add-beneficiary-modal.css'
})
export class AddBeneficiaryModal {
  @Output() close = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();

  addForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');

  categories = ['فقير', 'يتيم', 'أرملة', 'معاق', 'أخرى'];
  statuses = ['أعزب', 'متزوج', 'مطلق', 'أرمل'];
  needs = ['طعام', 'علاج', 'ملابس', 'تعليم', 'سكن', 'أخرى'];
  
  isSSNChecking = signal(false);
  isSSNValid = signal(true);
  ssnError = signal('');

  constructor(private fb: FormBuilder, private caseService: CaseService) {
    this.addForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      ssnid: ['', [Validators.required, Validators.pattern(/^\d{14}$/)]],
      address: ['', Validators.required],
      education: ['', Validators.required],
      work: ['', Validators.required],
      status: ['أعزب', Validators.required],
      category: ['فقير', Validators.required],
      need: ['طعام', Validators.required],
      notes: ['']
    });
  }

  onSSNBlur() {
    const ssn = this.addForm.get('ssnid')?.value;
    if (ssn && /^\d{14}$/.test(ssn)) {
      this.isSSNChecking.set(true);
      this.ssnError.set('');
      
      this.caseService.checkSSN(ssn).subscribe({
        next: (res) => {
          this.isSSNChecking.set(false);
          if (res.exists) {
            this.isSSNValid.set(false);
            this.ssnError.set(res.message || 'هذا الرقم القومي مسجل مسبقاً');
            this.addForm.get('ssnid')?.setErrors({ duplicated: true });
          } else {
            this.isSSNValid.set(true);
            this.ssnError.set('');
            // If it had a duplicated error, clear it but keep other errors if any
            const errors = this.addForm.get('ssnid')?.errors;
            if (errors) {
              delete errors['duplicated'];
              this.addForm.get('ssnid')?.setErrors(Object.keys(errors).length ? errors : null);
            }
          }
        },
        error: () => {
          this.isSSNChecking.set(false);
        }
      });
    }
  }

  onSubmit() {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.errorMessage.set('حدث خطأ في المصادقة. يرجى تسجيل الدخول مجدداً.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const dto: CaseEntityAddDTO = {
      ...this.addForm.value,
      userId: userId
    };

    this.caseService.addCase(dto).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.success.emit();
        this.close.emit();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'حدث خطأ أثناء إضافة المستفيد. يرجى المحاولة لاحقاً.');
        console.error('Error adding case:', err);
      }
    });
  }

  onClose() {
    this.close.emit();
  }
}
