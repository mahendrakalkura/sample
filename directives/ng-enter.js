application.directive(
  'ngEnter',
  [
    function () {
      return function (scope, element, attributes) {
        element.bind(
          'keydown keypress',
          function (event) {
            if (event.which === 13) {
              event.preventDefault();
              scope.$apply(
                function () {
                  scope.$eval(attributes.ngEnter);
                }
              );
            }
          }
        );
      };
    }
  ]
);
