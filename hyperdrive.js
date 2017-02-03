function Component(component) {
  return function(props) {
    var instance = Object.create(component);

    // autobinding
    for (var key in component) {
      if (typeof instance[key] === 'function') {
        instance[key] = component[key].bind(instance);
      }
    }

    var element = instance.render(props, instance);
    var node = $element(element);

    instance.state = component.state;
    instance.props = props;

    instance.transact = function(func) {
      instance.state = func(instance.state);
      var element = instance.render(props, instance);
      var newNode = $element(element);

      //node.parentNode.replaceChild(newNode, node);
      //node = newNode;
      node = patch(node, newNode);
    };

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

// can be smarter about how we patch nodes if only their attributes
// have changed. Probably use a full diff algorithm which spits out
// patch objects to run later.
function patch(nodeA, nodeB) {
  if (equalNode(nodeA, nodeB)) {
    patchChildren(nodeA, nodeB);
    return nodeA;
  } else {
    nodeA.parentNode.replaceChild(nodeB, nodeA);
    return nodeB;
  }
}

function patchChildren(nodeA, nodeB) {
  var as = nodeA.childNodes;
  var bs = nodeB.childNodes;

  for (var i = 0; i < Math.max(as.length, bs.length); i++) {
    var a = as[i];
    var b = bs[i];

    if (a && b) {
      patch(a, b);
    }

    else if (a) {
      nodeA.removeChild(a);
    }

    else if (b) {
      nodeA.appendChild(b);
    }
  }
}

function equalNode(nodeA, nodeB) {
  var TEXT_NODE = 3;
  if (nodeA.tagName !== nodeB.tagName) return false;
  if (nodeA.nodeType !== nodeB.nodeType) return false;
  if (nodeA.attributes && nodeB.attributes) {
    if (nodeA.attributes.length !== nodeB.attributes.length) return false;
  }
  if (nodeA.nodeType === TEXT_NODE && nodeB.nodeType === TEXT_NODE) {
    return nodeA.textContent === nodeB.textContent;
  }
  return equalAttrs(nodeA, nodeB);
}

function equalAttrs(nodeA, nodeB) {
  for (var index = 0; index < nodeA.attributes.length; index++) {
    var attr = nodeA.attributes[index];
    if (nodeB.getAttribute(attr.nodeName) !== attr.nodeValue) {
      return false;
    }
  }
  return true;
}

// make mint jsx compatible
function jsx(element, props, ...children) {
  return [element, props].concat(children);
}

