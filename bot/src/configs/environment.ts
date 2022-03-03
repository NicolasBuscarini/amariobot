export const AppConfig = {
	TOKEN: process.env.DISCORD_TOKEN ?? "OTQ4MjIzNTg3MjY4MDQ2ODQ5.Yh4sCA.C2Mrd72RNv5pkbDThy62VUFkoJ4",
	CLIENT_ID: process.env.DISCORD_CLIENT_ID ?? "948223587268046849",
	GUILD_ID: process.env.DISCORD_GUILD_ID ?? "705513409814331462",

	MONGO_DB_HOST: "mongodb://" + (process.env.MONGO_DB_HOST ?? "localhost"),
	MONGO_DB_NAME: process.env.MONGO_DB_NAME ?? "armario",
	MONGO_DB_USERNAME: process.env.MONGO_DB_USERNAME ?? "root",
	MONGO_DB_PASSWORD: process.env.MONGO_DB_PASSWORD ?? "root"
}