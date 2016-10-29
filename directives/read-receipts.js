application.directive(
  'readReceipts',
  [
    '$rootScope',
    '$sce',
    'lodash',
    function ($rootScope, $sce, lodash) {
      return {
        link: function (scope, element, attributes) {
          scope.class = 'text-muted';
          scope.html = '';
          scope.isEnabled = false;

          var process = function (message) {
            var length = lodash.keys(message.readReceipts).length;
            if (length) {
              scope.class = 'text-success';
              var html = [];
              html.push(
                '<strong>Your email was read ' + length + ' times</strong>'
              );
              for (var receiver in message.readReceipts) {
                html.push(
                  [
                    'Read',
                    moment(message.readReceipts[receiver].firedOn).fromNow(),
                    'by',
                    message.readReceipts[receiver].receiverName ||
                    message.readReceipts[receiver].receiver,
                  ].join(' ')
                );
              }
              firedOn = lodash
                .values(message.readReceipts)
                .map(
                  function (item) {
                    return item.firedOn;
                  }
                );
              firedOn.sort();
              html.push(
                'First read' +
                ' ' +
                moment(moment(message.date))
                  .from(lodash.head(firedOn), true) +
                ' ' +
                'after you sent it'
              );
              scope.html = $sce.trustAsHtml(html.join('<br>'));
              scope.isEnabled = true;
            } else {
              scope.class = 'text-muted';
              scope.html = '';
              scope.isEnabled = false;
            }
          };

          var refresh = function () {
            if (attributes.type === 'thread') {
              refreshThread();
            }
            if (attributes.type === 'message') {
              refreshMessage();
            }
          };

          var refreshThread = function () {
            var message = lodash.first(
              lodash.sortBy(
                scope
                  .thread
                  .messages
                  .filter(
                    function (message) {
                      return message.from.e === $rootScope.user.email;
                    }
                  ),
                function (message) {
                  return -message.date;
                }
              )
            );
            if (message) {
              process(message);
            }
          };

          var refreshMessage = function () {
            process(scope.message);
          };

          scope.$watch(
            'thread',
            function () {
              refresh();
            },
            true
          );

          scope.$watch(
            'message',
            function () {
              refresh();
            },
            true
          );

          refresh();
        },
        restrict: 'E',
        templateUrl: 'templates/directives/read-receipts.html'
      };
    }
  ]
);
