import { Client, GatewayIntentBits, SlashCommandBuilder } from 'discord.js';

const token = process.env.DISCORD_TOKEN;
const webUrl = process.env.THC_U_KNOW_WEB_URL ?? 'https://dtfseeds.com/games/thc-u-know';

export const commands = [
  new SlashCommandBuilder().setName('thc-u-know-create').setDescription('Create a THC U Know Smoke Circle invite.'),
  new SlashCommandBuilder()
    .setName('thc-u-know-join')
    .setDescription('Get a THC U Know join link from a session code.')
    .addStringOption(option => option.setName('code').setDescription('Session code').setRequired(true)),
  new SlashCommandBuilder().setName('thc-u-know-status').setDescription('Show THC U Know bot status.')
];

if (!token) {
  console.log('Discord bot scaffold loaded. Set DISCORD_TOKEN to run the bot.');
} else {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'thc-u-know-create') {
      await interaction.reply(`Create a Smoke Circle here: ${webUrl}`);
      return;
    }

    if (interaction.commandName === 'thc-u-know-join') {
      const code = interaction.options.getString('code', true).toUpperCase();
      await interaction.reply(`Join THC U Know: ${webUrl}?join=${code}`);
      return;
    }

    if (interaction.commandName === 'thc-u-know-status') {
      await interaction.reply('THC U Know bot scaffold is online.');
    }
  });

  client.login(token);
}
