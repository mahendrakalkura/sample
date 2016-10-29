application
  .directive(
    'autoFocus',
    [
      '$timeout',
      function($timeout) {
        return {
          link: function(scope, element, attributes) {
            if (attributes.autoFocus === 'true') {
              $timeout(
                function () {
                  element.find('input')[0].focus();
                },
                100
              );
            }
          },
          restrict: 'A'
        };
      }
    ]
  );
