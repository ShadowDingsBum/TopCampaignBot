import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import { config } from './config.mjs';

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

export async function notifyRecord(mapName, newPlayerName, newPlayerTime, newPlayerRank, timeDifference, oldPlayerName, oldPlayerTime) {
  const channel = client.channels.cache.get(config.channelId);
  if (!channel) {
    console.error('Channel not found!');
    return;
  }

  //Fix title according to your preferences (Country etc..)
  const embed = new EmbedBuilder()
    .setTitle('New Italian Campaign Record!')
    .setDescription(`Map: **${mapName}**`)
    .addFields(
      { name: 'Player', value: `⬆️ ${newPlayerName}`, inline: true },
      { name: 'Time', value:`${newPlayerTime} (${timeDifference})`, inline: true },
      { name: 'World Rank', value: `#${newPlayerRank}`, inline: true },
      { name: 'Player', value: `⬇️ ${oldPlayerName}`, inline: true },
      { name: 'Time', value: oldPlayerTime, inline: true },
      { name: '\u200B', value: '\u200B', inline: true } //Placeholder for alignment
    )
    .setColor('#0c0c8b')
    .setTimestamp();

  try {
    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Failed to send new record message to Discord:', error);
  }
}

export function login() {
  client.login(config.botToken);
}