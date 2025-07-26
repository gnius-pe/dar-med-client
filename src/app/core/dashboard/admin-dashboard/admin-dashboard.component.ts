import {Component, OnInit, ViewChild} from '@angular/core';
import {routes} from 'src/app/shared/routes/routes';
import {
  ChartComponent,
} from 'ng-apexcharts';
import {Sort} from '@angular/material/sort';
import {DataService} from 'src/app/shared/data/data.service';
import {DashboardService} from '../service/dashboard.service';
import {ChartOptions, ChartOptionsTwo, data} from "../models/dashboard.model";

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit {
  public routes = routes;
  public selectedValue = "2024";
  @ViewChild('chart') chart!: ChartComponent;
  public chartOptionsOne!: Partial<ChartOptions>;
  public chartOptionsTwo!: Partial<ChartOptions>;
  public chartOptionsThree!: Partial<ChartOptionsTwo>;

  // Datos principales
  public appointments: any = [];
  public user: any;

  // Estadísticas principales
  public total_appointments = 0;
  public total_patients = 0;
  public total_doctors = 0;
  public total_staff = 0;

  // Estadísticas del día
  public appointments_today = 0;
  public pending_appointments = 0;
  public completed_appointments = 0;

  // Datos para gráficos
  public query_patient_by_genders: any = [];
  public query_patients_speciality: any = [];
  public query_patients_speciality_percentage: any = [];
  public appointments_by_month: any = [];

  constructor(
    public data: DataService,
    public dashboardService: DashboardService,
  ) {
    this.initializeCharts();
  }

  ngOnInit(): void {
    this.user = this.dashboardService.authService.user;

    if (this.user.roles.includes("Super-Admin") || this.user.permissions.includes("admin_dashboard")) {
      this.loadDashboardData();
      this.loadYearData();
    }
  }

  private initializeCharts() {
    // Gráfico de pacientes por género
    this.chartOptionsOne = {
      chart: {
        height: 230,
        type: 'bar',
        stacked: true,
        toolbar: {
          show: false,
        },
      },
      grid: {
        show: true,
        xaxis: {
          lines: {
            show: false
          }
        },
        yaxis: {
          lines: {
            show: true
          }
        },
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            legend: {
              position: 'bottom',
              offsetX: -10,
              offsetY: 0,
            },
          },
        },
      ],
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '15%',
        },
      },
      dataLabels: {
        enabled: false,
      },
      series: [
        {
          name: 'Masculino',
          color: '#2E37A4',
          data: [],
        },
        {
          name: 'Femenino',
          color: '#00D3C7',
          data: [],
        },
      ],
      xaxis: {
        categories: [
          'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
          'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
        ],
        axisBorder: {
          show: false,
        },
      },
    };

    // Gráfico de especialidades (donut)
    this.chartOptionsTwo = {
      series: [],
      labels: [],
      chart: {
        type: 'donut',
        height: 200,
        width: 200,
        toolbar: {
          show: false,
        },
      },
      legend: {
        show: false
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '50%'
        },
      },
      dataLabels: {
        enabled: false,
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {
            show: false
          }
        }
      }],
    };

    // Gráfico de citas por mes (línea)
    this.chartOptionsThree = {
      chart: {
        height: 200,
        type: 'line',
        toolbar: {
          show: false,
        },
      },
      grid: {
        show: true,
        xaxis: {
          lines: {
            show: false
          }
        },
        yaxis: {
          lines: {
            show: true
          }
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
      },
      series: [
        {
          name: 'Citas',
          color: '#2E37A4',
          data: [],
        },
      ],
      xaxis: {
        categories: [],
      },
    };
  }

  private loadDashboardData() {
    this.dashboardService.dashboardAdmin({}).subscribe((resp: any) => {
      console.log('Dashboard data:', resp);

      // Actualizar datos principales
      this.appointments = resp.appointments.data;

      // Estadísticas principales
      this.total_appointments = resp.total_appointments;
      this.total_patients = resp.total_patients;
      this.total_doctors = resp.total_doctors;
      this.total_staff = resp.total_staff;

      // Estadísticas del día
      this.appointments_today = resp.appointments_today;
      this.pending_appointments = resp.pending_appointments;
      this.completed_appointments = resp.completed_appointments;
    });
  }

  private loadYearData() {
    const data = {
      year: this.selectedValue,
    };

    this.dashboardService.dashboardAdminYear(data).subscribe((resp: any) => {
      console.log('Year data:', resp);

      this.query_patient_by_genders = resp.query_patient_by_genders;
      this.query_patients_speciality = resp.query_patients_speciality;
      this.query_patients_speciality_percentage = resp.query_patients_speciality_percentage;
      this.appointments_by_month = resp.appointments_by_month;

      this.updateCharts();
    });
  }

  private updateCharts() {
    // Actualizar gráfico de género
    const data_male: any = [];
    const data_female: any = [];

    this.query_patient_by_genders.forEach((item: any) => {
      data_male.push(item.hombre);
      data_female.push(item.mujer);
    });

    this.chartOptionsOne.series = [
      {
        name: 'Masculino',
        color: '#2E37A4',
        data: data_male,
      },
      {
        name: 'Femenino',
        color: '#00D3C7',
        data: data_female,
      },
    ];

    // Actualizar gráfico de especialidades
    const labels_spe: any = [];
    const series_spe: any = [];

    this.query_patients_speciality.forEach((patients_special: any) => {
      labels_spe.push(patients_special.name);
      series_spe.push(patients_special.count);
    });

    this.chartOptionsTwo.labels = labels_spe;
    this.chartOptionsTwo.series = series_spe;

    // Actualizar gráfico de citas por mes
    const appointments_data: any = [];
    const month_names: any = [];

    this.appointments_by_month.forEach((element: any) => {
      appointments_data.push(element.count);
      month_names.push(element.month_name);
    });

    this.chartOptionsThree.series = [
      {
        name: 'Citas',
        color: '#2E37A4',
        data: appointments_data,
      },
    ];

    this.chartOptionsThree.xaxis = {
      categories: month_names,
    };
  }

  public selectedYear() {
    this.loadYearData();
  }

  public sortData(sort: Sort) {
    const data = this.appointments.slice();

    if (!sort.active || sort.direction === '') {
      this.appointments = data;
    } else {
      this.appointments = data.sort((a: any, b: any) => {
        const aValue = (a as any)[sort.active];
        const bValue = (b as any)[sort.active];
        return (aValue < bValue ? -1 : 1) * (sort.direction === 'asc' ? 1 : -1);
      });
    }
  }

  // Utilidades
  getStatusText(status: number): string {
    return status === 1 ? 'PENDIENTE' : 'ATENDIDO';
  }

  getStatusClass(status: number): string {
    return status === 1 ? 'status-pink' : 'status-green';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  selectedList: data[] = [
    {value: '2025'},
    {value: '2024'},
    {value: '2023'},
    {value: '2022'},
    {value: '2021'},
  ];
}
