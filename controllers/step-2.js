application.controller(
  'step2',
  [
    '$rootScope',
    '$scope',
    '$state',
    '$timeout',
    'users',
    function ($rootScope, $scope, $state, $timeout, users) {
      $scope.spinner = true;
      $scope.error = false;

      $scope.next = function () {
        $rootScope.user.preferences['account:state:old'] = 'true';

        $scope.spinner = true;
        $scope.error = false;
        users
          .set($rootScope.user, 'preferences')
          .then(
            function () {
              if ($rootScope.signUp !== 2) {
                $scope.spinner = true;
                $scope.error = false;
                $state.go('inbox');
                return;
              }
              var timeout = $timeout(
                function () {
                  watch();
                  $state.go('inbox');
                },
                30000
              );
              var watch = $rootScope.$watch(
                'signUp',
                function (newValue, oldValue) {
                  if (newValue === 0 || newValue === 1) {
                    $timeout.cancel(timeout);
                    watch();
                    $state.go('inbox');
                  }
                }
              );
            },
            function () {
              $scope.spinner = false;
              $scope.error = true;
            }
          );
      };

      $scope.spinner = false;
    }
  ]
);
