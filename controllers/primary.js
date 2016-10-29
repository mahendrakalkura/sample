application.controller(
  'primary',
  [
    '$rootScope',
    '$timeout',
    '$window',
    function ($rootScope, $timeout, $window) {
      $rootScope.layout = 'primary';
      $timeout(
        function () {
          jQuery($window).trigger('resize');
        }
      );
    }
  ]
);
