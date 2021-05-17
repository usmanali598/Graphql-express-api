const express = require("express");
const { graphqlHTTP } = require('express-graphql');
const { GraphQLSchema, GraphQLObjectType, GraphQLList, GraphQLInt, GraphQLString, graphql } = require("graphql");
const users = [
    {id:1, name:'Microsoft', age:"40"},
    {id:2, name:'Amazon', age:"41"},
    {id:3, name:'Apple', age:"42"},
    {id:4, name:'Google', age:"43"},
]

const UserType = new GraphQLObjectType({
    name: 'query',
    description:'user info',
    fields:{
        id: {
            type: GraphQLInt
        },
        name: {
            type: GraphQLString
        },
        age: {
            type: GraphQLString
        }
    }
})
const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
    name: "User",
    description: "Users Info",
    fields: () => ({
        // list of users
        users: {
            type: new GraphQLList(UserType),
            resolve: (parent, args) => {
                return users;
            }
        },
        // we don't need list just need one user
        user: {
            type: UserType,
            args: {
                id:{
                type:GraphQLInt,
            },
        },
        // destructuring args id
            resolve: (parent, {id}) => {
                // we filter the users and return each user as a new array that is equal to args id
                const user = users.filter(user => user.id == id);
                // return new array's first element 
                return user[0];
            }
        }
    })
    })
});

const app = express();

app.use("/graphql", graphqlHTTP({
    schema,
    graphiql:true
}));

app.get("/", (req, res) => {
    const query = `query{users{id name age}}`
    // graphql returns a promise that we can then send to client(browser),
    // Not necessary to pass second param as {users{id, name, age}}. it can work even without this param
    graphql(schema, "{users{id, name, age}}", query).then(response => res.send(response)).catch(err => res.send(err));
})

app.get("/:id", (req, res) => {
    // we can create query what values we want, can separate fields by space or commas
    const query = `query{user(id:${req.params.id}){id, name, age}}`
    graphql(schema, query).then(response => res.send(response)).catch(err => res.send(err));
})

app.listen(3000, ()=>console.log('Running at localhost:3000'));