import { CacheType, CommandInteraction } from "discord.js";
import { User } from "../models/user.model";
import { userService } from "../services/user.service";

const discordCommands = new Map<String, any>();

discordCommands.set("hilorena", async (interaction: CommandInteraction<CacheType>) => {
	interaction.reply("Teu cu filhão");
});

discordCommands.set("cudecachorro", async (interaction: CommandInteraction<CacheType>) => {
	await interaction.user.send("ele caga ele caga");
});

discordCommands.set("saveuser", async (interaction: CommandInteraction<CacheType>) => {
	const username = interaction.options.getString("username");

	if (username === null)
		return await interaction.reply("Coloque um username");
	
	await userService.signUp(new User(username));
	await interaction.reply("user criado");
});

discordCommands.set("getuser", async (interaction: CommandInteraction<CacheType>) => {
	const username = interaction.options.getString("username");

	if (username === null)
		return await interaction.reply("Coloque um username");
	
	const user = await userService.getUserByUsername(username);

	if (user === null)
		return await interaction.reply("Usuário não encontrado");
	
	await interaction.reply(JSON.stringify(user));
});

export default discordCommands;