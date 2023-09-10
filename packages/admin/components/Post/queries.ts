import { gql } from '@apollo/client';

export const POSTS_QUERY = gql`
  query getPosts($query: PostQuery, $limit: Int, $skip: Int, $sort: PostSort) {
    posts(query: $query, limit: $limit, skip: $skip, sort: $sort) {
      _id
      title
      public
      body
      type
      user{
        _id
        fullname
        blocked
      }
      ... on Article {
        views
        likes
        tags
        media {
          type
          src
          filename
          duration
          thumbSmall
          thumbLarge
        }
        links{
          title
          excerpt
          activity{
            _id
          }
        }        
      }
      ... on UserStory {
        views
        likes
        media {
          type
          src
          filename
          duration
          thumbSmall
          thumbLarge
        }
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

export const POSTS_COUNT = gql`
  query postCount($query: PostQuery) {
    countPosts(query: $query)
  }
`;

export const DELETE_POST = gql`
  mutation deletePost($_id: ObjectID!) {
    deletePost(_id: $_id) {
      success
      message
    }
  }
`;

export const NESTED_POSTS_QUERY = gql`
  query getNestedPosts {
    nestedPosts {
      _id
      title
      type
      public
    }
  }
`;

export const ORDER_POSTS_QUERY = gql`
  mutation reOrder($order: OrderInput) {
    reOrder(order: $order) {
      code
      message
    }
  }
`;
