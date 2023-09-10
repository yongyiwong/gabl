import React from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

import { ListItem, ListItemIcon, ListItemText } from '@material-ui/core';

import { DrawerItem } from '../config';

interface DrawerItemProps {
  item: DrawerItem,
  active?: boolean
}

const useStyles = makeStyles(theme => ({
  iconSelected: {
    color: theme.palette.primary.main
  }
}));

const DrawerItemComponent: React.FC<DrawerItemProps> = function DrawerItemComponent({ item, active }) {
  const classes = useStyles();

  return (
    <Link href={ item.href }>
      <ListItem button selected={ active }>
        <ListItemIcon className={ clsx( active && classes.iconSelected ) }>
          { item.icon }
        </ListItemIcon>
        <ListItemText primary={ item.title } />
      </ListItem>
    </Link>
  );
};

export default DrawerItemComponent;
