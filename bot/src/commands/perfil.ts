import { CacheType, User as DiscordUser, CommandInteraction , MessageActionRow, MessageEmbed, MessageSelectMenu} from "discord.js";
import { User } from "../models/user.model";
import { userService } from "../services/user.service";
//import progressbar from "string-progressbar";

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

    let exp = user.exp;
    let resultado: number = exp;
    let level = 0;
    let c: boolean = false;
    while( c != true ) {
        level += 1;
        resultado = resultado/2;

        if (resultado <= 2) {
            c = true;
            level -= 1;
        };
    }
    console.log(`expe: ${exp}`);
    console.log("level:"+level);

    let total;
    let inicio;
    let current;
    
    if (level == 0) {
        level = 1;
        current = exp;  
        total = Math.pow(2, level+1) -2;      
    } else { 
        inicio = Math.pow(2, level) -2;
        total = Math.pow(2, level+1) -2;
        current = total - inicio;
    }
    

    console.log("total:"+total);
    console.log("current:"+current);

    //const progressBar = progressbar.splitBar(total, current, 11);

    const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setURL('https://discord.js.org/')
        .setTitle(`${discordUser.username}`)
        .addFields(
            //{name: `Level: ${level}`, value: `${progressBar[0]} ${current}/${total}xp`, inline: true},
        )
        .setDescription(`<@!${user.userid}>\nCréditos: ${user.credits}`)
        .setThumbnail(discordUser.avatarURL({format: "jpg"})?.toString()!);        

    await interaction.reply({ embeds: [embed] });

});


discordPerfilCommands.set("teste", async (currentUser: User, interaction: CommandInteraction<CacheType>) => {

});



export default discordPerfilCommands;