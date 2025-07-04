import {Component, OnInit} from '@angular/core';
import {DoctorService} from '../service/doctor.service';

@Component({
  selector: 'app-add-doctor',
  templateUrl: './add-doctor.component.html',
  styleUrls: ['./add-doctor.component.scss']
})
export class AddDoctorComponent implements OnInit {
  public selectedValue !: string;
  public name = '';
  public surname = '';
  public mobile = '';
  public email = '';
  public password = '';
  public password_confirmation = '';

  public birth_date = '';
  public gender = 1;
  public education = '';
  public designation = '';
  public address = '';

  public roles: any = [];

  public FILE_AVATAR: any;
  public IMAGEN_PREVIZUALIZA: any = 'assets/img/user-06.jpg';

  public specialitie_id: any;
  public specialities: any = [];

  isLoading = false;
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' | 'warning' = 'success';

  public days_week = [
    {
      day: 'Lunes',
      class: 'table-primary'
    },
    {
      day: 'Martes',
      class: 'table-secondary'
    },
    {
      day: 'Miercoles',
      class: 'table-success'
    },
    {
      day: 'Jueves',
      class: 'table-warning'
    },
    {
      day: 'Viernes',
      class: 'table-info'
    },
    {
      day: 'Sabado',
      class: 'table-light'
    },
    {
      day: 'Domingo',
      class: 'custom-sunday'
    }
  ]
  public hours_days: any = [];
  public hours_selecteds: any = [];

  constructor(
    public doctorsService: DoctorService,
  ) {

  }

  ngOnInit(): void {
    this.doctorsService.listConfig().subscribe((resp: any) => {
      console.log(resp);
      this.roles = resp.roles;
      this.specialities = resp.specialities;
      this.hours_days = resp.hours_days;
    })
  }

  save() {

    this.showLoading()

    if (!this.name || !this.email || !this.surname || !this.password) {
      this.showWarning("COMPLETE LOS CAMPOS OBLIGATORIOS")
      this.hideLoading();
      return;
    }

    if (this.password != this.password_confirmation) {
      this.showWarning("LAS CONTRASEÑA DEBEN SER IGUALES")
      this.hideLoading();
      return;
    }

    if (this.hours_selecteds.length == 0) {
      this.showWarning("NECESITAS SELECCIONAR UN HORARIO AL MENOS")
      this.hideLoading();
      return;
    }

    const formData = new FormData();
    formData.append("name", this.name);
    formData.append("surname", this.surname);
    formData.append("email", this.email);
    formData.append("mobile", this.mobile);
    formData.append("birth_date", this.birth_date);
    formData.append("gender", this.gender + "");
    formData.append("education", this.education);
    formData.append("designation", this.designation);
    formData.append("address", this.address);
    formData.append("password", this.password);
    formData.append("role_id", this.selectedValue);
    formData.append("specialitie_id", this.specialitie_id);
    formData.append("imagen", this.FILE_AVATAR);

    const HOUR_SCHEDULES: any = [];

    this.days_week.forEach((day: any) => {
      const DAYS_HOURS = this.hours_selecteds.filter((hour_select: any) => hour_select.day_name == day.day);
      HOUR_SCHEDULES.push({
        day_name: day.day,
        children: DAYS_HOURS,
      });
    })

    formData.append("schedule_hours", JSON.stringify(HOUR_SCHEDULES));
    this.doctorsService.registerDoctor(formData).subscribe((resp: any) => {

      if (resp.message == 403) {
        this.hideLoading();
        this.showError(resp.message_text)
      } else {

        this.hideLoading();
        this.showSuccess("El usuario ha sido registrado correctamente")

        this.name = '';
        this.surname = '';
        this.email = '';
        this.mobile = '';
        this.birth_date = '';
        this.gender = 1;
        this.education = '';
        this.designation = '';
        this.address = '';
        this.password = '';
        this.password_confirmation = '';
        this.selectedValue = '';
        this.specialitie_id = '';
        this.FILE_AVATAR = null;
        this.IMAGEN_PREVIZUALIZA = null;
        this.hours_selecteds = [];
      }

    })
  }

  loadFile($event: any) {
    if ($event.target.files[0].type.indexOf("image") < 0) {
      this.showWarning("SOLAMENTE PUEDEN SER ARCHIVOS DE TIPO IMAGEN")
      return;
    }

    this.FILE_AVATAR = $event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(this.FILE_AVATAR);
    reader.onloadend = () => this.IMAGEN_PREVIZUALIZA = reader.result;
  }

  addHourItem(hours_day: any, day: any, item: any) {

    const INDEX = this.hours_selecteds.findIndex((hour: any) => hour.day_name == day.day
      && hour.hour == hours_day.hour
      && hour.item.hour_start == item.hour_start && hour.item.hour_end == item.hour_end);
    if (INDEX != -1) {
      this.hours_selecteds.splice(INDEX, 1);
    } else {
      this.hours_selecteds.push({
        "day": day,
        "day_name": day.day,
        "hours_day": hours_day,
        "hour": hours_day.hour,
        "grupo": "none",
        "item": item,
      });
    }

    console.log(this.hours_selecteds);
  }

  addHourAll(hours_day: any, day: any) {
    const INDEX = this.hours_selecteds.findIndex((hour: any) => hour.day_name == day.day
      && hour.hour == hours_day.hour && hour.grupo == "all");

    const COUNT_SELECTED = this.hours_selecteds.filter((hour: any) => hour.day_name == day.day
      && hour.hour == hours_day.hour).length;
    if (INDEX != -1 && COUNT_SELECTED == hours_day.items.length) {
      hours_day.items.forEach((item: any) => {
        const INDEX = this.hours_selecteds.findIndex((hour: any) => hour.day_name == day.day
          && hour.hour == hours_day.hour
          && hour.item.hour_start == item.hour_start && hour.item.hour_end == item.hour_end);
        if (INDEX != -1) {
          this.hours_selecteds.splice(INDEX, 1);
        }
      });
    } else {
      hours_day.items.forEach((item: any) => {
        const INDEX = this.hours_selecteds.findIndex((hour: any) => hour.day_name == day.day
          && hour.hour == hours_day.hour
          && hour.item.hour_start == item.hour_start && hour.item.hour_end == item.hour_end);
        if (INDEX != -1) {
          this.hours_selecteds.splice(INDEX, 1);
        }
        this.hours_selecteds.push({
          "day": day,
          "day_name": day.day,
          "hours_day": hours_day,
          "hour": hours_day.hour,
          "grupo": "all",
          "item": item,
        });
      });
    }
    console.log(this.hours_selecteds);
  }

  addHourAllDay($event: any, hours_day: any) {

    const INDEX = this.hours_selecteds.findIndex((hour: any) => hour.hour == hours_day.hour);

    if (INDEX != -1 && !$event.currentTarget.checked) {
      this.days_week.forEach((day) => {
        hours_day.items.forEach((item: any) => {
          const INDEX = this.hours_selecteds.findIndex((hour: any) => hour.day_name == day.day
            && hour.hour == hours_day.hour
            && hour.item.hour_start == item.hour_start && hour.item.hour_end == item.hour_end);
          if (INDEX != -1) {
            this.hours_selecteds.splice(INDEX, 1);
          }
        });
      })
    } else {
      this.days_week.forEach((day) => {
        hours_day.items.forEach((item: any) => {
          const INDEX = this.hours_selecteds.findIndex((hour: any) => hour.day_name == day.day
            && hour.hour == hours_day.hour
            && hour.item.hour_start == item.hour_start && hour.item.hour_end == item.hour_end);
          if (INDEX != -1) {
            this.hours_selecteds.splice(INDEX, 1);
          }
        });
      })
      setTimeout(() => {
        this.days_week.forEach((day) => {
          this.addHourAll(hours_day, day);
        })
      }, 25);
    }


  }

  isCheckHourAll(hours_day: any, day: any) {
    const INDEX = this.hours_selecteds.findIndex((hour: any) => hour.day_name == day.day
      && hour.hour == hours_day.hour && hour.grupo == "all");

    const COUNT_SELECTED = this.hours_selecteds.filter((hour: any) => hour.day_name == day.day
      && hour.hour == hours_day.hour).length;
    if (INDEX != -1 && COUNT_SELECTED == hours_day.items.length) {
      return true;
    } else {
      return false;
    }
  }

  isCheckHour(hours_day: any, day: any, item: any) {
    const INDEX = this.hours_selecteds.findIndex((hour: any) => hour.day_name == day.day
      && hour.hour == hours_day.hour
      && hour.item.hour_start == item.hour_start && hour.item.hour_end == item.hour_end);
    if (INDEX != -1) {
      return true;
    } else {
      return false;
    }
  }

  private showLoading() {
    this.isLoading = true;
  }

  private hideLoading() {
    this.isLoading = false;
  }

  showSuccess(message: string) {
    this.notificationMessage = message;
    this.notificationType = 'success';
    this.showNotification = true;
  }

  showError(message: string) {
    this.notificationMessage = message;
    this.notificationType = 'error';
    this.showNotification = true;
  }

  showWarning(message: string) {
    this.notificationMessage = message;
    this.notificationType = 'warning';
    this.showNotification = true;
  }

  onNotificationClose() {
    this.showNotification = false;
  }
}
