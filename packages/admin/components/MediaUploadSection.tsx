import React, { useState, useRef, useEffect } from 'react';
import { DropzoneDialog } from 'material-ui-dropzone';
import { useApolloClient } from '@apollo/client';

import { Grid, Box, Button, Card, CardMedia, Snackbar, CircularProgress, Typography } from '@material-ui/core';

import { azureUpload } from '../helpers/azure';
import { videoUpload, processingStatus, ProcessingStatusResponse } from '../helpers/file';
import { PostMedia, PostMediaType } from '../config/types';

interface MediaUploadSectionProps {
  media: PostMedia[],
  loading?: boolean,
  acceptedFiles?:string[] ,
  onClear: () => void,
  onChange: (media: PostMedia) => void,
  onError: (error: Error) => void,
  onLoading: (loading: boolean) => void
}

const MediaUploadSection: React.FC<MediaUploadSectionProps> = function MediaUploadSection({ media, acceptedFiles, loading, onClear, onChange, onError, onLoading }) {
  const apolloClient = useApolloClient();
  const [imageOpen, setImageOpen] = useState<boolean>(false);
  const [processing, setProcessing] = useState<string | false>(false);
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [processingState, setProcessingState] = useState<ProcessingStatusResponse<number> | null>(null);

  const processingTimeout = useRef<ReturnType<typeof setTimeout>>();

  const onFileSave = async (files: File[]) => {
    try {
      setImageOpen(false);
      onLoading(true);

      const mediaType: PostMediaType = files[0].type.includes('image') ? PostMediaType.PICTURE : files[0].type.includes('video') ? PostMediaType.VIDEO : PostMediaType.AUDIO;

      const uploadResponse = mediaType === PostMediaType.VIDEO ? await videoUpload( files[0] ) : await azureUpload( apolloClient, files[0] );

      const media: PostMedia = {
        type: mediaType,
        ...uploadResponse
      };

      //  If uploading video, check for processing status
      if ( mediaType === PostMediaType.VIDEO && uploadResponse.filename ) {
        setProcessing(uploadResponse.filename);
        setProcessingProgress(0);
      }

      onChange( media );
    } catch (e) {
      onError(e);
      console.error(e);
    } finally {
      onLoading(false);
    }
  };

  const mediaExists = media && media.length > 0;

  const checkStatus = async (media?: PostMedia) => {
    try {
      const { mp4, webm } = await processingStatus( media ? media.filename : (processing as string) );

      const progress = ( mp4 + webm ) / 2;

      setProcessingProgress( progress as number );
      setProcessingState({ mp4, webm })

      if ( mp4 === 100 && webm === 100 ) {
        setProcessing(false);
      } else {
        if ( !processing ) {
          setProcessing( media.filename );
        }
        processingTimeout.current = setTimeout( checkStatus, 3500 );
      }

    } catch (e) {
      onError(e);
      console.error(JSON.stringify(e));
    }
  };

  useEffect(() => {
    if ( processing ) {
      processingTimeout.current = setTimeout( checkStatus, 3500 );
    } else {
      clearTimeout(processingTimeout.current);
    }

    return () => clearTimeout( processingTimeout.current );
  }, [processing]);

  useEffect(() => {
    if ( mediaExists && media[0].type === PostMediaType.VIDEO ) {
      checkStatus(media[0]);
    }
  }, []);

  return (<>
    <Grid container item spacing={2}>
      { mediaExists && media.map(({ type, src }, index) => (
        <Grid item key={'post-image-' + index} xs={3}>
          <Card style={{ minHeight: 200, height: 200 }}>
            { type === PostMediaType.PICTURE && <CardMedia image={src} style={{ width: '100%', height: '100%'}} /> }
            { type === PostMediaType.AUDIO && <CardMedia component="audio" src={src} style={{ width: '100%', height: '100%'}} controls /> }
            { type === PostMediaType.VIDEO && ( processing && processingState?.mp4 < 100 ) && <Box display="flex" alignItems="center" justifyContent="center" style={{ height: '100%' }}><CircularProgress /></Box> }
            { type === PostMediaType.VIDEO && ( !processing || processingState?.mp4 === 100 ) && <CardMedia component="video" src={src} style={{ width: '100%', height: '100%'}} preload="true" muted loop autoPlay={ true } /> }
          </Card>
        </Grid>
      ))}
    </Grid>

    <Grid container item spacing={2}>
      <Grid item>
        <Button color="primary" disabled={ loading } onClick={() => setImageOpen(true)}>
          { (media && media.length > 0) ? 'Change' : 'Add' } Media
        </Button>
      </Grid>

      { mediaExists &&
        <Grid item>
          <Button color="secondary" onClick={onClear}>
            Remove Media
          </Button>
        </Grid>
      }
    </Grid>

    <DropzoneDialog
      acceptedFiles={acceptedFiles?acceptedFiles:['image/*', 'video/mp4', 'audio/mpeg']}
      cancelButtonText={'cancel'}
      submitButtonText={'submit'}
      filesLimit={1}
      maxFileSize={512000000}
      open={ imageOpen }
      onClose={() => setImageOpen(false)}
      onSave={ onFileSave }
      showPreviews={ true }
    />

    {/* Processing Progress */}
    <Snackbar
      open={ !!processing }
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      message={
        <Box display="flex" alignItems="center">
          <CircularProgress
            variant="determinate"
            value={ processingProgress }
            style={{ marginRight: 12 }}
          />
          <Grid container direction="column">
            <Grid item>
              <Typography>
                Video is processing. Progress: { Math.round(processingProgress) }%
              </Typography>
            </Grid>
            { processingState?.mp4 === 100 &&
              <Grid item>
                <Typography variant="caption">
                  Main video file is ready. Waiting for webm super-optimized video to be completed
                </Typography>
              </Grid>
            }
            { processingState?.mp4 < 100 &&
              <Grid item>
                <Typography variant="caption">
                  You can save immediately. The video will continue processing in the background
                </Typography>
              </Grid>
            }
          </Grid>
        </Box>
      }
    />

  </>);
};

export default MediaUploadSection;
