application.directive(
  'attachments',
  [
    'lodash',
    function (lodash) {
      return {
        link: function (scope, element, attributes) {
          scope.isFirst = function (thread, message) {
            var first = lodash
              .first(
                thread
                  .messages
                  .filter(
                    function (message) {
                      return message.attachments.length;
                    }
                  )
              );
            if (first && first.meta.messageId === message.meta.messageId) {
              return true;
            }
            return false;
          };
        },
        restrict: 'E',
        templateUrl: 'templates/directives/attachments.html'
      };
    }
  ]
);
