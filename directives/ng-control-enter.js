application.directive(
  'ngControlEnter',
  [
    function () {
      return function (scope, element, attributes) {
        element.bind(
          'keydown keypress',
          function (event) {
            if (
              event.ctrlKey !== undefined &&
              event.ctrlKey === true &&
              event.keyCode == 13
            ) {
              event.preventDefault();
              scope.$apply(
                function () {
                  scope.$eval(attributes.ngControlEnter);
                }
              );
            }
          }
        );
      };
    }
  ]
);
