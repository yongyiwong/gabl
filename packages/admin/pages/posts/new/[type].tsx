import React, { useEffect, useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { DefaultEditor } from 'react-simple-wysiwyg';
import update from 'immutability-helper';
import omit from 'lodash-es/omit';
import some from 'lodash-es/some';
import isEmpty from 'lodash-es/isEmpty';
import 'emoji-mart/css/emoji-mart.css';
import { Picker } from 'emoji-mart';
import { KeyboardTimePicker } from '@material-ui/pickers';
import { DateTime } from 'luxon';
import { unflatten } from 'flatulence';

import {
  Grid,
  TextField,
  CircularProgress,
  InputLabel,
  Input,
  Select,
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
  Popover,
} from '@material-ui/core';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';

import DashboardLayout from '../../../components/DashboardLayout';
import Restricted from '../../../components/RestrictedRoute';
import Error from '../../../components/Error';
import MediaUploadSection from '../../../components/MediaUploadSection';

import {
  Post,
  PostLink,
  PostMedia,
  PostType,
  User,
  HabitReccurence,
} from '../../../config/types';
import { AUTHORS_QUERY, TAGS_QUERY } from '../../../config/queries';
import useEditorStyles, { editorStyles } from '../../../styles/editor.styles';
import {
  checkPostTypeAlias,
  goBackLink,
  PostCreateType,
} from '../../../components/Post/config';
import { NESTED_POSTS_QUERY } from '../../../components/Post/queries';
import SelectLink from '../../../components/Post/SelectLink';
import PostLinkEntry from '../../../components/Post/PostLinkEntry';

const POST_CREATE = gql`
  mutation createPost($post: CreatePostInput!) {
    createPost(post: $post) {
      success
      message
      post {
        _id
      }
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

function createEmptyPost() {
  const post: Post = {
    title: '',
    body: '',
    tags: [] as Array<string>,
    authorID: '',
    type: PostType.ARTICLE,
    postsIDs: [],
  };

  return post;
}

const PostEditorCreate: React.FC = function PostsEditorCreate() {
  const classes = useEditorStyles();

  const [hideSnackbar, setHideSnackbar] = useState<boolean>(true);
  const [notify, setNotify] = useState<boolean>(false);
  const [imageLoading, setImageLoading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<{ message?: string } | null>(
    null
  );
  const [emojiAnchor, setEmojiAnchor] = useState<HTMLInputElement | null>(null);

  const {
    query: { type },
    replace,
  } = useRouter();

  const [post, setPost] = useState<Post>(createEmptyPost());

  const {
    data: tagsData,
    error: tagsError,
    loading: tagsLoading,
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

  const openPicker = (event: React.MouseEvent<HTMLInputElement>) => {
    setEmojiAnchor(event.currentTarget);
  };

  const closePicker = () => {
    setEmojiAnchor(null);
  };

  const selectDate = (date: DateTime, index: number) => {
    setPost(update(post, {
      reccurence: {
        [index]: {
          $merge: {
            hour: date == null || date.invalid ? null : date.hour,
            minute: date == null || date.invalid ? null : date.minute
          }
        }
      }
    }));
  };

  const getDate = (notification: HabitReccurence) => {
    if ( isNaN(notification.hour) || isNaN(notification.minute) ) {
      return null;
    }
    return DateTime.fromObject({ hour: notification.hour, minute: notification.minute });
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

  const onMediaChange = (media: PostMedia) => {
    setPost(update(post, { media: { $set: [media] } }));
  };

  const clearMedia = () => {
    setPost(update(post, { media: { $set: [] } }));
  };

  const onCreate = ({
    createPost: {
      post: { _id },
    },
  }) => {
    replace(`/posts/${_id}`);
  };
  const [createPost, { error: createError, loading: createLoading }] =
    useMutation(POST_CREATE, {
      errorPolicy: 'all',
      onError: () => null,
      onCompleted: onCreate,
    });

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
    const author = post.authorID || null;
    const posts = post.postsIDs || [];

    createPost({
      variables: {
        post: {
          ...omit(post, ['authorID', 'postsIDs']),

          author,
          posts,

          type: PostCreateType[type as string],
        },
      },
    });
  };

  const onUpdatePublic = () => {
    setPost(update(post, { public: { $set: !post.public } }));
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
          label={tag.slug}
          className={classes.tagChip}
          color="primary"
        />
      );
    });

    return <div className={classes.tagChipsContainer}>{chips}</div>;
  };

  useEffect(() => {
    if (tagsError || authorsError || postsError || createError || uploadError) {
      setHideSnackbar(false);
    }
  }, [tagsError, authorsError, createError, postsError, uploadError]);

  useEffect(() => {
    if (type === 'notification') {
      setNotify(true);
    }
  }, []);

  const layoutProps = {
    title: 'Post Editor',
  };

  const invalidDateIndexes =
    post?.reccurence?.map( r => r.hour == null || r.minute == null );

  const formValid = post &&
      post.body.replace('<br>', '').trim().length > 0 &&
      ( !checkPostTypeAlias(type as string, [PostType.HABIT]) || (
        !isEmpty(post.reccurence) &&
        !some(invalidDateIndexes, i => i === true)
      ) );

  const updatePostLink = (links: PostLink[]) => {
    setPost(update(post, { links: { $set: links } }));
  };

  const selectedCollectionPosts =
    post?.postsIDs &&
    postsData?.nestedPosts?.filter((p) => post.postsIDs.includes(p._id));
  const selectablePosts = post?.postsIDs
    ? postsData?.nestedPosts?.filter((p) => !post.postsIDs.includes(p._id))
    : postsData?.nestedPosts;

  const convertDetailToLink = () => {
    return post.links?.map((lk) =>
      lk.activity?._id ? lk.activity?._id : lk.activity
    );
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
            createLoading ||
            tagsLoading ||
            authorsLoading ||
            postsLoading ||
            imageLoading) && (
            <CircularProgress className={classes.loadingIndicator} />
          )}

          {post != null && (
            <>
              <Grid container item justify="space-between" wrap="nowrap">
                <Grid item>
                  <Typography variant="overline">Type: {type}</Typography>
                </Grid>

                <Grid item>
                  <Button
                    className={classes.editorButton}
                    color="primary"
                    onClick={onSave}
                    disabled={!formValid}
                  >
                    Save
                  </Button>
                  <Link href={goBackLink(PostCreateType[type as string])}>
                    <Button className={classes.editorButton} color="secondary">
                      Cancel
                    </Button>
                  </Link>
                </Grid>
              </Grid>
              {PostCreateType[type as string] !==
                PostCreateType['user post'] && (
                <Grid item>
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
              )}

              {!checkPostTypeAlias(type as string, [PostType.NOTIFICATION]) && (
                <MediaUploadSection
                  media={post.media}
                  loading={imageLoading}
                  onChange={onMediaChange}
                  onClear={clearMedia}
                  onLoading={setImageLoading}
                  onError={setUploadError}
                />
              )}
              <Grid container item xs={12} spacing={2}>
                {PostCreateType[type as string] !==
                PostCreateType['user post'] && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      id="title"
                      label="Post Title"
                      value={post.title}
                      onChange={(e) => onChange(e, 'title')}
                      style={{ width: '100%' }}
                    />
                  </Grid>
                )
                }
                {checkPostTypeAlias(type as string, [PostType.HABIT]) && (
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

                {checkPostTypeAlias(type as string, [
                  PostType.ARTICLE,
                  PostType.POST_COLLECTION,
                ]) && (
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
                <Grid item xs={12} md={6}>
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
              </Grid>

              <Grid item>
                <Typography variant="overline">Post Body</Typography>

                <DefaultEditor
                  value={post.body || ''}
                  onChange={(e) => onChange(e, 'body')}
                  styles={editorStyles}
                />
              </Grid>

              {checkPostTypeAlias(type as string, [PostType.ARTICLE]) && (
                <PostLinkEntry
                  data={convertDetailToLink() || []}
                  nestedPosts={postsData?.nestedPosts}
                  selectablePosts={selectablePosts}
                  updatePostLink={updatePostLink}
                />
              )}

              {checkPostTypeAlias(type as string, [PostType.HABIT]) && (
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

              {checkPostTypeAlias(type as string, [
                PostType.POST_COLLECTION,
              ]) && (
                <Grid container item spacing={2} direction="column">
                  <Grid item>
                    <Typography variant="overline">Class sessions</Typography>
                    <Typography variant="subtitle2">
                      Note: While you can add paywalled sessions to a public
                      Class, they will not be acessible.
                    </Typography>
                  </Grid>

                  {selectedCollectionPosts?.map((p, index) => (
                    <Grid item key={p._id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Grid
                            container
                            item
                            spacing={1}
                            justifyContent="center"
                          >
                            <Grid item xs={11}>
                              <Typography variant="body1">{p.title}</Typography>
                            </Grid>
                            <Grid
                              item
                              xs={1}
                              justifyContent="center"
                              alignItems="center"
                            >
                              <Button
                                className={classes.editorButton}
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
              <Grid item>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={notify}
                      onChange={() => setNotify(!notify)}
                      name="notify"
                      color="primary"
                    />
                  }
                  label="Push a notification to all users when post is created"
                />
              </Grid>

              {notify && (
                <>
                  <Grid item>
                    <TextField
                      id="pushTitle"
                      label="Nofitication Title"
                      value={post.pushTitle}
                      onChange={(e) => onChange(e, 'pushTitle')}
                      style={{ width: '100%' }}
                    />
                  </Grid>

                  <Grid item>
                    <TextField
                      id="pushBody"
                      label="Nofitication Body"
                      value={post.pushBody}
                      onChange={(e) => onChange(e, 'pushBody')}
                      style={{ width: '100%' }}
                      multiline={true}
                    />
                  </Grid>
                </>
              )}
            </>
          )}
        </Grid>
      </DashboardLayout>

      <Error open={!hideSnackbar} onClose={() => setHideSnackbar(true)}>
        {tagsError ? tagsError.message : ''}
        {authorsError ? authorsError.message : ''}
        {postsError ? postsError.message : ''}
        {createError ? createError.message : ''}
        {uploadError ? uploadError.message : ''}
      </Error>
    </Restricted>
  );
};

export default PostEditorCreate;
