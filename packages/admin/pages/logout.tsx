import React, { CSSProperties, useEffect } from 'react';
import { CircularProgress } from '@material-ui/core';
import { useFirebaseAuth } from 'use-firebase-auth';

const centerProgress: CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  marginLeft: '-21px',
  marginTop: '-21px',
};

const Logout: React.FC = function Logout() {
  const { signOut } = useFirebaseAuth();

  useEffect(() => {
    async function effect() {
      await signOut();
      localStorage.removeItem('fb_token');
      window.location.href = process.env.WEB_URL;
    }

    effect();
  }, []);

  return <CircularProgress size={ 42 } style={ centerProgress }/>;
};

export default Logout;
