application.factory(
  'webSockets',
  [
    '$localStorage',
    '$rootScope',
    '$state',
    '$stateParams',
    '$window',
    'URI',
    'webNotification',
    function (
      $localStorage,
      $rootScope,
      $state,
      $stateParams,
      $window,
      URI,
      webNotification
    ) {
      var notify = function (payload) {
        if (
          $rootScope
            .user
            .preferences['account:settings:notifications:browser'] === 'false'
        ) {
          return;
        }
        if (
          $rootScope
            .user
            .preferences['account:settings:alerts:readReceipts'] === 'false'
        ) {
          return;
        }
        if (payload.firedOn < $rootScope.timestamp) {
          return;
        }
        webNotification.showNotification(
          payload.subject || payload.threadId,
          {
            autoClose: 5000,
            body: (
              payload.receiverName || payload.receiver
            ) + ' has just read your email',
            icon: '/images/icon.ico',
            onClick: function () {
              $state.go(
                'thread',
                {
                  id: payload.threadId
                },
                {
                  reload: true
                }
              );
            }
          },
          function () {}
        );
      };

      return {
        initialize: function () {
          var resource = $window
            .atmosphere
            .subscribe({
              heartbeat: {
                client: 30000,
                server: 30000
              },
              onMessage: function (response) {
                var json = {};
                try {
                  json = $window.JSON.parse(response.responseBody);
                } catch (e) {
                }
                if (json.seqId !== undefined) {
                  resource.push(
                    JSON.stringify({
                      seqId: json.seqId,
                      type: 'ack'
                    })
                  );
                }
                if (json.type !== undefined) {
                  if (json.type === 'message-sent-success') {
                    for (var requestId in json.payload) {
                      var t = json.payload[requestId].thread;
                      var m = json.payload[requestId].message;
                      $rootScope.feeds.threads.forEach(
                        function (thread) {
                          if (thread.state.requestId !== requestId) {
                            return;
                          }
                          thread.date = t.date;
                          thread.formattedDate = t.formattedDate;
                          thread.state = t.state;
                          thread.summary = t.summary;
                          thread.messages.forEach(
                            function (message) {
                              if (message.meta.requestId !== requestId) {
                                return;
                              }
                              message.bcc = m.bcc;
                              message.cc = m.cc;
                              message.content = m.content;
                              message.date = m.date;
                              message.formattedDate = m.formattedDate;
                              message.from = m.from;
                              message.labels = m.labels;
                              message.meta = m.meta;
                              message.snippet = m.snippet;
                              message.state = m.state;
                              message.to = m.to;
                            }
                          );
                        }
                      );
                    }
                  }
                  if (json.type === 'full-sync-inbox-complete') {
                    $rootScope.signUp = 1;
                    $rootScope.$apply();
                  }
                  if (json.type === 'full-sync-complete') {
                    $rootScope.signUp = 0;
                    $rootScope.$apply();
                  }
                  if (json.type === 'partial-sync-complete') {
                    if (json.payload.threads.length) {
                      $rootScope.synchronize(json.payload.threads);
                      $rootScope.refreshCounts([]);
                    }
                  }
                  if (json.type === 'partial-sync-error') {
                    $rootScope.partialSync();
                  }
                  if (json.type === 'read-receipt') {
                    $rootScope.feeds.threads.forEach(
                      function (thread) {
                        if (thread.meta.threadId !== json.payload.threadId) {
                          return;
                        }
                        thread.messages.forEach(
                          function (message) {
                            if (
                              message.meta.messageId !== json.payload.messageId
                            ) {
                              return;
                            }
                            message.readReceipts[json.payload.receiver] = {
                              firedOn : json.payload.firedOn,
                              receiver : json.payload.receiver,
                              receiverName : json.payload.receiverName
                            };
                          }
                        );
                      }
                    );
                    notify(json.payload);
                  }
                }
              },
              logLevel: 'debug',
              timeout: 86400000,
              transport: 'websocket',
              url: URI($window.variables.url)
                .segment('gateway')
                .search({
                  token: $localStorage.bearer
                })
                .href()
            });
        }
      };
    }
  ]
);
