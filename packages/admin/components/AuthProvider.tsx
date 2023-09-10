import React, { useState, useEffect, useContext } from 'react';
import { useLazyQuery } from '@apollo/client';
import { useFirebaseAuth } from 'use-firebase-auth';

import { ME_QUERY } from '../helpers/auth';
import { User } from '../../shared/types';
import { EXPIRATION_TIME } from '../config';

type AuthContext = {
  user: User | null;
  isLoading: boolean;
  isAllowed: true | false | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;
};

export const AuthContext: React.Context<AuthContext> = React.createContext({
  user: null,
  isLoading: true as boolean,
  isAllowed: null,
  error: null,
});
export const useAuth: () => AuthContext = () => useContext(AuthContext);

export const AuthProvider: React.FC = ({ children }) => {
  const [actuallyMounted, setActuallyMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(null);
  const [expirationTime, setExpirationTime] = useState(new Date().getTime());
  const { user, loading: fbLoading, error } = useFirebaseAuth();

  const expired =
    new Date().getTime() - expirationTime > EXPIRATION_TIME ? true : false;

  const onMeCompleted = () => {
    setIsAllowed(
      typeof data !== 'undefined' && data.me && data.me.role === 'ADMIN',
    );
    setIsLoading(false);
  };

  const [getMe, { data }] = useLazyQuery(ME_QUERY, {
    onCompleted: onMeCompleted,
  });

  const getToken = async () => {
    if (user) {
      const token = await user.getIdToken(true);
      await localStorage.setItem('fb_token', token);
      setExpirationTime(new Date().getTime());
      getMe();
    } else {
      console.error('Why?');
    }
  };

  useEffect(() => {
    setActuallyMounted(true);
  }, []);

  useEffect(() => {
    if (actuallyMounted && !fbLoading && user != null) {
      getToken();
      return;
    }

    if (actuallyMounted && !fbLoading && user == null) {
      setIsLoading(false);
      setIsAllowed(false);
    }
  }, [fbLoading, user, expired]);

  return (
    <AuthContext.Provider
      value={{
        user: data && data.me ? data.me : null,
        isLoading,
        isAllowed,
        error,
      }}>
      {children}
    </AuthContext.Provider>
  );
};
