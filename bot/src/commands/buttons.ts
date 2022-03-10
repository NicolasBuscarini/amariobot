import { ButtonInteraction, CacheType, CommandInteraction , MessageEmbed, User as DiscordUser} from "discord.js";
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

async function jokenpoResult(vencedor: User | null | undefined, discordUser: DiscordUser) {
    if ( vencedor === undefined ) return discordUser.send("Adversário ainda não jogou... Aguarde a resposta do seu oponente") 
    else if (vencedor === null) {
        jokenpo.channel!.send(`Empate entre <@!${jokenpo.userApplicationStarter!.userid}> e <@!${jokenpo.userApplicationOpponent!.userid}>`)
        jokenpo.ativo = false;
    }
    else {
        await userService.adicionaCreditos(jokenpo.userApplicationStarter!, -jokenpo.aposta);
        await userService.adicionaCreditos(jokenpo.userApplicationOpponent!, -jokenpo.aposta);
        await userService.adicionaCreditos(vencedor, (jokenpo.aposta*2));

        await userService.ganharExp(jokenpo.userApplicationStarter!, (jokenpo.aposta * 1/10), jokenpo.channel!)  
        await userService.ganharExp(jokenpo.userApplicationOpponent!, (jokenpo.aposta * 1/10), jokenpo.channel!)  
        await userService.ganharExp(vencedor, (jokenpo.aposta * 4/10), jokenpo.channel!)   
        
        jokenpo.userDiscordStarter?.send(`Vencedor do jokenpo: ${vencedor.userid}`);
        jokenpo.userDiscordOpponent?.send(`Vencedor do jokenpo: ${vencedor.userid}`);


        const jokenpoEmbedWin = new MessageEmbed()
            .addFields(
                {name: `Resultado`, value: '\u200B', inline : false },
                {name: `\u200B`, value: `Desafiante <@!${jokenpo.userApplicationStarter?.userid}>:`, inline : false },
                {name: `\u200B`, value: `Desafiado <@!${jokenpo.userApplicationStarter?.userid}>:`, inline: true },
                {name: `${jokenpo.jogada1}`, value: `\u200B`, inline : false },
                {name: `${jokenpo.jogada2}`, value: `\u200B`, inline : true },

                {name: `*VENCEDOR:*`, value: `<@!${vencedor.userid}>`},
                {name: "Aposta:", value: `A${jokenpo.aposta.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`},

            )
            .setTitle("Jokenpo")
            .setColor("RANDOM")
            .setThumbnail('https://i.imgur.com/8hBKLiU.png')
            .setImage('https://i.imgur.com/OSYsZU0.png')
            .setFooter(`Jokenpo`);
        
        jokenpo.channel!.send({embeds: [jokenpoEmbedWin]});
        jokenpo.ativo = false;
    }
};

buttonsCommands.set("pedra", async (currentUser: User, interaction: CommandInteraction<CacheType>) => {
    if (jokenpo.userApplicationStarter?.userid == currentUser.userid && jokenpo.jogada1 === null) {
        jokenpo.jogada1 = "pedra";
        await interaction.reply(`Você escolheu Pedra`);
    } else if (jokenpo.userApplicationOpponent?.userid == currentUser.userid && jokenpo.jogada2 === null){
        await interaction.reply(`Você escolheu Pedra`);
    } else {
        await interaction.reply("Você não pode mudar sua escolha");
    }

    let play = jokenpoPlay()
    jokenpoResult(play, interaction.user);
});


buttonsCommands.set("papel", async (currentUser: User, interaction: ButtonInteraction<CacheType>) => {
    if (jokenpo.userApplicationStarter?.userid == currentUser.userid && jokenpo.jogada1 === null) {
        jokenpo.jogada1 = "papel";
        await interaction.reply(`Você escolheu Papel`);

    } else if (jokenpo.userApplicationOpponent?.userid == currentUser.userid && jokenpo.jogada2 === null){
        jokenpo.jogada2 = "papel";
        await interaction.reply(`Você escolheu Papel`);

    } else {
        await interaction.reply("Você não pode mudar sua escolha");
    }

    interaction.reply("Você escolheu papel!");

    let play = jokenpoPlay()
    jokenpoResult(play, interaction.user);  
});

buttonsCommands.set("tesoura", async (currentUser: User, interaction: ButtonInteraction<CacheType>) => {
    if (jokenpo.userApplicationStarter?.userid == currentUser.userid && jokenpo.jogada1 === null) {
        jokenpo.jogada1 = "tesoura";
        await interaction.reply(`Você escolheu Tesoura`);

    } else if (jokenpo.userApplicationOpponent?.userid == currentUser.userid && jokenpo.jogada2 === null){
        jokenpo.jogada2 = "tesoura";
        await interaction.reply(`Você escolheu Tesoura`);
    } else {
        await interaction.reply("Você não pode mudar sua escolha");
    }

    let play = jokenpoPlay()
    jokenpoResult(play, interaction.user);
});

export default buttonsCommands;