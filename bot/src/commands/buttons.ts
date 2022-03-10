import { ButtonInteraction, CacheType, CommandInteraction , User as DiscordUser} from "discord.js";
import { User } from "../models/user.model";
import { userService } from "../services/user.service";
import { jokenpo } from "./jogos";

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
    if ( vencedor === undefined ) return discordUser.send("Adversário ainda não jogou... Aguarde a resposta do seu oponente") 
    else if (vencedor === null) {
        userService.adicionaCreditos(jokenpo.userApplicationOpponent!, jokenpo.aposta);
        userService.adicionaCreditos(jokenpo.userApplicationStarter!, jokenpo.aposta);
        jokenpo.channel!.send(`Empate entre <@!${jokenpo.userApplicationStarter!.userid}> e <@!${jokenpo.userApplicationOpponent!.userid}>`)
        jokenpo.ativo = false;
    }
    else {
        userService.adicionaCreditos(vencedor, (jokenpo.aposta*2));
        jokenpo.channel!.send(`Vencedor <@!${vencedor.userid}>`);
        jokenpo.ativo = false;
    }
};

buttonsCommands.set("pedra", async (currentUser: User, interaction: CommandInteraction<CacheType>) => {
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
});


buttonsCommands.set("papel", async (currentUser: User, interaction: ButtonInteraction<CacheType>) => {
    if (jokenpo.userApplicationStarter?.userid == currentUser.userid) {
        jokenpo.jogada1 = "papel";
    } else if (jokenpo.userApplicationOpponent?.userid == currentUser.userid){
        jokenpo.jogada2 = "papel";
    } else {
        interaction.reply("certo");
        return interaction.user.send("algo deu errado");
    }

    interaction.reply("Você escolheu papel!");

    let play = jokenpoPlay()
    jokenpoResult(play, interaction.user);  
});

buttonsCommands.set("tesoura", async (currentUser: User, interaction: ButtonInteraction<CacheType>) => {
    if (jokenpo.userApplicationStarter?.userid == currentUser.userid) {
        jokenpo.jogada1 = "tesoura";
        interaction.reply(`Você escolheu papel na partida contra o <!@${jokenpo}>!`);

    } else if (jokenpo.userApplicationOpponent?.userid == currentUser.userid){
        jokenpo.jogada2 = "tesoura";
    } else {
        interaction.reply("certo");
        return interaction.user.send("algo deu errado");
    }

    let play = jokenpoPlay()
    jokenpoResult(play, interaction.user);
});

export default buttonsCommands;