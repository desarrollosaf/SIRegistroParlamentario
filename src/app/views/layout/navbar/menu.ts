import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [
  {
    label: 'Dashboard',
    icon: 'home',
    link: '/dashboard'
  },
  {
    label: 'Agenda',
    icon: 'mail',
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
    icon: 'mail',
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
  
  
];
