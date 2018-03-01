import gql from 'graphql-tag';
import client from '../../data/apollo-client';

export default {
//   fetchIds: ({ ids, loading }, actions, type) => {
//     actions.toggleLoading();
//     return actions
//       .fetchFilms(type).catch(console.error)
//       .then(actions.toggleLoading);
//   },
  toggleLoading: () => state => ({
    loading: !state.loading,
  }),
  fetch: () => async (s, actions) => {
    actions.toggleLoading();
    const graphResponse = await client.query({
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
        `,
    });
    actions.set(graphResponse.data.allFilms);

    return actions.toggleLoading();
  },
  set: data => () => ({
    films: data.edges,
  }),
};
