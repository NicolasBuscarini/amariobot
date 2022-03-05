import { Entity, Property } from "@mikro-orm/core";
import { BaseEntity } from "./base.model";

@Entity()
export class User extends BaseEntity {

  @Property()
  userid: string;

  @Property({ nullable: false })
  credits: number;

  @Property({ nullable: false })
  daily: number;

  @Property({ nullable: false })
  protect: boolean;

  // @OneToMany(() => Book, b => b.author, { cascade: [Cascade.ALL] })
  // books = new Collection<Book>(this);

  // @ManyToOne(() => Book, { nullable: true })
  // favouriteBook?: Book;

  constructor(userid: string, credits: number = 0, daily = 0, protect = false) {
    super();
    this.daily = daily;
    this.userid = userid;
		this.credits = credits;
    this.protect = protect;
  }

}