import React from 'react';
import Link from 'next/link';
import { Line } from 'react-chartjs-2';
import { gql, useQuery } from '@apollo/client';

import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  CircularProgress,
} from '@material-ui/core';

import DashboardLayout from '../components/DashboardLayout';
import Restricted from '../components/RestrictedRoute';
import { chartOptions } from '../config';

const Index: React.FC = function Index() {
  const layoutProps = {
    title: 'Dashboard',
  };

  return (
    <Restricted>
      <DashboardLayout {...layoutProps}>
        <Grid container direction="column" spacing={2}>
          <Grid item>
            <Typography variant="h3" component="h1">
              Dashboard
            </Typography>
            <Typography variant="subtitle1">
              This page should contain useful metrics but right now it's a
              placeholder. Let us know what metrics you need and we'll try to
              provide them 🙂
            </Typography>
          </Grid>

          <Grid
            container
            item
            justifyContent="center"
            alignItems="stretch"
            spacing={2}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography component="h2" color="textSecondary" gutterBottom>
                    Posts
                  </Typography>
                  <Typography variant="body2" component="p">
                    A list of all posts of admin types like <code>Atricle</code>{' '}
                    and <code>Notification</code>
                  </Typography>
                </CardContent>
                <CardActions>
                  <Link href="/posts">
                    <Button size="small">View All</Button>
                  </Link>
                </CardActions>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography component="h2" color="textSecondary" gutterBottom>
                    Users
                  </Typography>
                  <Typography variant="body2" component="p">
                    A list of all users
                  </Typography>
                </CardContent>
                <CardActions>
                  <Link href="/users">
                    <Button size="small">View All</Button>
                  </Link>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </DashboardLayout>
    </Restricted>
  );
};

export default Index;
