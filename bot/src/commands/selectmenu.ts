import { SelectMenuComponent, SelectMenuOption } from "@discordjs/builders";
import { ButtonInteraction, CacheType, CommandInteraction , MessageEmbed, SelectMenuInteraction, User as DiscordUser} from "discord.js";
import { User } from "../models/user.model";
import { userService } from "../services/user.service";

const selectMenuCommands = new Map<string, any>();


selectMenuCommands.set("select", async (currentUser: User, interaction: SelectMenuInteraction<CacheType>) => {
    interaction.reply("teste")
    console.log(interaction.component);

});

export default selectMenuCommands;