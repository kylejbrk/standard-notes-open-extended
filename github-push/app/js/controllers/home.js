class HomeCtrl {
  constructor($rootScope, $scope, $timeout) {

    $scope.formData = {loading: true, pushStatus: "Push Changes"};

    var permissions = [
      {
        name: "stream-context-item"
      }
    ]

    let componentManager = new window.ComponentManager(permissions, function(){
      $scope.formData.loading = false;
      $scope.onReady();
    });

    let defaultHeight = 60;

    componentManager.streamContextItem(function(item){
      $timeout(function(){
        $scope.note = item;
        if($scope.repos) {
          $scope.loadRepoDataForCurrentNote();
        }
      })
    })

    $scope.onReady = function() {
      $scope.token = componentManager.componentDataValueForKey("token");
      if($scope.token) {
        $scope.onTokenSet();
      }
    }

    $scope.submitToken = function() {
      $scope.token = $scope.formData.token;
      componentManager.setComponentDataValueForKey("token", $scope.token);
      $scope.onTokenSet();
    }

    $scope.onTokenSet = function() {

      $scope.gh = new GitHub({
        token: $scope.token
      });

      var me = $scope.gh.getUser();
      $scope.formData.loadingRepos = true;

      me.listRepos(function(err, repos) {
        $timeout(function(){
          $scope.formData.loadingRepos = false;
          if(err) {
            alert("An error occurred with the GitHub Push extension. Make sure your GitHub token is valid and try again.")
            return;
          }
          $scope.repos = repos;
          if($scope.note) {
            $scope.loadRepoDataForCurrentNote();
          }
        })
      });
    }

    $scope.loadRepoDataForCurrentNote = function() {
      var noteData = componentManager.componentDataValueForKey("notes") || {};
      var savedNote = noteData[$scope.note.uuid];
      if(savedNote) {
        // per note preference
        $scope.noteFileExtension = savedNote.fileExtension;
        $scope.noteFileDirectory = savedNote.fileDirectory;
        $scope.selectRepoWithName(savedNote.repoName);
      } else {
        // default pref
        var defaultRepo = componentManager.componentDataValueForKey("defaultRepo");
        if(defaultRepo) {
          $scope.selectRepoWithName(defaultRepo);
        }
      }

      $scope.defaultFileExtension = componentManager.componentDataValueForKey("defaultFileExtension");
      $scope.formData.fileExtension = $scope.noteFileExtension || $scope.defaultFileExtension || "txt";

      $scope.defaultFileDirectory = componentManager.componentDataValueForKey("defaultFileDirectory");
      $scope.formData.fileDirectory = $scope.noteFileDirectory || $scope.defaultFileDirectory || "";
    }


    $scope.selectRepoWithName = function(name) {
      $scope.formData.selectedRepo = $scope.repos.filter(function(repo){
        return repo.name === name;
      })[0];
      $scope.didSelectRepo();
    }

    $scope.didSelectRepo = function() {
      var repo = $scope.formData.selectedRepo;
      $scope.selectedRepoObject = $scope.gh.getRepo(repo.owner.login, repo.name);

      // save this as default repo for this note
      $scope.setDataForNote("repoName", repo.name);

      // save this as default repo globally
      if(!$scope.hasDefaultRepo) {
        componentManager.setComponentDataValueForKey("defaultRepo", repo.name);
        $scope.hasDefaultRepo = true;
      }
    }

    $scope.setDataForNote = function(key, value) {
      var notesData = componentManager.componentDataValueForKey("notes") || {};
      var noteData = notesData[$scope.note.uuid] || {};
      /**
       * Skip updating the component data if the current value and the new value for the key are the same.
       * This will prevent spamming the postMessage API with the same message, which causes high CPU usage.
       */
      if (noteData[key] === value) {
        return;
      }
      noteData[key] = value;
      notesData[$scope.note.uuid] = noteData;
      componentManager.setComponentDataValueForKey("notes", notesData);
    }

    $scope.sanitizeFileDirectory = function($directory) {
      // if no directory is given, then push to root.
      if (!$directory)
        return '';

      // try to ensure they haven't attempted any funny business with escape strings by turning
      // any backslashes into forward slashes - then replace any duplicate slashes with a single
      // slash.
      return $directory = $directory
        // make sure the last symbol is a '/'
        .replace(/[/]*$/g, '/')
        // make sure there are no escaping slashes.
        .replace(/\\/g, '/')
        // make sure there are no double '//'.
        .replace(/\/\//g, '/')
        // make sure the directory does not start with
        // a '/'.
        .replace(/^\/+/g, '');
    }

    $scope.pushChanges = function($event) {
      $event.target.blur();
      var message = $scope.formData.commitMessage || `Updated note '${$scope.note.content.title}'`;

      var fileExtension = $scope.formData.fileExtension;
      var fileDirectory = $scope.formData.fileDirectory;
      if(!$scope.defaultFileExtension) {
        // set this as default
        componentManager.setComponentDataValueForKey("defaultFileExtension", fileExtension);
        $scope.defaultFileExtension = fileExtension;
      }

      if(fileExtension !== $scope.noteFileExtension) {
        // set this ext for this note
        $scope.setDataForNote("fileExtension", fileExtension);
        $scope.noteFileExtension = fileExtension;
      }

      if(!$scope.defaultFileDirectory) {
        // set this as default
        componentManager.setComponentDataValueForKey("defaultFileDirectory", fileDirectory);
        $scope.defaultFileDirectory = fileDirectory;
      }

      if(fileDirectory !== $scope.noteFileDirectory) {
        // set this directory for the note
        $scope.setDataForNote("fileDirectory", fileDirectory);
        $scope.noteFileDirectory = fileDirectory;
      }

      $scope.formData.pushStatus = "Pushing...";
      $scope.selectedRepoObject.writeFile("master", $scope.sanitizeFileDirectory(fileDirectory) + $scope.note.content.title + "." + fileExtension, $scope.note.content.text, message, {encode: true}, function(err, result){
        $timeout(function(){
          if(!err) {
            $scope.formData.commitMessage = "";
            $scope.formData.pushStatus = "Success!";
            $timeout(function(){
              $scope.formData.pushStatus = "Push Changes";
            }, 1500)
          } else {
            alert("Something went wrong trying to push your changes.", + err);
          }
        })
      });
    }

    $scope.logout = function() {
      componentManager.clearComponentData();
      $scope.hasDefaultRepo = null;
      $scope.defaultFileExtension = null;
      $scope.defaultFileDirectory = null;
      $scope.noteFileExtension = null;
      $scope.noteFileDirectory = null;
      $scope.selectedRepo = null;
      $scope.repos = null;
      $scope.token = null;
    }

    componentManager.setSize("container", "100%", defaultHeight);


  }
}

// required for FireFox
HomeCtrl.$$ngIsClass = true;

angular.module('app').controller('HomeCtrl', HomeCtrl);
