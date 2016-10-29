application.directive(
  'switchery',
  [
    '$timeout',
    '$window',
    function ($timeout, $window) {
      return {
        link: function (scope, element, attributes, ngModel) {
          if (!ngModel) {
            return false;
          }

          var switcher;

          var initialize = function () {
            $timeout(
              function () {
                if (switcher) {
                  angular.element(switcher.switcher).remove();
                }
                switcher = new $window.Switchery(
                  element[0],
                  {
                    color: '#1a70b4',
                    secondaryColor: '#444444'
                  }
                );
                switcher.element.checked = (
                  scope.value === scope.$eval(attributes.ngTrueValue)
                );
                if (attributes.disabled) {
                  switcher.disable();
                }
                switcher.setPosition(false);
                switcher.element.addEventListener(
                  'change',
                  function (event) {
                    scope.$apply(
                      function () {
                        ngModel.$setViewValue(switcher.element.checked);
                      }
                    );
                  }
                );
              },
              0
            );
          };

          attributes.$observe(
            'disabled',
            function (value) {
              if (!switcher) {
                return;
              }
              if (value) {
                switcher.disable();
              }
              else {
                switcher.enable();
              }
            }
          );

          initialize();
        },
        require: 'ngModel',
        restrict: 'A',
        scope : {
          value : '=ngModel'
        }
      };
    }
  ]
);
