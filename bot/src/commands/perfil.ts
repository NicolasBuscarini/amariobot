import { CacheType, User as DiscordUser, CommandInteraction , MessageActionRow, MessageEmbed, MessageSelectMenu} from "discord.js";
import { User } from "../models/user.model";
import { userService } from "../services/user.service";
import progressbar from "string-progressbar";

const discordPerfilCommands = new Map<string, any>();

discordPerfilCommands.set("perfil", async (currentUser: User, interaction: CommandInteraction<CacheType>) => {
    const mencao = interaction.options.getUser('usuario', false);
    let user : User;
    let discordUser : DiscordUser ;
    
    if ( mencao === null) {
        discordUser = interaction.user;
        user = currentUser;
    } else {
        discordUser = mencao;
        user = await userService.getOrCreateUserByUserId(discordUser.id);
    }
    
    const userLevel : number = await userService.getLevelByExp(user.exp);
    const total : number = await userService.getExpToNextLevel(userLevel);
    const current = user.exp - await userService.getExpByLevel(userLevel);

    const progressBar = progressbar.filledBar(total, current, 15, "<:level2:950448131374469231>" ,"<:level:950432727893676083>" )[0];
    
    const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setURL('https://discord.js.org/')
        .setTitle(`${discordUser.username}`)
        .addFields(
            {name: `Level: ${userLevel}`, value: `${progressBar} ${current}/${total}xp`, inline: true},
        )
        .setDescription(`<@!${user.userid}>\nCréditos: ${user.credits}`)
        .setThumbnail(discordUser.avatarURL({format: "jpg"})?.toString()!);        

    await interaction.reply({ embeds: [embed] });

});


discordPerfilCommands.set("teste", async (currentUser: User, interaction: CommandInteraction<CacheType>) => {

});

export default discordPerfilCommands;