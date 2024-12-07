import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { GeographicLocation } from "../models/patient.model";

@Component({
  selector: 'app-geographic-location-form',
  templateUrl: './geographic-location-form.component.html',
  styleUrls: ['./geographic-location-form.component.scss'],
})
export class GeographicLocationFormComponent implements OnInit, OnChanges {

  @Input() geographicLocation: GeographicLocation | undefined;
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
    Promise.all([
      this.loadNationalities(),
      this.loadDepartments(),
      this.loadProvinces(),
      this.loadDistricts()
    ]).then(() => {
      if (this.geographicLocation) {
        this.patchLocationForm(this.geographicLocation);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['geographicLocation'] && this.geographicLocation) {
      this.patchLocationForm(this.geographicLocation);
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

  private loadNationalities(): Promise<void> {
    return this.http.get('/assets/locations/nacionalidades.json').toPromise().then((data: any) => {
      this.nationalities = data;
    });
  }

  private loadDepartments(): Promise<void> {
    return this.http.get('/assets/locations/departamentos.json').toPromise().then((data: any) => {
      this.departments = data;
    });
  }

  private loadProvinces(): Promise<void> {
    return this.http.get('/assets/locations/provincias.json').toPromise().then((data: any) => {
      this.provinces = data;
    });
  }

  private loadDistricts(): Promise<void> {
    return this.http.get('/assets/locations/distritos.json').toPromise().then((data: any) => {
      this.districts = data;
    });
  }

  private patchLocationForm(location: GeographicLocation): void {
    this.locationForm.patchValue(location);

    const department = location.department;
    const province = location.province;

    // Filtrar provincias y distritos
    if (department) {
      this.filteredProvinces = this.provinces.filter(
        (provinceItem) => provinceItem.department_id === department
      );
    }

    if (province) {
      this.filteredDistricts = this.districts.filter(
        (districtItem) => districtItem.province_id === province
      );
    }
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
