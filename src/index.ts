import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";

async function init() {
  const app = express();

  app.use(express.json());

  const PORT = Number(process.env.PORT) || 8000;

  // create graphql server
  const gqlserver = new ApolloServer({
    typeDefs: `
        type Query {
            hello: String,
            say(name: String): String
        }
    `,
    resolvers: {
        Query: {
            hello: ()=> "Hello form grapql server",
            say: (_ ,{name}:{name:String}) => `Hello from ${name}`  
        }
    },
  });

  await gqlserver.start();

  app.get("/", (req, res) => {
    res.json({ message: "Server is up and running" });
  });

  app.use('/graphql',expressMiddleware(gqlserver));

  app.listen(PORT, () => {
    console.log(`Server is started at PORT: ${PORT}`);
  });
}

init();
