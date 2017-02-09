(function(global) {
  'use strict';

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
      var component = tag(props, children);
      return createElement(component);
    }

    var parsed = parseTag(tag);
    var node = document.createElement(parsed.name);
    var classes = parsed.classes;

    if (classes.length > 0) {
      props = props || {};
      props['class'] = props['class'] || '';
      props['class'] += classes.join(' ');
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

      if (instance.mount) instance.mount();

      return [instance.node];
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
      this.node = patch(this.node, newNode);
    }
  };

  // utils

  function asArray(list) {
    return [].slice.call(list);
  }

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
      name: tag,
      classes: []
    };
  }

  function jsx(element, props, ...children) {
    return [element, props].concat(children);
  }

  // render

  function render(element, parent) {
    var node = createElement(element);

    if (parent.childNodes.length > 0) {
      parent.innerHTML = '';
    }

    parent.appendChild(node);
  }

  // diff & patch

  function patch(nodeA, nodeB) {
    // TODO: could flatten call stacks with a stack based patch impl
    if (areNodesEqual(nodeA, nodeB)) {
      patchChildren(nodeA, nodeB);
      return nodeA;
    } else {
      nodeA.parentNode.replaceChild(nodeB, nodeA);
      return nodeB;
    }
  }

  function patchChildren(nodeA, nodeB) {
    // shallow clone node lists into arrays so that if we end up mutating
    // childNodes as part of the patch, the loop indexes won't get broken
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
    if (nodeA.nodeType !== nodeB.nodeType || nodeA.tagName !== nodeB.tagName) {
      return false;
    }

    if (nodeA.nodeType === Node.TEXT_NODE && nodeA.textContent !== nodeB.textContent) {
      return false;
    }

    if (!areAttributesEqual(nodeA, nodeB)) {
      return false;
    }

    return true;
  }

  function areAttributesEqual(nodeA, nodeB) {
    if (nodeA.attributes === nodeB.attributes) {
      return true;
    }

    if (nodeA.attributes.length !== nodeB.attributes.length) {
      return false;
    }

    for (var index = 0; index < nodeA.attributes.length; index++) {
      var attrA = nodeA.attributes[index];
      var attrB = nodeB.attributes[index];

      if (nodeB.getAttribute(attrA.nodeName) !== attrA.nodeValue ||
          nodeA.getAttribute(attrB.nodeName) !== attrB.nodeValue) {
        return false;
      }
    }

    return true;
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

