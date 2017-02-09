(function(global) {
  'use strict';

  function Component(component) {
    var BaseComponent = Object.assign(
      component,
      Component.prototype
    );

    return function createComponent(props) {
      var instance = Object.create(BaseComponent);

      // autobinding
      for (var key in component) {
        if (typeof instance[key] === 'function') {
          instance[key] = component[key].bind(instance);
        }
      }

      instance.state = component.state;
      instance.props = props;

      var element = instance.render();
      instance.node = createElement(element);
      instance.node.backingComponent = instance;

      if (instance.mount) instance.mount();

      return [instance.node, props];
    }
  }

  Component.prototype = {
    setState: function setState(newState) {
      if (typeof newState === 'function') {
        this.state = newState(this.state);
      } else {
        Object.assign(this.state, newState);
      }

      this.forceUpdate();
    },
    forceUpdate: function forceUpdate() {
      var newElement = this.render(this.props, this);
      var newNode = createElement(newElement);
      newNode.backingComponent = this;
      this.node = patch(this.node, newNode);
    }
  };

  function createElement(element) {
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
      return createElement(element);
    }

    var parsed = parseTag(tag);
    var node = document.createElement(parsed.name);

    if (classes.length > 0) {
      props = props || {};
      props['class'] = props['class'] || '';
      props['class'] += parsed.classes.join(' ');
    }

    if (props) {
      for (var key in props) {
        if (key.slice(0, 2) == 'on') {
          node[key] = props[key];
        } else if (key === 'style') {
          Object.assign(node.style, props.style);
        } else {
          node.setAttribute(key, props[key]);
        }
      }
    }

    if (children) {
      children.forEach(function createChild(child) {
        var childNode = createElement(child);
        node.appendChild(childNode);
      });
    }

    return node;
  }

  // utils

  function parseTag(tag) {
    if (typeof tag === 'string') {
      var splits = tag.split('.');
      var name = splits[0];
      var classes = splits.slice(1);

      return {
        name: name,
        classes: classes
      };
    }

    return {
      component: tag,
      classes: []
    };
  }

  // render

  function render(element, parent) {
    var node = createElement(element);

    if (parent.children.length > 0) {
      parent.innerHTML = '';
    }

    parent.appendChild(node);
  }

  function patch(nodeA, nodeB) {
    if (areNodesEqual(nodeA, nodeB)) {
      patchChildren(nodeA, nodeB);
      return nodeA;
    } else {
      nodeA.parentNode.replaceChild(nodeB, nodeA);
      return nodeB;
    }
  }

  function patchChildren(nodeA, nodeB) {
    // shallow clone nodelists into arrays to prevent mutations to
    // childNodes from messing up loop indexes.
    var as = asArray(nodeA.childNodes);
    var bs = asArray(nodeB.childNodes);
    var length = Math.max(as.length, bs.length);

    for (var i = 0; i < length; i++) {
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

  function areNodesEqual(nodeA, nodeB) {
    var TEXT_NODE = 3;

    if (nodeA.tagName !== nodeB.tagName) {
      return false;
    }

    if (nodeA.nodeType !== nodeB.nodeType) {
      return false;
    }

    if (nodeA.nodeType === TEXT_NODE &&
        nodeB.nodeType === TEXT_NODE &&
        nodeA.textContent !== nodeB.textContent) {
      return false;
    }

    if (nodeA.attributes && nodeB.attributes) {
      if (nodeA.attributes.length !== nodeB.attributes.length) {
        return false;
      }

      if (!areAttributesEqual(nodeA, nodeB)) {
        return false;
      }
    }

    return true;
  }

  function areAttributesEqual(nodeA, nodeB) {
    for (var index = 0; index < nodeA.attributes.length; index++) {
      var attr = nodeA.attributes[index];
      if (nodeB.getAttribute(attr.nodeName) !== attr.nodeValue) {
        return false;
      }
    }

    for (var index = 0; index < nodeB.attributes.length; index++) {
      var attr = nodeB.attributes[index];
      if (nodeA.getAttribute(attr.nodeName) !== attr.nodeValue) {
        return false;
      }
    }

    return true;
  }

  function jsx(element, props, ...children) {
    return [element, props].concat(children);
  }

  function asArray(nodelist) {
    return [].slice.call(nodelist);
  }

  var Hyperdrive = {
    Component: Component,
    createElement: createElement,
    render: render,
    parseTag: parseTag,
    jsx: jsx
  };

  if (typeof module === 'object') {
    module.exports = Hyperdrive;
  } else { 
    global.Hyperdrive = Hyperdrive;
  }
})(this);

