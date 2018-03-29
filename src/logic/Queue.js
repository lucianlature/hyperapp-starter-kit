class Queue {
  constructor() {
    this.in = [];
    this.out = [];
    this.length = 0;
  }

  /*
   * Enqueue all elements of a list in order. Equivalent to
   *   list.forEach(queue.enqueue.bind(queue));
   */
  enqueueAll(list) {
    this.in = this.in.concat(list);
    this.length += list.length;
  }

  enqueue(item) {
    this.in.push(item);
    this.length += 1;
  }

  dequeue() {
    if (this.out.length) {
      this.length--;
      return this.out.pop();
    } else if (this.in.length) {
      this.out = this.in.reverse();
      this.in = [];
      this.length -= 1;
      return this.out.pop();
    } else {
      return undefined;
    }
  }

  empty() {
    this.out = [];
    this.in = [];
    this.length = 0;
  }

  toArray() {
    const res = [];
    res = res.concat(this.out);
    res.reverse();
    res = res.concat(this.in);
    return res;
  }

  toString() {
    return this.toArray().toString();
  }
}

export default Queue;
