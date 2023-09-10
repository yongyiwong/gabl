import { gql } from '@apollo/client';

export const TAGS_QUERY = gql`
  query getTags($query: TagQuery, $limit: Int, $skip: Int, $sort: TagSort) {
    tags(query: $query, limit: $limit, skip: $skip, sort: $sort) {
      _id
      slug
      displayName
    }
  }
`;

export const BLOCK_USER = gql`
  mutation blockUser($_id: ObjectID!) {
    updateUser(_id: $_id, update: { blocked: true }) {
      success
      message
    }
  }
`;

export const UNBLOCK_USER = gql`
  mutation unblockUser($_id: ObjectID!) {
    updateUser(_id: $_id, update: { blocked: false }) {
      success
      message
    }
  }
`;

export const AUTHORS_QUERY = gql`
  query getAuthors {
    authors {
      _id
      fullname
    }
  }
`;
