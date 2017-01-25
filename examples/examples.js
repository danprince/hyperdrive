var Counter = Component({
  state: 0,
  render: function({ state, transact }) {
    function inc() {
      transact(count => count + 1);
    }

    function dec() {
      transact(count => count - 1);
    }

    return (
      ['div', null,
        ['button', { onclick: dec }, '-'],
        ['span', null, state],
        ['button', { onclick: inc }, '+']]
    );
  }
});

render(
  [Counter],
  document.getElementById('root')
);
