import PostList from '../../components/Post/List';
import { PostType } from '../../config/types';

const PostListPage: React.FC = () => {
  const query = {
    type: [ PostType.NOTIFICATION ]
  };

  return (
    <PostList
      query={ query }
      createButtons={[ 'notification' ]}
      title={ 'Notifications' }
    />
  );
};

export default PostListPage;
