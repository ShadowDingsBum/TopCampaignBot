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

  let embedDescription = '';
  let fields = [];

  if (newPlayerName === oldPlayerName) {
    embedDescription = `**${newPlayerName}** improved their own time on **${mapName}**!`;
    fields = [
      { name: 'New PB', value: `${newPlayerTime} (${timeDifference})`, inline: true },
      { name: 'Old PB', value: oldPlayerTime, inline: true },	
      { name: 'World Rank', value: `#${newPlayerRank}`, inline: true }
    ];
  } else {
    embedDescription = `**${newPlayerName}** beat **${oldPlayerName}**'s time on **${mapName}**!`;
    fields = [
      { name: `${newPlayerName}'s PB`, value: `${newPlayerTime}`, inline: true },
      { name: 'Time Gap', value: `${timeDifference}`, inline: true },
      { name: 'World Rank', value: `#${newPlayerRank}`, inline: true },
      { name: `${oldPlayerName}'s PB`, value: oldPlayerTime, inline: true }
    ];
  }

  const embed = new EmbedBuilder()
    .setTitle('New Italian Campaign Record! :flag_it:')
    .setDescription(embedDescription)
    .addFields(fields)
    .setColor('#0c0c8b');

  try {
    await channel.send({ embeds: [embed] });
    console.log('Message sent successfully!');
  } catch (error) {
    console.error('Failed to send new record message to Discord:', error);
  }
}

export function login() {
  client.login(config.botToken);
}