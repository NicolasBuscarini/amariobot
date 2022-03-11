import { CacheType, CommandInteraction, MessageActionRow, MessageButton, MessageEmbed, TextBasedChannel, User as DiscordUser} from "discord.js";
import { User } from "../models/user.model";
import { userService } from "../services/user.service";
import blackjack from "discord-blackjack";

interface Jokenpo { 
    ativo: boolean
    finished: boolean
    jogada1: null | string, 
    jogada2: null | string , 
    userApplicationStarter: User | null, 
    userApplicationOpponent: User | null, 
    userDiscordStarter: DiscordUser | null, 
    userDiscordOpponent: DiscordUser | null, 
    channel: TextBasedChannel | null,
    aposta: number
};
export let jokenpo : Jokenpo = { 
    ativo: false,
    finished: false,
    jogada1: null, 
    jogada2: null, 
    userApplicationStarter: null, 
    userApplicationOpponent: null, 
    userDiscordStarter: null, 
    userDiscordOpponent: null, 
    channel: null,
    aposta: 0
};

const discordJogosCommands = new Map<string, any>();

discordJogosCommands.set("blackjack", async (currentUser: User, interaction: CommandInteraction<CacheType>) => {
    let multiplicador = 0.75;
    const guild = interaction.guild!;
    const userMember = (await guild?.members.fetch({ user: interaction.user }));

    const aposta = interaction.options.getNumber('aposta', true); 

    if (!await userService.gastarCreditos(currentUser, aposta)){
        return interaction.reply({
            content: 'Você não tem créditos suficientes', 
            ephemeral: true
        });
    };

    let embed = {
        title: "Blackjack game",
        color: "RANDOM",
        thumbnail: {
            url: 'https://i.imgur.com/MGjMGjM.png',
        },
        fields: [
            {name: `Mão do ${userMember.nickname}\t\t`, value: '\u200B', inline : true },
            {name: `Mão do Dealer`, value: '\u200B', inline: true },
            {name: "\u200B", value: `<@!${currentUser.userid}>`},

            {name: "ATENÇÃO!!! SE DEMORAR PARA JOGAR SERÁ GASTO SEUS CRÉDITOS", value: "\u200B"},
            {name: "Aposta:", value: `A${aposta.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`},
        ],
        image: {
            url: 'https://i.imgur.com/V1cE3E5.png',
        },
        footer: {
            text: `Jogo de: ${userMember.nickname}`,
        },
    }

    let game = await blackjack(interaction, {resultEmbed: false, normalEmbed: false, normalEmbedContent: embed , doubledown: false, split: false, transition: "delete" } );

    function msgCards (cards: Array<any>) : Array<string> {
        let msgCards : string = "[ " ;
        let totalCards : number = 0;
        cards.forEach(cards => {
            msgCards += "`" + cards.emoji + cards.rank + "` ";
            totalCards += cards.value;
        });
        msgCards += "]";
        return [msgCards, totalCards.toString()]
    }

    let ycards = msgCards(game.ycard);

    let dcards;
    if ( game.method == "You busted") { dcards = ["[ ` ? ` ]", "` ? `"]; }
     else { dcards = msgCards(game.dcard); }

     let msgMethod
     switch (game.method) {
        case "You had blackjack":
            multiplicador = 1
            msgMethod = "Sortudo. Você fez *BLACKJACK*";
             break;
        case "You busted":
             msgMethod = "Você passou de 21";
             break;
        case  "You had more":
            msgMethod = "Você chegou mais proximo de 21";
            break;
        case  "Dealer had blackjack":
            msgMethod = "Dealer fez *BLACKJACK*";
            break;
        case  "Dealer had more":
            msgMethod = "Dealer chegou mais proximo de 21";
            break;
        case  "Dealer busted":
            msgMethod = "Dealer ultrapassou 21";
            break;
        case  "Tie":
            msgMethod = "EMPATE";
            break;
        case  "None":
            msgMethod = "Partida cancelada ou demorou para jogar";
            break;
     }

    switch (game.result) {
            
        case "WIN":
            await userService.ganharExp(currentUser, aposta, interaction.channel!);

            await userService.adicionaCreditos(currentUser, aposta*2*multiplicador);

            const embedWin = new MessageEmbed()
                .setTitle("BlackJack")
                .setDescription(`Parabéns, você ganhou! Você ganhou A${(aposta * 2 * multiplicador).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}!`)
                .setColor("GREEN")
                .addFields(
                    { name: `\u200B` , value: `<@!${currentUser.userid}> <a:VaiBrasil:852727978416537601>` }, 
                    { name: `Você tem um total de: A${currentUser.credits.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}` , value: '\u200B' },
                    { name: `Resultado: `, value: `${msgMethod}`, inline: false },
                    { name: `Suas cartas:  `, value: `${ycards[0]} \n Total: ${ycards[1]}`, inline: true },
                    { name: `Cartas do Dealer: `, value: `${dcards[0]} \n Total: ${dcards[1]}`, inline: true },
                );
            await interaction.channel!.send({ embeds: [embedWin]});

            break;

        case "LOSE":
            await userService.ganharExp(currentUser, aposta/4, interaction.channel!);

            const embedLose = new MessageEmbed()
                .setTitle("BlackJack")
                .setDescription(`Você perdeu A${aposta.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}. `)
                .setColor("RED")
                .addFields(
                    { name: `\u200B` , value: `<@!${currentUser.userid}>` }, 
                    { name: `Você tem um total de: A${currentUser.credits.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}` , value: "\u200B"},
                    { name: `Resultado: `, value: `${msgMethod}`, inline: false },
                    { name: `Suas cartas:  `, value: `${ycards[0]} \nTotal: ${ycards[1]}`, inline: true },
                    { name: `Cartas do Dealer:  `, value: `${dcards[0]} \n Total: ${dcards[1]}`, inline: true },
                );
            await interaction.channel!.send({ embeds: [embedLose]});

            break;

        case "TIE":
            await userService.ganharExp(currentUser, aposta/4, interaction.channel!);

            const embedTie = new MessageEmbed()
                .setTitle("BlackJack")
                .setDescription(`Empate! Você perdeu sua aposta de A${aposta.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}. (Empate é da casa) `)
                .setColor("BLUE")
                .addFields(
                    { name: `\u200B` , value: `<@!${currentUser.userid}>` },
                    { name: `Você tem um total de: A${currentUser.credits.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}` , value: '\u200B'},
                  
                    { name: `Resultado: `, value: `${msgMethod}`, inline: false },
                    { name: `Suas cartas:  `, value: `${ycards[0]} \nTotal: ${ycards[1]}`, inline: true },
                    { name: `Cartas do Dealer:  `, value: `${dcards[0]} \n Total: ${dcards[1]}`, inline: true },
                );
            await interaction.channel!.send({ embeds: [embedTie]});

        case "CANCEL":
            const embedTimeout = new MessageEmbed()
                .setTitle("BlackJack")
                .setDescription(`Timeout ou cancelado! Você já viu suas cartas então perdeu a aposta de A${aposta.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.`)
                .setColor("BLUE")
                .addFields(
                    { name: `\u200B` , value: `<@!${currentUser.userid}>` },
                    { name: `Você tem um total de: A${currentUser.credits.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}` , value: '\u200B'},
                    { name: `Resultado: `, value: `${msgMethod}`, inline: false },
                );
            await interaction.channel!.send({ embeds: [embedTimeout]});
    }
});

discordJogosCommands.set("jokenpo", async (currentUser: User, interaction: CommandInteraction<CacheType>) => {
    if (jokenpo.ativo) {
        return interaction.reply({
            content: `Bot já está sendo arbitro em outra partida de jokenpo. Tente novamente mais tarde. \n(Uma partida tem duração máxima de 1 minuto)`, 
            ephemeral: true
        });
    }
    jokenpo.ativo = true;

    const oponenteDiscordUser = interaction.options.getUser("oponente", true);
    const oponenteApplicationUser = await userService.getOrCreateUserByUserId(oponenteDiscordUser.id);
    const aposta = interaction.options.getNumber("aposta", true);
    
    jokenpo.channel = interaction.channel;
    jokenpo.userApplicationStarter = currentUser;
    jokenpo.userApplicationOpponent = oponenteApplicationUser;
    jokenpo.userDiscordStarter = interaction.user;
    jokenpo.userDiscordOpponent = oponenteDiscordUser;
    jokenpo.aposta = aposta;

    if ( jokenpo.userApplicationStarter == jokenpo.userApplicationOpponent ) {
        jokenpo = { 
            ativo: false,
            finished: false,
            jogada1: null, 
            jogada2: null, 
            userApplicationStarter: null, 
            userApplicationOpponent: null, 
            userDiscordStarter: null, 
            userDiscordOpponent: null, 
            channel: null,
            aposta: 0
        };
        return interaction.reply({
            content: 'Não pode desafiar você mesmo.', 
            ephemeral: true
        });
    }

    if (currentUser.credits < aposta) {
        jokenpo = { 
            ativo: false,
            finished: false,
            jogada1: null, 
            jogada2: null, 
            userApplicationStarter: null, 
            userApplicationOpponent: null, 
            userDiscordStarter: null, 
            userDiscordOpponent: null, 
            channel: null,
            aposta: 0
        };
        return interaction.reply({
            content: 'Você não tem créditos suficientes', 
            ephemeral: true
        });
    }

    if (oponenteApplicationUser.credits < aposta) {
        jokenpo = { 
            ativo: false,
            finished: false,
            jogada1: null, 
            jogada2: null, 
            userApplicationStarter: null, 
            userApplicationOpponent: null, 
            userDiscordStarter: null, 
            userDiscordOpponent: null, 
            channel: null,
            aposta: 0
        };
        return interaction.reply({
            content: `Oponente não tem saldo de créditos suficientes. Olhe o perfil dele com o /perfil <@!${oponenteDiscordUser.id}> para descobrir quanto ele tem.`, 
            ephemeral: true
        });
    }

    async function jokenpoMsgPrivado (user: DiscordUser) {
        const embedPrivado = new MessageEmbed()
        .setTitle("Jokenpo")
        .setDescription(`<@!${currentUser.userid}> está desafiando <@!${oponenteDiscordUser.id}> para uma partida de jokenpo valendo ${aposta.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`)
        .setColor("BLUE")
        .addFields(
            { name: `\u200B` , value: `Para recusar o desafio apenas não responda a esta mensagem` }, 
            { name: `O desafio tem um tempo de 1 minuto para fazer sua jogada` , value: `\u200B` }, 
        );

        const row = new MessageActionRow()
			.addComponents(
                new MessageButton()
					.setCustomId('pedra')
					.setLabel('Pedra')
					.setStyle('SECONDARY')
                    .setEmoji('🪨'),
                new MessageButton()
					.setCustomId('papel')
					.setLabel('Papel')
					.setStyle('PRIMARY')
                    .setEmoji('📰'),
				new MessageButton()
					.setCustomId('tesoura')
					.setLabel('Tesoura')
					.setStyle('DANGER')
                    .setEmoji('✂️'),
			);
            
        let message = await user.send({embeds: [embedPrivado], components: [row]});

        setTimeout(() => {
            jokenpo = { 
                ativo: false,
                finished: false,
                jogada1: null, 
                jogada2: null, 
                userApplicationStarter: null, 
                userApplicationOpponent: null, 
                userDiscordStarter: null, 
                userDiscordOpponent: null, 
                channel: null,
                aposta: 0
            };
            message.delete();
        }, 60000)
        return ;
    }

    jokenpoMsgPrivado(oponenteDiscordUser);
    jokenpoMsgPrivado(interaction.user);

    const embedStart = new MessageEmbed()
        .setTitle("Jokenpo")
        .setDescription(`<@!${currentUser.userid}> está desafiando <@!${oponenteDiscordUser.id}> para uma partida de jokenpo valendo A${aposta.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`)
        .setColor("BLUE")
        .addFields(
            { name: `\u200B` , value: `Uma mensagem foi enviada para cada um no privado para escolher sua jogada` }, 
        );
    await interaction.reply({ embeds: [embedStart]});

});

export default discordJogosCommands;