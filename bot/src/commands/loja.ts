import { AudioPlayer, createAudioResource, entersState, getVoiceConnection, joinVoiceChannel, PlayerSubscription, StreamType, VoiceConnection, VoiceConnectionStatus } from "@discordjs/voice";
import { CacheType, User as DiscordUser, CommandInteraction, MessageActionRow, MessageEmbed, MessageSelectMenu } from "discord.js";
import { User } from "../models/user.model";
import { userService } from "../services/user.service";
import discordTTS from 'discord-tts';

const discordLojaCommands = new Map<string, any>();
let botSendoUsado: boolean = false;

const precoKickar: number = 20;
const precoApelido: number = 200;
const precoMutar: number = 250;
const precoDesmutar: number = 70;
const precoCastigo: number = 30;


discordLojaCommands.set("loja", async (currentUser: User,  interaction: CommandInteraction<CacheType>)=> {
	const exampleEmbed = new MessageEmbed()
	.setColor('#0099ff')
	.setTitle('Loja')
	.setAuthor({ name: 'Armário Créditos', iconURL: 'https://i.imgur.com/xCH7NyD.png' })
	.setDescription('Loja onde você poderá gastar seus créditos sociais\n\n')
	.setThumbnail('https://i.imgur.com/xCH7NyD.png')
	.addFields(
		{ name: `Mutar alguém no servidor \n\t\tAR\$${precoMutar},00`, value: `/silenciar @usuário` },
		{ name: `Desmutar alguém ou você mesmo \n\t\tAR\$${precoDesmutar},00`, value: `/dessilenciar @usuário`},
		{ name: `Alterar apelido de alguém ou de você mesmo \n\t\tAR\$${precoApelido},00`, value: `/apelido @usuário "Apelido"` },
		{ name: `Deixar uma pessoa de castigo\n\t\t1 minuto = AR\$${precoCastigo},00`, value: `/castigo minutos @usuário` },
        { name: `Kickar do chat de voz  \n\t\tAR\$${precoKickar},00`, value: `/kickar @usuário` },
	)
	.setImage('https://i.imgur.com/UKK6OCb.png')
	.setTimestamp()
	.setFooter({ text: 'Armário Creditos', iconURL: 'https://i.imgur.com/AfFp7pu.png' });

	await interaction.reply({ embeds: [exampleEmbed] });
});

discordLojaCommands.set("kickar", async (currentUser: User, interaction: CommandInteraction<CacheType>) => {    
    if (!await userService.gastarCreditos(currentUser, precoKickar)){
        return interaction.reply({content: 'Você não tem créditos suficientes', ephemeral: true});
    };

    const alvo = interaction.options.getUser('alvo')!;
    const guild = interaction.guild!;

    const alvoMember = (await guild?.members.fetch({ user: alvo }));
    const alvoVoice = alvoMember?.voice;
    const voiceChannelAlvo = alvoVoice?.channel;

    if ( alvo.bot ) {
        await userService.adicionaCreditos(currentUser, precoKickar);
        return interaction.reply({ content: "Não pode usar em bot não seu bobão!", ephemeral: true})
    }

    if ( !voiceChannelAlvo ) {
        await userService.adicionaCreditos(currentUser, precoKickar);
        return interaction.reply({ content: 'Alvo não esta em nenhum canal de voz', ephemeral: true })
    }

    if (botSendoUsado) {
        await userService.adicionaCreditos(currentUser, precoKickar);
        return interaction.reply("Bot tem mais o que fazer, tente mais tarde.")
    }
    botSendoUsado = true;    

    let stream, audio;
    let voiceConnection: VoiceConnection;

    try {
        stream = discordTTS.getVoiceStream(`po mano, vaza ai ${alvoMember.nickname}`, { lang: "pt"});
        audio = createAudioResource(stream, { inputType: StreamType.Arbitrary, inlineVolume: true });

        voiceConnection = joinVoiceChannel({
            channelId: voiceChannelAlvo.id,
            guildId: guild.id,
            adapterCreator: voiceChannelAlvo.guild.voiceAdapterCreator,
            debug: true,
            selfMute: false
        });
    } catch (e) {
        botSendoUsado = false;
        throw e;
    }

    voiceConnection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
        try {
            await Promise.race([
                entersState(voiceConnection, VoiceConnectionStatus.Signalling, 5_000),
                entersState(voiceConnection, VoiceConnectionStatus.Connecting, 5_000),
            ]);
            // Seems to be reconnecting to a new channel - ignore disconnect
        } catch (error) {
            // Seems to be a real disconnect which SHOULDN'T be recovered from
            voiceConnection.destroy();
            botSendoUsado = false;
        }
    });

    voiceConnection.on(VoiceConnectionStatus.Ready, async () => {
        voiceConnection.setSpeaking(true);
        let audioPlayer = new AudioPlayer();
        voiceConnection.subscribe(audioPlayer);
        audioPlayer.play(audio);
        voiceConnection.dispatchAudio();
        await entersState(voiceConnection, VoiceConnectionStatus.Ready, 10_000);
        setTimeout(( c , av) => {
            botSendoUsado = false;
            c.disconnect();
            av?.disconnect();
            userService.ganharExp(currentUser, 5, interaction.channel!);
        }, 4400, voiceConnection, alvoVoice);
    });
    await interaction.reply(`<@!${currentUser.userid}> mandou o <@!${alvo.id}> sair da chamada de voz`);

});

discordLojaCommands.set("apelido", async (currentUser: User, interaction: CommandInteraction<CacheType>) => {    
    if (!await userService.gastarCreditos(currentUser, precoApelido)){
        return interaction.reply({
            content: 'Você não tem créditos suficientes', 
            ephemeral: true
        });
    };
    
    const alvo = interaction.options.getUser('alvo', true);
    const apelido = interaction.options.getString('apelido', true);
    const guild = interaction.guild!;

    if( apelido.length > 32) {
        await userService.adicionaCreditos(currentUser, precoApelido);
        return interaction.reply({
            content: "Apelido muito grande. Tente novamente com um apelido menor", 
            ephemeral: true
        });
    };

    const alvoMember = (await guild?.members.fetch({ user: alvo }));

    alvoMember.setNickname(apelido, "Comando bot");

    await interaction.reply(`<@!${currentUser.userid}> mudou o apelido de <@!${alvo.id}>.`);

    await userService.ganharExp(currentUser, 55, interaction.channel!);

});

discordLojaCommands.set("castigo", async (currentUser: User, interaction: CommandInteraction<CacheType>) => {    
    const minutos = interaction.options.getNumber('minutos', true);

    if (!await userService.gastarCreditos(currentUser, minutos * precoCastigo)){
        return interaction.reply({
            content: 'Você não tem créditos suficientes', 
            ephemeral: true
        });
    };
    
    const alvo = interaction.options.getUser('alvo', true);
    const guild = interaction.guild!;

    const alvoMember = (await guild?.members.fetch({ user: alvo }));

    if (alvoMember.permissions.has("ADMINISTRATOR")) {
        await userService.adicionaCreditos(currentUser, minutos * precoCastigo);
        interaction.reply(
            "Engraçadinho... Infelizmente não é possivel dar um castigo para um adm."
        );
        return interaction.channel?.send(`Ademir <@!${alvo.id}>, olha o que o trouxa tentou fazer KKKKKKKKKKKKKK.`)
    };

    await alvoMember.timeout(minutos * 60 * 1000, `${interaction.user.username} comprou na loja para o ${alvo.username}`)
        .then(console.log)
        .catch(console.error);

    await interaction.reply(`<@!${currentUser.userid}> deixou o <@!${alvo.id}> de castigo.`);
    await userService.ganharExp(currentUser, 6 * minutos, interaction.channel!);

});

discordLojaCommands.set("silenciar", async (currentUser: User, interaction: CommandInteraction<CacheType>) => {    
    if (!await userService.gastarCreditos(currentUser, precoMutar)){
        return interaction.reply({
            content: 'Você não tem créditos suficientes', 
            ephemeral: true
        });
    };
    
    const alvo = interaction.options.getUser('alvo', true);
    const guild = interaction.guild!;
    const alvoMember = (await guild?.members.fetch({ user: alvo }));
    const alvoVoice = alvoMember?.voice;

    if (alvoVoice.serverMute) {
        await userService.adicionaCreditos(currentUser, precoMutar);
        return await interaction.reply({content: `<@!${alvo.id}> já está mutado.` , ephemeral: true});
    }

    await alvoVoice.setMute();
    await interaction.reply(`<@!${currentUser.userid}> mutou o <@!${alvo.id}>.`);

    const voiceChannelAlvo = alvoVoice?.channel;
    if ( !voiceChannelAlvo ) {
        return
    } else {
        if (botSendoUsado) {
            await userService.adicionaCreditos(currentUser, precoMutar);
            await interaction.channel?.send("Bot esta sendo usado, infelizmente nao conseguiu conectar no chat de voz.");
            return
        }
        botSendoUsado = true;  

        let stream, audio;
        let voiceConnection: VoiceConnection;

        try {
            stream = discordTTS.getVoiceStream(`cala a boquinha, ${alvoMember.nickname}`, { lang: "pt"});
            audio = createAudioResource(stream, { inputType: StreamType.Arbitrary, inlineVolume: true });

            voiceConnection = joinVoiceChannel({
                channelId: voiceChannelAlvo.id,
                guildId: guild.id,
                adapterCreator: voiceChannelAlvo.guild.voiceAdapterCreator,
                debug: true,
                selfMute: false
            });
        } catch (e) {
            botSendoUsado = false;
            throw e;
        }

        voiceConnection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
            try {
                await Promise.race([
                    entersState(voiceConnection, VoiceConnectionStatus.Signalling, 5_000),
                    entersState(voiceConnection, VoiceConnectionStatus.Connecting, 5_000),
                ]);
                // Seems to be reconnecting to a new channel - ignore disconnect
            } catch (error) {
                // Seems to be a real disconnect which SHOULDN'T be recovered from
                voiceConnection.destroy();
                botSendoUsado = false;
            }
        });

        voiceConnection.on(VoiceConnectionStatus.Ready, async () => {
            voiceConnection.setSpeaking(true);
            let audioPlayer = new AudioPlayer();
            voiceConnection.subscribe(audioPlayer);
            audioPlayer.play(audio);
            voiceConnection.dispatchAudio();
            await entersState(voiceConnection, VoiceConnectionStatus.Ready, 10_000);
            setTimeout(( c ) => {
                c.disconnect();
                botSendoUsado = false;
                userService.ganharExp(currentUser, 70, interaction.channel!);
            }, 4400, voiceConnection);
        });

    }
});

discordLojaCommands.set("dessilenciar", async (currentUser: User, interaction: CommandInteraction<CacheType>) => {    
    if (!await userService.gastarCreditos(currentUser, precoDesmutar)){
        return interaction.reply({
            content: 'Você não tem créditos suficientes', 
            ephemeral: true
        });
    };
    
    const alvo = interaction.options.getUser('alvo', true);
    const guild = interaction.guild!;
    const alvoMember = (await guild?.members.fetch({ user: alvo }));
    const alvoVoice = alvoMember?.voice;

    if (alvoVoice.serverMute == false) {
        await userService.adicionaCreditos(currentUser, precoDesmutar);
        return await interaction.reply({content: `<@!${alvo.id}> não esta está mutado.` , ephemeral: true});
    }

    await alvoVoice.setMute(false, "Comprou na loja");
    await interaction.reply(`<@!${currentUser.userid}> desmutou o <@!${alvo.id}>.`);
});

export default discordLojaCommands;