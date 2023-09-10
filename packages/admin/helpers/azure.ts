import { BlobServiceClient } from '@azure/storage-blob';
import uid from 'uid-safe';

import { ApolloClient, gql } from '@apollo/client';
import { FileUploadResponse } from '../config/types';

const GET_SAS = gql`
  query getSAS($blobName: String!, $contentType: String!) {
    getSAS(blobName: $blobName, contentType: $contentType) {
      sas
    }
  }
`;

export function getUploadsURL( filename: string ): string {
  return `${ process.env.STORAGE_URL }/${ process.env.UPLOADS_CONTAINER }/${ filename }`;
}

export function getCDNURL( filename: string ): string {
  return `${ process.env.CDN_URL }/${ process.env.UPLOADS_CONTAINER }/${ filename }`;
}

const filenameRegex = /(?<name>.*)(?<extension>\..*$)/;

export async function azureUpload( apolloClient: ApolloClient<object>, file: File ): Promise<FileUploadResponse> {
  //  Wow, Microsoft!
  //  Was all of this really necessary or can I upload file via PUT/POST
  //  request like any sane rational person would do?
  const fileName = filenameRegex.exec( file.name );

  const date = new Date().toISOString();

  const blobName = `${ date }_${ uid.sync(18) }${ fileName.groups.extension }`;
  const { data: { getSAS: { sas } }, error } = await apolloClient.query( { query: GET_SAS, variables: { blobName, contentType: file.type } } );

  if ( error ) {
    throw 'Error generating access signature';
  }

  const blobServiceClient = new BlobServiceClient( process.env.STORAGE_URL + `?${ sas }` );
  const containerClient = blobServiceClient.getContainerClient( process.env.UPLOADS_CONTAINER );
  const blockBlobClient = containerClient.getBlockBlobClient( blobName );

  const response = await blockBlobClient.uploadBrowserData( file, { blobHTTPHeaders: { blobContentType: file.type } } );

  if ( response._response.status >= 200 && response._response.status < 400 ) {
    return { src: getCDNURL( blobName ) };
  } else {
    throw 'Unknown server error';
  }
}
