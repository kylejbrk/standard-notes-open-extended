(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _classCallCheck2(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;
}

var ComponentManager =
/*#__PURE__*/
function () {
  function ComponentManager(permissions, onReady) {
    _classCallCheck(this, ComponentManager);

    this.sentMessages = [];
    this.messageQueue = [];
    this.loggingEnabled = false;
    this.acceptsThemes = true;
    this.activeThemes = [];
    this.initialPermissions = permissions;
    this.onReadyCallback = onReady;
    this.coallesedSaving = true;
    this.coallesedSavingDelay = 250;
    this.registerMessageHandler();
  }

  _createClass(ComponentManager, [{
    key: "registerMessageHandler",
    value: function registerMessageHandler() {
      var _this = this;

      var messageHandler = function messageHandler(event) {
        if (_this.loggingEnabled) {
          console.log("Components API Message received:", event.data);
        } // We don't have access to window.parent.origin due to cross-domain restrictions.
        // Check referrer if available, otherwise defer to checking for first-run value.
        // Craft URL objects so that example.com === example.com/


        if (document.referrer) {
          var referrer = new URL(document.referrer).origin;
          var eventOrigin = new URL(event.origin).origin;

          if (referrer !== eventOrigin) {
            return;
          }
        } // The first message will be the most reliable one, so we won't change it after any subsequent events,
        // in case you receive an event from another window.


        if (!_this.origin) {
          _this.origin = event.origin;
        } else if (event.origin !== _this.origin) {
          // If event origin doesn't match first-run value, return.
          return;
        } // Mobile environment sends data as JSON string


        var data = event.data;
        var parsedData = typeof data === "string" ? JSON.parse(data) : data;

        _this.handleMessage(parsedData);
      };
      /*
        Mobile (React Native) uses `document`, web/desktop uses `window`.addEventListener
        for postMessage API to work properly.
         Update May 2019:
        As part of transitioning React Native webview into the community package,
        we'll now only need to use window.addEventListener.
         However, we want to maintain backward compatibility for Mobile < v3.0.5, so we'll keep document.addEventListener
         Also, even with the new version of react-native-webview, Android may still require document.addEventListener (while iOS still only requires window.addEventListener)
        https://github.com/react-native-community/react-native-webview/issues/323#issuecomment-467767933
       */

      document.addEventListener("message", function (event) {
        messageHandler(event);
      }, false);
      window.addEventListener("message", function (event) {
        messageHandler(event);
      }, false);
    }
  }, {
    key: "handleMessage",
    value: function handleMessage(payload) {
      if (payload.action === "component-registered") {
        this.sessionKey = payload.sessionKey;
        this.componentData = payload.componentData;
        this.onReady(payload.data);

        if (this.loggingEnabled) {
          console.log("Component successfully registered with payload:", payload);
        }
      } else if (payload.action === "themes") {
        if (this.acceptsThemes) {
          this.activateThemes(payload.data.themes);
        }
      } else if (payload.original) {
        // get callback from queue
        var originalMessage = this.sentMessages.filter(function (message) {
          return message.messageId === payload.original.messageId;
        })[0];

        if (!originalMessage) {
          // Connection must have been reset. Alert the user.
          alert("This extension is attempting to communicate with Standard Notes, but an error is preventing it from doing so. Please restart this extension and try again.");
        }

        if (originalMessage.callback) {
          originalMessage.callback(payload.data);
        }
      }
    }
  }, {
    key: "onReady",
    value: function onReady(data) {
      this.environment = data.environment;
      this.platform = data.platform;
      this.uuid = data.uuid;
      this.isMobile = this.environment == "mobile";

      if (this.initialPermissions && this.initialPermissions.length > 0) {
        this.requestPermissions(this.initialPermissions);
      }

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.messageQueue[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var message = _step.value;
          this.postMessage(message.action, message.data, message.callback);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      this.messageQueue = [];

      if (this.loggingEnabled) {
        console.log("onReadyData", data);
      }

      this.activateThemes(data.activeThemeUrls || []);

      if (this.onReadyCallback) {
        this.onReadyCallback();
      }
    }
  }, {
    key: "getSelfComponentUUID",
    value: function getSelfComponentUUID() {
      return this.uuid;
    }
  }, {
    key: "isRunningInDesktopApplication",
    value: function isRunningInDesktopApplication() {
      return this.environment === "desktop";
    }
  }, {
    key: "setComponentDataValueForKey",
    value: function setComponentDataValueForKey(key, value) {
      this.componentData[key] = value;
      this.postMessage("set-component-data", {
        componentData: this.componentData
      }, function (data) {});
    }
  }, {
    key: "clearComponentData",
    value: function clearComponentData() {
      this.componentData = {};
      this.postMessage("set-component-data", {
        componentData: this.componentData
      }, function (data) {});
    }
  }, {
    key: "componentDataValueForKey",
    value: function componentDataValueForKey(key) {
      return this.componentData[key];
    }
  }, {
    key: "postMessage",
    value: function postMessage(action, data, callback) {
      if (!this.sessionKey) {
        this.messageQueue.push({
          action: action,
          data: data,
          callback: callback
        });
        return;
      }

      var message = {
        action: action,
        data: data,
        messageId: this.generateUUID(),
        sessionKey: this.sessionKey,
        api: "component"
      };
      var sentMessage = JSON.parse(JSON.stringify(message));
      sentMessage.callback = callback;
      this.sentMessages.push(sentMessage); // Mobile (React Native) requires a string for the postMessage API.

      if (this.isMobile) {
        message = JSON.stringify(message);
      }

      if (this.loggingEnabled) {
        console.log("Posting message:", message);
      }

      window.parent.postMessage(message, this.origin);
    }
  }, {
    key: "setSize",
    value: function setSize(type, width, height) {
      this.postMessage("set-size", {
        type: type,
        width: width,
        height: height
      }, function (data) {});
    }
  }, {
    key: "requestPermissions",
    value: function requestPermissions(permissions, callback) {
      this.postMessage("request-permissions", {
        permissions: permissions
      }, function (data) {
        callback && callback();
      }.bind(this));
    }
  }, {
    key: "streamItems",
    value: function streamItems(contentTypes, callback) {
      if (!Array.isArray(contentTypes)) {
        contentTypes = [contentTypes];
      }

      this.postMessage("stream-items", {
        content_types: contentTypes
      }, function (data) {
        callback(data.items);
      }.bind(this));
    }
  }, {
    key: "streamContextItem",
    value: function streamContextItem(callback) {
      var _this2 = this;

      this.postMessage("stream-context-item", null, function (data) {
        var item = data.item;
        /*
          If this is a new context item than the context item the component was currently entertaining,
          we want to immediately commit any pending saves, because if you send the new context item to the
          component before it has commited its presave, it will end up first replacing the UI with new context item,
          and when the debouncer executes to read the component UI, it will be reading the new UI for the previous item.
        */

        var isNewItem = !_this2.lastStreamedItem || _this2.lastStreamedItem.uuid !== item.uuid;

        if (isNewItem && _this2.pendingSaveTimeout) {
          clearTimeout(_this2.pendingSaveTimeout);

          _this2._performSavingOfItems(_this2.pendingSaveParams);

          _this2.pendingSaveTimeout = null;
          _this2.pendingSaveParams = null;
        }

        _this2.lastStreamedItem = item;
        callback(_this2.lastStreamedItem);
      });
    }
  }, {
    key: "selectItem",
    value: function selectItem(item) {
      this.postMessage("select-item", {
        item: this.jsonObjectForItem(item)
      });
    }
  }, {
    key: "createItem",
    value: function createItem(item, callback) {
      this.postMessage("create-item", {
        item: this.jsonObjectForItem(item)
      }, function (data) {
        var item = data.item; // A previous version of the SN app had an issue where the item in the reply to create-item
        // would be nested inside "items" and not "item". So handle both cases here.

        if (!item && data.items && data.items.length > 0) {
          item = data.items[0];
        }

        this.associateItem(item);
        callback && callback(item);
      }.bind(this));
    }
  }, {
    key: "createItems",
    value: function createItems(items, callback) {
      var _this3 = this;

      var mapped = items.map(function (item) {
        return _this3.jsonObjectForItem(item);
      });
      this.postMessage("create-items", {
        items: mapped
      }, function (data) {
        callback && callback(data.items);
      }.bind(this));
    }
  }, {
    key: "associateItem",
    value: function associateItem(item) {
      this.postMessage("associate-item", {
        item: this.jsonObjectForItem(item)
      });
    }
  }, {
    key: "deassociateItem",
    value: function deassociateItem(item) {
      this.postMessage("deassociate-item", {
        item: this.jsonObjectForItem(item)
      });
    }
  }, {
    key: "clearSelection",
    value: function clearSelection() {
      this.postMessage("clear-selection", {
        content_type: "Tag"
      });
    }
  }, {
    key: "deleteItem",
    value: function deleteItem(item, callback) {
      this.deleteItems([item], callback);
    }
  }, {
    key: "deleteItems",
    value: function deleteItems(items, callback) {
      var params = {
        items: items.map(function (item) {
          return this.jsonObjectForItem(item);
        }.bind(this))
      };
      this.postMessage("delete-items", params, function (data) {
        callback && callback(data);
      });
    }
  }, {
    key: "sendCustomEvent",
    value: function sendCustomEvent(action, data, callback) {
      this.postMessage(action, data, function (data) {
        callback && callback(data);
      }.bind(this));
    }
  }, {
    key: "saveItem",
    value: function saveItem(item, callback) {
      var skipDebouncer = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      this.saveItems([item], callback, skipDebouncer);
    }
    /* Presave allows clients to perform any actions last second before the save actually occurs (like setting previews).
       Saves debounce by default, so if a client needs to compute a property on an item before saving, it's best to
       hook into the debounce cycle so that clients don't have to implement their own debouncing.
     */

  }, {
    key: "saveItemWithPresave",
    value: function saveItemWithPresave(item, presave, callback) {
      this.saveItemsWithPresave([item], presave, callback);
    }
  }, {
    key: "saveItemsWithPresave",
    value: function saveItemsWithPresave(items, presave, callback) {
      this.saveItems(items, callback, false, presave);
    }
  }, {
    key: "_performSavingOfItems",
    value: function _performSavingOfItems(_ref) {
      var items = _ref.items,
          presave = _ref.presave,
          callback = _ref.callback;
      // presave block allows client to gain the benefit of performing something in the debounce cycle.
      presave && presave();
      var mappedItems = [];
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = items[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var item = _step2.value;
          mappedItems.push(this.jsonObjectForItem(item));
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
            _iterator2["return"]();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      this.postMessage("save-items", {
        items: mappedItems
      }, function (data) {
        callback && callback();
      });
    }
    /*
    skipDebouncer allows saves to go through right away rather than waiting for timeout.
    This should be used when saving items via other means besides keystrokes.
    */

  }, {
    key: "saveItems",
    value: function saveItems(items, callback) {
      var _this4 = this;

      var skipDebouncer = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var presave = arguments.length > 3 ? arguments[3] : undefined;

      // We need to make sure that when we clear a pending save timeout,
      // we carry over those pending items into the new save.
      if (!this.pendingSaveItems) {
        this.pendingSaveItems = [];
      }

      if (this.coallesedSaving == true && !skipDebouncer) {
        if (this.pendingSaveTimeout) {
          clearTimeout(this.pendingSaveTimeout);
        }

        var incomingIds = items.map(function (item) {
          return item.uuid;
        }); // Replace any existing save items with incoming values
        // Only keep items here who are not in incomingIds

        var preexistingItems = this.pendingSaveItems.filter(function (item) {
          return !incomingIds.includes(item.uuid);
        }); // Add new items, now that we've made sure it's cleared of incoming items.

        this.pendingSaveItems = preexistingItems.concat(items); // We'll potentially need to commit early if stream-context-item message comes in

        this.pendingSaveParams = {
          items: this.pendingSaveItems,
          presave: presave,
          callback: callback
        };
        this.pendingSaveTimeout = setTimeout(function () {
          _this4._performSavingOfItems(_this4.pendingSaveParams);

          _this4.pendingSaveItems = [];
          _this4.pendingSaveTimeout = null;
          _this4.pendingSaveParams = null;
        }, this.coallesedSavingDelay);
      } else {
        this._performSavingOfItems({
          items: items,
          presave: presave,
          callback: callback
        });
      }
    }
  }, {
    key: "jsonObjectForItem",
    value: function jsonObjectForItem(item) {
      var copy = Object.assign({}, item);
      copy.children = null;
      copy.parent = null;
      return copy;
    }
  }, {
    key: "getItemAppDataValue",
    value: function getItemAppDataValue(item, key) {
      var AppDomain = "org.standardnotes.sn";
      var data = item.content.appData && item.content.appData[AppDomain];

      if (data) {
        return data[key];
      } else {
        return null;
      }
    }
    /* Themes */

  }, {
    key: "activateThemes",
    value: function activateThemes(incomingUrls) {
      if (this.loggingEnabled) {
        console.log("Incoming themes", incomingUrls);
      }

      if (this.activeThemes.sort().toString() == incomingUrls.sort().toString()) {
        // incoming are same as active, do nothing
        return;
      }

      var themesToActivate = incomingUrls || [];
      var themesToDeactivate = [];
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = this.activeThemes[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var activeUrl = _step3.value;

          if (!incomingUrls.includes(activeUrl)) {
            // active not present in incoming, deactivate it
            themesToDeactivate.push(activeUrl);
          } else {
            // already present in active themes, remove it from themesToActivate
            themesToActivate = themesToActivate.filter(function (candidate) {
              return candidate != activeUrl;
            });
          }
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
            _iterator3["return"]();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      if (this.loggingEnabled) {
        console.log("Deactivating themes:", themesToDeactivate);
        console.log("Activating themes:", themesToActivate);
      }

      for (var _i = 0, _themesToDeactivate = themesToDeactivate; _i < _themesToDeactivate.length; _i++) {
        var theme = _themesToDeactivate[_i];
        this.deactivateTheme(theme);
      }

      this.activeThemes = incomingUrls;
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = themesToActivate[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var url = _step4.value;

          if (!url) {
            continue;
          }

          var link = document.createElement("link");
          link.id = btoa(url);
          link.href = url;
          link.type = "text/css";
          link.rel = "stylesheet";
          link.media = "screen,print";
          link.className = "custom-theme";
          document.getElementsByTagName("head")[0].appendChild(link);
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4["return"] != null) {
            _iterator4["return"]();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }
    }
  }, {
    key: "themeElementForUrl",
    value: function themeElementForUrl(url) {
      var elements = Array.from(document.getElementsByClassName("custom-theme")).slice();
      return elements.find(function (element) {
        // We used to search here by `href`, but on desktop, with local file:// urls, that didn't work for some reason.
        return element.id == btoa(url);
      });
    }
  }, {
    key: "deactivateTheme",
    value: function deactivateTheme(url) {
      var element = this.themeElementForUrl(url);

      if (element) {
        element.disabled = true;
        element.parentNode.removeChild(element);
      }
    }
    /* Theme caching is currently disabled. Might be enabled in the future if neccessary. */

    /*
    activateCachedThemes() {
      let themes = this.getCachedThemeUrls();
      let writeToCache = false;
      if(this.loggingEnabled) { console.log("Activating cached themes", themes); }
      this.activateThemes(themes, writeToCache);
    }
     cacheThemeUrls(urls) {
      if(this.loggingEnabled) { console.log("Caching theme urls", urls); }
      localStorage.setItem("cachedThemeUrls", JSON.stringify(urls));
    }
     decacheThemeUrls() {
      localStorage.removeItem("cachedThemeUrls");
    }
     getCachedThemeUrls() {
      let urls = localStorage.getItem("cachedThemeUrls");
      if(urls) {
        return JSON.parse(urls);
      } else {
        return [];
      }
    }
    */

    /* Utilities */

  }, {
    key: "generateUUID",
    value: function generateUUID() {
      var crypto = window.crypto || window.msCrypto;

      if (crypto) {
        var buf = new Uint32Array(4);
        crypto.getRandomValues(buf);
        var idx = -1;
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          idx++;
          var r = buf[idx >> 3] >> idx % 8 * 4 & 15;
          var v = c == 'x' ? r : r & 0x3 | 0x8;
          return v.toString(16);
        });
      } else {
        var d = new Date().getTime();

        if (window.performance && typeof window.performance.now === "function") {
          d += performance.now(); //use high-precision timer if available
        }

        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          var r = (d + Math.random() * 16) % 16 | 0;
          d = Math.floor(d / 16);
          return (c == 'x' ? r : r & 0x3 | 0x8).toString(16);
        });
        return uuid;
      }
    }
  }]);

  return ComponentManager;
}();

if (typeof module != "undefined" && typeof module.exports != "undefined") {
  module.exports = ComponentManager;
}

if (window) {
  window.ComponentManager = ComponentManager;
}

;'use strict';

angular.module('app', []);
var HomeCtrl = function HomeCtrl($rootScope, $scope, $timeout) {
  _classCallCheck2(this, HomeCtrl);

  var permissions = [{
    name: "stream-context-item"
  }];

  var componentManager = new window.ComponentManager(permissions, function () {
    // on ready
  });
  componentManager.loggingEnabled = false;

  $scope.formData = {};
  var defaultHeight = 56;

  $scope.analyzeNote = function (note) {
    $scope.createdAt = new Date(note.created_at).toLocaleString();
    $scope.updatedAt = new Date(note.updated_at).toLocaleString();

    var text = note.content.text;
    if (!note.content.appData.prefersPlainEditor) {
      // Remove HTML tags if not in the plain editor.
      // HTML is already cleaned by the editor on save.
      var div = document.createElement("div");
      div.innerHTML = text;
      text = div.textContent || div.innerText || "";
    }

    $scope.wordCount = countWords(text);
    $scope.paragraphCount = text.replace(/\n$/gm, '').split(/\n/).length;
    $scope.characterCount = text.length;

    var timeToRead = $scope.wordCount / 200;
    var timeInt = Math.round(timeToRead);
    if (timeInt == 0) {
      $scope.readTime = "< 1 minute";
    } else {
      var noun = timeInt == 1 ? "minute" : "minutes";
      $scope.readTime = timeInt + " " + noun;
    }

    $scope.note = note;
  };

  componentManager.streamContextItem(function (item) {
    $timeout(function () {
      $scope.analyzeNote(item);
    });
  });

  componentManager.setSize("container", "100%", defaultHeight);

  $scope.buttonPressed = function (action) {
    switch (action) {
      case "date":
        var date = new Date().toLocaleDateString([], {
          hour: '2-digit',
          minute: '2-digit'
        });
        $scope.copyTextToClipboard(date, function () {
          $scope.copiedDate = true;
          $timeout(function () {
            $scope.copiedDate = false;
          }, 1000);
        });
        break;
      case "duplicate":
        componentManager.sendCustomEvent("duplicate-item", {
          item: $scope.note
        });
        break;
      case "copy":
        $scope.copyNoteToClipboard();
        $scope.copyText = "Copied";
        $timeout(function () {
          $scope.copyText = "Copy";
        }, 500);
        break;
      case "save":
        downloadText($scope.note.content.title, $scope.note.content.text);
        break;
      case "email":
        window.open("mailto:?subject=" + $scope.note.content.title + "&body=" + encodeURIComponent($scope.note.content.text));
        break;
    }
  };

  $scope.copyTextToClipboard = function (text, completion) {
    var body = angular.element(document.body);
    var textarea = angular.element('<textarea/>');
    textarea.css({
      position: 'fixed',
      opacity: '0'
    });

    textarea.val(text);
    body.append(textarea);
    textarea[0].select();

    try {
      var successful = document.execCommand('copy');
      if (!successful) throw successful;
      completion && completion();
    } catch (err) {
      console.error("Failed to copy", toCopy);
    }

    textarea.remove();
  };

  $scope.copyNoteToClipboard = function () {
    $scope.copyTextToClipboard($scope.note.content.text, function () {
      $scope.copied = true;
      $timeout(function () {
        $scope.copied = false;
      }, 1000);
    });
  };
};

function countWords(s) {
  s = s.replace(/(^\s*)|(\s*$)/gi, ""); //exclude  start and end white-space
  s = s.replace(/[ ]{2,}/gi, " "); //2 or more space to 1
  s = s.replace(/\n /, "\n"); // exclude newline with a start spacing
  return s.split(' ').length;
}

function downloadText(filename, text) {
  var pom = document.createElement('a');
  pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  pom.setAttribute('download', filename);

  if (document.createEvent) {
    var event = document.createEvent('MouseEvents');
    event.initEvent('click', true, true);
    pom.dispatchEvent(event);
  } else {
    pom.click();
  }
}

// required for firefox
HomeCtrl.$$ngIsClass = true;

angular.module('app').controller('HomeCtrl', HomeCtrl);


},{}]},{},[1]);
