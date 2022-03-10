import { ButtonInteraction, CacheType, CommandInteraction , User as DiscordUser} from "discord.js";
import { User } from "../models/user.model";
import { userService } from "../services/user.service";
import { jokenpo } from "./jogos";
const { MessageEmbed } = require('discord.js');

const buttonsCommands = new Map<string, any>();

function jokenpoPlay () {
    if ( jokenpo.jogada1 == null || jokenpo.jogada2 == null ) {
        return undefined
    };

    if ((jokenpo.jogada1 == "pedra" && jokenpo.jogada2 == "tesoura") || (jokenpo.jogada1 == "papel" && jokenpo.jogada2 == "pedra") || (jokenpo.jogada1 == "tesoura" && jokenpo.jogada2 == "papel")) {
        return jokenpo.userApplicationStarter;
    } else if ((jokenpo.jogada1 == "pedra" && jokenpo.jogada2 == "pedra") || (jokenpo.jogada1 == "papel" && jokenpo.jogada2 == "papel") || (jokenpo.jogada1 == "tesoura" && jokenpo.jogada2 == "tesoura"))  { 
        return null;
    } else {
        return jokenpo.userApplicationOpponent;
    }
};

function jokenpoResult(vencedor: User | null | undefined, discordUser: DiscordUser) {
    if ( vencedor === undefined ) return discordUser.send("Aguarde o adversário jogar") 
    else if (vencedor === null) jokenpo.channel!.send(`Empate`)
    else jokenpo.channel!.send(`<@!${vencedor.userid}>`)
};

buttonsCommands.set("pedra", async (currentUser: User, interaction: CommandInteraction<CacheType>) => {
    interaction.user.send("Você escolheu pedra!");

    if (jokenpo.userApplicationStarter?.userid == currentUser.userid) {
        jokenpo.jogada1 = "pedra";
    } else if (jokenpo.userApplicationOpponent?.userid == currentUser.userid){
        jokenpo.jogada2 = "pedra";
    } else {
        interaction.reply("certo");
        return interaction.user.send("algo deu errado");
    }

    let play = jokenpoPlay()
    jokenpoResult(play, interaction.user);

    return interaction.reply("certo");

});


buttonsCommands.set("papel", async (currentUser: User, interaction: ButtonInteraction<CacheType>) => {
    interaction.user.send("Você escolheu papel!");

    if (jokenpo.userApplicationStarter?.userid == currentUser.userid) {
        jokenpo.jogada1 = "papel";
    } else if (jokenpo.userApplicationOpponent?.userid == currentUser.userid){
        jokenpo.jogada2 = "papel";
    } else {
        interaction.reply("certo");
        return interaction.user.send("algo deu errado");
    }

    let play = jokenpoPlay()
    jokenpoResult(play, interaction.user);  

    return interaction.reply("certo");

});

buttonsCommands.set("tesoura", async (currentUser: User, interaction: ButtonInteraction<CacheType>) => {
    interaction.user.send("Você escolheu tesoura!");

    if (jokenpo.userApplicationStarter?.userid == currentUser.userid) {
        jokenpo.jogada1 = "tesoura";
    } else if (jokenpo.userApplicationOpponent?.userid == currentUser.userid){
        jokenpo.jogada2 = "tesoura";
    } else {
        interaction.reply("certo");
        return interaction.user.send("algo deu errado");
    }

    let play = jokenpoPlay()
    jokenpoResult(play, interaction.user);

    return interaction.reply("certo");
});

export default buttonsCommands;