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

test('Component', function() {
  fail('Not tested');
});

test('parseTag', function() {
  deepEqual(
    'should parse single tag name',
    parseTag('div'),
    { component: 'div', classes: [] }
  );

  deepEqual(
    'should parse class name from string',
    parseTag('div.test'),
    { component: 'div', classes: ['test'] }
  );

  deepEqual(
    'should parse multiple class names from string',
    parseTag('div.test.foo.bar'),
    { component: 'div', classes: ['test', 'foo', 'bar'] }
  );

  deepEqual(
    'should ignore non-string tags',
    parseTag(null),
    { component: null, classes: [] }
  );
});

test('$element', function() {
  nodeEqual(
    'should render basic elements',
    $element(['div']),
    document.createElement('div')
  );

  var div = document.createElement('div');
  div.setAttribute('id', 'foo');
  nodeEqual(
    'should render elements with attributes',
    $element(['div', { id: 'foo' }]),
    div
  );

  var form = document.createElement('form');
  form.appendChild(document.createElement('button'));
  nodeEqual(
    'should render elements with children',
    $element(['form', null, ['button']]),
    form
  );

  var p = document.createElement('p');
  p.setAttribute('class', 'content');
  nodeEqual(
    'should render elements with class shorthand',
    $element(['p.content', null]),
    p
  );

  nodeEqual(
    'should render non-arrays as text nodes',
    $element('hello'),
    document.createTextNode('hello')
  );

  var span = document.createElement('span');
  nodeEqual(
    'should return element if it is already a HTMLElement',
    $element([span]),
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
    $element([todo]),
    div
  );

  function button(color) {
    return ['button', { class: 'btn-' + color }];
  }

  var btn = document.createElement('button');
  btn.setAttribute('class', 'btn-blue');

  nodeEqual(
    'should render component functions with args',
    $element([button, 'blue']),
    btn
  );

  var clicked = false;
  var btn = $element(['button', {
    onclick: function(event) { clicked = true; }
  }]);

  btn.click();

  equal(
    'should support onverb events',
    clicked,
    true
  );
});

test('events', function() {
  var flag = true;

  function surrender() {
    flag = false;
  }

  var off = on('surrender', surrender);

  deepEqual(
    'should add event listener',
    listeners['surrender'],
    [surrender]
  );

  emit('surrender');

  equal(
    'should run event listener',
    flag,
    false
  );

  off();

  deepEqual(
    'should remove event listener',
    listeners['surrender'],
    []
  );
});

test('wildcards', function() {
  var flag = true;

  function surrender() {
    flag = false;
  }

  var off = on('*', surrender);

  deepEqual(
    'should add wildcard listener',
    listeners['*'],
    [surrender]
  );

  emit('foo');

  equal(
    'should run event listener',
    flag,
    false
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

