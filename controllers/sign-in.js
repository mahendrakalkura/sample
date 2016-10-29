application.controller(
  'signIn',
  [
    '$location',
    '$rootScope',
    '$scope',
    '$state',
    '$window',
    function ($location, $rootScope, $scope, $state, $window) {
      $scope.spinner = true;

      $scope.google = function () {
        $scope.spinner = true;
        $window.location.href = URI($window.variables.oAuth2)
          .search({
            state: btoa($window.location.origin + '/#!/sign-in/')
          })
          .href();
      };

      var parameters = $location.search();
      if (parameters.signup === 'true') {
        $rootScope.signUp = 2;
      }
      if (parameters.bearer !== undefined) {
        $rootScope
          .signIn(parameters.bearer)
          .then(
            function () {
              $state.go('step-1');
            },
            function () {
              $state.go('404');
            }
          );
        return;
      }

      $scope.spinner = false;
    }
  ]
);
