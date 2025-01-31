import { isAddress } from 'ethers/lib/utils';
import { ComputeConfig, Dictionary } from '../types';
import { fetcher } from '../utils';

export async function getAllGitcoinData() {
  const data = (await fetcher(
    'GET',
    'https://theconvo.space/gitcoindata.json'
  )) as Dictionary<string>;

  const addDb = [];
  for (let index = 0; index < data['addresses'].length; index++) {
    if (isAddress(data['addresses'][index][0]) === true) {
      addDb.push(data['addresses'][index][0]);
    }
  }

  return addDb;
}

interface GitcoinResult {
  success: boolean;
  error: string;
}

export async function getGitcoinData(
  address: string,
  computeConfig: ComputeConfig
) {
  if (Boolean(computeConfig?.CNVSEC_ID) === false) {
    throw new Error(
      'getAllGitcoinData: computeConfig does not contain CNVSEC_ID'
    );
  }
  const json = (await fetcher(
    'GET',
    `https://cnvsec.vercel.app/api/omnid/gitcoin?id=${computeConfig.CNVSEC_ID}&address=${address}`
  )) as GitcoinResult;
  return {
    funder: Boolean(json.success) === false ? false : true,
  };
}
