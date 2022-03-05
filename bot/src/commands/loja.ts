import { AudioPlayer, createAudioResource, entersState, getVoiceConnection, joinVoiceChannel, PlayerSubscription, StreamType, VoiceConnection, VoiceConnectionStatus } from "@discordjs/voice";
import { CacheType, User as DiscordUser, CommandInteraction, MessageActionRow, MessageEmbed, MessageSelectMenu } from "discord.js";
import { User } from "../models/user.model";
import { userService } from "../services/user.service";
import discordTTS from 'discord-tts';

const discordLojaCommands = new Map<string, any>();
let botSendoUsado: boolean = false;

discordLojaCommands.set("loja", async (currentUser: User,  interaction: CommandInteraction<CacheType>)=> {
	const exampleEmbed = new MessageEmbed()
	.setColor('#0099ff')
	.setTitle('Loja')
	.setAuthor({ name: 'Armario Creditos', iconURL: 'https://i.imgur.com/xCH7NyD.png' })
	.setDescription('Loja onde você poderá gastar seus créditos sociais\n\n')
	.setThumbnail('https://i.imgur.com/xCH7NyD.png')
	.addFields(
		{ name: '\nMutar alguem no servidor \n(:white_check_mark: funcionando)\n\t\tAR$250,00', value: '/mutar @usuario' },
		{ name: 'Desmutar alguem ou você mesmo \n(:x:  infuncionando)\n\t\tAR$70,00', value: '/desmutar @usuario'},
		{ name: 'Alterar apelido de alguém ou de você mesmo \n(:white_check_mark: funcionando)\n\t\tAR$200,00', value: '/apelido @usuario "Apelido"' },
		{ name: 'Deixar uma pessoa de castigo por 5 minutos\n(:white_check_mark: funcionando)\n\t\tAR$100,00', value: '/castigo @usuario' },
        { name: 'Kickar do chat de voz \n(:white_check_mark: funcionando) \n\t\tAR$10,00', value: '/kickar @usuario' },
	)
	.setImage('https://i.imgur.com/UKK6OCb.png')
	.setTimestamp()
	.setFooter({ text: 'Armario Creditos', iconURL: 'https://i.imgur.com/AfFp7pu.png' });

	await interaction.reply({ embeds: [exampleEmbed] });
});

discordLojaCommands.set("kickar", async (currentUser: User, interaction: CommandInteraction<CacheType>) => {    
    if (!await userService.gastarCreditos(currentUser, 10)){
        return interaction.reply({content: 'Você não tem créditos suficientes', ephemeral: true});
    };

    const alvo = interaction.options.getUser('alvo')!;
    const guild = interaction.guild!;

    const alvoMember = (await guild?.members.fetch({ user: alvo }));
    const alvoVoice = alvoMember?.voice;
    const voiceChannelAlvo = alvoVoice?.channel;

    if ( alvo.bot ) {
        await userService.adicionaCreditos(currentUser, 10);
        return interaction.reply({ content: "Não pode usar em bot não seu bobão!", ephemeral: true})
    }

    if ( !voiceChannelAlvo ) {
        await userService.adicionaCreditos(currentUser, 10);
        return interaction.reply({ content: 'Alvo não esta em nenhum canal de voz', ephemeral: true })
    }

    //const permissions = voiceChannelAlvo.permissionsFor(interaction.user)!;
    //if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    //    return interaction.reply(
    //        "I need the permissions to join and speak in your voice channel!"
    //    );
    //}

    //voiceConnection(VoiceConnectionStatus.Ready);
    if (botSendoUsado) {
        await userService.adicionaCreditos(currentUser, 10);
        return interaction.reply("Bot tem mais o que fazer, tente mais tarde.")
    }
    botSendoUsado = true;    

    const stream = discordTTS.getVoiceStream(`po mano, vaza ai ${alvoMember.nickname}`, { lang: "pt"});
    const audio = createAudioResource(stream, { inputType: StreamType.Arbitrary, inlineVolume: true });

    let voiceConnection: VoiceConnection = joinVoiceChannel({
        channelId: voiceChannelAlvo.id,
        guildId: guild.id,
        adapterCreator: voiceChannelAlvo.guild.voiceAdapterCreator,
        debug: true,
        selfMute: false
    });

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
            c.disconnect();
            av?.disconnect();
            botSendoUsado = false;
        }, 4400, voiceConnection, alvoVoice);
    });
    await interaction.reply(`<@!${currentUser.userid}> mandou o <@!${alvo.id}> sair da chamada de voz`);
});

discordLojaCommands.set("apelido", async (currentUser: User, interaction: CommandInteraction<CacheType>) => {    
    if (!await userService.gastarCreditos(currentUser, 200)){
        return interaction.reply({
            content: 'Você não tem créditos suficientes', 
            ephemeral: true
        });
    };
    
    const alvo = interaction.options.getUser('alvo', true);
    const apelido = interaction.options.getString('apelido', true);
    const guild = interaction.guild!;


    if( apelido.length > 32) {
        await userService.adicionaCreditos(currentUser, 200);
        return interaction.reply({
            content: "Apelido muito grande. Tente novamente com um apelido menor", 
            ephemeral: true
        });
    };

    const alvoMember = (await guild?.members.fetch({ user: alvo }));

    alvoMember.setNickname(apelido, "Comando bot");

    await interaction.reply(`<@!${currentUser.userid}> mudou o apelido de <@!${alvo.id}>.`);
});

discordLojaCommands.set("castigo", async (currentUser: User, interaction: CommandInteraction<CacheType>) => {    
    if (!await userService.gastarCreditos(currentUser, 100)){
        return interaction.reply({
            content: 'Você não tem créditos suficientes', 
            ephemeral: true
        });
    };
    
    const alvo = interaction.options.getUser('alvo', true);
    const guild = interaction.guild!;

    const alvoMember = (await guild?.members.fetch({ user: alvo }));

    if (alvoMember.permissions.has("ADMINISTRATOR")) {
        await userService.adicionaCreditos(currentUser, 100);
        interaction.reply(
            "Engraçadinho... Infelizmente não é possivel dar um castigo para um adm."
        );
        return interaction.channel?.send(`Ademir <@!${alvo.id}>, olha o que o trouxa tentou fazer KKKKKKKKKKKKKK.`)
    };

    await alvoMember.timeout(5 * 60 * 1000, `${interaction.user.username} comprou na loja para o ${alvo.username}`)
        .then(console.log)
        .catch(console.error);

    await interaction.reply(`<@!${currentUser.userid}> deixou o <@!${alvo.id}> de castigo.`);
});

discordLojaCommands.set("silenciar", async (currentUser: User, interaction: CommandInteraction<CacheType>) => {    
    if (!await userService.gastarCreditos(currentUser, 250)){
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
        !await userService.adicionaCreditos(currentUser, 250);
        return await interaction.reply({content: `<@!${alvo.id}> já está mutado.` , ephemeral: true});
    }

    await alvoVoice.setMute();
    await interaction.reply(`<@!${currentUser.userid}> mutou o <@!${alvo.id}>.`);

    const voiceChannelAlvo = alvoVoice?.channel;
    if ( !voiceChannelAlvo ) {
        return
    } else {
        

        if (botSendoUsado) {
            await userService.adicionaCreditos(currentUser, 10);
            await interaction.channel?.send("Bot esta sendo usado, infelizmente nao conseguiu conectar no chat de voz.");
            return
        }
        botSendoUsado = true;  

        const stream = discordTTS.getVoiceStream(`cala a boquinha, ${alvoMember.nickname}`, { lang: "pt"});
        const audio = createAudioResource(stream, { inputType: StreamType.Arbitrary, inlineVolume: true });

        let voiceConnection: VoiceConnection = joinVoiceChannel({
            channelId: voiceChannelAlvo.id,
            guildId: guild.id,
            adapterCreator: voiceChannelAlvo.guild.voiceAdapterCreator,
            debug: true,
            selfMute: false
        });

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
            }, 4400, voiceConnection);
        });

    }
});

export default discordLojaCommands;