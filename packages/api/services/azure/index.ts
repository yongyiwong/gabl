// An HTTP trigger Azure Function that returns a SAS token for Azure Storage for the specified container.
// You can also optionally specify a particular blob name and access permissions.
// To learn more, see https://github.com/Azure-Samples/functions-dotnet-sas-token/blob/master/README.md
import { DateTime } from 'luxon';
import {
  generateBlobSASQueryParameters,
  ContainerSASPermissions,
  SASProtocol,
  StorageSharedKeyCredential,
} from '@azure/storage-blob';
import { gql } from 'apollo-server-express';

const sharedKeyCredential = new StorageSharedKeyCredential(
  process.env.STORAGE_ACCOUNT_NAME,
  process.env.STORAGE_KEY
);

function getSASForBlob({ blobName, contentType }) {
  const startsOn = DateTime.now().minus({ minutes: 15 }).toJSDate();
  const expiresOn = DateTime.now().plus({ minutes: 15 }).toJSDate();

  const sas = generateBlobSASQueryParameters(
    {
      blobName, // Required
      contentType,
      containerName: process.env.UPLOADS_CONTAINER, // Required
      permissions: ContainerSASPermissions.parse('w'), // Required
      startsOn, // Required
      expiresOn, // Optional. Date type
      protocol: SASProtocol.Https, // Optional
    },
    sharedKeyCredential // StorageSharedKeyCredential - `new StorageSharedKeyCredential(account, accountKey)`
  ).toString();

  return { sas };
}

const azureResolver = {
  Query: {
    getSAS(parent, args) {
      return getSASForBlob(args);
    },
  },
};

export { getSASForBlob, azureResolver };
