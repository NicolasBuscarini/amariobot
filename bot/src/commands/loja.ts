import { AudioPlayer, createAudioResource, entersState, getVoiceConnection, joinVoiceChannel, StreamType, VoiceConnection, VoiceConnectionStatus } from "@discordjs/voice";
import { CacheType, User as DiscordUser, CommandInteraction , MessageActionRow, MessageEmbed, MessageSelectMenu} from "discord.js";
import { User } from "../models/user.model";
import { userService } from "../services/user.service";
import dicordtts from 'discord-tts';

const discordLojaCommands = new Map<string, any>();


discordLojaCommands.set("kickar", async (currentUser: User, interaction: CommandInteraction<CacheType>) => {
    const alvo = interaction.options.getUser('alvo')!;
    const guild = interaction.guild!;

    const guildMemberAlvo = (await guild?.members.fetch({user: alvo}));
    const alvoVoice = guildMemberAlvo?.voice;
    const voiceChannelAlvo = alvoVoice?.channel;

    if (!voiceChannelAlvo) {
        return interaction.reply({ content: 'Alvo não esta em nenhum canal de voz', ephemeral: true})
    }

    //await alvoVoice?.disconnect("fulano mandou tu sair");

    //voiceConnection(VoiceConnectionStatus.Ready);
    
    const stream = dicordtts.getVoiceStream("VAZAAAAAA");
    const audio = createAudioResource(stream, { inputType: StreamType.Arbitrary, inlineVolume: true });

    let voiceConnection : VoiceConnection = joinVoiceChannel({ channelId : voiceChannelAlvo.id, 
    guildId: guild.id, 
    adapterCreator: voiceChannelAlvo.guild.voiceAdapterCreator});
    //voiceConnection = await entersState(voiceConnection, VoiceConnectionStatus.Ready, 5_000);

    console.log(voiceConnection.state);

    if(voiceConnection.state.status  === VoiceConnectionStatus.Ready){
        console.log("ENTROU NO IF;");
        
    } 

    setTimeout((c, a ) => {
        try{
            let audioPlayer = new AudioPlayer();
            console.log("settimeout");
            c.subscribe(audioPlayer);
            audioPlayer.play(a);
        } catch( e ) {console.log(e)}
        
    }, 3000, voiceConnection, audio);

    setTimeout((c ) => c.destroy(), 8000, voiceConnection);
    await interaction.reply('deu certo ai');

});



export default discordLojaCommands;