application.directive(
  'threads',
  [
    '$window',
    function ($window) {
      return {
        restrict: 'E',
        templateUrl: 'templates/directives/threads.html'
      };
    }
  ]
);
