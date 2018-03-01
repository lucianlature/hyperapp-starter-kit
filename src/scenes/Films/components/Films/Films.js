import { h } from 'hyperapp';
import cc from 'classcat';
import Film from '../Film/Film';
// import { More } from './more';
// import classnames from 'classnames';

export default ({
  films,
  actions,
  page,
  loading,
}) => {
  // const limit = 30;
  // const max = page * limit;
  // const min = max - limit;
  // const sliced = ids.slice(min, max);

  const onCreate = () => {
    if (!loading) {
      actions.fetch();
    }
  };

  return (
        <main oncreate={onCreate} class='uk-container'>
            <div>
                <ul>
                    {
                        films.map((id, i) =>
                            <Film index={i} film={films[i].node} page={page} actions={actions} />)
                    }
                </ul>
            </div>
            {/* {!loading &&
                sliced.length === limit &&
            <More page={page} actions={actions} type={type} /> */}

            {loading && <div class="loader">Loading&hellip;</div>}
        </main>
  );
};
