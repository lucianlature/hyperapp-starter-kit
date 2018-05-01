import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

const client = new ApolloClient({
  link: new HttpLink({
    uri: 'http://swapi.apis.guru',
    // Additional fetch options like `credentials` or `headers`
    credentials: 'same-origin'
  }),
  cache: new InMemoryCache()
});

export default client;
