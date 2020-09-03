(function (root, factory) {
      if (typeof define === 'function' && define.amd) {
        define(factory);
      } else if (typeof exports === 'object') {
        module.exports = factory();
      } else {
        root.PhotoSwipe = factory();
      }
    })(this, function () {
      'use strict';
      var PhotoSwipe = function(template, UiClass, items, options){