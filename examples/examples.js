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

var Todos = Component({
  state: ['hello'],
  render: function(props) {
    return (
      ['div.todos', null,
        [List, this.state],
        [AddTodo, {onAdd: this.addTodo}]]
    );
  },
  addTodo: function(todo) {
    this.transact(todos => todos.concat([todo]));
  }
});

function List(list) {
  return (
    ['ul', null, ...list.map(todo => ['li', null, todo])]
  );
}

var AddTodo = Component({
  state: '',
  render() {
    return (
      ['div', null,
        ['input', {type: 'text', onchange: this.change}],
        ['button', {onclick: this.add}, 'Add']]
    );
  },
  add: function() {
    this.props.onAdd(this.state);
  },
  change: function(e) {
    this.transact(text => e.target.value);
  }
});

var TempConverter = Component({
  state: 0,
  render() {
    return (
      ['div', null,
        ['input', {type: 'text', onchange: this.convert}],
        ['span', null, 'C'],
        ['br', null, '='],
        ['input', null, {type: 'text', value: this.state}],
        ['span', null, 'F']]
    );
  },
  convert(e) {
    let c = Number(e.target.value);
    console.log(c);
    this.transact(f => c * (9 / 5) + 32);
  }
});

var Examples = (
  ['div', null,
    ['h2', null, 'Counters'],
    [Counter],
    ['h2', null, 'TodoList'],
    [Todos],
    ['h2', null, 'Temperature'],
    [TempConverter]
  ]
);

render(
  Examples,
  document.getElementById('root')
);
