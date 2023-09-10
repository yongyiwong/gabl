import React from 'react';
import { Snackbar } from '@material-ui/core';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  errorAlert: {
    '& .MuiAlert-action': {
      alignItems: 'baseline'
    }
  }
});

interface ErrorSnackProps {
  onClose: () => void,
  open: boolean
}

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const ErrorSnack: React.FC<ErrorSnackProps> = function ErrorSnack({ onClose, open, children }) {
  const classes = useStyles();
  return (
    <Snackbar open={ open } onClose={ onClose }>
      <Alert onClose={ onClose } severity="error" className = {classes.errorAlert}>
        { children }
      </Alert>
    </Snackbar>
  );
};

export default ErrorSnack;
