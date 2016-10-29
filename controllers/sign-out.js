application.controller(
  'signOut',
  [
    '$rootScope',
    '$state',
    function ($rootScope, $state) {
      $rootScope.signOut();
      $state.go('welcome');
    }
  ]
);
