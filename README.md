# Hyperdrive

Declarative UI library for people who like to live dangerously.

```js
// stateful components

import { Component } from 'hyperdrive';

let Counter = Component({
  state: 0,
  render() {
    return (
      ['div.counter', null,
        ['span', { style: this.color() }, this.state],
        ['button', { onclick: this.inc }, '+']]
    );
  },
  inc() {
    this.setState(n => n + 1);
  },
  color() {
    return {
      color: this.state > 10 ? 'red' : 'green'
    }
  }
});

// stateless components

function Button(props) {
  return [
    'button',
    {
      style: props.style || {},
      class: 'btn btn-primary',
      onclick: props.onclick
    },
    props.text
  ];
}
```


