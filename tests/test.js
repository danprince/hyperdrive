var Component = Hyperdrive.Component;
var render = Hyperdrive.render;
var createElement = Hyperdrive.createElement;

function assert(message, condition) {
  if (!condition) throw new Error(message);
}

function fail(message) {
  throw new Error(message);
}

function equal(message, a, b) {
  if (a == b) return;
  var err = new Error(message);
  err.printer = function() {
    console.log(a, 'is not equal to', b);
  };
  throw err;
}

function deepEqual(message, a, b) {
  if (JSON.stringify(a) == JSON.stringify(b)) return;
  var err = new Error(message);

  err.printer = function() {
    console.log('Not deep equal!');
    console.log(a);
    console.log(b);
  };

  throw err;
}

function nodeEqual(message, a, b) {
  if (a.isEqualNode(b)) return;
  var err = new Error(message);

  err.printer = function() {
    console.log('Not equal nodes');
    console.log(a);
    console.log(b);
  };

  throw err;
}

function test(name, func) {
  console.group(name);

  try {
    func();
    console.log('%c\u2714 Tests passing!', 'color: green');
  } catch(err) {
    console.log('%c\u2718 Test failed!', 'color: red');
    if (err.printer) err.printer();
    throw err;
  }

  console.groupEnd(name);
}

test('parseTag', function() {
  deepEqual(
    'should parse single tag name',
    Hyperdrive.parseTag('div'),
    { name: 'div', classes: [] }
  );

  deepEqual(
    'should parse class name from string',
    Hyperdrive.parseTag('div.test'),
    { name: 'div', classes: ['test'] }
  );

  deepEqual(
    'should parse multiple class names from string',
    Hyperdrive.parseTag('div.test.foo.bar'),
    { name: 'div', classes: ['test', 'foo', 'bar'] }
  );

  deepEqual(
    'should ignore non-string tags',
    Hyperdrive.parseTag(null),
    { name: null, classes: [] }
  );
});

test('createElement', function() {
  nodeEqual(
    'should render basic elements',
    createElement(['div']),
    document.createElement('div')
  );

  var div = document.createElement('div');
  div.setAttribute('id', 'foo');
  nodeEqual(
    'should render elements with attributes',
    createElement(['div', { id: 'foo' }]),
    div
  );

  var form = document.createElement('form');
  form.appendChild(document.createElement('button'));
  nodeEqual(
    'should render elements with children',
    createElement(['form', null, ['button']]),
    form
  );

  var p = document.createElement('p');
  p.setAttribute('class', 'content');
  nodeEqual(
    'should render elements with class shorthand',
    createElement(['p.content', null]),
    p
  );

  nodeEqual(
    'should render non-arrays as text nodes',
    createElement('hello'),
    document.createTextNode('hello')
  );

  var span = document.createElement('span');
  nodeEqual(
    'should return element if it is already a HTMLElement',
    createElement([span]),
    span
  );

  function todo() {
    return ['div.todo', { id: 'foo' }];
  }

  var div = document.createElement('div');
  div.setAttribute('class', 'todo');
  div.setAttribute('id', 'foo');

  nodeEqual(
    'should render component functions',
    createElement([todo]),
    div
  );

  function button(color) {
    return ['button', { class: 'btn-' + color }];
  }

  var btn = document.createElement('button');
  btn.setAttribute('class', 'btn-blue');

  nodeEqual(
    'should render component functions with args',
    createElement([button, 'blue']),
    btn
  );

  var clicked = false;
  var btn = createElement(['button', {
    onclick: function(event) { clicked = true; }
  }]);

  btn.click();

  equal(
    'should support onverb events',
    clicked,
    true
  );
});

test('render', function() {
  var parent = document.createElement('div');
  parent.appendChild(document.createElement('span'));

  var target = document.createElement('div');
  render(['span'], target);

  nodeEqual(
    'should render into node',
    target,
    parent
  );

  var dirtyParent = document.createElement('div');
  dirtyParent.appendChild(document.createElement('span'));

  var parent = document.createElement('div');
  parent.appendChild(document.createElement('button'));

  var target = document.createElement('div');
  render(['button'], target);

  nodeEqual(
    'should clean up if parent already has child',
    target,
    parent
  );
});

test('Component', function() {
  var Counter = Component({
    state: 0,

    render: function(props) {
      return ['button', { id: 'button', onclick: this.increment }, this.state];
    },

    increment: function() {
      this.setState(count => count + 1);
    }
  });

  var container = document.createElement('div');

  render(
    [Counter],
    container
  );

  var counter = container.children[0];

  equal(
    'should show initial state value',
    counter.innerText,
    '0'
  );

  counter.click();

  var counter = container.children[0];

  equal(
    'should have incremented on click',
    counter.innerText,
    '1'
  );
});

test('Patching', function() {
  var Counter = Component({
    state: 0,

    render: function(props) {
      return (
        ['div', null,
          ['button', { id: 'button', onclick: this.increment }, '+'],
          ['span', null, this.state]]
      );
    },

    increment: function() {
      this.setState(count => count + 1);
    }
  });

  var container = document.createElement('div');

  render(
    [Counter],
    container
  );

  var div = container.children[0];
  var button = div.children[0];
  var span = div.children[1];

  button.click();

  var newDiv = container.children[0];
  var newButton = div.children[0];
  var newSpan = div.children[1];

  assert(
    'outer div should have been reused',
    div.isSameNode(newDiv)
  );

  assert(
    'button should have been reused',
    button.isSameNode(newButton)
  );

  assert(
    'span should have been reused',
    span.isSameNode(newSpan)
  );

  equal(
    'text should have been updated',
    '1',
    span.innerText
  );
})

