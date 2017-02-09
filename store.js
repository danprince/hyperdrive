(function(global) {
  'use strict';

  function Store(store) {
    var subscribers = [];

    for (var key in store) {
      if (typeof store[key] === 'function') {
        var method = store[key];

        store[key] = function storeUpdate() {
          var result = method.apply(store, arguments);
          notify();
          return result;
        };
      }
    }

    function notify() {
      subscribers.forEach(function(func) {
        func(store);
      });
    }

    function subscribe(func) {
      subscribers.push(func);
    }

    store.subscribe = subscribe;

    return store;
  }

  function connect(store, component) {
    return Component({
      state: store,
      mount: function() {
        store.subscribe(this.setState);
      },
      render: function() {
        var props = Object.assign({}, this.state, this.props);
        return [component, props];
      }
    });
  }

  if (typeof module === 'object') {
    module.exports = {
      Store: Store,
      connect: connect
    };
  } else {
    global.Store = Store;
    global.connect = connect;
  }
})(this);

