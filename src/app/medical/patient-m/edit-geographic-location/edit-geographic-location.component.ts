import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {GeographicLocationService} from '../service/geographic_location.service';
import {GeographicLocation} from '../models/patient.model';
import {tap, catchError, of} from 'rxjs';

@Component({
  selector: 'app-edit-geographic-location',
  templateUrl: './edit-geographic-location.component.html',
  styleUrls: ['./edit-geographic-location.component.scss']
})
export class EditGeographicLocationComponent implements OnInit {

  public hasLocation: boolean | null = null;
  public geographicLocation: GeographicLocation | null = null;
  public patientId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private locationService: GeographicLocationService
  ) {
  }

  ngOnInit(): void {
    this.patientId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.patientId) {
      this.loadGeographicLocation(this.patientId);
    }
  }

  private loadGeographicLocation(patientId: number): void {
    this.locationService.getLocationByPatient(patientId).pipe(
      tap((resp: any) => {
        if (resp && resp.data) {
          this.geographicLocation = resp.data;
          this.hasLocation = true;
        } else {
          this.hasLocation = false;
        }
      }),
      catchError(error => {
        console.error('Error al cargar la ubicación:', error);
        this.hasLocation = false;
        return of(null);
      })
    ).subscribe();
  }

  public updateGeographicLocation(locationData: GeographicLocation): void {

    const updatedLocation: GeographicLocation = {
      ...locationData,
      id: this.geographicLocation!.id,
      patient_id: this.patientId!,
    };

    this.locationService.updateLocation(this.geographicLocation!.id, updatedLocation).pipe(
      tap(() => console.log('Ubicación actualizada exitosamente')),
      catchError((error) => {
        console.error('Error al actualizar la ubicación:', error);
        return of(error);
      })
    ).subscribe();
  }
}
