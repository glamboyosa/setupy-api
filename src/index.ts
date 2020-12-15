import { ApolloServer } from 'apollo-server-express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { config } from 'dotenv';
import express from 'express';
import 'reflect-metadata';
import { buildSchema } from 'type-graphql';
import { createConnection } from 'typeorm';
import { HelloResolver } from './resolvers/helloResolver';
import { PostsResolver } from './resolvers/postsResolver';
import { UserResolver } from './resolvers/userResolver';
import { __prod__ } from './utils/constants';
import { context } from './utils/context';
(async () => {
  const app = express();
  config();
  app.use(
    cors({
      credentials: true,
      origin: ['https://setupy.vercel.app', 'http://localhost:3000'],
    })
  );
  app.use(cookieParser());
  app.use(express.static('images'));
  await createConnection({
    type: 'postgres',
    host: __prod__ ? process.env.DB_HOST : 'localhost',
    port: 5432,
    database: process.env.DB,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    synchronize: true,
    logging: false,
    entities: ['src/entities/**/*.ts'],
    migrations: ['src/migration/**/*.ts'],
    subscribers: ['src/subscriber/**/*.ts'],
  });
  const apolloServer = new ApolloServer({
    introspection: true,
    schema: await buildSchema({
      resolvers: [HelloResolver, UserResolver, PostsResolver],
      validate: false,
    }),
    context: ({ req, res }: context) => ({ req, res }),
  });
  apolloServer.applyMiddleware({ app, cors: false });
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`started on ${port}`);
  });
})();
