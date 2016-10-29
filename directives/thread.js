application.directive(
  'thread',
  [
    '$rootScope',
    '$sce',
    '$state',
    '$timeout',
    '$window',
    'lodash',
    'messages',
    'threads',
    'utilities',
    function (
      $rootScope,
      $sce,
      $state,
      $timeout,
      $window,
      lodash,
      messages,
      threads,
      utilities
    ) {
      return {
        link: function (scope, element, attributes) {
          scope.read = function (thread) {
            if (!thread.state.isUnread) {
              return;
            }
            thread.state.isUnread = false;
            thread.messages.forEach(
              function (message) {
                message.state.isUnread = false;
              }
            );
            thread.summary.from.forEach(
              function (item) {
                item.isUnread = false;
              }
            );
            thread.from = utilities.getFrom(thread);
            threads
              .update(thread.meta.threadId, 'read')
              .then(
                function () {
                },
                function () {
                  utilities.notify(
                    '<i class="fa fa-times-circle"></i>',
                    'Not marked as read.'
                  );
                }
              );
            $window.ga(
              'send',
              'event',
              'thread',
              'read',
              $state.current.url + '#' + $rootScope.feeds.v
            );
          };

          scope.unread = function (thread) {
            if (thread.state.isUnread) {
              return;
            }
            thread.state.isUnread = true;
            thread.messages.forEach(
              function (message) {
                message.state.isUnread = true;
              }
            );
            thread.summary.from.forEach(
              function (item) {
                item.isUnread = true;
              }
            );
            thread.from = utilities.getFrom(thread);
            threads
              .update(thread.meta.threadId, 'unread')
              .then(
                function () {
                },
                function () {
                  utilities.notify(
                    '<i class="fa fa-times-circle"></i>',
                    'Not marked as unread.'
                  );
                }
              );
            $window.ga(
              'send',
              'event',
              'thread',
              'unread',
              $state.current.url + '#' + $rootScope.feeds.v
            );
          };

          scope.archive = function (thread) {
            threads
              .update(thread.meta.threadId, 'archive')
              .then(
                function () {
                  utilities.notify(
                    '<i class="fa fa-check-circle"></i>',
                    'Archived.'
                  );
                },
                function () {
                  utilities.notify(
                    '<i class="fa fa-times-circle"></i>',
                    'Not archived.'
                  );
                }
              );
          };

          scope.spam = function (thread) {
            threads
              .update(thread.meta.threadId, 'spam')
              .then(
                function () {
                  utilities.notify(
                    '<i class="fa fa-check-circle"></i>',
                    'Marked as spam.'
                  );
                },
                function () {
                  utilities.notify(
                    '<i class="fa fa-times-circle"></i>',
                    'Not marked as spam.'
                  );
                }
              );
          };

          scope.unspam = function (thread) {
            threads
              .update(thread.meta.threadId, 'unspam')
              .then(
                function () {
                  utilities.notify(
                    '<i class="fa fa-check-circle"></i>',
                    'Marked as not spam.'
                  );
                },
                function () {
                  utilities.notify(
                    '<i class="fa fa-times-circle"></i>',
                    'Not marked as not spam.'
                  );
                }
              );
          };

          scope.trash = function (thread) {
            threads
              .delete(thread.meta.threadId)
              .then(
                function () {
                  utilities.notify(
                    '<i class="fa fa-check-circle"></i>',
                    'Trashed.'
                  );
                },
                function () {
                  utilities.notify(
                    '<i class="fa fa-times-circle"></i>',
                    'Not trashed.'
                  );
                }
              );
          };

          scope.star = function (thread) {
            if (thread.state.isStarred) {
              return;
            }
            thread.state.isStarred = true;
            threads
              .update(thread.meta.threadId, 'star')
              .then(
                function () {
                },
                function () {
                  utilities.notify(
                    '<i class="fa fa-times-circle"></i>',
                    'Not starred.'
                  );
                }
              );
          };

          scope.unstar = function (thread) {
            if (!thread.state.isStarred) {
              return;
            }
            thread.state.isStarred = false;
            threads
              .update(thread.meta.threadId, 'unstar')
              .then(
                function () {
                },
                function () {
                  utilities.notify(
                    '<i class="fa fa-times-circle"></i>',
                    'Not unstarred.'
                  );
                }
              );
          };

          scope.expand = function (thread) {
            scope.read(thread);
            thread.messages.forEach(
              function (message) {
                message.status = 2;
              }
            );
            $timeout(
                function () {
                jQuery($window).trigger('resize');
              }
            );
          };

          scope.collapse = function (thread) {
            thread.messages.forEach(
              function (message) {
                if (message.meta.messageId !== thread.meta.messageId) {
                  message.status = 0;
                }
              }
            );
            if (
              $rootScope
                .user
                .preferences['account:settings:markAsRead'] !== 'true'
            ) {
              scope.read(thread);
            }
            $timeout(
                function () {
                jQuery($window).trigger('resize');
              }
            );
          };

          scope.toggle = function (thread, $event) {
            if (!$rootScope.isExpanded) {
              if (thread.isExpanded) {
              } else {
                $rootScope.feeds.threads.forEach(
                  function (thread) {
                    thread.isExpanded = false;
                  }
                );
              }
            }
            thread.isExpanded = !thread.isExpanded;
            if (!thread.isExpanded) {
              $window.scrollTo(
                0,
                angular
                  .element('#thread-' + thread.meta.threadId)
                  .offset()
                  .top - $event.clientY + 17.5
              );
            }
            scope.read(thread);
            $timeout(
              function () {
                jQuery($window).trigger('resize');
              }
            );
            $window.ga(
              'send',
              'event',
              'thread',
              thread.isExpanded? 'expand': 'collapse',
              $state.current.url + '#' + $rootScope.feeds.v
            );
          };

          scope.status = function (thread, oldValue, newValue) {
            thread.messages.forEach(
              function (message) {
                if (message.status === oldValue) {
                  message.status = newValue;
                }
              }
            );
            $timeout(
                function () {
                jQuery($window).trigger('resize');
              }
            );
          };

          scope.getMessages = function (thread, status) {
            return thread
              .messages
              .filter(
                function (message) {
                  return message.status === status;
                }
              )
              .length;
          };

          scope.isExpanded = function (thread) {
            return thread
              .messages
              .filter(
                function (message) {
                  return message.status !== 2;
                }
              )
              .length === 0;
          };
        },
        restrict: 'A',
        templateUrl: 'templates/directives/thread.html'
      };
    }
  ]
);
