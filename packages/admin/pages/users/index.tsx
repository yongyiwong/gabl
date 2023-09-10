import React, { useEffect, useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import Link from 'next/link';
import update from 'immutability-helper';

import {
  Grid,
  Paper,
  Typography,
  CircularProgress,
  List,
  ListItem,
  Button,
  Select,
  Checkbox,
  FormControl,
  InputLabel,
  MenuItem,
  ListItemText,
  Input,
  Chip,
  TextField,
} from '@material-ui/core';
import Pagination from '@material-ui/lab/Pagination';

import DashboardLayout from '../../components/DashboardLayout';
import Restricted from '../../components/RestrictedRoute';
import { User } from '../../config/types';
import { UserRole } from '../../shared/types';
import useEditorStyles from '../../styles/editor.styles';
import { BLOCK_USER, UNBLOCK_USER } from '../../config/queries';

import { PersonAdd } from '@material-ui/icons';
import { MenuProps } from '../../components/Post/config';

export const UserRoles = [UserRole.Admin, UserRole.User];

const USERS_QUERY = gql`
  query getUsers($query: UserQuery, $limit: Int, $skip: Int, $sort: UserSort) {
    users(query: $query, limit: $limit, skip: $skip, sort: $sort) {
      _id
      email
      fullname
      username
      role
      blocked
    }
  }
`;

const USERS_COUNT = gql`
  query userCount($query: UserQuery) {
    countUsers(query: $query)
  }
`;

const PAGE = 25;

const userQueryVars = {
  limit: PAGE,
};

interface UserQuery {
  role?: UserRole[];
  search_txt?: string;
}
interface UserProps {
  user: User;
  onUserBlock: () => void;
}

const UserEntry: React.FC<UserProps> = function UserEntry({
  user,
  onUserBlock,
}) {
  const classes = useEditorStyles();
  const [blockUser, { loading: blockLoading }] = useMutation(BLOCK_USER, {
    onError: () => null,
    onCompleted: () => onUserBlock(),
  });
  const [unblockUser, { loading: unblockLoading }] = useMutation(UNBLOCK_USER, {
    onError: () => null,
    onCompleted: () => onUserBlock(),
  });

  const onBlock = () => {
    blockUser({ variables: { _id: user._id } });
  };

  const onUnblock = () => {
    unblockUser({ variables: { _id: user._id } });
  };

  return (
    <ListItem divider={true} className={classes.listItem}>
      <Grid
        container
        spacing={2}
        alignItems={'center'}
        className={classes.relative}>
        <Grid item xs={8}>
          <Typography variant="overline" style={{ lineHeight: 1 }}>
            {user.role} ({user._id})
          </Typography>
          <Typography>
            {user.fullname} ({user.username})
          </Typography>
        </Grid>
        <Grid item xs={1}>
          <Link href={`/users/${user._id}`}>
            <Button color="primary" style={{ width: '100%' }}>
              View
            </Button>
          </Link>
        </Grid>

        <Grid item xs={1}>
          {!(blockLoading || unblockLoading) && !user.blocked && (
            <Button
              variant="text"
              color="secondary"
              onClick={onBlock}
              style={{ width: '100%' }}>
              Block
            </Button>
          )}

          {!(blockLoading || unblockLoading) && user.blocked && (
            <Button
              variant="text"
              color="secondary"
              onClick={onUnblock}
              style={{ width: '100%' }}>
              Unblock
            </Button>
          )}

          {(blockLoading || unblockLoading) && (
            <CircularProgress color="primary" />
          )}
        </Grid>
      </Grid>
    </ListItem>
  );
};

const Users: React.FC = function Users() {
  const [page, setPage] = useState<number>(1);
  const classes = useEditorStyles();

  const skip = (page - 1) * PAGE;

  const [query, setQuery] = useState<UserQuery>({ role: [] });
  const { data: usersCount, loading: countLoading } = useQuery(USERS_COUNT);
  const { data, error, loading, refetch } = useQuery(USERS_QUERY, {
    variables: { ...userQueryVars, skip, query },
  });

  const layoutProps = {
    title: 'Users',
  };

  const renderUserRoleChips = (selected) => {
    return (
      <div className={classes.tagChipsContainer}>
        {selected.map((s) => {
          return (
            <Chip
              key={'userRole-' + s}
              label={s}
              className={classes.tagChip}
              color="primary"
            />
          );
        })}
      </div>
    );
  };

  const onPageChanged = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const queryChanged = (
    e: React.ChangeEvent<
      | HTMLTextAreaElement
      | HTMLInputElement
      | { name?: string; value?: unknown }
    >,
    key: string,
  ) => {
    setQuery(update(query, { [key]: { $set: e.target.value } }));
  };

  const onUserBlock = () => {
    refetch();
  };

  const pages = usersCount ? Math.ceil(usersCount.countUsers / PAGE) : 0;

  useEffect(() => {
    refetch();
  }, [page, query]);

  const isLoading = loading || countLoading;

  return (
    <Restricted>
      <DashboardLayout {...layoutProps}>
        <Grid container direction="column" className={classes.relative}>
          <Grid container item justify="space-between" alignItems="center">
            <Grid item>
              <Typography variant="overline">
                Total users: {usersCount ? usersCount.countUsers : 'N/A'}
              </Typography>
            </Grid>

            <Grid item>
              {isLoading && (
                <CircularProgress className={classes.loadingIndicator} />
              )}
            </Grid>
          </Grid>

          <Grid container item xs={12} justify="flex-end" alignItems="center">
            <Link href="/users/new">
              <Button
                variant="contained"
                color="primary"
                style={{ marginLeft: 12 }}>
                <PersonAdd style={{ marginRight: 8 }} /> New User
              </Button>
            </Link>
          </Grid>
          <Grid item container xs={12} md={9} alignItems="center">
            <Grid item xs={6} md={4}>
              <FormControl style={{ width: '90%', marginBottom: '10px' }}>
                <InputLabel id="users-select-label">
                  Filter by user role
                </InputLabel>
                <Select
                  labelId="users-select-label"
                  value={query?.role || []}
                  multiple
                  onChange={(e) => queryChanged(e, 'role')}
                  input={<Input id="users-select-input" />}
                  renderValue={renderUserRoleChips}
                  MenuProps={MenuProps}>
                  {UserRoles.map((ur) => (
                    <MenuItem key={'activity-answer-' + ur} value={ur}>
                      <Checkbox
                        checked={query?.role?.includes(ur)}
                        color="primary"
                      />
                      <ListItemText primary={ur} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={5}>
              <TextField
                id="search_txt"
                label="Search..."
                value={query.search_txt || ''}
                onChange={(e) => queryChanged(e, 'search_txt')}
                style={{ width: '100%' }}
              />
            </Grid>
          </Grid>
          <Paper style={{ marginTop: 16 }}>
            {error && JSON.stringify(error)}
            {!error && data && (
              <>
                <List>
                  {data.users.map((u) => (
                    <UserEntry
                      key={'user-' + u._id}
                      user={u}
                      onUserBlock={onUserBlock}
                    />
                  ))}
                </List>
                <Grid
                  container
                  alignItems="center"
                  justify="center"
                  className={classes.paginationContainer}>
                  <Pagination
                    count={pages}
                    page={page}
                    onChange={onPageChanged}
                  />
                </Grid>
              </>
            )}
          </Paper>
        </Grid>
      </DashboardLayout>
    </Restricted>
  );
};

export default Users;
