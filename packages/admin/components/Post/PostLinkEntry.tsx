import { useState, useEffect, useRef } from 'react';
import useEditorStyles from '../../styles/editor.styles';
import {
  Grid,
  TextField,
  CircularProgress,
  Typography,
  Button,
  Card,
  CardContent,
} from '@material-ui/core';
import { ErrorMessage, Post, PostLink } from '../../config/types';
import { ArrowDownward, ArrowUpward } from '@material-ui/icons';
import SelectLink from './SelectLink';
import update from 'immutability-helper';
import { getIconByType } from './config';
import Error from '../../components/Error';

type PostLinkEntryProps = {
  data: PostLink[];
  selectablePosts: Partial<Post>[];
  nestedPosts:Post[];
  updatePostLink:(post:PostLink[]) => void;
};

const PostLinkEntry: React.FC<PostLinkEntryProps> = function PostLinkEntry({
  data,
  selectablePosts,
  nestedPosts,
  updatePostLink,
}) {

  const addPostLinkRef = useRef(null);
  const postLinkButtonRef = useRef(null);

  const classes = useEditorStyles();

  const [links, setLinks] = useState<PostLink[]>(data);
  const [link, setLink] = useState<PostLink | null>(null);
  const [isAdd, setIsAdd] = useState(false);
  const [editPos, setEditPos] = useState(-1);
  const [editError, setEditError] = useState<ErrorMessage|null>(null);
  const [hideSnackbar, setHideSnackbar] = useState<boolean>(true);

  const [selectablePostLinks, setSelectablePostLinks] = useState<Partial<Post>[]>(selectablePosts);

  // const convertDetailLinkToLink = (data) => {
  //   const extractLinks:PostLink[] = data.map( function(d) {
  //     return {
  //       ...d,
  //       activity:d.activity?._id||d.activity,
  //     };
  //   });
  //   setLinks(extractLinks);
  // };

  const removeFromPostLink = (index: number) => {
    links.splice(index,1);
    const newLinks = links.concat([]);
    setLinks(newLinks);
    updatePostLink(newLinks);
  };
  const editFromPostLink = (index: number) => {
    const link: PostLink = links[index];
    setLink(link);
    setEditPos(index);
    setIsAdd(true);
  };

  const addToActivity = (post: Partial<Post>) => {
    if( post ){
      setLink(update(link, { 'activity': { $set: post._id } }));
    }
  };

  const makeErrorMessage = () => {
    const errorMessage = (
      <div>
        {!link?.title.trim().length?<div>Post link title is required</div>:<></>}
        {!link?.activity?<div>Post link is required</div>:<></>}
      </div>
    );
    return errorMessage;
  };

  const formValid = link?.title.trim().length && link?.activity;

  const onSave = () => {
    if( !formValid ) {
      setHideSnackbar(false);      
      setEditError({message:makeErrorMessage()});
      return;
    }
    goToPostLinkButton();    

    setEditError(null);
    setHideSnackbar(true);
    if (editPos !== -1) {
      links.splice(editPos, 1);
      links.splice(editPos, 0, link);
    } else {
      links.splice(links.length, 0, link );
    }

    setEditPos(-1);
    setIsAdd(false);
    
    const linkIds = links.map(l => l.activity );

    setSelectablePostLinks( selectablePostLinks?.filter(sp=> !linkIds.includes(sp._id) ));
    setLinks(links);
    updatePostLink(links);
  };

  const onChange = (
    e: React.ChangeEvent<
      | HTMLTextAreaElement
      | HTMLInputElement
      | { name?: string; value?: unknown }
    >,
    key: string
  ) => {
    setLink(update(link, { [key]: { $set: e.target.value } }));
  };

  const onAddLink = () => {
    setLink({
      title: '',
      excerpt: '',
    });
    setIsAdd(true);
  };

  const onOrder = (index:number, isUp: boolean) => {
    if (isUp && index <= 0) {
      return;
    }
    if (!isUp && index >= length - 1) {
      return;
    }
    const link = links[index];

    links.splice(index, 1);
    
    if (isUp) links.splice(index - 1, 0, link);
    if (!isUp) links.splice(index+1, 0, link);

    setLinks(links.concat([]));
  };

  const getPostById = (_id: string|undefined ) => {
    if( !_id || !nestedPosts ) {
      return null;
    }

    const posts = nestedPosts?.filter(np => np._id === _id );
    if( posts && posts.length ) {
      return posts[0]; 
    }
    return null;
  };

  const executeScroll = () => addPostLinkRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const goToPostLinkButton = () => postLinkButtonRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });

  let linkIds = links.map(l => l.activity );
  if( editPos != -1 ) {
    linkIds = linkIds.filter( lId=> lId != link.activity );
  }
  const newSelectablePosts = selectablePosts?.filter(sp=> !linkIds.includes(sp._id) );

  // useEffect(()=>{
  //   if( data ) {
  //     convertDetailLinkToLink(data);
  //   }
  // },[data]);

  useEffect(()=> {
    if( isAdd )
      executeScroll();
  },[isAdd]);

  return (
    <Grid container item spacing={2} xs={12} direction="column">
      {!links && <CircularProgress className={classes.loadingIndicator} />}
      <Grid item>
        <Typography variant="overline">Linked Post</Typography>
        <Typography variant="subtitle2">
          Note: While you can add paywalled sessions to a public Class, they
          will not be acessible.
        </Typography>
      </Grid>

      {links?.map( function (lk, index){
        const nestedPost = getPostById(lk.activity);
        return(
          <Grid item key={`postLink_${index}`} xs={12} style={{ width: '100%' }}>
            <Card variant="outlined">
              <CardContent>
                <Grid
                  container
                  item
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Grid item xs={9}>
                    <Typography variant="body1">{lk.title || ''}</Typography>
                    <Typography variant="body1">{lk.excerpt || ''}</Typography>
                    <Typography variant='body1'>{getIconByType(nestedPost?.type)} {nestedPost?.title || ''}</Typography>
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
                      onClick={() => editFromPostLink(index)}
                    >
                    Edit
                    </Button>
                    <Button
                      color="secondary"
                      onClick={() => removeFromPostLink(index)}
                    >
                    Remove
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid> );          
      })}
      <Grid item ref = {postLinkButtonRef}>
        <Button color="primary" onClick={() => onAddLink()}>
          Add post
        </Button>
      </Grid>
      {isAdd && (
        <Grid item container xs={12} spacing={2} ref = {addPostLinkRef}>
          <Grid item xs={2}>
            <TextField
              id="title"
              label="Title Alias"
              value={link?.title}
              onChange={(e) => onChange(e, 'title')}
              style={{ width: '100%' }}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              id="excerpt"
              label="Excerpt"
              value={link?.excerpt}
              onChange={(e) => onChange(e, 'excerpt')}
              style={{ width: '100%' }}
            />
          </Grid>
          <Grid item xs={4}>
            <SelectLink
              currentPostId={link.activity}
              selectablePosts={newSelectablePosts}
              addToCollection={addToActivity}
              isButtonLabel={false}
              textLabel={'Add Post to Session'}
            />
          </Grid>
          <Grid container item xs={2} justifyContent="flex-end">
            <Button color="primary" onClick={() => onSave()}>
              Save
            </Button>
            <Button color="secondary" onClick={() => setIsAdd(false)}>
              Cancel
            </Button>
          </Grid>
        </Grid>
      )}
      <Error open={!hideSnackbar} onClose={() => setHideSnackbar(true)}>
        {editError ? editError.message : ''}
      </Error>
    </Grid>
  );
};

export default PostLinkEntry;
