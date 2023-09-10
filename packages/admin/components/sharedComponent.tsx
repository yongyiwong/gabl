import { PostMedia, PostMediaType } from '../config/types';
import { VolumeUp, Warning } from '@material-ui/icons';
import Image from 'material-ui-image';

export const PostMediaThumb: React.FC<PostMedia> = function PostMedia({ type, src, thumbSmall }) {
  switch(type){
  case PostMediaType.PICTURE:
    return <Image src={src} aspectRatio={1} style={{ objectFit: 'cover', width: '100%', background: 'transparent' }} />;
  case PostMediaType.VIDEO:
    return <Image src={thumbSmall} aspectRatio={1} style={{ objectFit: 'cover', width: '100%', background: 'transparent' }} />;
  case PostMediaType.AUDIO:
    return <VolumeUp fontSize={'large'} />;
  default:            
    return <Warning fontSize={'large'} />;
  }
};
