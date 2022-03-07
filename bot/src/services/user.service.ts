import { User } from "../models/user.model";
import { mongoDbContext as ctx } from "../context/mongo-db.context";
import { EntityRepository } from "@mikro-orm/core";
import { MongoEntityRepository } from "@mikro-orm/mongodb";
import { TextBasedChannel } from "discord.js";

class UserService {

	_userRepository?: MongoEntityRepository<User>;
	
	async userRepository(): Promise<MongoEntityRepository<User>> {
		if (this._userRepository === undefined) {
			this._userRepository = await ctx.getRepository(User);
		}

		return this._userRepository;
	}

	async signUp(user: User): Promise<User> {
		const userRepository = await this.userRepository();
		userRepository.persistAndFlush(user); // Criar instância
		return user
	}

	async getUserByUserId(userid: string): Promise<User | null> {
		const userRepository = await this.userRepository();
		try {
			return await userRepository.findOneOrFail({ userid: userid});
		} catch (e) {return null}
	}

	async getOrCreateUserByUserId(userid: string): Promise<User> {
		let user =  await this.getUserByUserId(userid);
		if (user) return user;
		await this.signUp(new User(userid));
		user = await this.getUserByUserId(userid);
		return user!
	}

	async adicionaCreditos(user: User, creditos: number) {
		const userRepository = await this.userRepository();
		user.credits += creditos;
		if(user.credits < 0 )
			user.credits = 0;

		await userRepository.persistAndFlush(user);
	}

	async gastarCreditos(user: User, creditos: number) : Promise<boolean>{
		if (user.credits < creditos) {
			return false;
		}
		await this.adicionaCreditos(user, -creditos);
		return true;
		
	}

	async getLevelExp(level: number) {
		return 2 ** level;
	}

	async getLevelByExp(exp: number) {
		let level = 1;
		let i = 0;
		while (1) {
			i++;
			if (exp / (2 ** i) < 1) {
				break;
			}
	  
			level++;
		}
		return level;
	}

	async getExpToNextLevel(exp: number,) {
		const level = await this.getLevelByExp(exp)
		const expNextLevel = await this.getLevelExp(level);
		
		return expNextLevel - exp;
	}

	async getExpToPreviousLevel(exp: number,) {
		const level = await this.getLevelByExp(exp)
		const expNextLevel = await this.getLevelExp(level -1);
		
		return expNextLevel - exp;
	}

	async ganharXp(user: User, xp: number, channel: TextBasedChannel){
		const userRepository = await this.userRepository();

		const oldLevel = await this.getLevelByExp(user.exp);
		user.exp += xp;
		const newLevel = await this.getLevelByExp(user.exp);

		await userRepository.persistAndFlush(user);

		if (oldLevel != newLevel ) {
			channel.send(`Parabéns! Você subiu para o level *${newLevel}*`)
		}
	}

	async updateUser(user: User, partialUser: Partial<User>) {
		const userRepository = await this.userRepository();
		for (let key of Object.keys(partialUser)) {
			if ((partialUser as any)[key]!== undefined) {
				(user as any)[key] = (partialUser as any)[key];
			}
		}
		await userRepository.persistAndFlush(user);
	}
}

export const userService = new UserService();