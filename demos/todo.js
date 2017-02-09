let { Component, render } = Hyperdrive;

let TodoApp = Component({
  state: {
    todos: [
      { id: 0, name: 'Get bread', done: true },
      { id: 1, name: 'Get jam', done: false }
    ],
    hideDone: false
  },

  render() {
    let { hideDone } = this.state;
    let { addTodo, toggleTodo, toggleHide, clearDone } = this;
    let todos = this.visibleTodos();

    return (
      ['div.todo-app', null,
        ['h1.todo-app__title', null, 'Todo List'],
        [TodoList, { todos, toggleTodo }],
        [TodoEntry, { addTodo }],
        [TodoControls, { hideDone, toggleHide, clearDone }]]
    );
  },

  addTodo(todo) {
    let todos = [todo, ...this.state.todos];
    this.setState({ todos });
  },

  visibleTodos() {
    let { todos, hideDone } = this.state;

    if (hideDone) {
      return todos.filter(todo => !todo.done);
    } else {
      return todos;
    }
  },

  toggleTodo(id) {
    let todos = this.state.todos.map(todo => {
      if (todo.id === id) {
        return Object.assign({}, todo, { done: !todo.done });
      } else {
        return todo;
      }
    });

    this.setState({ todos });
  },

  toggleHide() {
    let { hideDone } = this.state;
    this.setState({ hideDone: !hideDone });
  },

  clearDone() {
    let todos = this.state.todos.filter(todo => !todo.done);
    this.setState({ todos });
  }
});

let TodoList = Component({
  render() {
    let { todos } = this.props;

    return (
      ['ol.todo-list', null, ...todos.map(this.renderTodo)]
    );
  },
  renderTodo({ id, done, name }) {
    let { toggleTodo } = this.props;
    let toggle = () => toggleTodo(id);

    return (
      ['li.todo-list__item',
        { id, onclick: toggle, 'data-done': done },
        name]
    );
  }
});

let TodoEntry = Component({
  state: '',
  render() {
    return (
      ['form.todo-entry', { onsubmit: this.addTodo },
        ['input.todo-entry__input',
          { type: 'text',
            oninput: this.update,
            placeholder: 'Enter todo' }]]
    );
  },
  addTodo(event) {
    this.props.addTodo({
      id: uid(),
      name: this.state,
      done: false
    });

    event.preventDefault();
  },
  update(event) {
    this.setState(s => event.target.value);
  }
});

function TodoControls({ clearDone, toggleHide, hideDone }) {
  return (
    ['div.todo-controls', null,
      ['a.todo-controls__control',
        { onclick: toggleHide, 'data-toggled': hideDone },
        hideDone ? 'Show' : 'Hide'],
      ['a.todo-controls__control',
        { onclick: clearDone },
        'Clear']]
  );
}

function uid() {
  return Math.random().toString(36).slice(2, 8);
}

render(
  [TodoApp],
  document.getElementById('root')
);

