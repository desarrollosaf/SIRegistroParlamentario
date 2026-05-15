import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [
  {
    label: 'Dashboard',
    icon: 'home',
    link: '/dashboard'
  },
  {
    label: 'Agenda',
    icon: 'calendar',
    subMenus: [
      {
        subMenuItems: [
          {
            label: 'agenda',
            isTitle: true,
          },
          {
            label: 'Sesiones',
            link: '/agenda-comision/sesiones'
          },
          {
            label: 'Comisiones',
            link: '/agenda-comision/comisiones'
          }
        ]
      },
    ]
  },
  {
    label: 'Catalogos',
    icon: 'book',
    subMenus: [
      {
        subMenuItems: [
          {
            label: 'catalogos',
            isTitle: true,
          },
          {
            label: 'proponentes',
            link: '/catalogos'
          }
        ]
      },
    ]
  },
  {
    label: 'Reportes',
    icon: 'bar-chart-2',
    subMenus: [
      {
        subMenuItems: [
          {
            label: 'Reportes',
            isTitle: true,
          },
          {
            label: 'Seguimiento de iniciativas',
            link: '/iniciativas'
          },
          {
            label: 'Asistencia por Diputado',
            link: '/asistencia-diputado'
          },
          {
            label: 'Métricas ',
            link: '/reporte-iniciativas'
          }
        ]
      },
    ]
  },
  {
    label: 'Iniciativas',
    icon: 'file-text',
    subMenus: [
      {
        subMenuItems: [
          {
            label: 'Iniciativas',
            link: '/iniciativas-decretos'
          }
        ]
      },
    ]
  },
];