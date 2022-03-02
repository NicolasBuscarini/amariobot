import { CacheType, Client, CommandInteraction, Intents } from 'discord.js';
import discordCommands from './commands/index';
import { AppConfig } from './configs/environment';

const client: Client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.on('ready', () => {
  console.log(`Logged in as ${client?.user?.tag}!`);
});

client.on('interactionCreate', async (interaction) => {
	console.log(interaction);
  if (!interaction.isCommand()) return;

  discordCommands.forEach(async (action: (i: CommandInteraction<any>) => Promise<void>, commandName: String) => {
    if (commandName === interaction.commandName)
      await action(interaction);
  })
});

client.login(AppConfig.TOKEN);