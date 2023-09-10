// An HTTP trigger Azure Function that returns a SAS token for Azure Storage for the specified container.
// You can also optionally specify a particular blob name and access permissions.
// To learn more, see https://github.com/Azure-Samples/functions-dotnet-sas-token/blob/master/README.md
const { generateBlobSASQueryParameters, ContainerSASPermissions, SASProtocol, StorageSharedKeyCredential, BlobServiceClient } = require('@azure/storage-blob');

const isEmpty = require('lodash/isEmpty');

const getAzureAbsoluteURL = ( url = '' ) => {
  return `https://${ process.env.STORAGE_ACCOUNT_NAME }.blob.core.windows.net${ !isEmpty(url) ? `/uploads/${ url }` : '' }`;
};

const getCDNURL = ( url = '' ) => {
  return `${ process.env.CDN_URL }${ !isEmpty(url) ? `/uploads/${ url }` : '' }`;
}

const sharedKeyCredential = new StorageSharedKeyCredential( process.env.STORAGE_ACCOUNT_NAME, process.env.STORAGE_KEY );
const blobService = new BlobServiceClient(
  getAzureAbsoluteURL(),
  sharedKeyCredential
);

const containerClient = blobService.getContainerClient( process.env.UPLOADS_CONTAINER );

function getSASForBlob( { blobName, contentType } ) {
  const startsOn = new Date();

  const sas = generateBlobSASQueryParameters({
    blobName, // Required
    contentType,
    containerName: process.env.UPLOADS_CONTAINER, // Required
    permissions: ContainerSASPermissions.parse('w'), // Required
    startsOn, // Required
    expiresOn: new Date(startsOn.valueOf() + 60000), // Optional. Date type
    protocol: SASProtocol.Https, // Optional

  },
  sharedKeyCredential // StorageSharedKeyCredential - `new StorageSharedKeyCredential(account, accountKey)`
  ).toString();

  return { sas };
}

async function uploadBlob({ filename, filePath, contentType }) {
  //  Construct blob name from userid, putting each user's upload into it's own folder
  const { blobName, url } = getUploadBlobURL({ filename });
  //  Blob client... for some reason
  const blobClient = containerClient.getBlockBlobClient(blobName);
  //  Upload this stream and get a response
  const response = await blobClient.uploadFile( filePath, { blobHTTPHeaders: { blobContentType: contentType } });

  return { response, url };
}

function getUploadBlobURL({ filename }) {
  //  Construct blob name from userid, putting each user's upload into it's own folder
  const blobName = `${ filename }`;
  const url = getAzureAbsoluteURL( blobName );
  const cdn = getCDNURL( blobName );

  return { blobName, url, cdn };
}

module.exports = {
  getSASForBlob,
  uploadBlob,
  getAzureAbsoluteURL,
  getCDNURL,
  getUploadBlobURL,
};
