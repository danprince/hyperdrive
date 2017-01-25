var Counter = Component({
  state: 0,
  render: function(props) {
    return (
      ['div', null,
        ['button', { onclick: this.dec }, '-'],
        ['span', null, this.state],
        ['button', { onclick: this.inc }, '+']]
    );
  },

  inc: function() {
    this.transact(count => count + 1);
  },

  dec: function() {
    this.transact(count => count - 1);
  }
});

render(
  [Counter],
  document.getElementById('root')
);
