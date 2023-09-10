import React, { useEffect, useState } from 'react';
import { gql, useMutation, useQuery, useApolloClient } from '@apollo/client';
import { useRouter } from 'next/router';
import update from 'immutability-helper';
import { pick } from 'lodash-es';
import capitalize from 'lodash-es/capitalize';
import format from 'date-fns/format';
import Image from 'material-ui-image';
import { DropzoneDialog } from 'material-ui-dropzone';
import { ChartOptions } from 'chart.js';
import {
  Grid,
  TextField,
  CircularProgress,
  InputLabel,
  Select,
  FormControl,
  FormControlLabel,
  MenuItem,
  Typography,
  Button,
  Checkbox,
} from '@material-ui/core';
import CheckCircle from '@material-ui/icons/CheckCircle';

import DashboardLayout from '../../components/DashboardLayout';
import Restricted from '../../components/RestrictedRoute';
import Error from '../../components/Error';
import { ErrorMessage, User } from '../../config/types';
import { UserRole } from '../../shared/types';
import useEditorStyles from '../../styles/editor.styles';
import { azureUpload } from '../../helpers/azure';

const options: ChartOptions = {
  legend: {
    position: 'bottom',
  },
};

const USER_QUERY = gql`
  query getUserById($_id: ObjectID) {
    user(_id: $_id) {
      _id
      fullname
      username
      email
      role
      blocked
      picture {
        type
        src
        filename
      }
      bio
      created_at
    }
  }
`;

const USER_UPDATE = gql`
  mutation updateUser($_id: ObjectID!, $update: UpdateUserInput!) {
    updateUser(_id: $_id, update: $update) {
      success
      message
      user {
        _id
        fullname
        username
        email
        role
        bio
        blocked
        picture {
          type
          src
          filename
        }
      }
    }
  }
`;

const UserEditor: React.FC = function UsersEditor() {
  const classes = useEditorStyles();
  const apolloClient = useApolloClient();

  const [user, setUser] = useState<User | null>(null);
  const [hideSnackbar, setHideSnackbar] = useState<boolean>(true);
  const [imageOpen, setImageOpen] = useState<boolean>(false);
  const [imageLoading, setImageLoading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<{ message?: string } | null>(
    null,
  );
  const [updateErrorMessage, setUpdateErrorMessage] =
    useState<ErrorMessage | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<boolean>(false);

  const onUpdateCompleted = (data) => {
    const {
      updateUser: { success, message },
    } = data;

    setUpdateSuccess(false);

    if (!success) {
      setUpdateErrorMessage({ message: 'Error: ' + message });
    } else {
      setUpdateSuccess(true);
    }
  };

  const {
    query: { _id },
  } = useRouter();

  const { data, error, loading } = useQuery(USER_QUERY, {
    variables: { _id },
  });

  const [updateUser, { error: updateError, loading: updateLoading }] =
    useMutation(USER_UPDATE, {
      errorPolicy: 'all',
      onError: () => null,
      onCompleted: onUpdateCompleted,
    });

  const onFileSave = async (files: File[]) => {
    try {
      setImageOpen(false);
      setImageLoading(true);
      const { src: url } = await azureUpload(apolloClient, files[0]);
      setUser(update(user, { picture: { filename: { $set: url } } }));
    } catch (e) {
      setUploadError(e);
      console.error(e);
    } finally {
      setImageLoading(false);
    }
  };

  const clearPicture = () => {
    setUser(update(user, { picture: { filename: { $set: null } } }));
  };

  const onChange = (
    e: React.ChangeEvent<
      | HTMLTextAreaElement
      | HTMLInputElement
      | { name?: string; value?: unknown }
    >,
    key: string,
  ) => {
    setUser(update(user, { [key]: { $set: e.target.value } }));
  };

  const onBlockedChange = ($set: boolean) => {
    setUser(update(user, { blocked: { $set } }));
  };

  const onSave = () => {
    try {
      updateUser({
        variables: {
          _id,
          update: pick(user, [
            'email',
            'fullname',
            'username',
            'role',
            'blocked',
            'picture',
            'bio',
          ]),
        },
      });
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (data && data.user) {
      const user: User = {
        ...data.user,
        confirmPassword: data.user?.password,
      };
      setUser(user);
    }
  }, [data]);

  useEffect(() => {
    if (error || updateError || uploadError || updateErrorMessage) {
      setHideSnackbar(false);
    }
  }, [error, updateError, uploadError, updateErrorMessage]);

  const layoutProps = {
    title: 'User Editor',
  };

  return (
    <Restricted>
      <DashboardLayout {...layoutProps}>
        <Grid
          container
          direction="column"
          className={classes.relative}
          spacing={3}>
          {(!user || loading || updateLoading) && (
            <CircularProgress className={classes.loadingIndicator} />
          )}
          {user != null && (
            <>
              <Grid container item justify="space-between" wrap="nowrap">
                <Grid item>
                  <Typography variant="overline">
                    {user._id} | Member since{' '}
                    {format(new Date(user.created_at), 'PPpp')}
                  </Typography>
                </Grid>

                <Grid container item xs={3} spacing={2} justify="flex-end">
                  {updateSuccess && (
                    <Grid item container xs={2}>
                      <CheckCircle className={classes.successIcon} />
                    </Grid>
                  )}

                  <Grid item>
                    <Button
                      className={classes.editorButton}
                      color="primary"
                      variant="contained"
                      onClick={onSave}>
                      Save
                    </Button>
                  </Grid>
                </Grid>
              </Grid>

              <Grid container item spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    id="fullname"
                    label="Full Name"
                    value={user.fullname}
                    onChange={(e) => onChange(e, 'fullname')}
                    style={{ width: '100%' }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    id="username"
                    label="User Name"
                    value={user.username}
                    onChange={(e) => onChange(e, 'username')}
                    style={{ width: '100%' }}
                  />
                </Grid>
              </Grid>

              <Grid container item spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    id="email"
                    label="Email"
                    type="email"
                    value={user.email}
                    disabled={true}
                    onChange={(e) => onChange(e, 'email')}
                    style={{ width: '100%' }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl style={{ width: '100%' }}>
                    <InputLabel id="tags-select-label">Role</InputLabel>
                    <Select
                      labelId="role-select-label"
                      value={user.role}
                      onChange={(e) => onChange(e, 'role')}>
                      {Object.values(UserRole).map((role) => (
                        <MenuItem value={role} key={role}>
                          {capitalize(role)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={11}>
                  <TextField
                    id="bio"
                    label="Bio"
                    value={user.bio}
                    onChange={(e) => onChange(e, 'bio')}
                    style={{ width: '100%' }}
                    multiline={true}
                  />
                </Grid>
              </Grid>

              <Grid container item spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    id="password"
                    label="Password"
                    type="password"
                    value={user?.password}
                    onChange={(e) => onChange(e, 'password')}
                    style={{ width: '100%' }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    id="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    value={user?.confirmPassword}
                    onChange={(e) => onChange(e, 'confirmPassword')}
                    style={{ width: '100%' }}
                  />
                </Grid>
              </Grid>

              <Grid container item spacing={2}>
                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={user.blocked}
                        onChange={() => onBlockedChange(!user.blocked)}
                        name="blocked"
                        color="primary"
                      />
                    }
                    label="Blocked"
                  />
                </Grid>
              </Grid>
              <Grid container item spacing={2}>
                <Grid container item spacing={2} xs={4}>
                  <Grid container item spacing={2}>
                    <Grid item xs={8}>
                      <Image
                        src={user.picture?.filename || ''}
                        aspectRatio={1}
                        style={{ objectFit: 'cover' }}
                      />
                    </Grid>
                  </Grid>

                  <Grid container item spacing={2}>
                    <Grid item>
                      <Button
                        variant="contained"
                        color="primary"
                        disabled={imageLoading}
                        onClick={() => setImageOpen(true)}>
                        {user.picture ? 'Change' : 'Add'} Picture
                      </Button>
                    </Grid>
                    {user.picture && (
                      <Grid item>
                        <Button color="secondary" onClick={clearPicture}>
                          Remove Picture
                        </Button>
                      </Grid>
                    )}
                  </Grid>
                </Grid>
                <DropzoneDialog
                  acceptedFiles={['image/*']}
                  cancelButtonText={'cancel'}
                  submitButtonText={'submit'}
                  filesLimit={1}
                  maxFileSize={5000000}
                  open={imageOpen}
                  onClose={() => setImageOpen(false)}
                  onSave={onFileSave}
                  showPreviews={true}
                />
              </Grid>
            </>
          )}
        </Grid>
      </DashboardLayout>

      <Error open={!hideSnackbar} onClose={() => setHideSnackbar(true)}>
        {error ? error.message : ''}
        {updateError ? updateError.message : ''}
        {uploadError ? uploadError.message : ''}
      </Error>
    </Restricted>
  );
};

export default UserEditor;
