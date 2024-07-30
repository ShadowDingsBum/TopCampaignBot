import {
  getUbiToken,
  getNadeoToken,
  getOAuthToken,
  enumerateCountryZones,
  getLatestCampaign,
  getPlayers
} from './api.mjs';

import { delay } from './timeUtils.mjs';

//Insert exact country name
const country = '';

export async function getRecords() {
  try {
    //Tokens
    const ubiToken = await getUbiToken();
    const nadeoLiveToken = await getNadeoToken(ubiToken, 'NadeoLiveServices');
    const nadeoCoreToken = await getNadeoToken(ubiToken, 'NadeoServices');
    const oauthToken = await getOAuthToken();

    //Zones and campaign
    const zones = await enumerateCountryZones(country, nadeoCoreToken);
    const latestCampaign = await getLatestCampaign(nadeoLiveToken);

    if (latestCampaign === null) {
      console.error('Failed to retrieve the latest campaign.');
      return;
    }

    const maps = latestCampaign.playlist;
    const results = [];

    //Iterate over each map
    for (let i = 0; i < maps.length; i++) {
      //Fetch players for the current map
      const result = await getPlayers(nadeoLiveToken, maps[i], zones, oauthToken);
      if (result) {
        results.push(result); //Add to the results array
      }
      await delay(500); //2 requests per second
    }

    //console.log('Player results:', results); //In case you want to see the results
    return results;

  } catch (error) {
    console.error('An error occurred:', error);
  }
}
