import { FC, useEffect } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
// import { useRouter } from 'next/router';
import { ApolloProvider } from '@apollo/client';
import { ThemeProvider, makeStyles } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import LuxonUtils from '@date-io/luxon';
import CssBaseline from '@material-ui/core/CssBaseline';
import { FirebaseAuthProvider } from 'use-firebase-auth';

import firebase from '../helpers/firebase';
import { useApollo } from '../helpers/apollo';
import theme from '../config/theme';
import { AuthProvider } from '../components/AuthProvider';

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
  },
}));

const App: FC<AppProps> = function App({ Component, pageProps }) {
  const classes = useStyles();
  const apolloClient = useApollo(pageProps);

  useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  return (
    <>
      <Head>
        <title>GABL Admin panel</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <FirebaseAuthProvider firebase={firebase}>
        <ApolloProvider client={apolloClient}>
          <AuthProvider>
            <MuiPickersUtilsProvider utils={LuxonUtils}>
              <ThemeProvider theme={theme}>
                {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
                <CssBaseline />
                <div className={classes.root}>
                  <Component {...pageProps} />
                </div>
              </ThemeProvider>
            </MuiPickersUtilsProvider>
          </AuthProvider>
        </ApolloProvider>
      </FirebaseAuthProvider>
    </>
  );
};

export default App;
