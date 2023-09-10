import React, { CSSProperties, useEffect } from 'react';
import { useRouter } from 'next/router';
import { CircularProgress } from '@material-ui/core';
import { useAuth } from './AuthProvider';

interface RestrictedRouteProps {
  children: React.ReactNode
}

const centerProgress: CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  marginLeft: '-21px',
  marginTop: '-21px',
};

const Restricted: React.FC<RestrictedRouteProps> = ({ children } ) => {
  const { push, asPath } = useRouter();
  const { isLoading, isAllowed } = useAuth();

  useEffect( () => {
    if ( !isLoading && isAllowed === false ) {
      push(`/login?returnTo=${ asPath }`);
    }
  }, [ isAllowed ] );

  return (<>
    { isLoading && <CircularProgress size={ 42 } style={ centerProgress }/> }
    { !isLoading && isAllowed === true && children }
  </>);

};

export default Restricted;
