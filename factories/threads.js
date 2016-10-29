application.factory(
  'threads',
  [
    '$http',
    '$q',
    '$rootScope',
    '$timeout',
    '$window',
    'URI',
    'utilities',
    function ($http, $q, $rootScope, $timeout, $window, URI, utilities) {
      return {
        delete: function (threadId) {
          var defer = $q.defer();
          $rootScope.feeds.threads.splice(
            utilities.getThreadIndex($rootScope.feeds.threads, threadId), 1
          );
          $http({
            ignoreLoadingBar: true,
            method: 'DELETE',
            url: URI($window.variables.url)
              .segment('threads')
              .segment(threadId)
              .href()
          })
            .then(
              function (response) {
                $rootScope.refreshCounts([]);
                defer.resolve();
              },
              function () {
                defer.reject();
              }
            );
          return defer.promise;
        },
        update: function (threadId, state) {
          var defer = $q.defer();
          if (state === 'archive') {
            $rootScope.feeds.threads.splice(
              utilities.getThreadIndex($rootScope.feeds.threads, threadId), 1
            );
          }
          if (state === 'spam') {
            $rootScope.feeds.threads.splice(
              utilities.getThreadIndex($rootScope.feeds.threads, threadId), 1
            );
          }
          $timeout(
              function () {
              jQuery($window).trigger('resize');
            }
          );
          $http({
            ignoreLoadingBar: true,
            data: {
              state: state
            },
            method: 'POST',
            url: URI($window.variables.url)
              .segment('threads')
              .segment(threadId)
              .href()
          })
            .then(
              function (response) {
                $rootScope.refreshCounts([]);
                defer.resolve();
              },
              function () {
                defer.reject();
              }
            );
          return defer.promise;
        }
      };
    }
  ]
);
