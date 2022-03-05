import { CacheType, User as DiscordUser, CommandInteraction , MessageActionRow, MessageEmbed, MessageSelectMenu} from "discord.js";
import { User } from "../models/user.model";
import { userService } from "../services/user.service";
const progressbar = require('string-progressbar');

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

    const row = new MessageActionRow()

    var exp = currentUser.exp;
    let resultado: number = exp;
    let contador = 0;
    while( resultado <= 2 ) {
        resultado = resultado/2;
        contador += 1
    }
    var current = exp - Math.pow(2, contador);

    // Assaign values to total and current values
    var total = 100;
    var current = 50;
    // First two arguments are mandatory
    progressbar.splitBar(total, current);
    // Returns: Array<String, String>

    const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setURL('https://discord.js.org/')
        .setTitle(`${discordUser.username}`)
        .addFields(
            {name: "level", value: `0`, inline: true},

        )
        .setDescription(`<@!${user.userid}>\nCréditos: ${user.credits}`)
        .setThumbnail(discordUser.avatarURL({format: "jpg"})?.toString()!);        

    await interaction.reply({ embeds: [embed] });

});


discordPerfilCommands.set("comprar2", async (currentUser: User, interaction: CommandInteraction<CacheType>) => {

});



export default discordPerfilCommands;