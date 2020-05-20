const { ApolloServer, gql } = require("apollo-server");
const { buildFederatedSchema } = require("@apollo/federation");

const typeDefs = gql`
  interface Node {
    id: ID!
  }

  extend type Query {
    me: User
    node(id: ID!): Node
  }

  extend type Review implements Node @key(fields: "id") {
    id: ID! @external
  }

  type User implements Node @key(fields: "id") {
    id: ID!
    name: String
    username: String
  }
`;

const resolvers = {
  Query: {
    me() {
      return data.User[0];
    },
    node: (_root, { id }) => {
      const [type] = id.split("-");

      const entity = data[type];
      return entity ? entity.find((u) => u.id === id) : { id };
    },
  },
  Node: {
    __resolveType: ({ id }) => {
      const [typeName] = id.split("-");
      return typeName;
    },
  },
  User: {
    __resolveReference(object) {
      return data.User.find((user) => user.id === object.id);
    },
  },
};

const server = new ApolloServer({
  schema: buildFederatedSchema([
    {
      typeDefs,
      resolvers,
    },
  ]),
});

server.listen({ port: 4001 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});

const data = {
  User: [
    {
      id: "User-1",
      name: "Ada Lovelace",
      birthDate: "1815-12-10",
      username: "@ada",
    },
    {
      id: "User-2",
      name: "Alan Turing",
      birthDate: "1912-06-23",
      username: "@complete",
    },
  ],
};
