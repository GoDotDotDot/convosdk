import { ComputeConfig } from '../types';
import { fetcher } from '../utils';

interface RaribleResult {
  ownership: {
    priceEth: number;
    status: string;
  };
}

interface ProfileResult {
  followings: number;
  followers: number;
  blacklisted: boolean;
  shortUrl: string;
}

export default async function getRaribleData(
  address: string,
  computeConfig: ComputeConfig
) {
  if (Boolean(computeConfig?.etherumPriceInUsd) === false) {
    throw new Error(
      'getRaribleData: computeConfig does not contain etherumPriceInUsd'
    );
  }
  const promiseArray = [
    fetcher(
      'POST',
      'https://api-mainnet.rarible.com/marketplace/api/v4/items',
      '',
      {
        filter: {
          '@type': 'by_creator',
          creator: address,
        },
      }
    ),
    fetcher(
      'GET',
      `https://api-mainnet.rarible.com/marketplace/api/v4/profiles/${address}/meta`
    ),
  ];

  const resp = await Promise.allSettled(promiseArray);

  let artworks: Array<RaribleResult> = [];
  if (resp[0].status === 'fulfilled') {
    const tempRes = resp[0] as PromiseFulfilledResult<Array<RaribleResult>>;
    artworks = tempRes.value;
  }

  let metadata: ProfileResult = {
    followings: 0,
    followers: 0,
    blacklisted: false,
    shortUrl: '',
  };
  if (resp[1].status === 'fulfilled') {
    const tempRes = resp[1] as PromiseFulfilledResult<ProfileResult>;
    metadata = tempRes.value;
  }

  let totalCountSold = artworks.length;

  let totalAmountSold = 0;
  for (let index = 0; index < artworks.length; index++) {
    if (artworks[index]['ownership']?.status === 'FIXED_PRICE') {
      totalAmountSold +=
        artworks[index]['ownership']['priceEth'] *
        computeConfig.etherumPriceInUsd;
    } else {
      totalCountSold -= 1;
    }
  }

  return {
    totalCountSold,
    totalAmountSold,
    ...metadata,
  };
}
