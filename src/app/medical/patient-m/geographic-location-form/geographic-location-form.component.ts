import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {GeographicLocation} from "../models/patient.model";

@Component({
  selector: 'app-geographic-location-form',
  templateUrl: './geographic-location-form.component.html',
  styleUrls: ['./geographic-location-form.component.scss'],
})
export class GeographicLocationFormComponent implements OnInit, OnChanges {

  @Input() geographicLocation: GeographicLocation | undefined
  @Output() saveLocationData: EventEmitter<GeographicLocation> = new EventEmitter<GeographicLocation>();

  public locationForm: FormGroup;
  public showMessage = false;

  public nationalities: any[] = [];
  public departments: any[] = [];
  public provinces: any[] = [];
  public districts: any[] = [];

  public filteredProvinces: any[] = [];
  public filteredDistricts: any[] = [];

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.locationForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadNationalities();
    this.loadDepartments();
    this.loadProvinces();
    this.loadDistricts();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('geographicLocation') && this.geographicLocation != undefined) {
      this.locationForm.patchValue(this.geographicLocation);
      this.onDepartmentChange();
      this.onProvinceChange();
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      country: ['', [Validators.required]],
      department: ['', [Validators.required]],
      province: ['', [Validators.required]],
      district: ['', [Validators.required]],
      address: ['', [Validators.required]],
      reference: [''],
    });
  }

  private loadNationalities(): void {
    this.http.get('/assets/locations/nacionalidades.json').subscribe((data: any) => {
      this.nationalities = data;
    });
  }

  private loadDepartments(): void {
    this.http.get('/assets/locations/departamentos.json').subscribe((data: any) => {
      this.departments = data;
    });
  }

  private loadProvinces(): void {
    this.http.get('/assets/locations/provincias.json').subscribe((data: any) => {
      this.provinces = data;
    });
  }

  private loadDistricts(): void {
    this.http.get('/assets/locations/distritos.json').subscribe((data: any) => {
      this.districts = data;
    });
  }

  public onDepartmentChange(): void {

    const selectedDepartment = this.locationForm.get('department')?.value;

    this.filteredProvinces = this.provinces.filter(
      (province) => province.department_id === selectedDepartment
    );
    this.filteredDistricts = [];

    this.locationForm.get('district')?.reset();
    this.locationForm.get('province')?.reset();
  }

  public onProvinceChange(): void {
    const selectedProvince = this.locationForm.get('province')?.value;
    this.filteredDistricts = this.districts.filter(
      (district) => district.province_id === selectedProvince
    );
    this.locationForm.get('district')?.reset();
  }

  public save(): void {
    if (this.locationForm.invalid) {
      this.locationForm.markAllAsTouched();
      return;
    }

    this.triggerMessage();
    this.saveLocationData.emit(this.locationForm.value);
    this.resetForm();
  }

  private resetForm(): void {
    this.locationForm.reset();
    this.filteredProvinces = [];
    this.filteredDistricts = [];
  }

  private triggerMessage(): void {
    this.showMessage = true;

    setTimeout(() => {
      this.showMessage = false;
    }, 5000);
  }
}
