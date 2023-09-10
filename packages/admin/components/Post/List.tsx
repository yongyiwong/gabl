import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import update from 'immutability-helper';

import startCase from 'lodash-es/startCase';
import isEmpty from 'lodash-es/isEmpty';

import {
  Grid,
  Paper,
  Typography,
  CircularProgress,
  List,
  Chip,
  Button,
  InputLabel,
  Input,
  Select,
  FormControl,
  MenuItem,
  ListItemText,
  Checkbox,
} from '@material-ui/core';
import Pagination from '@material-ui/lab/Pagination';

import DashboardLayout from '../../components/DashboardLayout';
import Restricted from '../../components/RestrictedRoute';
import Error from '../../components/Error';

import { ErrorMessage, Tag, PostType, Post } from '../../config/types';
import { TAGS_QUERY } from '../../config/queries';
import useEditorStyles from '../../styles/editor.styles';

import PostEntry from './ListEntry';

import { POSTS_QUERY, POSTS_COUNT, ORDER_POSTS_QUERY } from './queries';
import { adminPostQueryVars, MenuProps, PostQuery, PAGE } from './config';

type PostListProps = {
  query: PostQuery;
  createButtons: string[];
  title: string;
};

const Posts: React.FC<PostListProps> = function Posts({
  query: inputQuery,
  createButtons,
  title,
}) {
  const { push } = useRouter();
  const [page, setPage] = useState<number>(1);
  const [hideSnackbar, setHideSnackbar] = useState<boolean>(true);
  const [removeError, setRemoveError] = useState<ErrorMessage | null>(null);
  const [reOrderErrorMessage, setReOrderErrorMessage] =
    useState<ErrorMessage | null>(null);
  const [query, setQuery] = useState<PostQuery>({ ...inputQuery });

  const classes = useEditorStyles();
  const skip = (page - 1) * PAGE;

  const {
    data: tags,
    loading: tagsLoading,
    error: tagsError,
  } = useQuery(TAGS_QUERY, { variables: { query: { all: true } } });

  const { data: postsCount, loading: countLoading } = useQuery(POSTS_COUNT, {
    variables: { query },
  });
  const { data, error, loading, refetch } = useQuery(POSTS_QUERY, {
    variables: { ...adminPostQueryVars, skip, query },
  });

  const onReOrderCompleted = (data) => {
    const {
      reOrder: { success, message },
    } = data;
    if (!success) {
      setReOrderErrorMessage({ message: 'Error: ' + message });
    } else {
      refetch();
    }
  };

  const [reOrder, { error: reOrderError, loading: reOrderLoading }] =
    useMutation(ORDER_POSTS_QUERY, {
      errorPolicy: 'all',
      onError: () => null,
      onCompleted: onReOrderCompleted,
    });
  const layoutProps = {
    title: title || 'Posts',
  };

  const queryChange = (value, key) => {
    if (isEmpty(value)) {
      setQuery(update(query, { $unset: [key] }));
    } else {
      setQuery(update(query, { [key]: { $set: value } }));
    }
  };

  const onPageChanged = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const onPostDelete = () => {
    refetch();
  };

  const onReOrder = (post: Post, isUp: boolean) => {
    // const pos = data.posts.findIndex(sp=>sp._id === post._id);
    // data.posts.splice(pos,1);

    // if( isUp ) {
    //   data.posts.splice(pos-1, 0, post);
    // }else{
    //   data.posts.splice(pos+1, 0, post);
    // }

    // const newOrders = data.posts.map( function(p, idx){
    //   return {
    //     _id:p._id,
    //     order:idx,
    //   };
    // });
    reOrder({
      variables: {
        order: {
          _id: post._id,
          isUp: isUp,
          type: post.type,
        },
      },
    });
  };

  const getTagLabel = (_id: string) => {
    const tag = tags && tags.tags && tags.tags.find((t) => t._id === _id);
    return tag ? tag.slug : 'Loading...';
  };

  const createPost = (type: string) => {
    push('/posts/new/' + type);
  };

  const renderTypeChips = (selected) => {
    return (
      <div className={classes.tagChipsContainer}>
        {(selected as string[]).map((type) => (
          <Chip
            key={'post-selected-type-' + type}
            label={startCase(type)}
            className={classes.tagChip}
            color="primary"
          />
        ))}
      </div>
    );
  };

  const renderTagChips = (selected) => {
    return (
      <div className={classes.tagChipsContainer}>
        {(selected as string[]).map((_id) => {
          const tag = tags.tags.find((t) => t._id === _id);
          return (
            <Chip
              key={'selected-tag-' + tag.slug}
              label={tag.displayName}
              className={classes.tagChip}
              color="primary"
            />
          );
        })}
      </div>
    );
  };

  const pages = postsCount ? Math.ceil(postsCount.countPosts / PAGE) : 0;

  useEffect(() => {
    refetch();
  }, [page, query, reOrderError, reOrderLoading]);

  useEffect(() => {
    if (error || tagsError || removeError) {
      setHideSnackbar(false);
    }
  }, [error, tagsError, removeError]);

  const isLoading = loading || tagsLoading || countLoading;

  return (
    <Restricted>
      <DashboardLayout {...layoutProps}>
        {reOrderLoading && (
          <CircularProgress className={classes.loadingIndicator} />
        )}
        <Grid container direction="column" className={classes.relative}>
          <Grid container item justify="space-between" alignItems="center">
            <Grid item>
              <Typography variant="overline">
                Total posts: {postsCount ? postsCount.countPosts : 'N/A'}
              </Typography>
            </Grid>

            <Grid item>
              {isLoading && (
                <CircularProgress className={classes.loadingIndicator} />
              )}
            </Grid>
          </Grid>

          <Grid container item spacing={2}>
            {createButtons && createButtons.length && (
              <Grid
                container
                item
                xs={12}
                justify="flex-end"
                alignItems="center"
              >
                {createButtons.map((postType, index) => (
                  <Button
                    key={`create_button_${index}`}
                    variant="contained"
                    color="primary"
                    onClick={() => createPost(postType)}
                    style={{ marginLeft: 12 }}
                  >
                    New {postType}
                  </Button>
                ))}
              </Grid>
            )}

            {!inputQuery && (
              <>
                <Grid item xs={12} md={4}>
                  <FormControl style={{ width: '100%' }}>
                    <InputLabel id="types-select-label">
                      Filter by Type
                    </InputLabel>
                    <Select
                      labelId="types-select-label"
                      multiple
                      value={query.type || []}
                      onChange={(e) =>
                        queryChange(e.target.value as PostType[], 'type')
                      }
                      input={<Input id="types-select-input" />}
                      renderValue={renderTypeChips}
                      MenuProps={MenuProps}
                    >
                      {Object.values(PostType).map((p) => (
                        <MenuItem key={'post-type-' + p} value={p}>
                          <Checkbox
                            color="primary"
                            checked={query.type && query.type.includes(p)}
                          />
                          <ListItemText primary={p} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl style={{ width: '100%' }}>
                    <InputLabel id="types-select-label">
                      Filter by Tag
                    </InputLabel>
                    <Select
                      labelId="tags-select-label"
                      multiple
                      value={query.tags || []}
                      onChange={(e) =>
                        queryChange(e.target.value as string[], 'tags')
                      }
                      input={<Input id="tags-select-input" />}
                      renderValue={renderTagChips}
                      MenuProps={MenuProps}
                    >
                      {tags &&
                        tags.tags.length > 0 &&
                        tags.tags.map((tag: Tag) => (
                          <MenuItem key={'tag-' + tag.slug} value={tag._id}>
                            <Checkbox
                              color="primary"
                              checked={
                                query.tags && query.tags.includes(tag._id)
                              }
                            />
                            <ListItemText primary={tag.displayName} />
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}
          </Grid>

          <Grid container item></Grid>

          <Grid item>
            <Paper style={{ marginTop: 16 }}>
              {error && JSON.stringify(error)}
              {!error && data && (
                <>
                  <List>
                    {data.posts.map((p, idx) => (
                      <PostEntry
                        key={'post-' + p._id}
                        post={p}
                        getTagLabel={getTagLabel}
                        length={data.posts.length}
                        index={idx}
                        onReOrder={onReOrder}
                        onPostDelete={onPostDelete}
                        setRemoveError={setRemoveError}
                      />
                    ))}
                  </List>
                  <Grid
                    container
                    alignItems="center"
                    justify="center"
                    className={classes.paginationContainer}
                  >
                    <Pagination
                      count={pages}
                      page={page}
                      onChange={onPageChanged}
                    />
                  </Grid>
                </>
              )}
            </Paper>
          </Grid>

          <Error open={!hideSnackbar} onClose={() => setHideSnackbar(true)}>
            {error ? error.message : ''}
            {tagsError ? tagsError.message : ''}
            {removeError ? removeError.message : ''}
            {reOrderErrorMessage ? reOrderErrorMessage.message : ''}
          </Error>
        </Grid>
      </DashboardLayout>
    </Restricted>
  );
};

export default Posts;
