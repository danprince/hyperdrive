var Component = Hyperdrive.Component;

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
    this.setState(count => count + 1);
  },

  dec: function() {
    this.setState(count => count - 1);
  }
});

var Todos = Component({
  state: ['hello'],
  render: function(props) {
    return (
      ['div.todos', null,
        [List, this.state],
        [TodoEntry, {onAdd: this.addTodo}]]
    );
  },
  addTodo: function(todo) {
    this.setState(todos => todos.concat([todo]));
  }
});

function List(list) {
  return ['ul', null, ...list.map(todo => ['li', null, todo])];
}

var TodoEntry = Component({
  state: '',
  render() {
    return (
      ['div', null,
        ['input', {type: 'text', oninput: this.change}],
        ['button', {onclick: this.add}, 'Add']]
    );
  },
  add: function() {
    this.props.onAdd(this.state);
  },
  change: function(e) {
    this.setState(text => e.target.value);
  }
});

var TempConverter = Component({
  state: 0,
  render() {
    return (
      ['div', null,
        ['input', {type: 'text', oninput: this.convert}],
        ['span', null, 'C'],
        ['br', null, '='],
        ['input', {type: 'text', value: this.state}],
        ['span', null, 'F']]
    );
  },
  convert(e) {
    let c = Number(e.target.value) || 0;
    this.setState(f => c * (9 / 5) + 32);
  }
});

var StyledComponent = Component({
  render() {
    return (
      ['p', { style: { color: 'red' } }, 'Hello']
    );
  }
});

var Router = Component({
  state: 'default',
  render(props) {
    return this.props[this.state];
  },
  change() {
    var path = document.location.hash.slice(1);
    if (path in this.props) {
      this.setState(_ => path);
    } else {
      this.setState(_ => 'missing');
    }
  },
  mount() {
    window.addEventListener('hashchange', this.change);
  }
});

function color(name) {
  return { style: { color: name } };
}

function Nav() {
  return (
    ['div', null,
      ['nav', null,
        ['a', {href: '#green'}, 'Green'],
        ['a', {href: '#yellow'}, 'Yellow'],
        ['a', {href: '#blue'}, 'Blue']]]
  );
}

var Timer = Component({
  state: {
    count: 0,
    running: false
  },
  render(props) {
    return (
      ['div', null,
        ['button', {onclick: this.toggle}, this.state.running ? 'stop' : 'start'],
        ['button', {onclick: this.reset}, 'reset'],
        ['span', null, 'timer:'],
        ['span', null, this.state.count]]
    );
  },
  toggle() {
    this.setState({ running: !this.state.running });
  },
  reset() {
    this.setState({ count: 0 });
  },
  tick() {
    if (this.state.running) {
      this.setState({
        count: this.state.count + 1
      });
    }
  },
  mount() {
    setInterval(this.tick, 15);
  }
});

var TodoStore = Store({
  todos: [
    'yo'
  ],
  addTodo: function(name) {
    this.todos.push(name);
  }
});

var StoreTodos = connect(TodoStore, ({ todos, addTodo }) =>
  ['div.todos', null,
    [List, todos],
    [TodoEntry, {onAdd: addTodo}]]
);

var Reverser = Component({
  state: '',
  render() {
    return (
      ['div', null,
        ['input', { type: 'text', oninput: this.update }],
        ['span', null, 'reverser'],
        ['input', { type: 'text', value: this.reverse() }]]
    );
  },
  update(e) {
    this.setState(str => e.target.value);
  },
  reverse() {
    return this.state.split('').reverse().join('');
  }
});

var Examples = (
  ['div', null,
    ['h2', null, 'Counters'],
    [Counter],
    ['h2', null, 'TodoList'],
    [Todos],
    ['h2', null, 'Store Powered TodoList'],
    [StoreTodos],
    ['h2', null, 'Temperature'],
    [TempConverter],
    ['h2', null, 'Styled Component'],
    [StyledComponent],
    ['h2', null, 'Timer'],
    [Timer],
    ['h2', null, 'Reverser'],
    [Reverser],
    ['h2', null, 'Router'],
    [Nav],
    [Router, {
      'default': ['h1', color('red'), 'Default'],
      'green': ['h1', color('green'), 'Green'],
      'yellow': ['h1', color('yellow'), 'Yellow'],
      'blue': ['h1', color('blue'), 'Blue']
    }]
  ]
);

Hyperdrive.render(
  Examples,
  document.getElementById('root')
);
