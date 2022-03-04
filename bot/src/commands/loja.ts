import { AudioPlayer, createAudioResource, entersState, getVoiceConnection, joinVoiceChannel, PlayerSubscription, StreamType, VoiceConnection, VoiceConnectionStatus } from "@discordjs/voice";
import { CacheType, User as DiscordUser, CommandInteraction, MessageActionRow, MessageEmbed, MessageSelectMenu } from "discord.js";
import { User } from "../models/user.model";
import { userService } from "../services/user.service";
import discordTTS from 'discord-tts';

const discordLojaCommands = new Map<string, any>();
let botSendoUsado: boolean = false;

discordLojaCommands.set("kickar", async (currentUser: User, interaction: CommandInteraction<CacheType>) => {
    if (!await userService.gastarCreditos(currentUser, 10)){
        return interaction.reply({content: 'Você não tem créditos suficientes', ephemeral: true});
    };
    
    const alvo = interaction.options.getUser('alvo')!;
    const guild = interaction.guild!;

    const guildMemberAlvo = (await guild?.members.fetch({ user: alvo }));
    const alvoVoice = guildMemberAlvo?.voice;
    const voiceChannelAlvo = alvoVoice?.channel;

    if (!voiceChannelAlvo) {
        return interaction.reply({ content: 'Alvo não esta em nenhum canal de voz', ephemeral: true })
    }

    const permissions = voiceChannelAlvo.permissionsFor(interaction.user)!;
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        return interaction.reply(
            "I need the permissions to join and speak in your voice channel!"
        );
    }

    //voiceConnection(VoiceConnectionStatus.Ready);
    if (botSendoUsado) {
        return interaction.reply("Bot tem mais o que fazer, tente mais tarde.")
    }
    botSendoUsado = true;

    const stream = discordTTS.getVoiceStream("po mano, vaza ai", { lang: "pt"});
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
        }, 3000, voiceConnection, alvoVoice);
        

    });
    await interaction.reply(`<@!${currentUser.id}> mandou o <@!${alvo.id}> sair da chamada de voz`);

});



export default discordLojaCommands;