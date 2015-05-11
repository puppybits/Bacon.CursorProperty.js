'use scripts';

var Bacon = require('baconjs');

var CursorProperty = (function(Bacon){
  
  var CursorProperty = function(data){
    var bus = arguments.length === 2 && arguments[1] || new Bacon.Bus();
    var cursor = bus
      .toProperty(data);
    cursor.push = bus.push;
    
    cursor.toCursorProperty = function(prop){
      var val;
      this.onValue(function(v){ val = v.get(prop); })();
      if (!val) {
        return null;
      }
      
      var _subBus = new Bacon.Bus();
      _subBus.onValue(function(r){console.log('sub ', prop, r); });
      var subcursor = new CursorProperty(val, _subBus);
    
      var downstream = this.map(function(val){
        return val.get(prop);
      }).onValue(function(val){
        _subBus.push(val);
      });
    
      var upstream = function(sub){
        var root;
        cursor.onValue(function(v){ root = v; });
        var newroot = root.set(prop, sub);
        bus.push(newroot);
      }
      subcursor.push = upstream;
    
      return subcursor;
    };
    
    return cursor;
  }
  
  Bacon.CursorProperty = CursorProperty;
}(Bacon))
