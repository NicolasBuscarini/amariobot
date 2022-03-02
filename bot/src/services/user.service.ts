import { User } from "../models/user.model";
import { mongoDbContext as ctx } from "../context/mongo-db.context";
import { EntityRepository } from "@mikro-orm/core";
import { MongoEntityRepository } from "@mikro-orm/mongodb";

class UserService {

	_userRepository?: MongoEntityRepository<User>;
	
	async userRepository(): Promise<MongoEntityRepository<User>> {
		if (this._userRepository === undefined) {
			this._userRepository = await ctx.getRepository(User);
		}

		return this._userRepository;
	}

	async signUp(user: User): Promise<void> {
		const userRepository = await this.userRepository();
		userRepository.persistAndFlush(user); // Criar instância
	}

	async getUserByUsername(username: string): Promise<User | null> {
		const userRepository = await this.userRepository();
		return await userRepository.findOne({ username: username});
	}

}

export const userService = new UserService();