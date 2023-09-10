import React, { ReactNode } from 'react';
import { Dashboard, Folder, People, QuestionAnswer, Assessment, Alarm, Rowing, Notifications, ListAltOutlined, Subscriptions, Pages } from '@material-ui/icons';

export type DrawerItem = {
  icon: ReactNode,
  title: string,
  href: string,
}

export const DRAWER_ITEMS: DrawerItem[] = [
  {
    title: 'Dashboard',
    icon: <Dashboard />,
    href: '/'
  },
  {
    title: 'Sessions',
    icon: <Folder />,
    href: '/posts'
  },
  {
    title: 'Classes',
    icon: <ListAltOutlined />,
    href: '/collections'
  },
  {
    title: 'Comments',
    icon: <QuestionAnswer />,
    href: '/comments'
  },
  {
    title: 'Users',
    icon: <People />,
    href: '/users'
  },
  {
    title: 'Assessments',
    icon: <Assessment />,
    href: '/assessments'
  },
  {
    title: 'Activities',
    icon: <Rowing />,
    href: '/activities'
  },
  {
    title: 'Habits',
    icon: <Alarm />,
    href: '/habits'
  },
  {
    title: 'Notifications',
    icon: <Notifications />,
    href: '/notifications'
  },
  {
    title: 'Subscription codes',
    icon: <Subscriptions />,
    href: '/subscriptioncodes'
  },
  {
    title: 'User post',
    icon: <Pages />,
    href: '/userpost'
  },  
];

export const answerTypeMap = {
  single: 'SINGLE',
  multipe:'MULTIPLE',
  text:'TEXT'
};

export const chartOptions = {
  legend: {
    position: 'bottom'
  },
  scales: {
    yAxes: [
      {
        ticks: {
          beginAtZero: true,
          precision: 0
        }
      }
    ]
  }
};

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;


export const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export const EXPIRATION_TIME = 1800000; //30*60*1000;