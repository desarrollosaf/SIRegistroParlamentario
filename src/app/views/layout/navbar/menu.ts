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
            label: 'Eventos',
            link: '/agenda-comision'
          }
        ]
      },
      
    ]
  },
  
  
];
