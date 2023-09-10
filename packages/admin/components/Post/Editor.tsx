import React, { useEffect, useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { DefaultEditor } from 'react-simple-wysiwyg';
import update from 'immutability-helper';
import pick from 'lodash-es/pick';
import some from 'lodash-es/some';
import omit from 'lodash-es/omit';
import sortBy from 'lodash-es/sortBy';
import isEmpty from 'lodash-es/isEmpty';
import isNaN from 'lodash-es/isNaN';
import 'emoji-mart/css/emoji-mart.css';
import { Picker } from 'emoji-mart';
import { KeyboardTimePicker } from '@material-ui/pickers';
import { DateTime } from 'luxon';
import { unflatten } from 'flatulence';
import { Avatar } from '@material-ui/core';

import {
  Grid,
  TextField,
  CircularProgress,
  InputLabel,
  Input,
  Select,
  Popover,
  FormControl,
  MenuItem,
  Chip,
  Typography,
  Button,
  Checkbox,
  ListItemText,
  FormControlLabel,
  Card,
  CardContent,
} from '@material-ui/core';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import { ArrowDownward, ArrowUpward, CheckCircle } from '@material-ui/icons';

import DashboardLayout from '../../components/DashboardLayout';
import Restricted from '../../components/RestrictedRoute';
import RemovePostDialog from '../../components/RemovePostDialog';
import Error from '../../components/Error';
import MediaUploadSection from '../../components/MediaUploadSection';

import {
  ErrorMessage,
  Post,
  PostLink,
  PostMedia,
  PostType,
  User,
  HabitReccurence,
} from '../../config/types';
import { AUTHORS_QUERY, TAGS_QUERY } from '../../config/queries';
import useEditorStyles, { editorStyles } from '../../styles/editor.styles';

import { NESTED_POSTS_QUERY } from './queries';
import { getIconByType, getPostTypeAliases } from './config';
import PostLinkEntry from './PostLinkEntry';
import SelectLink from './SelectLink';

const POST_QUERY = gql`
  query getPostById($_id: ObjectID) {
    post(_id: $_id) {
      __typename
      title
      type
      body
      tags
      public
      ... on Habit {
        icon
        reccurence {
          hour
          minute
          days
          pushTitle
          pushBody
        }
      }
      ... on UserStory {
        user {
          fullname
          picture
        }
        media {
          type
          src
          filename
          duration
          thumbSmall
          thumbLarge
        }
      }
      ... on Article {
        pushTitle
        pushBody
        authorID
        media {
          type
          src
          filename
          duration
          thumbSmall
          thumbLarge
        }
        links {
          title
          excerpt
          activity {
            _id
          }
        }
      }
      ... on Notification {
        pushTitle
        pushBody
      }
      ... on PostCollection {
        postsIDs
        media {
          type
          src
          filename
          duration
          thumbSmall
          thumbLarge
        }
      }
    }
  }
`;

const POST_UPDATE = gql`
  mutation updatePost($_id: ObjectID!, $update: UpdatePostInput!) {
    updatePost(_id: $_id, update: $update) {
      success
      message
      post {
        _id
        title
        body
        tags
        public
        ... on Habit {
          icon
          reccurence {
            hour
            minute
            days
            pushTitle
            pushBody
          }
        }
        ... on Article {
          pushTitle
          pushBody
          authorID
          media {
            type
            src
            filename
            duration
            thumbSmall
            thumbLarge
          }
        }
        ... on Notification {
          pushTitle
          pushBody
        }
        ... on PostCollection {
          postsIDs
          media {
            type
            src
            filename
            duration
            thumbSmall
            thumbLarge
          }
        }
      }
    }
  }
`;

const POST_REMOVE = gql`
  mutation deletePost($_id: ObjectID!) {
    deletePost(_id: $_id) {
      success
      message
    }
  }
`;

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const PostEditor: React.FC = function PostsEditor() {
  const classes = useEditorStyles();

  const [post, setPost] = useState<Post | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [imageLoading, setImageLoading] = useState<boolean>(false);
  const [hideSnackbar, setHideSnackbar] = useState<boolean>(true);
  const [uploadError, setUploadError] = useState<{ message?: string } | null>(
    null
  );
  const [removeErrorMessage, setRemoveErrorMessage] =
    useState<ErrorMessage | null>(null);
  const [updateErrorMessage, setUpdateErrorMessage] =
    useState<ErrorMessage | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<boolean>(false);
  const [emojiAnchor, setEmojiAnchor] = useState<HTMLInputElement | null>(null);

  const openPicker = (event: React.MouseEvent<HTMLInputElement>) => {
    setEmojiAnchor(event.currentTarget);
  };

  const closePicker = () => {
    setEmojiAnchor(null);
  };

  const onUpdateCompleted = (data) => {
    const {
      updatePost: { success, message },
    } = data;

    setUpdateSuccess(false);

    if (!success) {
      setUpdateErrorMessage({ message: 'Error: ' + message });
    } else {
      setUpdateSuccess(true);
    }
  };

  const onRemoveCompleted = (data) => {
    const {
      deletePost: { success, message },
    } = data;

    setDialogOpen(false);

    if (!success) {
      setRemoveErrorMessage({ message: 'Error: ' + message });
    } else {
      push('/posts');
    }
  };

  const {
    query: { _id },
    push,
  } = useRouter();
  const { data, error, loading } = useQuery(POST_QUERY, { variables: { _id } });
  const {
    data: tagsData,
    loading: tagsLoading,
    error: tagsError,
  } = useQuery(TAGS_QUERY, { variables: { query: { all: true } } });
  const {
    data: authorsData,
    loading: authorsLoading,
    error: authorsError,
  } = useQuery(AUTHORS_QUERY);
  const {
    data: postsData,
    loading: postsLoading,
    error: postsError,
  } = useQuery(NESTED_POSTS_QUERY);
  const [updatePost, { error: updateError, loading: updateLoading }] =
    useMutation(POST_UPDATE, {
      errorPolicy: 'all',
      onError: () => null,
      onCompleted: onUpdateCompleted,
    });
  const [removePost, { error: removeError, loading: removeLoading }] =
    useMutation(POST_REMOVE, {
      errorPolicy: 'all',
      onError: () => null,
      onCompleted: onRemoveCompleted,
    });

  const onMediaChange = (media: PostMedia) => {
    setPost(update(post, { media: { $set: [media] } }));
  };

  const clearMedia = () => {
    setPost(update(post, { media: { $set: [] } }));
  };

  const addToCollection = (selectedNewPost: Partial<Post>) => {
    setPost(update(post, { postsIDs: { $push: [selectedNewPost._id] } }));
  };

  const removeFromCollection = (index: number) => {
    setPost(update(post, { postsIDs: { $splice: [[index, 1]] } }));
  };

  const onChange = (
    e: React.ChangeEvent<
      | HTMLTextAreaElement
      | HTMLInputElement
      | { name?: string; value?: unknown }
    >,
    key: string
  ) => {
    setPost(update(post, unflatten({ [key]: { $set: e.target.value } })));
  };

  const onSave = () => {
    try {
      const media =
        post.media &&
        post.media.map((m) =>
          pick(m, [
            'type',
            'src',
            'duration',
            'filename',
            'thumbSmall',
            'thumbLarge',
          ])
        );
      const reccurence =
        post.reccurence && post.reccurence.map((m) => omit(m, ['__typename']));
      const author = post.authorID;
      const posts = post.postsIDs;
      const links =
        post.links?.map((l) => {
          const link = pick(l, ['title', 'excerpt', 'activity']);
          link.activity = l.activity?._id || l.activity || null;
          return link;
        }) || [];

      updatePost({
        variables: {
          _id,
          update: {
            ...pick(post, ['title', 'body', 'tags', 'public', 'icon']),
            media,
            author,
            posts,
            links,
            reccurence,
          },
        },
      });
    } catch (e) {
      console.log(e);
    }
  };

  const selectDate = (date: DateTime, index: number) => {
    setPost(
      update(post, {
        reccurence: {
          [index]: {
            $merge: {
              hour: date == null || date.invalid ? null : date.hour,
              minute: date == null || date.invalid ? null : date.minute,
            },
          },
        },
      })
    );
  };

  const getDate = (notification: HabitReccurence) => {
    if (isNaN(notification.hour) || isNaN(notification.minute)) {
      return null;
    }
    return DateTime.fromObject({
      hour: notification.hour,
      minute: notification.minute,
    });
  };

  const addReccurence = () => {
    const defaultReccurence = {
      hour: 12,
      minute: 0,
      days: [1, 2, 3, 4, 5, 6, 0],
      pushTitle: '',
      pushBody: '',
    };

    if (post.reccurence != null) {
      setPost(
        update(post, {
          reccurence: {
            $push: [defaultReccurence],
          },
        })
      );
    } else {
      setPost(
        update(post, {
          reccurence: {
            $set: [defaultReccurence],
          },
        })
      );
    }
  };

  const removeReccurence = (index: number) => {
    setPost(update(post, { reccurence: { $splice: [[index, 1]] } }));
  };

  const selectEmoji = (icon) => {
    setPost(update(post, { icon: { $set: icon.native } }));
  };

  const updatePostLink = (links: PostLink[]) => {
    setPost(update(post, { links: { $set: links } }));
  };

  const onUpdatePublic = () => {
    setPost(update(post, { public: { $set: !post.public } }));
  };

  const onRemove = () => {
    try {
      removePost({ variables: { _id } });
    } catch (e) {
      console.log(e);
    }
  };

  const renderTagChips = (selected) => {
    if (!tagsData || !tagsData.tags) {
      return <div>Loading tags...</div>;
    }

    const chips = (selected as string[]).map((_id) => {
      const tag = tagsData.tags.find((t) => t._id === _id);
      return (
        <Chip
          key={'post-selected-tag-' + _id}
          label={tag?.slug}
          className={classes.tagChip}
          color="primary"
        />
      );
    });

    return <div className={classes.tagChipsContainer}>{chips}</div>;
  };

  useEffect(() => {
    if (!post && data && data.post) {
      setPost(data.post);
    }
  }, [data]);

  useEffect(() => {
    if (
      error ||
      tagsError ||
      authorsError ||
      postsError ||
      removeError ||
      uploadError ||
      removeErrorMessage ||
      updateErrorMessage
    ) {
      setHideSnackbar(false);
    }
  }, [
    error,
    tagsError,
    authorsError,
    postsError,
    updateError,
    removeError,
    uploadError,
    removeErrorMessage,
    updateErrorMessage,
  ]);

  const layoutProps = {
    title: 'Post Editor',
  };

  const invalidDateIndexes = post?.reccurence?.map(
    (r) => r.hour == null || r.minute == null
  );

  const formValid =
    post &&
    post.body.replace('<br>', '').trim().length > 0 &&
    (post.type !== PostType.HABIT ||
      (!isEmpty(post.reccurence) &&
        !some(invalidDateIndexes, (i) => i === true)));

  let selectedCollectionPosts =
    post?.postsIDs &&
    postsData?.nestedPosts?.filter((p) => post.postsIDs.includes(p._id));
  if (selectedCollectionPosts) {
    selectedCollectionPosts = sortBy(selectedCollectionPosts, [
      ({ _id }) => post.postsIDs.indexOf(_id),
    ]);
  }

  let selectablePosts = post?.postsIDs
    ? postsData?.nestedPosts?.filter((p) => !post.postsIDs.includes(p._id))
    : postsData?.nestedPosts;
  selectablePosts = selectablePosts?.filter((sp) => sp._id != _id);

  const onOrder = (index: number, isUp: boolean) => {
    if (isUp && index <= 0) {
      return;
    }

    if (!isUp && index >= selectedCollectionPosts.length - 1) {
      return;
    }

    const selectedPost = selectedCollectionPosts[index];

    selectedCollectionPosts.splice(index, 1);

    if (isUp) selectedCollectionPosts.splice(index - 1, 0, selectedPost);
    if (!isUp) selectedCollectionPosts.splice(index + 1, 0, selectedPost);

    const newSelectedCollectionPosts = selectedCollectionPosts.concat([]);
    setPost(
      update(post, {
        postsIDs: { $set: newSelectedCollectionPosts.map((p) => p._id) },
      })
    );
  };

  const convertPostLinkDetail = () => {
    if (post && post.links) {
      return post.links.map((l) => {
        return {
          ...l,
          activity: l.activity?._id ? l.activity?._id : l.activity,
        };
      });
    }
    return [];
  };

  return (
    <Restricted>
      <DashboardLayout {...layoutProps}>
        <Grid
          container
          direction="column"
          className={classes.relative}
          spacing={3}
        >
          {(!post ||
            loading ||
            updateLoading ||
            removeLoading ||
            tagsLoading ||
            authorsLoading ||
            postsLoading ||
            imageLoading) && (
            <CircularProgress className={classes.loadingIndicator} />
          )}

          {post != null && (
            <>
              <Grid container item justify="space-between" wrap="nowrap">
                <Grid item xs={2}>
                  <Typography variant="overline">
                    Type: {getPostTypeAliases(post.type)}
                  </Typography>
                </Grid>

                <Grid container item xs={3} spacing={2} justify="flex-end">
                  {updateSuccess && (
                    <Grid item container xs={2}>
                      <CheckCircle className={classes.successIcon} />
                    </Grid>
                  )}

                  <Grid item>
                    <Button
                      className={classes.editorButton}
                      color="primary"
                      disabled={!formValid}
                      onClick={onSave}
                    >
                      Save
                    </Button>
                  </Grid>

                  <Grid item>
                    <Button
                      className={classes.editorButton}
                      color="secondary"
                      onClick={() => setDialogOpen(true)}
                    >
                      Remove
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
              {post.__typename === 'UserStory' && (
                <Grid container item xs={12} spacing={2} alignItems="center">
                  <Avatar
                    src={post.user?.picture}
                    style={{ width: 56, height: 56, marginRight: 10 }}
                  />
                  <Typography variant="overline">
                    {post.user?.fullname}
                  </Typography>
                </Grid>
              )}
              <Grid container item xs={12} spacing={2}>
                <Grid item xs={12} md={6}>
                  {post.type !== PostType.NOTIFICATION && (
                    <MediaUploadSection
                      media={post.media}
                      loading={imageLoading}
                      onChange={onMediaChange}
                      onClear={clearMedia}
                      onLoading={setImageLoading}
                      onError={setUploadError}
                    />
                  )}
                </Grid>
                {post.type !== PostType.USER_STORY && (
                  <Grid container item xs={12} md={6}>
                    <Grid container item xs={12} justifyContent="flex-end">
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={
                              post.public !== undefined ? post.public : false
                            }
                            onChange={() => onUpdatePublic()}
                            name="public"
                            color="primary"
                          />
                        }
                        label="Public"
                      />
                    </Grid>
                  </Grid>
                )}
              </Grid>

              <Grid container item xs={12} spacing={2}>
                {post.type !== PostType.USER_STORY && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      id="title"
                      label="Post Title"
                      value={post.title}
                      onChange={(e) => onChange(e, 'title')}
                      style={{ width: '100%' }}
                    />
                  </Grid>
                )}
                {post.type === PostType.HABIT && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      id="icon"
                      label="Emoji Icon"
                      value={post.icon}
                      style={{ width: '100%' }}
                      onClick={openPicker}
                    />
                    <Popover
                      open={Boolean(emojiAnchor)}
                      anchorEl={emojiAnchor}
                      onClose={closePicker}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                      }}
                    >
                      <Picker theme={'dark'} onSelect={selectEmoji} />
                    </Popover>
                  </Grid>
                )}

                {[PostType.ARTICLE, PostType.POST_COLLECTION].includes(
                  post.type
                ) && (
                  <Grid item xs={12} md={6}>
                    <FormControl style={{ width: '100%' }}>
                      <InputLabel id="authors-select-label">Author</InputLabel>
                      <Select
                        labelId="authors-select-label"
                        value={post.authorID}
                        onChange={(e) => onChange(e, 'authorID')}
                        input={<Input id="authors-select-input" />}
                        MenuProps={MenuProps}
                      >
                        {authorsData &&
                          authorsData.authors.map((author: User) => (
                            <MenuItem
                              key={'post-authors-' + author._id}
                              value={author._id}
                            >
                              <ListItemText primary={author.fullname} />
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}
              </Grid>

              <Grid container item xs={12} spacing={2}>
                {post.type !== PostType.USER_STORY && (
                  <Grid container item xs={12} md={6}>
                    <FormControl style={{ width: '100%' }}>
                      <InputLabel id="tags-select-label">Tags</InputLabel>
                      <Select
                        labelId="tags-select-label"
                        multiple
                        value={post.tags}
                        onChange={(e) => onChange(e, 'tags')}
                        input={<Input id="tags-select-input" />}
                        renderValue={renderTagChips}
                        MenuProps={MenuProps}
                      >
                        {tagsData &&
                          tagsData.tags.length > 0 &&
                          tagsData.tags.map((tag) => (
                            <MenuItem
                              key={'post-tags-' + tag._id}
                              value={tag._id}
                            >
                              <Checkbox
                                checked={post.tags.includes(tag._id)}
                                color="primary"
                              />
                              <ListItemText primary={tag.slug} />
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}
              </Grid>

              <Grid item>
                <Typography variant="overline">Post Body</Typography>

                <DefaultEditor
                  value={post.body || ''}
                  onChange={(e) => onChange(e, 'body')}
                  styles={editorStyles}
                />
              </Grid>

              {post.type === PostType.ARTICLE && (
                <PostLinkEntry
                  data={convertPostLinkDetail()}
                  nestedPosts={postsData?.nestedPosts}
                  selectablePosts={selectablePosts}
                  updatePostLink={updatePostLink}
                />
              )}

              {post.type === PostType.HABIT && (
                <Grid container item xs={12} spacing={2} direction="column">
                  <Grid item>
                    <Typography variant="overline">Notifications</Typography>
                    <Typography variant="subtitle2">
                      You can add multiple notifications for he habit fwith
                      different text and reccurence time
                    </Typography>
                  </Grid>

                  {post.reccurence?.map((notification, index) => (
                    <Grid item xs={12} key={'notification-' + index}>
                      <Card variant="outlined">
                        <CardContent>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                              <TextField
                                id="pushTitle"
                                label="Nofitication Title"
                                value={notification.pushTitle}
                                onChange={(e) =>
                                  onChange(e, `reccurence[${index}].pushTitle`)
                                }
                                style={{ width: '100%' }}
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <TextField
                                id="pushBody"
                                label="Nofitication Body"
                                value={notification.pushBody}
                                onChange={(e) =>
                                  onChange(e, `reccurence[${index}].pushBody`)
                                }
                                style={{ width: '100%' }}
                              />
                            </Grid>
                            <Grid item xs={12} md={4}>
                              <KeyboardTimePicker
                                label="Reccurence Time"
                                mask="__:__ _M"
                                value={getDate(notification)}
                                error={invalidDateIndexes[index]}
                                onChange={(e) => selectDate(e, index)}
                              />
                            </Grid>
                            <Grid item xs={12} md={4}>
                              <ToggleButtonGroup
                                value={notification.days}
                                onChange={(e, value) =>
                                  onChange(
                                    { ...e, target: { ...e.target, value } },
                                    `reccurence[${index}].days`
                                  )
                                }
                              >
                                <ToggleButton value={1}>M</ToggleButton>
                                <ToggleButton value={2}>T</ToggleButton>
                                <ToggleButton value={3}>W</ToggleButton>
                                <ToggleButton value={4}>T</ToggleButton>
                                <ToggleButton value={5}>F</ToggleButton>
                                <ToggleButton value={6}>S</ToggleButton>
                                <ToggleButton value={0}>S</ToggleButton>
                              </ToggleButtonGroup>
                            </Grid>
                            <Grid
                              container
                              item
                              xs={12}
                              md={4}
                              justifyContent="flex-end"
                              alignItems="center"
                            >
                              <Button
                                className={classes.editorButton}
                                color="primary"
                                variant="contained"
                                onClick={() => removeReccurence(index)}
                              >
                                Remove
                              </Button>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}

                  <Grid item xs={12}>
                    <Button
                      className={classes.editorButton}
                      color="primary"
                      onClick={addReccurence}
                    >
                      Add Notification
                    </Button>
                  </Grid>
                </Grid>
              )}

              {post.type === PostType.POST_COLLECTION && (
                <Grid container item spacing={2} xs={12} direction="column">
                  <Grid item>
                    <Typography variant="overline">Class sessions</Typography>
                    <Typography variant="subtitle2">
                      Note: While you can add paywalled sessions to a public
                      Class, they will not be acessible.
                    </Typography>
                  </Grid>

                  {selectedCollectionPosts?.map((p, index) => (
                    <Grid item key={p._id} xs={12} style={{ width: '100%' }}>
                      <Card variant="outlined">
                        <CardContent>
                          <Grid
                            container
                            item
                            spacing={1}
                            justifyContent="center"
                          >
                            <Grid item xs={9}>
                              <Typography variant="body1">
                                {getIconByType(p.type)} {p.title}
                              </Typography>
                            </Grid>
                            <Grid
                              item
                              xs={3}
                              container
                              justifyContent="flex-end"
                              alignItems="center"
                            >
                              <Button onClick={() => onOrder(index, true)}>
                                <ArrowUpward />
                              </Button>
                              <Button onClick={() => onOrder(index, false)}>
                                <ArrowDownward />
                              </Button>
                              <Button
                                color="secondary"
                                onClick={() => removeFromCollection(index)}
                              >
                                Remove
                              </Button>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                  <SelectLink
                    selectablePosts={selectablePosts}
                    addToCollection={addToCollection}
                    isButtonLabel={true}
                    textLabel={'Add Post to Class'}
                  />
                </Grid>
              )}

              {post.pushTitle && (
                <Grid item>
                  <TextField
                    id="pushTitle"
                    label="Nofitication Title"
                    value={post.pushTitle}
                    onChange={(e) => onChange(e, 'pushTitle')}
                    style={{ width: '100%' }}
                    disabled
                  />
                </Grid>
              )}

              {post.pushBody && (
                <Grid item>
                  <TextField
                    id="pushBody"
                    label="Nofitication Body"
                    value={post.pushBody}
                    onChange={(e) => onChange(e, 'pushBody')}
                    style={{ width: '100%' }}
                    disabled
                  />
                </Grid>
              )}
            </>
          )}
        </Grid>
      </DashboardLayout>

      <RemovePostDialog
        open={dialogOpen}
        loading={removeLoading}
        onHide={() => setDialogOpen(false)}
        onRemove={onRemove}
      />

      <Error open={!hideSnackbar} onClose={() => setHideSnackbar(true)}>
        {error ? error.message : ''}
        {tagsError ? tagsError.message : ''}
        {authorsError ? authorsError.message : ''}
        {postsError ? postsError.message : ''}
        {updateError ? updateError.message : ''}
        {removeError ? removeError.message : ''}
        {uploadError ? uploadError.message : ''}
        {removeErrorMessage ? removeErrorMessage.message : ''}
        {updateErrorMessage ? updateErrorMessage.message : ''}
      </Error>
    </Restricted>
  );
};

export default PostEditor;
