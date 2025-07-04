import {Component, OnInit} from '@angular/core';
import { StaffService } from '../service/staff.service';

@Component({
  selector: 'app-add-staff-n',
  templateUrl: './add-staff-n.component.html',
  styleUrls: ['./add-staff-n.component.scss']
})
export class AddStaffNComponent implements OnInit{

  public selectedValue !: string  ;
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

  public roles:any = [];

  isLoading = false;

  public FILE_AVATAR:any;
  public IMAGEN_PREVIZUALIZA:any = 'assets/img/user-06.jpg';

  public text_success = '';
  public text_validation = '';
  constructor(
    public staffService: StaffService,
  ) {

  }
  ngOnInit(): void {
    this.staffService.listConfig().subscribe((resp:any) => {
      this.roles = resp.roles;
    })
  }

  save(){

    this.showLoading();

    this.text_validation = '';
    if(!this.name || !this.email || !this.surname || !this.FILE_AVATAR || !this.password){
      this.text_validation = "COMPLETE LOS CAMPOS OBLIGATORIOS";
      this.hideLoading();
      return;
    }

    if(this.password != this.password_confirmation){
      this.text_validation = "LAS CONTRASEÑA DEBEN SER IGUALES";
      this.hideLoading();
      return;
    }

    const formData = new FormData();
    formData.append("name",this.name);
    formData.append("surname",this.surname);
    formData.append("email",this.email);
    formData.append("mobile",this.mobile);
    formData.append("birth_date",this.birth_date);
    formData.append("gender",this.gender+"");
    formData.append("education",this.education);
    formData.append("designation",this.designation);
    formData.append("address",this.address);
    formData.append("password",this.password);
    formData.append("role_id",this.selectedValue);
    formData.append("imagen",this.FILE_AVATAR);

    this.staffService.registerUser(formData).subscribe((resp:any) => {

      if(resp.message == 403){
        this.hideLoading();
        this.text_validation = resp.message_text;
      }else{
        this.text_success = 'El usuario ha sido registrado correctamente';

        this.name = '';
        this.surname = '';
        this.email  = '';
        this.mobile  = '';
        this.birth_date  = '';
        this.gender  = 1;
        this.education  = '';
        this.designation  = '';
        this.address  = '';
        this.password  = '';
        this.password_confirmation  = '';
        this.selectedValue  = '';
        this.FILE_AVATAR = null;
        this.IMAGEN_PREVIZUALIZA = null;
        this.hideLoading();
      }

    })
  }

  loadFile($event:any){
    if($event.target.files[0].type.indexOf("image") < 0){
      this.text_validation = "SOLAMENTE PUEDEN SER ARCHIVOS DE TIPO IMAGEN";
      return;
    }
    this.text_validation = '';
    this.FILE_AVATAR = $event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(this.FILE_AVATAR);
    reader.onloadend = () => this.IMAGEN_PREVIZUALIZA = reader.result;
  }

  private showLoading() {
    this.isLoading = true;
  }

  private hideLoading() {
    this.isLoading = false;
  }
}
