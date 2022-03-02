import { CacheType, Client, CommandInteraction, Intents } from 'discord.js';
import discordCommands from './commands/index';
import { AppConfig } from './configs/environment';

const client: Client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const adminCommands = ["cudecachorro"]

client.on('ready', () => {
  console.log(`Logged in as ${client?.user?.tag}!`);
});

client.on('interactionCreate', async (interaction) => {
	console.log(interaction);
  if (!interaction.isCommand()) return;

  const isAdm = await interaction.memberPermissions?.has("ADMINISTRATOR")

  if (!isAdm && adminCommands.includes(interaction.commandName)) {
    return await interaction.reply("Você não tem permissão para isso.")
    
  }

  discordCommands.forEach(async (action: (i: CommandInteraction<any>) => Promise<void>, commandName: String) => {
    if (commandName === interaction.commandName)
      return await action(interaction);
  })
});

client.login(AppConfig.TOKEN);