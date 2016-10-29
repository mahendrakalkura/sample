application.directive(
  'expandingTextareas',
  [
    '$window',
    function ($window) {
      return {
        link: function (scope, element, attributes) {
          angular.element(element).expanding();
        },
        restrict: 'A'
      };
    }
  ]
);
