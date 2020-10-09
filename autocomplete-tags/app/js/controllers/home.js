class HomeCtrl {

  constructor($rootScope, $scope, $timeout) {

    $scope.tags = [];

    var delimitter = ".";

    var permissions = [
      {
        name: "stream-items",
        content_types: ["Tag"]
      },
      {
        name: "stream-context-item"
      }
    ]

    let componentManager = new window.ComponentManager(permissions, function () {
      // on ready
    });

    $scope.formData = {};
    let defaultHeight = 28;

    $scope.dummyTag = { dummy: true, content: {} };

    $scope.tagsInputChange = function ($event) {
      var input = $scope.formData.input || "";

      var hasExactMatch = false;
      var tagInput = input.split("#").slice(-1)[0];
      if (tagInput) {
        $scope.results = $scope.tags.filter((tag) => {
          if (!hasExactMatch) {
            hasExactMatch = tag.content.title == tagInput;
          }
          var comps = tag.content.title.split(delimitter);
          for (var comp of comps) {
            if (comp.length && comp.toLowerCase().startsWith(tagInput.toLowerCase())) {
              return true;
            }
          }
          return tag.content.title.toLowerCase().startsWith(tagInput.toLowerCase());
        }).sort(function (a, b) {
          return a.content.title > b.content.title;
        })
      } else {
        $scope.results = [];
      }

      if (!hasExactMatch && tagInput.length > 0) {
        $scope.dummyTag.content.rawTitle = tagInput;
        $scope.dummyTag.content.title = `Create new tag '${tagInput}'`;
        $scope.results.push($scope.dummyTag);
      }

      $scope.showAutocomplete($scope.results.length > 0);
      $scope.highlightTag($scope.results[0]);
    }

    $scope.resetContext = function () {
      $scope.formData.input = "";
      $scope.highlightedTag = null;
      $scope.results = [];
      $scope.showAutocomplete(false);
    }

    $scope.showAutocomplete = function (show) {
      $scope.formData.showAutocomplete = show;

      $timeout(function () {
        if (show) {
          componentManager.setSize("content", "100%", document.documentElement.scrollHeight);
        } else {
          componentManager.setSize("content", "100%", defaultHeight);
        }
      })
    }

    $scope.selectTag = function (tag) {
      if (tag.dummy) {
        $scope.createTag(tag.content.rawTitle);
        return;
      }

      var comps = tag.content.title.split(delimitter);
      for (var index = 1; index < comps.length + 1; index++) {
        var tagName = comps.slice(0, index).join(delimitter);
        var _tag = $scope.tags.filter(function (candidate) {
          return candidate.content.title === tagName;
        })[0]

        componentManager.associateItem(_tag);
      }

      $scope.resetContext();
    }

    $scope.removeActiveTag = function (tag) {
      componentManager.deassociateItem(tag);
    }

    componentManager.streamItems(['Tag'], function (newTags) {
      $timeout(function () {
        var allTags = $scope.tags || [];

        for (var tag of newTags) {
          var existing = allTags.filter(function (tagCandidate) {
            return tagCandidate.uuid === tag.uuid;
          })[0];

          if (existing) {
            Object.assign(existing, tag);
          } else {
            allTags.push(tag);
          }

          if (tag.deleted) {
            var index = allTags.indexOf(existing || tag);
            allTags.splice(index, 1);
          }
        }

        $scope.tags = allTags;
        $scope.refreshNoteReferences();
      })

    }.bind(this));

    componentManager.streamContextItem((item) => {
      $scope.note = item;
      $timeout(() => {
        $scope.refreshNoteReferences();
      })
    })

    $scope.refreshNoteReferences = function () {
      $scope.resetContext();

      if (!$scope.note) {
        return;
      }

      const tags = $scope.tags.filter(function (tag) {
        const tagHasNote = tag.content.references.find((ref) => {
          return ref.uuid == $scope.note.uuid;
        })
        return tagHasNote;
      })

      $scope.activeTags = tags.sort(function (a, b) {
        return a.content.title > b.content.title;
      })
    }

    $scope.highlightTag = function (tag) {
      $scope.highlightedTag = tag;
    }

    $scope.highlightNextResult = function () {
      if (!$scope.results) {
        return;
      }
      var index = $scope.results.indexOf($scope.highlightedTag);
      $scope.highlighResultAtIndex(index + 1);
    }

    $scope.highlightPreviousResult = function () {
      if (!$scope.results) {
        return;
      }
      var index = $scope.results.indexOf($scope.highlightedTag);
      index--;
      if (index < 0) {
        index = $scope.results.length - 1;
      }
      $scope.highlighResultAtIndex(index);
    }

    $scope.highlighResultAtIndex = function (index) {
      $scope.highlightTag($scope.results[index % $scope.results.length]);
    }

    $scope.onEnter = function () {
      if ($scope.highlightedTag) {
        $scope.selectTag($scope.highlightedTag);
      }
    }

    $scope.createTag = function (title) {
      componentManager.createItem({ content_type: "Tag", content: { title: title } });
    }

    componentManager.setSize("container", "100%", defaultHeight);

    document.onkeydown = handleArrowKey;

    function handleArrowKey(e) {
      e = e || window.event;
      if (e.keyCode == '38') {
        // up arrow
        $timeout(function () {
          $scope.highlightPreviousResult();
        })
      } else if (e.keyCode == '40') {
        // down arrow
        $timeout(function () {
          $scope.highlightNextResult();
        });
      }
    }

  }
}

// required for firefox
HomeCtrl.$$ngIsClass = true;

angular.module('app').controller('HomeCtrl', HomeCtrl);
