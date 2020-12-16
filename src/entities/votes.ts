import { Field, Int, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Posts } from './posts';
@ObjectType()
@Entity('votes')
export class Votes extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  type: string;

  @Field(() => Posts)
  @ManyToOne(() => Posts, (post) => post.votes, { onDelete: 'CASCADE' })
  posts: Posts;
}
