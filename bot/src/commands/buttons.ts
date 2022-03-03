import { CacheType, CommandInteraction, Interaction } from "discord.js";
import { User } from "../models/user.model";
import { userService } from "../services/user.service";
const { MessageEmbed } = require('discord.js');

const buttonsCommands = new Map<String, any>();

buttonsCommands.set("comprar1", async (currentUser: User, interaction: CommandInteraction<CacheType>) => {

    interaction.reply("comprou!")
});


buttonsCommands.set("comprar2", async (currentUser: User, interaction: CommandInteraction<CacheType>) => {

});



export default buttonsCommands;