import React, { useEffect, useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import format from 'date-fns/format';
import Link from 'next/link';
import isEmpty from 'lodash-es/isEmpty';

import Image from 'material-ui-image';

import { Grid, Paper, Typography, CircularProgress, List, ListItem, Button } from '@material-ui/core';
import Pagination from '@material-ui/lab/Pagination';

import { ThumbUpAlt } from '@material-ui/icons';

import DashboardLayout from '../../components/DashboardLayout';
import Restricted from '../../components/RestrictedRoute';
import RemovePostDialog from '../../components/RemovePostDialog';
import { Comment } from '../../config/types';
import useEditorStyles from '../../styles/editor.styles';


const COMMENTS_QUERY = gql`
  query getComments($query: CommentQuery, $limit: Int, $skip: Int, $sort: CommentSort) {
    comments(query: $query, limit: $limit, skip: $skip, sort: $sort) {
      _id
      body
      likes
      created_at
      post {
        _id
        type
        title
        body
      }
      user {
        _id
        fullname
        username
        picture
        blocked
      }
    }
  }
`;

const COMMENTS_COUNT = gql`
  query commentCount($query: CommentQuery) {
    countComments(query: $query)
  }
`;

const DELETE_COMMENT = gql`
  mutation deleteComment($_id: ObjectID!) {
    deleteComment(_id: $_id) {
      success
      message
    }
  }
`;

const USER_UPDATE = gql`
  mutation updateUser($_id: ObjectID!, $update: UpdateUserInput!) {
    updateUser(_id: $_id, update: $update) {
      success
      message
    }
  }
`;

const PAGE = 25;

const adminCommentQueryVars = {
  limit: PAGE,
  sort: { created_at: -1 }
};

type CommentsQuery = {
  post?: string
}

interface CommentProps {
  comment: Comment,
  onCommentDelete: () => void
  setQuery: (filter: CommentsQuery) => void
}

const CommentEntry: React.FC<CommentProps> = function CommentEntry({ comment, setQuery, onCommentDelete }) {
  const classes = useEditorStyles();

  const [ showRemove, setShowRemove ] = useState<boolean>(false);

  const [ deleteComment, { loading: deleteLoading } ] = useMutation( DELETE_COMMENT, { onError: () => null, onCompleted: () => { setShowRemove(false); onCommentDelete(); } } );
  const [ updateUser ] = useMutation(USER_UPDATE, { onError: () => null, onCompleted: () => { onCommentDelete(); } });

  const onRemove = () => {
    deleteComment({ variables: { _id: comment._id } });
  };

  const blockUser = () => {
    updateUser({
      variables: {
        _id: comment.user._id,
        update: { blocked: !comment.user.blocked }
      }
    });
  };

  return (<>
    <RemovePostDialog open={ showRemove } loading={ deleteLoading } onHide={ () => setShowRemove(false) } onRemove={ onRemove } />

    <ListItem divider={true} className={classes.listItem}>
      <Grid
        container
        spacing={2}
        className={classes.relative}
      >
        { comment.user &&
          <Grid item>
            <Image src={comment.user.picture || ''} aspectRatio={1} style={{ objectFit: 'contain', width: 64, height: 64, background: 'transparent'  }} />
          </Grid>
        }

        <Grid container item xs={7} alignItems="center">
          <Grid item xs={12}>
            <span>
              { comment.user &&
                <Link href={ `/users/${ comment.user._id }` }>
                  <Typography
                    variant="overline"
                    component="a"
                    color="primary"
                    href={ `/users/${ comment.user._id }` }>
                    {comment.user.fullname || comment.user.username}
                  </Typography>
                </Link>
              }
              <Typography variant="overline"> commented on </Typography>
              { comment.post ?
                <Typography
                  variant="overline"
                  component="a"
                  color="primary"
                  href="#"
                  onClick={ () => setQuery({ post: comment.post._id }) }
                >
                  {comment.post.type}
                </Typography>
                :
                <Typography
                  variant="overline"
                  component="a"
                  color="primary"
                  href="#"
                >
                  DELETED
                </Typography>
              }
              <Typography variant="overline"> at { format( new Date( comment.created_at ), 'PPpp' ) } </Typography>
            </span>
            <Typography variant="body2">{comment.body}</Typography>
          </Grid>
        </Grid>

        <Grid container item alignItems="center" justify="flex-end" xs={1}>
          <ThumbUpAlt color="disabled"/>
          <Typography className={classes.counter} color="textSecondary">{comment.likes || 0}</Typography>
        </Grid>

        <Grid container item xs={3} alignItems="center" justify="space-around">
          <Button variant="text" color="primary" onClick={ () => setShowRemove( true ) }>
            Delete
          </Button>

          { comment.user &&
            <Button variant="text" color="primary" onClick={ blockUser }>
              { comment.user.blocked ? 'Unblock' : 'Block' } User
            </Button>
          }
        </Grid>
      </Grid>
    </ListItem>
  </>);
};

const Comments: React.FC = function Comments() {
  const [query, setQuery] = useState<CommentsQuery>({});
  const [page, setPage] = useState<number>(1);
  const classes = useEditorStyles();

  const skip = (page - 1) * PAGE;

  const { data: commentsCount, loading: countLoading } = useQuery(COMMENTS_COUNT, { variables: { query } });
  const { data, error, loading, refetch } = useQuery(COMMENTS_QUERY, { variables: { ...adminCommentQueryVars, skip, query } });

  const layoutProps = {
    title: 'Comments'
  };

  const onPageChanged = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const onCommentDelete = () => {
    refetch();
  };

  const filter = (filter: CommentsQuery) => {
    setPage(1);
    setQuery(filter);
  };

  const pages = commentsCount ? Math.ceil(commentsCount.countComments / PAGE) : 0;

  useEffect(() => {
    refetch();
  }, [page]);

  const isLoading = loading || countLoading;

  return (
    <Restricted>
      <DashboardLayout {...layoutProps}>
        <Grid
          container
          direction="column"
          className={classes.relative}
        >
          <Grid container item justify="space-between" alignItems="center">
            <Grid item>
              <Typography variant="overline">Total comments: {commentsCount ? commentsCount.countComments : 'N/A' }</Typography>
            </Grid>

            <Grid item>
              { isLoading && <CircularProgress className={classes.loadingIndicator} />}
            </Grid>
          </Grid>

          <Grid container item justify="flex-start" alignItems="center" spacing={2}>
            { !isEmpty( query ) && <>
              <Grid item>
                <Button variant="contained" color="secondary" onClick={ () => setQuery({}) } >
                  Clear Query
                </Button>
              </Grid>
              { query.post &&
                <Grid item>
                  Post: { query.post }
                </Grid>
              }
            </>}
          </Grid>

          <Grid item>
            <Paper style={{ marginTop: 16 }}>
              { error && JSON.stringify(error) }
              { !error && data && (<>
                <List>
                  {data.comments.map(p => <CommentEntry key={'comment-' + p._id} comment={p} onCommentDelete={onCommentDelete} setQuery={ filter } />)}
                </List>
                <Grid container alignItems="center" justify="center" className={classes.paginationContainer}>
                  <Pagination count={pages} page={page} onChange={onPageChanged} />
                </Grid>
              </>) }
            </Paper>
          </Grid>
        </Grid>

      </DashboardLayout>
    </Restricted>
  );
};

export default Comments;
