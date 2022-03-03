import { CacheType, CommandInteraction } from "discord.js";
import { User } from "../models/user.model";
import { userService } from "../services/user.service";
const { MessageEmbed } = require('discord.js');

const buttonsCommands = new Map<string, any>();

buttonsCommands.set("comprar1", async (currentUser: User, interaction: CommandInteraction<CacheType>) => {

    interaction.reply("comprou!")
});


buttonsCommands.set("comprar2", async (currentUser: User, interaction: CommandInteraction<CacheType>) => {

});



export default buttonsCommands;