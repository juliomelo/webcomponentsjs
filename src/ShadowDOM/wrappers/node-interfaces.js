/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

(function(scope) {
  'use strict';

  var NodeList = scope.wrappers.NodeList;

  function forwardElement(node) {
    while (node && node.nodeType !== Node.ELEMENT_NODE) {
      node = node.nextSibling;
    }
    return node;
  }

  function backwardsElement(node) {
    while (node && node.nodeType !== Node.ELEMENT_NODE) {
      node = node.previousSibling;
    }
    return node;
  }

  function nonEnum(obj, prop) {
    Object.defineProperty(obj, prop, {enumerable: false});
  }

  function createIndex(obj, idx) {
    Object.defineProperty(obj, idx, { get: function() { return obj.item(idx); } });
  }

  function ChildrenNodeList(wrapper) {
    this.wrapper_ = wrapper;
    this.changeCount_ = null;
    this.maxLength_ = 0;
    this.items_ = [];
    nonEnum(this, 'wrapper_');
    nonEnum(this, 'changeCount_');
    nonEnum(this, 'maxLength_');
    nonEnum(this, 'items_');
    this.build_();
  }

  ChildrenNodeList.prototype = {
    item: function(index) {
      if (this.isDirty_()) {
        this.build_();
      }

      return this.items_[index];
    },
    get length() {
      if (this.isDirty_()) {
        this.build_();
      }

      return this.items_.length;
    },
    isDirty_: function() {
      return this.wrapper_.childNodes.changeCount_ !== this.changeCount_;
    },
    build_: function() {
      this.items_ = [];

      for (var child = this.wrapper_.firstElementChild;
           child;
           child = child.nextElementSibling) {
        this.items_.push(child);
      }

      while (this.maxLength_ < this.items_.length) {
        createIndex(this, this.maxLength_++);
      }

      this.changeCount_ = this.wrapper_.childNodes.changeCount_;
    }
  }

  nonEnum(ChildrenNodeList.prototype, 'item');
  nonEnum(ChildrenNodeList.prototype, 'length');
  nonEnum(ChildrenNodeList.prototype, 'isDirty_');
  nonEnum(ChildrenNodeList.prototype, 'build_');

  var ParentNodeInterface = {
    get firstElementChild() {
      return forwardElement(this.firstChild);
    },

    get lastElementChild() {
      return backwardsElement(this.lastChild);
    },

    get childElementCount() {
      if (this.children_ !== undefined) {
        return this.children_.length;
      }

      var count = 0;
      for (var child = this.firstElementChild;
           child;
           child = child.nextElementSibling) {
        count++;
      }
      return count;
    },

    get children() {
      if (this.children_ === undefined) {
        this.children_ = new ChildrenNodeList(this);
      }

      return this.children_;
    },

    remove: function() {
      var p = this.parentNode;
      if (p)
        p.removeChild(this);
    }
  };

  var ChildNodeInterface = {
    get nextElementSibling() {
      return forwardElement(this.nextSibling);
    },

    get previousElementSibling() {
      return backwardsElement(this.previousSibling);
    }
  };

  var NonElementParentNodeInterface = {
    getElementById: function(id) {
      if (/[ \t\n\r\f]/.test(id))
        return null;
      return this.querySelector('[id="' + id + '"]');
    }
  };

  scope.ChildNodeInterface = ChildNodeInterface;
  scope.NonElementParentNodeInterface = NonElementParentNodeInterface;
  scope.ParentNodeInterface = ParentNodeInterface;

})(window.ShadowDOMPolyfill);
