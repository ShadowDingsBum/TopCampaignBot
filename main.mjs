import { getRecords } from './records.mjs';
import { client, notifyRecord, login } from './discord.mjs';
import { formatTime, formatTimeDifference } from './timeUtils.mjs';

let previousResults = [];

function checkRecords(currentResults) {
  //Map for quick lookup
  const previousMap = new Map(previousResults.map(result => [result.mapName, result]));

  currentResults.forEach(current => {
    const previous = previousMap.get(current.mapName);

    if (previous) {
      if (current.time < previous.time) {
        const mapName = current.mapName;
        const newPlayerName = current.playerName;
        const newPlayerTime = formatTime(current.time);
        const newPlayerRank = current.worldRank;
        const timeDifference = formatTimeDifference(current.time, previous.time);
        const oldPlayerName = previous.playerName;
        const oldPlayerTime = formatTime(previous.time);

        //Notify about the new record
        notifyRecord(mapName, newPlayerName, newPlayerTime, newPlayerRank, timeDifference, oldPlayerName, oldPlayerTime);
      }
    }
  });

  previousResults = currentResults;
}

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  const results = await getRecords();
  checkRecords(results);
  setInterval(async () => {
    const newResults = await getRecords();
    checkRecords(newResults);
  }, 10 * 60 * 1000);
});

login();