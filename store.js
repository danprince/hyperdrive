(function(global) {
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

    store.subscribe = function subscribe(func) {
      subscribers.push(func);
    };

    return store;
  }

  function connect(store, component) {
    return Component({
      state: store,
      mount: function() {
        this.unsubscribe = store.subscribe(this.setState);
      },
      unmount: function() {
        this.unsubscribe();
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

