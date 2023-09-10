import Head from 'next/head';

import { Grid, Typography } from '@material-ui/core';

import DashboardLayout from '../components/DashboardLayout';

function Error({ statusCode, err }) {
  const layoutProps = {
    title: 'Error'
  };

  return (<>
    <Head>
      { statusCode && <title>{ statusCode } | Limitless Minds</title> }
      { !statusCode && <title>Page not found | Limitless Minds</title> }
    </Head>
    <DashboardLayout {...layoutProps}>
      <Grid
        container
        direction="column"
        spacing={2}
      >
        <Grid item>
          <Typography variant="h3" component="h1">
            {statusCode
              ? `Server Error: ${statusCode}`
              : 'Unknown Server Error'}
          </Typography>

          <Typography variant="subtitle1">
            Some error happened and you should inform the developers 🙂<br/>
            Please include at least a brief explanation on what you were doing and a screenshot.
          </Typography>
        </Grid>

        { err &&
          <Grid item>
            <pre>{ err.message }</pre>
            <pre>{ err.stack }</pre>
          </Grid>
        }
      </Grid>
    </DashboardLayout>
  </>);
}

Error.getInitialProps = async ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode, err: err || null };
};

export default Error;
