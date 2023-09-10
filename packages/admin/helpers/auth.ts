import { gql } from '@apollo/client';

export const ME_QUERY = gql`
  query currentUser {
    me {
      _id
      role
      fullname
      username
      picture {
        filename
      }
    }
  }
`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handleAuthError = (push) => (error) => {
  console.log(error);
};
