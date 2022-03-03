import { Connection, IDatabaseDriver, MikroORM } from "@mikro-orm/core";
import { EntityRepository, MongoDriver, MongoEntityRepository } from "@mikro-orm/mongodb";
import options from '../configs/mongo.config';

class MongoDbContext {
	orm!: MikroORM<IDatabaseDriver<Connection>>;

	constructor() {
	}

	async connect() {
		console.log(`Conectando ao banco de dados com as opções:\n${JSON.stringify(options, undefined, 4)}`)

		try {
			this.orm = await MikroORM.init(options);
		} catch (e) {
			console.error(e);
		}

		console.log("Conectado ao banco de dados")
	}

	async getRepository(entity: any): Promise<MongoEntityRepository<any>> {
		if (!this.orm || !this.orm.isConnected){
			return await new Promise<MongoEntityRepository<any>>((resolve) => {
				setTimeout(async () => {
					resolve(await this.getRepository(entity));
				}, 1000);
			})
		}
		return await this.orm.em.fork().getRepository(entity) as any;
	}
}

export const mongoDbContext: MongoDbContext = new MongoDbContext();