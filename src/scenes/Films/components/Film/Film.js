import { h } from 'hyperapp';

export default ({
  actions,
  // page,
  film,
  index,
}) => {
//   const onClick = (e) => {
//     e.preventDefault();
//     actions.router.go(`/item/${film.id}`);
//     window.scrollTo(0, 0);
//   };

  return (
    <li>
        <span class="index">
            {index}
        </span>
        <br />
        <span class="title">
            {`title: ${film.title}`}
        </span>
        <span class="by">
            by: {film.director}
        </span>
    </li>
  );
};
