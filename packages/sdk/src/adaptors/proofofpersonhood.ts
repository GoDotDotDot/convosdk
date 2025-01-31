import { Dictionary } from '../types';
import { fetcher, gqlFetcher } from '../utils';

interface PoppQueryResult {
  data: {
    passports: Array<{
      id: string;
      tokenURI: string;
    }>;
  };
}

interface PoppResult {
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}

export default async function getPopData(address: string) {
  try {
    const response = (await gqlFetcher(
      'https://api.thegraph.com/subgraphs/id/QmewtAtJJsTDAeT8apSXtK3mi4PaHFqMwz1JjqinrVozPg',
      `{
        passports(where: {id: "${address.toLowerCase()}"}) {
          id
          tokenURI
        }
      }`
    )) as PoppQueryResult;

    if (response['data']['passports'].length > 0) {
      const passData = (await fetcher(
        'GET',
        response['data']['passports'][0].tokenURI
      )) as PoppResult;

      // eslint-disable-next-line prefer-const
      let retResp = {} as Dictionary<number>;
      for (let index = 0; index < passData.attributes.length; index++) {
        const attr = passData.attributes[index];
        retResp[attr.trait_type] = parseFloat(attr.value);
      }
      return retResp;
    } else {
      return {};
    }
  } catch (error) {
    return {};
  }
}
