application.directive(
  'noteBtnGroup',
  [
    function () {
      console.log(1);
      return {
        link: function (scope, element, attributes) {
          console.log(angular.element(element));
          angular.element(element).addClass('dropup');
        },
        restrict: 'C'
      };
    }
  ]
);
