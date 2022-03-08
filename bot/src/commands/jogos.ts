import { CacheType, CommandInteraction, MessageEmbed } from "discord.js";
import { User } from "../models/user.model";
import { userService } from "../services/user.service";
import blackjack from "discord-blackjack";

const discordJogosCommands = new Map<string, any>();

discordJogosCommands.set("blackjack", async (currentUser: User, interaction: CommandInteraction<CacheType>) => {
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
        fields: [
            {name: "ATENÇÃO. Se você demorar para jogar, você perderá a aposta", value: '\u200B'},
            {name: `Mão do <@!${currentUser.userid}>`, value: '\u200B' },
            {name: `Mão do Dealer`, value: '\u200B' }
        ],
    }

    let game = await blackjack(interaction, {resultEmbed: false, normalEmbed: false, normalEmbedContent: embed} );

    console.log(game.normalEmbedContent)

    console.log("Resultado")
    console.log(game.result)

    console.log("Minhas cartas")
    console.log(game.ycard)
    console.log(game.ycard.length)

    console.log("Dealer cartas")
    console.log(game.dcard)

    let msgYCards : string = "[ " ;
    let totalYCards : number = 0;
    game.ycard.forEach(ycards => {
        msgYCards += "`" + ycards.rank + ycards.emoji + "` ";
        totalYCards += ycards.value;
    });
    msgYCards += "]";
    console.log(msgYCards);

    let msgDCards : string = "[ " ;
    let totalDCards : number = 0;
    game.dcard.forEach(dcards => {
        msgDCards += "`" + dcards.rank + dcards.emoji + "` ";
        totalDCards += dcards.value;
    });
    msgDCards += "]";
    console.log(msgDCards);


    switch (game.result) {

            
        case "WIN":
            await userService.ganharExp(currentUser, aposta, interaction.channel!);

            await userService.adicionaCreditos(currentUser, aposta*2);

            const embedWin = new MessageEmbed()
                .setTitle("BlackJack")
                .setDescription(`Parabéns, você ganhou! Você ganhou AR\$${aposta * 2}!`)
                .setColor("GREEN")
                .addFields(
                    { name: `\u200B` , value: `<@!${currentUser.userid}> <a:VaiBrasil:852727978416537601>` },
                    { name: `Você tem um total de: ${currentUser.credits}` , value: '\u200B' },
                    { name: `Suas cartas:  `, value: `${msgYCards} \n Total: ${totalYCards}`, inline: true },
                    { name: `Cartas do Dealer:  `, value: `${msgDCards} \n Total: ${totalDCards}`, inline: true },
                );
            await interaction.channel!.send({ embeds: [embedWin]});

            break;

        case "LOSE":
            await userService.ganharExp(currentUser, aposta/4, interaction.channel!);

            const embedLose = new MessageEmbed()
                .setTitle("BlackJack")
                .setDescription(`Você perdeu AR\$${aposta}. `)
                .setColor("RED")
                .addFields(
                    { name: `Que triste <@!${currentUser.userid}>. Você tem um total de: ${currentUser.credits}` , value: "\u200B"},
                    { name: `Suas cartas:  `, value: `${msgYCards} \nTotal: ${totalYCards}`, inline: true },
                    { name: `Cartas do Dealer:  `, value: `${msgDCards} \n Total: ${totalDCards}`, inline: true },
                );
            await interaction.channel!.send({ embeds: [embedLose]});

            break;

        case "TIE":
            await userService.ganharExp(currentUser, aposta/2, interaction.channel!);

            const embedTie = new MessageEmbed()
                .setTitle("BlackJack")
                .setDescription(`Empate! Você perdeu sua aposta de AR\$${aposta}. (Empate é da casa) `)
                .setColor("BLUE")
                .addFields(
                    { name: `<@!${currentUser.userid}>. Você tem um total de: ${currentUser.credits}` , value: '\u200B'},
                    { name: `Suas cartas:  `, value: `${msgYCards} \nTotal: ${totalYCards}`, inline: true },
                    { name: `Cartas do Dealer:  `, value: `${msgDCards} \n Total: ${totalDCards}`, inline: true },
                );
            await interaction.channel!.send({ embeds: [embedTie]});
    }

});

export default discordJogosCommands;