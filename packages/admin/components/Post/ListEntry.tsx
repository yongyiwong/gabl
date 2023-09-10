import { useState } from 'react';
import { useMutation } from '@apollo/client';
import Link from 'next/link';

import {
  Grid,
  Typography,
  ListItem,
  Button,
  Chip,
  CircularProgress,
} from '@material-ui/core';
import {
  ThumbUpOutlined,
  VisibilityOutlined,
  VisibilityOffOutlined,
} from '@material-ui/icons';

import RemovePostDialog from '../../components/RemovePostDialog';
import { PostMediaThumb } from '../../components/sharedComponent';

import useEditorStyles from '../../styles/editor.styles';

import { DELETE_POST } from './queries';
import { PostProps } from './config';
import { ArrowDownward, ArrowUpward } from '@material-ui/icons';
import { BLOCK_USER, UNBLOCK_USER } from '../../config/queries';

function strip(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

const PostEntry: React.FC<PostProps> = function PostEntry({
  post,
  getTagLabel,
  onReOrder,
  index,
  length,
  onPostDelete,
  setRemoveError,
}) {
  const classes = useEditorStyles();

  const [showRemove, setShowRemove] = useState<boolean>(false);
  //const [order, setOrder] = useState<number>(index);
  const onCompleted = (data) => {
    const {
      deletePost: { success, message },
    } = data;

    setShowRemove(false);
    onPostDelete();

    if (!success) {
      setRemoveError({ message: 'Error: ' + message });
    }
  };

  const [deletePost, { loading: deleteLoading }] = useMutation(DELETE_POST, {
    onError: () => null,
    onCompleted,
  });

  const onBlockUserCompleted = (data) => {
    const {
      updateUser: { success, message },
    } = data;

    onPostDelete();

    if (!success) {
      setRemoveError({ message: 'Error: ' + message });
    }
  };

  const [unblockUser, { loading: unblockLoading }] = useMutation(UNBLOCK_USER, {
    onError: () => null,
    onCompleted: (data) => onBlockUserCompleted(data),
  });

  const [blockUser, { loading: blockLoading }] = useMutation(BLOCK_USER, {
    onError: () => null,
    onCompleted: (data) => onBlockUserCompleted(data),
  });

  const onRemove = () => {
    deletePost({ variables: { _id: post._id } });
  };

  const onBlock = (blocked: boolean | undefined) => {
    if (blocked) {
      unblockUser({ variables: { _id: post.user?._id } });
    } else {
      blockUser({ variables: { _id: post.user?._id } });
    }
  };

  const onOrder = (isUp: boolean) => {
    if (isUp && index <= 0) {
      return;
    }
    if (!isUp && index >= length - 1) {
      return;
    }

    onReOrder(post, isUp);
  };
  return (
    <>
      <RemovePostDialog
        open={showRemove}
        loading={deleteLoading}
        onHide={() => setShowRemove(false)}
        onRemove={onRemove}
      />
      <ListItem divider={true} className={classes.listItem}>
        <Grid
          container
          direction="column"
          spacing={2}
          className={classes.relative}
        >
          <Grid container item spacing={1}>
            {post.media && (
              <Grid item xs={1} container alignItems="center" justify="center">
                <PostMediaThumb {...post.media[0]} />
              </Grid>
            )}
            <Grid item xs={post.media ? 9 : 10}>
              <Typography variant="overline">
                {post.__typename}{' '}
                {post.__typename === 'UserStory' && post.user
                  ? (<span>
                    created by <Link href={`users/${post.user._id}`}><a style={{color:'white'}}>{post.user.fullname}</a></Link>
                  </span>)
                  : ''}
              </Typography>
              <Typography>
                {post.__typename === 'Tip' || post.__typename === 'UserStory'
                  ? strip(post.body)
                  : post.title}
              </Typography>
            </Grid>
          </Grid>
          <Grid container item spacing={2}>
            <Grid container item xs={12} md={5}>
              {post.tags &&
                post.tags.map((t) => (
                  <Chip
                    key={`post-${post._id}-tag-${t}`}
                    label={getTagLabel(t)}
                    className={classes.tagChip}
                  />
                ))}
            </Grid>
            <Grid container item xs={1} md={1} alignItems="center">
              {!post.public ? (
                <VisibilityOffOutlined color="disabled" />
              ) : (
                <VisibilityOutlined color="disabled" />
              )}
            </Grid>
            <Grid container item alignItems="center" xs={1} md={1}>
              {typeof post.views !== 'undefined' && (
                <>
                  <VisibilityOutlined color="disabled" />
                  <Typography className={classes.counter} color="textSecondary">
                    {post.views}
                  </Typography>
                </>
              )}
            </Grid>
            <Grid container item alignItems="center" xs={1} md={1}>
              {typeof post.likes !== 'undefined' && (
                <>
                  <ThumbUpOutlined color="disabled" />
                  <Typography className={classes.counter} color="textSecondary">
                    {post.likes}
                  </Typography>
                </>
              )}
            </Grid>
            <Grid
              container
              item
              xs={6}
              md={4}
              alignItems="center"
              justify="space-around"
            >
              {post.__typename !== 'UserStory' && (
                <>
                  <Button onClick={() => onOrder(true)}>
                    <ArrowUpward />
                  </Button>
                  <Button onClick={() => onOrder(false)}>
                    <ArrowDownward />
                  </Button>
                </>
              )}
              <Link href={`/posts/${post._id}`}>
                <Button color="primary">Edit</Button>
              </Link>
              <Button
                variant="text"
                color="secondary"
                onClick={() => setShowRemove(true)}
              >
                Delete
              </Button>
              {post.__typename === 'UserStory' &&
                !(blockLoading || unblockLoading) && (
                <Button
                  variant="text"
                  color="secondary"
                  onClick={() => onBlock(post.user?.blocked)}
                >
                  {post.user?.blocked ? 'Unblock user' : 'Block user'}
                </Button>
              )}
              {(blockLoading || unblockLoading) && (
                <CircularProgress color="primary" />
              )}
            </Grid>
          </Grid>
        </Grid>
      </ListItem>
    </>
  );
};

export default PostEntry;
