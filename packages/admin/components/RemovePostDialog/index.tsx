import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, CircularProgress } from '@material-ui/core';

import useEditorStyles from '../../styles/editor.styles';

interface RemovePostDialogProps {
  open: boolean,
  loading: boolean,
  onRemove: () => void,
  onHide: () => void,
  message?:string,
}

const RemovePostDialog: React.FC<RemovePostDialogProps> = function RemovePostDialog({ open, loading, onRemove, onHide, message }) {
  const classes = useEditorStyles();

  return (
    <Dialog
      open={open}
      onClose={onHide}
      aria-labelledby="remove-post-dialog-title"
      aria-describedby="remove-post-dialog-description"
    >
      { loading && <CircularProgress className={classes.loadingIndicator} />}

      <DialogTitle id="remove-post-dialog-title">{message || 'Remove Post?'}</DialogTitle>
      <DialogContent>
        <DialogContentText id="remove-post-dialog-description">
          This is not reversible. You won't be able to undo this action.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onHide} disabled={ loading }>
          Cancel
        </Button>
        <Button onClick={onRemove} disabled={ loading } color="primary" variant="contained">
          Remove
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RemovePostDialog;
