import { CacheType, Client, CommandInteraction, Intents } from 'discord.js';
import discordCreditosCommands from './commands/creditos';
import discordCommands from './commands/index';
import { AppConfig } from './configs/environment';
import { userService } from './services/user.service';

const client: Client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const adminCommands = ["cudecachorro", "addcreditos"]
const commandSources = [discordCreditosCommands, discordCommands];

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

  for (let commandSource of commandSources) {
    commandSource.forEach(async (action: (...i: any[]) => Promise<void>, commandName: String) => {
      if (commandName === interaction.commandName) {
        try{
          await action(user, interaction);
          return;
        } catch (e) { 
          console.error(e)
          await interaction.reply({content: "Algo deu errado ao executar esse comando", ephemeral: true})
          return;
        }
      }
    });
  }

});

client.login(AppConfig.TOKEN);