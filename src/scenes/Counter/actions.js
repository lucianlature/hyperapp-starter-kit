const add = ({ num }) => ({ num: num + 1 });
const sub = ({ num }) => ({ num: num - 1 });

export default {
  add: (/* ev */) => add,
  sub: (/* ev */) => sub
};
