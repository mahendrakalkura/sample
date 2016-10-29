application.factory(
  'feeds',
  [
    '$http',
    '$localStorage',
    '$q',
    '$rootScope',
    '$sce',
    '$timeout',
    '$window',
    'lodash',
    'URI',
    'utilities',
    function (
      $http,
      $localStorage,
      $q,
      $rootScope,
      $sce,
      $timeout,
      $window,
      lodash,
      URI,
      utilities
    ) {
      var getItems = function (items) {
        return items.map(
          function (item) {
            item.messages = item.messages.filter(
              function (message) {
                return !message.state.isDraft;
              }
            );

            var head = lodash.head(item.messages);
            var last = lodash.last(item.messages);

            item.imageUrl = utilities.getImageUrl(head.from.e);

            item.isExpanded = false;

            item.label = utilities.getLabel(head.from.n || head.from.e);

            item.from = utilities.getFrom(item);

            item.meta.messageId = last.meta.messageId;

            item.messages.forEach(
              function (message) {
                if (message.attachments === undefined) {
                  message.attachments = [];
                }
                message.attachments.forEach(
                  function (attachment) {
                    attachment.bytes = utilities.getBytes(
                      attachment.sizeInBytes
                    );

                    attachment.icon = utilities.getIcon(attachment.fileName);

                    attachment.url = URI($window.variables.url)
                      .segment('inbox')
                      .segment('m')
                      .segment(message.meta.messageId)
                      .segment('a')
                      .segment(attachment.id)
                      .search({
                        bearer: $localStorage.bearer
                      })
                      .href();
                  }
                );

                message.from_ = message.from.n || message.from.e;

                message.imageUrl = utilities.getImageUrl(message.from.e);

                message.label = utilities.getLabel(
                  message.from.n || message.from.e
                );

                message.readReceipts = {};

                message.snippet = $sce.trustAsHtml(message.snippet);

                message.status = 0;
                if (message.state.isUnread) {
                  message.status = 2;
                }
                if (message.meta.messageId === last.meta.messageId) {
                  message.status = 2;
                }

                message.to_cc = [].concat(
                  message.to.map(
                    function (item) {
                      return {
                        email: item.e,
                        imageUrl: utilities.getImageUrl(item.e),
                        label: utilities.getLabel(item.n || item.e),
                        name: item.n || item.e,
                        type: 'to'
                      };
                    }
                  ),
                  message.cc.map(
                    function (item) {
                      return {
                        email: item.e,
                        imageUrl: utilities.getImageUrl(item.e),
                        label: utilities.getLabel(item.n || item.e),
                        name: item.n || item.e,
                        type: 'cc'
                      };
                    }
                  )
                );

                message.url = URI($window.variables.url)
                  .segment('inbox')
                  .segment('m')
                  .segment(message.meta.messageId)
                  .segment('a')
                  .segment('all')
                  .search({
                    bearer: $localStorage.bearer
                  })
                  .href();
              }
            );

            item.messages_ = '';
            if (item.messages.length > 1) {
              item.messages_ = '(' + item.messages.length + ')';
            }

            item.snippet = $sce.trustAsHtml(item.summary.snippet);

            if (!item.subject.length) {
              item.subject = '(no subject)';
            }
            return item;
          }
        );
      };

      return {
        counts: function (labels) {
          var defer = $q.defer();
          $http({
            ignoreLoadingBar: true,
            method: 'GET',
            params: {
              labels: labels.join(',')
            },
            url: URI($window.variables.url)
              .segment('inbox')
              .segment('me')
              .segment('counts')
              .href()
          })
            .then(
              function (response) {
                var data = response.data;
                for (var key in data) {
                  if (key === 'INBOX') {
                    if (data[key] === 501) {
                      data[key] = '500+';
                    }
                  }
                }
                defer.resolve(data);
              },
              function () {
                defer.reject();
              }
            );
          return defer.promise;
        },
        inbox: function () {
          var q = $rootScope.feeds.q;
          if ($rootScope.feeds.v === 'a') {
            if ($rootScope.feeds.filename.length) {
              q = q + ' ' + $rootScope.feeds.filename;
            }
          }
          var defer = $q.defer();
          $rootScope.feeds.isScrolling = true;
          $rootScope.feeds.hasStopped = false;
          $http({
            ignoreLoadingBar: $rootScope.feeds.c !== ''? true: false,
            local: true,
            method: 'GET',
            url: URI($window.variables.url)
              .segment('inbox')
              .search({
                  c: $rootScope.feeds.c,
                  q: q,
                  s: 10
              })
              .href()
          })
            .then(
              function (response) {
                $rootScope.feeds.isScrolling = false;
                $rootScope.feeds.hasStopped = false;
                if (!response.data.threads.length) {
                  $rootScope.feeds.hasStopped = true;
                }
                if (!response.data.cursor) {
                  $rootScope.feeds.hasStopped = true;
                }
                $rootScope.feeds.threads = lodash.uniqBy(
                  [].concat(
                    $rootScope.feeds.threads, getItems(response.data.threads)
                  ),
                  function (thread) {
                    return thread.meta.threadId;
                  }
                );
                $rootScope.feeds.c = response.data.cursor || '';
                $rootScope.readReceipts(
                  response.data.threads.map(
                    function (thread) {
                      return thread.meta.threadId;
                    }
                  )
                );
                $timeout(
                  function () {
                    jQuery($window).trigger('resize');
                  }
                );
                defer.resolve();
              },
              function (response) {
                if (response.status !== -1) {
                  $rootScope.feeds.hasStopped = true;
                  $rootScope.feeds.isScrolling = false;
                }
                defer.resolve();
              }
            );
          return defer.promise;
        },
        readReceipts: function (threads) {
          var defer = $q.defer();
          if (threads.length) {
            $http({
              ignoreLoadingBar: true,
              local: true,
              method: 'GET',
              url: URI($window.variables.url)
                .segment('inbox')
                .segment('me')
                .segment('rr')
                .search({
                    threads: threads
                })
                .href()
            })
              .then(
                function (response) {
                  defer.resolve(response.data);
                },
                function () {
                  defer.resolve({});
                }
              );
          } else {
            defer.resolve({});
          }
          return defer.promise;
        },
        threads: function (threads) {
          var defer = $q.defer();
          if (threads.length) {
            $http({
              ignoreLoadingBar: true,
              local: true,
              method: 'GET',
              url: URI($window.variables.url)
                .segment('inbox')
                .search({
                    threads: threads
                })
                .href()
            })
              .then(
                function (response) {
                  defer.resolve(getItems(response.data.threads));
                },
                function () {
                  defer.resolve([]);
                }
              );
          } else {
            defer.resolve([]);
          }
          return defer.promise;
        },
        thread: function (id) {
          var defer = $q.defer();
          $http({
            ignoreLoadingBar: true,
            local: true,
            method: 'GET',
            url: URI($window.variables.url)
              .segment('inbox')
              .search({
                  threads: id
              })
              .href()
          })
            .then(
              function (response) {
                $rootScope.feeds.threads = getItems(response.data.threads)
                  .map(
                    function (thread) {
                      thread.isExpanded = true;
                      return thread;
                    }
                  );
                $rootScope.feeds.hasStopped = true;
                $rootScope.feeds.v = 't';
                defer.resolve();
              },
              function () {
                defer.resolve([]);
              }
            );
          return defer.promise;
        }
      };
    }
  ]
);
