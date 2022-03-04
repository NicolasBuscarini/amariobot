import { AudioPlayer, createAudioResource, entersState, getVoiceConnection, joinVoiceChannel, PlayerSubscription, StreamType, VoiceConnection, VoiceConnectionStatus } from "@discordjs/voice";
import { CacheType, User as DiscordUser, CommandInteraction, MessageActionRow, MessageEmbed, MessageSelectMenu } from "discord.js";
import { User } from "../models/user.model";
import { userService } from "../services/user.service";
import discordTTS from 'discord-tts';

const discordLojaCommands = new Map<string, any>();


discordLojaCommands.set("kickar", async (currentUser: User, interaction: CommandInteraction<CacheType>) => {
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
            //await alvoVoice?.disconnect("fulano mandou tu sair");
        }
    });

    voiceConnection.on(VoiceConnectionStatus.Ready, async () => {
        voiceConnection.setSpeaking(true);
        let audioPlayer = new AudioPlayer();
        voiceConnection.subscribe(audioPlayer);
        audioPlayer.play(audio);
        voiceConnection.dispatchAudio();
        await entersState(voiceConnection, VoiceConnectionStatus.Ready, 10_000);
        setTimeout((c) => c.disconnect(), 3000, voiceConnection);
    });
    await interaction.reply('deu certo ai');

});



export default discordLojaCommands;