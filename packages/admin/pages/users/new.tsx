import React, { useEffect, useState } from 'react';
import { gql, useMutation, useApolloClient } from '@apollo/client';
import { useRouter } from 'next/router';
import update from 'immutability-helper';
import pick from 'lodash-es/pick';

import Image from 'material-ui-image';
import { DropzoneDialog } from 'material-ui-dropzone';

import {
  Grid,
  TextField,
  CircularProgress,
  InputLabel,
  Select,
  FormControl,
  FormControlLabel,
  MenuItem,
  Button,
  Checkbox,
  capitalize,
} from '@material-ui/core';

import DashboardLayout from '../../components/DashboardLayout';
import Restricted from '../../components/RestrictedRoute';
import Error from '../../components/Error';

import { User, ErrorMessage, ProviderType } from '../../config/types';
import { UserRole } from '../../shared/types';

import useEditorStyles from '../../styles/editor.styles';
import { azureUpload } from '../../helpers/azure';

const USER_CREATE = gql`
  mutation createUser($user: CreateUserInput) {
    createUser(user: $user) {
      success
      message
      user {
        _id
      }
    }
  }
`;

// eslint-disable-next-line no-useless-escape
const EMAIL_REGEX = new RegExp(
  '^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$',
);

function createEmptyUser(): User {
  return {
    firebaseId: '',
    role: UserRole.User,
    fullname: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    providerType: ProviderType.EMAIL,
    picture: null,
  };
}
const UserEditor: React.FC = function UsersEditor() {
  const classes = useEditorStyles();
  const apolloClient = useApolloClient();

  const [user, setUser] = useState<User>(createEmptyUser());
  const [hideSnackbar, setHideSnackbar] = useState<boolean>(true);
  const [imageOpen, setImageOpen] = useState<boolean>(false);
  const [imageLoading, setImageLoading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<{ message?: string } | null>(
    null,
  );
  const [error, setError] = useState<{ message?: string } | null>(null);
  const [validationError, setValidationError] = useState<ErrorMessage | null>(
    null,
  );

  const { replace } = useRouter();

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

  const onCreate = ({ createUser: { success, message, user } }) => {
    if (!success) {
      setError({ message });
    } else {
      replace(`/users/${user._id}`);
    }
  };

  const [createUser, { error: createError, loading: createLoading }] =
    useMutation(USER_CREATE, {
      errorPolicy: 'all',
      onError: () => null,
      onCompleted: onCreate,
    });

  const clearPicture = () => {
    setUser(update(user, { picture: { $set: null } }));
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

  const setInvalidMessage = () => {
    const errorMessage = (
      <div>
        {user.firebaseId.trim().length === 0 ? (
          <div>Firebase Id is required</div>
        ) : (
          <></>
        )}
        {user.fullname.trim().length === 0 ? (
          <div>Full name is required</div>
        ) : (
          <></>
        )}
        {user.email.trim().length === 0 ? <div>Email is required</div> : <></>}
        {!EMAIL_REGEX.test(user.email) ? (
          <div>Email format is wrong</div>
        ) : (
          <></>
        )}
        {!user.password || user.password.trim().length < 6 ? (
          <div>Password is required</div>
        ) : (
          <></>
        )}
        {!user.confirmPassword || user.password !== user.confirmPassword ? (
          <div>Password doesn't match</div>
        ) : (
          <></>
        )}
      </div>
    );
    setHideSnackbar(false);
    setValidationError({ message: errorMessage });
  };

  const onSave = () => {
    console.log('On Save User=', user);
    if (formValid) {
      createUser({
        variables: {
          user: pick(user, [
            'fullname',
            'username',
            'role',
            'blocked',
            'picture',
            'email',
            'bio',
            'password',
            'firebaseId',
            'providerType',
          ]),
        },
      });
    } else {
      setInvalidMessage();
    }
  };

  useEffect(() => {
    if (error || createError || uploadError || createError) {
      setHideSnackbar(false);
    }
  }, [error, createError, uploadError, createError]);

  const layoutProps = {
    title: 'User Editor',
  };

  const formValid =
    user.fullname.trim().length > 0 &&
    user.email.trim().length > 0 &&
    EMAIL_REGEX.test(user.email) &&
    user.password &&
    user.confirmPassword &&
    user.password.trim().length >= 6 &&
    user.password === user.confirmPassword;

  return (
    <Restricted>
      <DashboardLayout {...layoutProps}>
        <Grid
          container
          direction="column"
          className={classes.relative}
          spacing={3}>
          {(!user || createLoading) && (
            <CircularProgress className={classes.loadingIndicator} />
          )}

          {user != null && (
            <>
              <Grid container item justify="space-between" wrap="nowrap">
                <Grid item></Grid>

                <Grid container item xs={3} spacing={2} justify="flex-end">
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
                <Grid item xs={4} md={3}>
                  <TextField
                    id="firebaseId"
                    label="Firebase ID"
                    value={user.firebaseId}
                    onChange={(e) => onChange(e, 'firebaseId')}
                    style={{ width: '100%' }}
                  />
                </Grid>
                <Grid item xs={8} md={8}>
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
                    value={user.password}
                    onChange={(e) => onChange(e, 'password')}
                    style={{ width: '100%' }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    id="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    value={user.confirmPassword}
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

              <Grid container item direction="column" spacing={2}>
                <Grid container item spacing={2}>
                  <Grid item xs={2}>
                    {user.picture && (
                      <Image
                        src={user.picture?.filename}
                        aspectRatio={1}
                        style={{ objectFit: 'cover' }}
                      />
                    )}
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

                <Grid item xs={2}></Grid>
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
            </>
          )}
        </Grid>
      </DashboardLayout>

      <Error open={!hideSnackbar} onClose={() => setHideSnackbar(true)}>
        {validationError ? validationError.message : ''}
        {createError ? createError.message : ''}
        {error ? error.message : ''}
        {uploadError ? uploadError.message : ''}
      </Error>
    </Restricted>
  );
};

export default UserEditor;
