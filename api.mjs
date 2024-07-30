import fetch from 'node-fetch';
import { URLSearchParams } from 'url';
import { config } from './config.mjs';


//Authentications
export async function getUbiToken() {
	const response = await fetch('https://public-ubiservices.ubi.com/v3/profiles/sessions', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Ubi-AppId': config.ubiAppId,
			'Authorization': 'Basic ' + Buffer.from(`${config.userEmail}:${config.userPassword}`).toString('base64'),
			'User-Agent': config.userAgent
		}
	});

	if (!response.ok) {
		console.error(`Error fetching Ubi token: ${response.status} ${response.statusText}`);
		console.error(await response.text());
		throw new Error('Failed to get Ubi token');
	}

	const data = await response.json();
	return data.ticket;
}

export async function getNadeoToken(ubiToken, audience) {
	const response = await fetch('https://prod.trackmania.core.nadeo.online/v2/authentication/token/ubiservices', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `ubi_v1 t=${ubiToken}`
		},
		body: JSON.stringify({ audience })
	});

	if (!response.ok) {
		console.error(`Error fetching Nadeo token for audience ${audience}: ${response.status} ${response.statusText}`);
		console.error(await response.text());
		throw new Error('Failed to get Nadeo token');
	}

	const data = await response.json();
	return data.accessToken;
}

export async function getOAuthToken() {
	const response = await fetch('https://api.trackmania.com/api/access_token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: new URLSearchParams({
			grant_type: 'client_credentials',
			client_id: config.oauthClientId,
			client_secret: config.oauthClientSecret,
		}),
	});

	if (!response.ok) {
		console.error(`Error fetching OAuth token: ${response.status} ${response.statusText}`);
		throw new Error('Failed to get OAuth token');
	}

	const data = await response.json();
	return data.access_token;
}



//Utilities
export async function getZones(nadeoToken) {
	const response = await fetch('https://prod.trackmania.core.nadeo.online/zones/', {
		method: 'GET',
		headers: {
			'Authorization': `nadeo_v1 t=${nadeoToken}`
		}
	});

	if (!response.ok) {
		console.error(`Error fetching zones: ${response.status} ${response.statusText}`);
		console.error(await response.text());
		throw new Error('Failed to get zones');
	}

	const data = await response.json();
	return data;
}

export async function enumerateCountryZones(country, nadeoToken) {
	let result = new Set();
	const allZones = await getZones(nadeoToken);
	const countryZone = allZones.find(z => z.name === country)?.zoneId;

	if (!countryZone) {
		console.error(`No zone found for country: ${country}`);
		return result;
	}

	let bfs = [countryZone];
	result.add(countryZone);

	while (bfs.length > 0) {
		const curr = bfs.shift();
		const childZones = allZones.filter(z => z.parentId === curr && !result.has(z.zoneId)).map(z => z.zoneId);
		bfs.push(...childZones);
		childZones.forEach(z => result.add(z));
	}

	return result;
}

export async function getLatestCampaign(nadeoToken) {
	try {
		const response = await fetch('https://live-services.trackmania.nadeo.live/api/token/campaign/official?length=1&offset=0', {
			method: 'GET',
			headers: {
				'Authorization': `nadeo_v1 t=${nadeoToken}`
			}
		});

		if (!response.ok) {
			console.error(`Error fetching latest campaign: ${response.status} ${response.statusText}`);
			console.error(await response.text());
			return null;
		}

		const data = await response.json();
		if (data.campaignList && data.campaignList.length > 0) {
			return data.campaignList[0];
		} else {
			console.error('No campaigns found in the response.');
			return null;
		}
	} catch (error) {
		console.error('An error occurred while fetching the latest campaign:', error);
		return null;
	}
}

export async function getMapDetails(nadeoToken, mapUid) {
	const response = await fetch(`https://live-services.trackmania.nadeo.live/api/token/map/${mapUid}`, {
		method: 'GET',
		headers: {
			'Authorization': `nadeo_v1 t=${nadeoToken}`
		}
	});

	if (!response.ok) {
		console.error(`Error fetching map details for map ${mapUid}: ${response.status} ${response.statusText}`);
		console.error(await response.text());
		throw new Error('Failed to get map details');
	}

	const data = await response.json();
	return data;
}

export async function getMapLeaderboard(nadeoToken, mapUid, length = 100, offset = 0) {
	try {
		const response = await fetch(`https://live-services.trackmania.nadeo.live/api/token/leaderboard/group/Personal_Best/map/${mapUid}/top?length=${length}&onlyWorld=true&offset=${offset}`, {
			method: 'GET',
			headers: {
				'Authorization': `nadeo_v1 t=${nadeoToken}`
			}
		});

		if (!response.ok) {
			console.error(`Error fetching leaderboard for map ${mapUid}: ${response.status} ${response.statusText}`);
			console.error(await response.text());
			throw new Error('Failed to get leaderboard');
		}

		const data = await response.json();
		if (!Array.isArray(data.tops) || data.tops.length === 0) {
			console.error(`No leaderboard data found for map ${mapUid}.`);
			return [];
		}

		const leaderboard = data.tops[0]?.top || [];
		return Array.isArray(leaderboard) ? leaderboard : [];
	} catch (error) {
		console.error('An error occurred while fetching the map leaderboard:', error);
		return [];
	}
}

export async function getPlayerName(accountId, accessToken) {
	try {
		if (!accountId) {
			console.error('No account ID provided');
			throw new Error('No account ID provided');
		}

		const url = `https://api.trackmania.com/api/display-names?accountId[]=${encodeURIComponent(accountId)}`;

		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${accessToken}`
			}
		});

		if (!response.ok) {
			const responseBody = await response.text();
			console.error(`Error fetching player name: ${response.status} ${response.statusText}`);
			console.error(`Response Body: ${responseBody}`);
			throw new Error('Failed to get player name');
		}

		const data = await response.json();
		return data[accountId] || 'Unknown';
	} catch (error) {
		console.error('An error occurred while fetching player name:', error);
		throw error;
	}
}

export async function getPlayers(nadeoToken, map, zones, oauthToken) {
	let offset = 0;
	let foundPlayer = false;
	let player = null;
	let mapDetails;

	try {
		mapDetails = await getMapDetails(nadeoToken, map.mapUid);
	} catch (error) {
		console.error(`Failed to get details for map ${map.mapUid}:`, error);
		return null;
	}

	while (!foundPlayer) {
		const leaderboard = await getMapLeaderboard(nadeoToken, map.mapUid, 100, offset);

		if (leaderboard.length === 0) {
			break;
		}

		player = leaderboard.find(p => zones.has(p.zoneId));
		if (player) {
			foundPlayer = true;
		}

		offset += 100;
	}

	if (player) {
		try {
			const playerName = await getPlayerName(player.accountId, oauthToken);
			return {
				mapName: mapDetails.name,
				playerName,
				worldRank: player.position,
				time: player.score
			};
		} catch (error) {
			console.error(`Failed to get player name for account ${player.accountId}:`, error);
		}
	}

	console.log(`No player found for map ${map.mapUid}`);
	return { mapName: mapDetails.name, playerName: 'No player found', worldRank: 'N/A' };
}