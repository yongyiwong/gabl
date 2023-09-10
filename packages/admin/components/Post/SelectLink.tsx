import React, { useState } from 'react';
import { Grid, TextField, Button } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import useEditorStyles from '../../styles/editor.styles';
import truncate from 'lodash-es/truncate';
import { Post } from '../../config/types';
import { getIconByType } from './config';

type SelectLinkProps = {
  currentPostId?: string;
  selectablePosts: Partial<Post>[];
  isButtonLabel?: boolean;
  textLabel: string;
  addToCollection: (post: Partial<Post> | null) => void;
};
const SelectLink: React.FC<SelectLinkProps> = function ({
  selectablePosts,
  addToCollection,
  textLabel,
  currentPostId,
  isButtonLabel,
}) {
  const classes = useEditorStyles();

  let initPost:Partial<Post>|null = null;

  if( currentPostId ) {
    initPost = selectablePosts.find( sp => sp._id==currentPostId );
  }
  const [post, setPost] = useState<Partial<Post> | null>(initPost);

  const add = (post: Partial<Post>) => {
    addToCollection(post);
    setPost(null);
  };

  const onChange = (post: Partial<Post> ) => {
    setPost(post);
    if(!isButtonLabel) {
      addToCollection(post);
    }
  };

  return (
    <Grid container item>
      <Grid item xs={12} md={11}>
        <Autocomplete
          value={post}
          onChange={(e, v) => onChange(v as Partial<Post>)}
          options={selectablePosts}
          getOptionLabel={(o: Post) =>
            `${getIconByType(o.type)} ${
              o.public ? '[Public]' : '[Paywalled]'
            } ${truncate(o.title, { length: 42, separator: ' ' })}`
          }
          renderInput={(params) => <TextField {...params} label={textLabel} />}
        />
      </Grid>
      {isButtonLabel && (
        <Grid item xs={12} md={1}>
          <Button
            className={classes.editorButton}
            color="primary"
            disabled={!post}
            onClick={() => add(post)}
          >
            Add
          </Button>
        </Grid>
      )}
    </Grid>
  );
};
export default SelectLink;
