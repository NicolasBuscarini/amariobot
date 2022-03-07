import { CacheType, CommandInteraction, MessageEmbed } from "discord.js";
import { User } from "../models/user.model";
import { userService } from "../services/user.service";
import blackjack from "discord-blackjack";

const discordJogosCommands = new Map<string, any>();

discordJogosCommands.set("blackjack", async (currentUser: User, interaction: CommandInteraction<CacheType>) => {
    
    let embed = {
        title: "A very pro blackjack game",
        color: "RANDOM",
        fields: [
            {name: `${interaction.user.username}'s hand`, value: "" },
            {name: `Dealer's Hand`, value: "" }
        ],
        footer: { text: "Type E to end the game. This bot is so pro so go support us..." }
    }
        

    let game = await blackjack(interaction);

    switch (game.result) {
            
        case "WIN":
            const embed = new MessageEmbed()
                .setTitle("Você venceu!")
                .setDescription(`You have a total of ${game.yvalue} points!`);

            interaction.channel?.send(`${embed}`)
            break;
        case "LOSE":
            interaction.channel?.send("You're a disgrace to us...")
        
    }

});

export default discordJogosCommands;