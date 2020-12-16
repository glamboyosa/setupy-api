import { Arg, Mutation, Query, Resolver } from 'type-graphql';
import { getRepository } from 'typeorm';
import { Posts } from '../entities/posts';
import { Votes } from '../entities/votes';
@Resolver()
export class VotesResolver {
  postsRepository = getRepository(Posts);
  votesRepository = getRepository(Votes);
  @Mutation(() => Boolean, { nullable: true })
  async CreateVotes(
    @Arg('postsId') postsId: number,
    @Arg('type') type: 'upvote' | 'downvote'
  ) {
    try {
      const post = await this.postsRepository.findOne(
        { id: postsId },
        { relations: ['votes'] }
      );
      if (!post) {
        return null;
      }
      const vote = await this.votesRepository.create({
        type,
        posts: post,
      });
      const savedVote = await this.votesRepository.save(vote);
      post.votes = [...post.votes, savedVote];
      await this.postsRepository.save(post);
    } catch (e) {
      return null;
    }
    return true;
  }
}
