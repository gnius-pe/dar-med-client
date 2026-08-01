import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StaffService } from '../service/staff.service';

@Component({
  selector: 'app-edit-staff-n',
  templateUrl: './edit-staff-n.component.html',
  styleUrls: ['./edit-staff-n.component.scss']
})
export class EditStaffNComponent {

  public selectedValue: number | string | null = null;
  public name: string = '';
  public surname: string = '';
  public mobile: string = '';
  public email: string = '';
  public password: string = '';
  public password_confirmation: string = '';

  public birth_date: string = '';
  public gender: number = 1;
  public education: string = '';
  public designation: string = '';
  public address: string = '';

  public roles: any[] = [];

  public FILE_AVATAR: any;
  public IMAGEN_PREVIZUALIZA: any = 'assets/img/user-06.jpg';

  public text_success: string = '';
  public text_validation: string = '';

  public staff_id: any;
  public staff_selected: any;

  constructor(
    public staffService: StaffService,
    public activedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activedRoute.params.subscribe((resp: any) => {
      this.staff_id = resp.id;

      this.staffService.showUser(this.staff_id).subscribe((resp: any) => {
        this.staff_selected = resp.user;
        this.name = this.staff_selected.name;
        this.surname = this.staff_selected.surname;
        this.mobile = this.staff_selected.mobile;
        this.email = this.staff_selected.email;
        this.birth_date = new Date(this.staff_selected.birth_date).toISOString();
        this.gender = this.staff_selected.gender;
        this.education = this.staff_selected.education;
        this.designation = this.staff_selected.designation;
        this.address = this.staff_selected.address;
        this.IMAGEN_PREVIZUALIZA = this.staff_selected.avatar;

        this.applySelectedRole();
      });

      this.staffService.listUsers().subscribe((resp: any) => {
        const user = (resp.users || []).find((u: any) => u.id === Number(this.staff_id));
        if (user?.role?.id) {
          this.staff_selected = this.staff_selected || {};
          this.staff_selected.role = this.staff_selected.role || {};
          this.staff_selected.role.id = Number(user.role.id);
        }
        this.applySelectedRole();
      });
    });

    this.staffService.listConfig().subscribe((resp: any) => {
      this.roles = resp.roles;
      this.applySelectedRole();
    });
  }

  private applySelectedRole(): void {
    if (!this.staff_selected || !this.roles || this.roles.length === 0) {
      return;
    }

    const rawRoleId = this.staff_selected.role?.id ?? this.staff_selected.role_id;
    if (rawRoleId !== undefined && rawRoleId !== null && rawRoleId !== '') {
      this.selectedValue = Number(rawRoleId);
    }
  }

  save(): void {
    this.text_validation = '';
    if (!this.name || !this.email || !this.surname) {
      this.text_validation = 'LOS CAMPOS SON NECESARIOS (name,surname,email)';
      return;
    }
    if (this.password && this.password !== this.password_confirmation) {
      this.text_validation = 'LAS CONTRASEÑA DEBEN SER IGUALES';
      return;
    }

    const formData = new FormData();
    formData.append('name', this.name);
    formData.append('surname', this.surname);
    formData.append('email', this.email);
    formData.append('mobile', this.mobile);
    formData.append('birth_date', this.birth_date);
    formData.append('gender', String(this.gender));
    if (this.education) {
      formData.append('education', this.education);
    }
    if (this.designation) {
      formData.append('designation', this.designation);
    }
    if (this.address) {
      formData.append('address', this.address);
    }
    if (this.password) {
      formData.append('password', this.password);
    }
    formData.append('role_id', String(this.selectedValue));
    if (this.FILE_AVATAR) {
      formData.append('imagen', this.FILE_AVATAR);
    }

    this.staffService.updateUser(this.staff_id, formData).subscribe((resp: any) => {
      if (resp.message == 403) {
        this.text_validation = resp.message_text;
      } else {
        this.text_success = 'El usuario ha editado correctamente';
      }
    });
  }

  loadFile($event: any): void {
    const file = $event.target.files[0];
    if (!file || file.type.indexOf('image') < 0) {
      this.text_validation = 'SOLAMENTE PUEDEN SER ARCHIVOS DE TIPO IMAGEN';
      return;
    }
    this.text_validation = '';
    this.FILE_AVATAR = file;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => (this.IMAGEN_PREVIZUALIZA = reader.result);
  }

  compareRoleIds(a: any, b: any): boolean {
    return a === b || (a != null && b != null && Number(a) === Number(b));
  }
}
