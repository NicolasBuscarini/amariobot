import { CacheType, Client, CommandInteraction, Intents } from 'discord.js';
import buttonsCommands from './commands/buttons';
import discordCreditosCommands from './commands/creditos';
import discordCommands from './commands/index';
import discordJogosCommands from './commands/jogos';
import discordLojaCommands from './commands/loja';
import discordPerfilCommands from './commands/perfil';
import { AppConfig } from './configs/environment';
import { mongoDbContext } from './context/mongo-db.context';
import { userService } from './services/user.service';

const adminCommands = ["addcreditos", "getuser", "removecreditos"]
const commandSources = [discordCreditosCommands, discordCommands, discordPerfilCommands, discordLojaCommands, discordJogosCommands ];

async function main() {

  await mongoDbContext.connect();
  
  const client: Client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES] });

  client.on('ready', () => {
    console.log(`Logged in as ${client?.user?.tag}!`);
  });
  
  client.on('interactionCreate', async (interaction) => {
    const user = await userService.getOrCreateUserByUserId(interaction.user.id);
  
    if (interaction.isButton()) {
      console.log(interaction.customId);
      buttonsCommands.forEach(async (action: (...i: any[]) => Promise<void>, commandName: String) => {
        if (commandName === interaction.customId) {
          try{
            await action(user, interaction);
            return;
          } catch (e) { 
            console.error(e)
            await interaction.reply({content: "Algo deu errado ao executar esse comando. Por favor reporte ao <@!576116903051788288>", ephemeral: true})
            return;
          }
        }
      });
    }
  
    if (!interaction.isCommand()) return;
  
    const isAdm = await interaction.memberPermissions?.has("ADMINISTRATOR")
  
    if (!isAdm && adminCommands.includes(interaction.commandName)) {
      return interaction.reply("Você não tem permissão para isso.")
      
    }
  
    for (let commandSource of commandSources) {
      commandSource.forEach(async (action: (...i: any[]) => Promise<void>, commandName: String) => {
        if (commandName === interaction.commandName) {
          try{
            await action(user, interaction);
            return;
          } catch (e) { 
            console.error(e)
            await interaction.reply({content: "Algo deu errado ao executar esse comando. Por favor reporte ao <@!576116903051788288>", ephemeral: true})
            return;
          }
        }
      });
    }
  
  });
  
  client.login(AppConfig.TOKEN);
}

main();