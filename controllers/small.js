application.controller(
  'secondary',
  [
    '$rootScope',
    '$timeout',
    '$window',
    function ($rootScope, $timeout, $window) {
      $rootScope.layout = 'secondary';
      $timeout(
        function () {
          jQuery($window).trigger('resize');
        }
      );
    }
  ]
);
