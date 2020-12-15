import { Field, Int, ObjectType } from 'type-graphql';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@ObjectType()
@Entity('posts')
export class Posts extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  description: string;

  @Field()
  @Column()
  photoPath: string;

  @Field()
  @Column()
  username: string;

  @Field()
  @Column({ default: 0 })
  votes: number;
}
