function Component(component) {
  return function (props, children) {
    props = props || {};

    props.transact = function(func) {
      var newState = func(props.state);
      props.state = newState;
      var element = component.render(props, children);
      var newNode = $element(element);

      node.parentNode.replaceChild(newNode, node);
      node = newNode;
    };

    props.state = component.state;

    var element = component.render(props, children);
    var node = $element(element);

    return [node];
  }
}

function $element(element) {

  // if the element is not an array then we're probably rendering
  // a child, so assume it has a toString and render it as a text node
  if (!(element instanceof Array)) {
    return document.createTextNode(element);
  }

  var tag = element[0];
  var props = element[1];
  var children = element.slice(2);

  if (tag instanceof HTMLElement) {
    return tag;
  }

  // rendering a "component"
  if (typeof tag === 'function') {
    var element = tag(props, children);
    return $element(element);
  }

  var parsed = parseTag(tag);
  var component = parsed.component;
  var classes = parsed.classes;
  var node = document.createElement(component);

  if (classes.length > 0) {
    props = props || {};
    props['class'] = props['class'] || '';
    props['class'] += classes.join(' ');
  }

  if (props) {
    for (var key in props) {
      if (key.slice(0, 2) == 'on') {
        node[key] = props[key];
      } else {
        node.setAttribute(key, props[key]);
      }
    }
  }

  if (children) {
    children.forEach(function(child) {
      var childNode = $element(child);
      node.appendChild(childNode);
    });
  }

  return node;
}

// utils

function parseTag(tag) {
  if (typeof tag === 'string') {
    var splits = tag.split('.');
    var component = splits[0];
    var classes = splits.slice(1);

    return {
      component: component,
      classes: classes
    };
  }

  return {
    component: tag,
    classes: []
  };
}

// events

var listeners = {
  '*': []
};

function on(type, func) {
  listeners[type] = listeners[type] || [];
  listeners[type].push(func);

  return function off() {
    var index = listeners[type].indexOf(func);
    listeners[type].splice(index, 1);
  }
}

function emit(type, message) {
  var listening = listeners[type] || [];

  listeners['*'].concat(listening).forEach(function(func) {
    func(message);
  });
}

// render

function render(element, parent) {
  var node = $element(element);

  if (parent.children.length > 0) {
    parent.innerHTML = '';
  }

  parent.appendChild(node);
}

// make mint jsx compatible
function jsx(element, props, children) {
  return [element, props].concat(children);
}

