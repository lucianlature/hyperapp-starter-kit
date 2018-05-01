import { action } from '@hyperapp/fx';
import gql from 'graphql-tag';

export default {
  set: state => state,
  getFilms: () => [
    'graphQLQuery',
    {
      action: 'setFilms',
      query: gql`
        query getAllFilms {
          allFilms {
            totalCount
            edges {
              node {
                title
                director
                releaseDate
              }
            }
          }
        }
      `
    }
  ],
  fetch: () => [action('set', { loading: true }), action('getFilms'), action('set', { loading: false })],
  setFilms: ({ loading, data }) => ({
    films: data.allFilms.edges,
    loading
  })
};
