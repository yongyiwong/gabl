import PostList from '../../components/Post/List';
import { PostType } from '../../config/types';

const PostListPage: React.FC = () => {
  const query = {
    type: [ PostType.ARTICLE ]
  };

  return (
    <PostList
      query={ query }
      createButtons={[ 'session' ]}
      title={ 'Sessions' }
    />
  );
};

export default PostListPage;
