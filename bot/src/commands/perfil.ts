import { CacheType, CommandInteraction , MessageActionRow, MessageEmbed, MessageSelectMenu} from "discord.js";
import { User } from "../models/user.model";
import { userService } from "../services/user.service";

const discordPerfilCommands = new Map<string, any>();

discordPerfilCommands.set("perfil", async (currentUser: User, interaction: CommandInteraction<CacheType>) => {
    const mencao = interaction.options.getUser('usuario', false);
    let user : User;
    let discordUser ;
    if ( mencao === null) {
        discordUser = interaction.user;
        user = currentUser;
    } else {
        discordUser = mencao;
        user = await userService.getOrCreateUserByUserId(discordUser);
    }

    const row = new MessageActionRow()

    const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setURL('https://discord.js.org/')
        .setTitle(`<!@${user.userid}>`)
        .setDescription(`Créditos: ${user.credits}`)
        .setImage(discordUser.avatarURL({format: "jpg"})?.toString()!);
        

    await interaction.reply({ content: 'Pong!', embeds: [embed] });

});


discordPerfilCommands.set("comprar2", async (currentUser: User, interaction: CommandInteraction<CacheType>) => {

});



export default discordPerfilCommands;