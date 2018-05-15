const add = ({ num }) => ({ num: num + 1 });
const sub = ({ num }) => ({ num: num - 1 });

export default {
  add: /* event (e) */ () => add,
  sub: /* event (e) */ () => sub,
  cah: ({ amount, update }) => update(({ num }) => ({ num: num + amount }))()
};
