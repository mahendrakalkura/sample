application.factory(
  'messages',
  [
    '$http',
    '$localStorage',
    '$q',
    '$rootScope',
    '$sce',
    '$state',
    '$timeout',
    '$window',
    'lodash',
    'URI',
    'threads',
    'utilities',
    function (
      $http,
      $localStorage,
      $q,
      $rootScope,
      $sce,
      $state,
      $timeout,
      $window,
      lodash,
      URI,
      threads,
      utilities
    ) {
      var getMessage = function (
        threadId,
        messageId,
        to,
        cc,
        bcc,
        subject,
        html,
        attachments,
        date,
        formattedDate,
        from_,
        label
      ) {
        var message = {
          attachments: attachments.map(
            function (attachment) {
              return {
                  bytes: attachment.bytes,
                  contentType: attachment.contentType || attachment.type,
                  fileName: attachment.fileName,
                  icon: attachment.icon,
                  id: attachment.key,
                  size: attachment.sizeInBytes || attachment.size,
                  url: URI($window.variables.url)
                    .segment('inbox')
                    .segment('m')
                    .segment(messageId)
                    .segment('a')
                    .segment(lodash.last(attachment.key.split('://')))
                    .search({
                      bearer: $localStorage.bearer
                    })
                    .href()
              };
            }
          ),
          bcc: bcc,
          cc: cc,
          content: html,
          date: date,
          formattedDate: formattedDate,
          from: from_,
          from_: from_.n || from_.e,
          label: label,
          meta: {
            messageId: messageId
          },
          readReceipts: {},
          snippet: $sce.trustAsHtml('...'),
          state: {
            isDraft: false,
            isImportant: false,
            isMentioned: false,
            isSent: true,
            isStarred: false,
            isUnread: false
          },
          status: 2,
          to: to,
          to_cc: [].concat(
            to.map(
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
            cc.map(
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
          )
        };
        return message;
      };

      var getThread = function (
        threadId,
        messageId,
        to,
        cc,
        bcc,
        subject,
        html,
        attachments,
        date,
        formattedDate,
        from_,
        label
      ) {
        var thread = {
          date: date,
          formattedDate: formattedDate,
          isExpanded: false,
          label: label,
          messages: [
            getMessage(
              threadId,
              messageId,
              to,
              cc,
              bcc,
              subject,
              html,
              attachments,
              date,
              formattedDate,
              from_
            )
          ],
          messages_: '',
          meta: {
            messageId: messageId,
            threadId: threadId
          },
          snippet: $sce.trustAsHtml('...'),
          state: {
            hasAttachments: attachments.length,
            isStarred: false,
            isUnread: false
          },
          subject: subject || '(no subject)',
          summary: {
            from: [
              {
                isUnread: false,
                name: from_.n
              }
            ],
            snippet: html
          }
        };
        thread.from = utilities.getFrom(thread);
        return thread;
      };

      return {
        delete: function (thread, message) {
          var defer = $q.defer();
          if (thread.messages.length > 1) {
            thread
              .messages
              .splice(
                utilities
                  .getMessageIndex(thread.messages, message.meta.messageId),
                1
              );
            thread.meta.messageId = lodash
              .last(thread.messages)
              .meta
              .messageId;
            lodash.last(thread.messages).status = 2;
            $http({
              ignoreLoadingBar: true,
              method: 'DELETE',
              url: URI($window.variables.url)
                .segment('messages')
                .segment(message.meta.messageId)
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
          } else {
            threads
              .delete(thread.meta.threadId)
              .then(
                function () {
                  defer.resolve();
                },
                function () {
                  defer.reject();
                }
              );
          }
          return defer.promise;
        },
        insert: function (
          thread, message, to, cc, bcc, subject, html, attachments, isForwarded
        ) {
          $rootScope.step = 1;
          to = lodash
            .uniqBy(
              to,
              function (item) {
                return item.e;
              }
            )
            .map(
              function (item) {
                if (item.e in $rootScope.contacts) {
                  item.n = $rootScope.contacts[item.e].name;
                }
                return item;
              }
            );
          cc = lodash
            .differenceBy(
              lodash.uniqBy(
                cc,
                function (item) {
                  return item.e;
                }
              ),
              to,
              function (item) {
                return item.e;
              }
            )
            .map(
              function (item) {
                if (item.e in $rootScope.contacts) {
                  item.n = $rootScope.contacts[item.e].name;
                }
                return item;
              }
            );
          bcc = lodash
            .differenceBy(
              lodash.uniqBy(
                bcc,
                function (item) {
                  return item.e;
                }
              ),
              to,
              cc,
              function (item) {
                return item.e;
              }
            )
            .map(
              function (item) {
                if (item.e in $rootScope.contacts) {
                  item.n = $rootScope.contacts[item.e].name;
                }
                return item;
              }
            );
          var defer = $q.defer();
          var date = moment.utc().unix() * 1000;
          var formattedDate = moment().format('hh:mm A');
          var from_ = {
            e: $rootScope.user.email,
            n: $rootScope.user.name || $rootScope.user.email
          };
          var label = utilities.getLabel(from_.n);
          var t;
          var m;
          if (thread) {
            m = getMessage(
              thread.meta.threadId,
              thread.meta.threadId,
              to,
              cc,
              bcc,
              subject,
              html,
              attachments,
              date,
              formattedDate,
              from_,
              label
            );
            thread.messages.push(m);
            thread.from = utilities.getFrom(thread);
            thread.messages_ = '';
            if (thread.messages.length > 1) {
              thread.messages_ = '(' + thread.messages.length + ')';
            }
            $rootScope
              .feeds
              .threads[
                utilities.getThreadIndex(
                  $rootScope.feeds.threads, thread.meta.threadId
                )
              ] = thread;
          } else {
            if ($rootScope.feeds.q === 'in:sent') {
              t = getThread(
                '0',
                '0',
                to,
                cc,
                bcc,
                subject,
                html,
                attachments,
                date,
                formattedDate,
                from_
              );
              $rootScope.feeds.threads.push(t);
            }
          }
          attachmentIds = [];
          attachments.forEach(
            function (attachment) {
              attachmentIds.push(attachment.key);
            }
          );
          $http({
            data: {
              attachmentIds: attachmentIds,
              bcc: bcc,
              cc: cc,
              forwardedMessageId: isForwarded? (message? message.meta.messageId: ''): '',
              html: html,
              inReplyTo: message? message.meta.messageId: '',
              subject: subject,
              threadId: thread? thread.meta.threadId: '',
              to: to
            },
            ignoreLoadingBar: true,
            method: 'POST',
            url: URI($window.variables.url).segment('messages').href()
          })
            .then(
              function (response) {
                if (thread) {
                  thread.meta.requestId = response.data.requestId;
                  thread.meta.messageId = response.data.requestId;
                  m.meta.requestId = response.data.requestId;
                } else {
                  if ($rootScope.feeds.q === 'in:sent') {
                    t.meta.requestId = response.data.requestId;
                    t.meta.threadId = response.data.requestId;
                    t.meta.messageId = response.data.requestId;
                    t.messages[0].meta.requestId = response.data.requestId;
                  }
                }
                $rootScope.refreshCounts([]);
                $rootScope.step = 2;
                $timeout(
                  function () {
                    $rootScope.step = 0;
                  },
                  1000
                );
                defer.resolve();
              },
              function () {
                if (thread) {
                  $rootScope
                    .feeds
                    .threads[
                      utilities.getThreadIndex(
                        $rootScope.feeds.threads, thread.meta.threadId
                      )
                    ]
                    .messages
                    .pop();
                } else {
                  $rootScope.feeds.threads.pop();
                }
                $rootScope.step = 2;
                $timeout(
                  function () {
                    $rootScope.step = 0;
                  },
                  1000
                );
                defer.reject();
              }
            );
          $window.ga(
            'send',
            'event',
            'message',
            'sent',
            $state.current.url + '#' + $rootScope.feeds.v
          );
          return defer.promise;
        },
        update: function (messageId, state) {
          var defer = $q.defer();
          $http({
            ignoreLoadingBar: true,
            data: {
              state: state
            },
            method: 'POST',
            url: URI($window.variables.url)
              .segment('messages')
              .segment(messageId)
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
