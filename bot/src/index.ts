import { CacheType, Client, CommandInteraction, Intents } from 'discord.js';
import discordCreditosCommands from './commands/creditos';
import discordCommands from './commands/index';
import { AppConfig } from './configs/environment';
import { userService } from './services/user.service';

const client: Client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const adminCommands = ["cudecachorro", "addcreditos"]

client.on('ready', () => {
  console.log(`Logged in as ${client?.user?.tag}!`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const isAdm = await interaction.memberPermissions?.has("ADMINISTRATOR")

  if (!isAdm && adminCommands.includes(interaction.commandName)) {
    return interaction.reply("Você não tem permissão para isso.")
    
  }
	const user = await userService.getOrCreateUserByUserId(interaction.user.id);

  discordCommands.forEach(async (action: (...i: any[]) => Promise<void>, commandName: String) => {
    if (commandName === interaction.commandName) {
      try{
        return await action(user, interaction);
      } catch (e) { return console.error(e)}
    }
  })

  discordCreditosCommands.forEach(async (action: (...i: any[]) => Promise<void>, commandName: String) => {
    if (commandName === interaction.commandName) {
      try{
        return await action(user, interaction);
      } catch (e) { return console.error(e)}
    }
      
  })  

});

client.login(AppConfig.TOKEN);