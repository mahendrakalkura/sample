application.controller(
  'settings',
  [
    '$rootScope',
    '$scope',
    '$uibModalInstance',
    '$window',
    'webNotification',
    'users',
    'utilities',
    'user',
    function (
      $rootScope,
      $scope,
      $uibModalInstance,
      $window,
      webNotification,
      users,
      utilities,
      user
    ) {
      $scope.user = user;

      $scope.tab = 'general';

      $scope.options = [
        {
          key: 'true',
          value: 'Mark as read once viewed'
        },
        {
          key: 'false',
          value: 'Leave as unread, I will manually mark as read'
        }
      ];

      $scope.summernote = $rootScope.getSummernote();
      $scope.summernote.focus = !$scope.isNew;
      $scope.summernote.height = 150;

      $scope.init = function (evt) {
        document.addEventListener(
          'animationstart', $window.paragraph, false
        );
        document.addEventListener(
          'MSAnimationStart', $window.paragraph, false
        );
        document.addEventListener(
          'webkitAnimationStart', $window.paragraph, false
        );
        $window.jQuery('.note-btn-group').addClass('dropup');
      };

      $scope.change = function (evt) {
        $scope.save('signature');
      };

      $scope.keyup = function (evt) {
        if (evt.keyCode == 9) {
          evt.preventDefault();
          return;
        }
        if (
          evt.ctrlKey !== undefined &&
          evt.ctrlKey === true &&
          evt.keyCode == 13
        ) {
          evt.preventDefault();
          $scope.save('signature');
        }
      };

      $scope.save = function (section) {
        return users
          .set($scope.user, section)
          .then(
            function () {
              $rootScope.user = $scope.user;
              $rootScope.categories = utilities.getCategories($rootScope.user);
            },
            function () {
            }
          );
      };

      $scope.close = function () {
        $uibModalInstance.dismiss('close');
      };

      $scope.$on(
        '$destroy',
        function () {
          document.removeEventListener(
            'animationstart', $window.paragraph
          );
          document.removeEventListener(
            'MSAnimationStart', $window.paragraph
          );
          document.removeEventListener(
            'webkitAnimationStart', $window.paragraph
          );
        }
      );

      $scope.$watch(
        function () {
          return $scope
            .user
            .preferences['account:settings:notifications:browser'];
        },
        function (newValue, oldValue) {
          if (newValue === oldValue) {
            return;
          }
          if (newValue === 'false') {
            $scope
              .user
              .preferences[
                'account:settings:notifications:browser'
              ] = 'false';
            $scope.save('preferences');
            return;
          }
          $window
            .notify
            .requestPermission(
              function () {
                $scope
                  .user
                  .preferences[
                    'account:settings:notifications:browser'
                  ] = webNotification.permissionGranted? 'true': 'false';
                $scope.save('preferences');
              }
            );
        }
      );
    }
  ]
);
