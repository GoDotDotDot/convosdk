import { Dictionary } from '../types';
import { gqlFetcher } from '../utils';

export default async function addressToEns(address: string) {
  const resp = (await gqlFetcher(
    'https://api.thegraph.com/subgraphs/name/ensdomains/ens',
    `
    {
        domains (where: {resolvedAddress: "${address.toLowerCase()}"}){
            name
        }
    }
    `
  )) as Dictionary<Dictionary<Array<Dictionary<string>>>>;

  if (Boolean(resp.data) === true && resp.data?.domains.length === 0) {
    return false;
  } else {
    let finalDomain: boolean | string = false;
    for (let index = 0; index < resp['data']['domains'].length; index++) {
      const domain = resp['data']['domains'][index];
      if (domain.name.split('.').length == 2) {
        finalDomain = domain.name;
      }
    }
    return finalDomain;
  }
}
