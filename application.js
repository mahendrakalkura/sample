var jFrame = Object.create(
  HTMLElement.prototype,
  {
    createdCallback: {
      value: function () {
        return this.createShadowRoot();
      }
    }
  }
);

var paragraph = function (event) {
  if (event.animationName === 'paragraph') {
    jQuery(event.target)
      .replaceWith('<div>' + (event.target.innerHTML || '<br>') + '</div>');
  }
};

var resize = function () {
  var body = jQuery('body');
  var wrapper = body.find('#wrapper');
  if (!wrapper.hasClass('forced')) {
    if (jQuery(document).width() > 990) {
      body.removeClass('smallscreen').addClass('widescreen');
      wrapper.removeClass('enlarged');
    } else {
      body.removeClass('widescreen').addClass('smallscreen');
      wrapper.addClass('enlarged');
      jQuery('.left ul').removeAttr('style');
    }
    if (wrapper.hasClass('enlarged') && body.hasClass('fixed-left')) {
      body.removeClass('fixed-left').addClass('fixed-left-void');
    } else if (
      !wrapper.hasClass('enlarged') && body.hasClass('fixed-left-void')
    ) {
      body.removeClass('fixed-left-void').addClass('fixed-left');
    }
  }
  slimScroll('.slimscrollleft');
};

var slimScroll = function (item) {
  if (jQuery('#wrapper').hasClass('enlarged')) {
    jQuery(item).css('overflow', 'hidden').parent().css('overflow', 'hidden');
    jQuery(item).siblings('.slimScrollBar').css('visibility', 'visible');
  } else {
    jQuery(item).css('overflow', 'hidden').parent().css('overflow', 'hidden');
    jQuery(item).siblings('.slimScrollBar').css('visibility', 'visible');
  }
};

var application = angular.module(
  'application',
  [
    'angular-inview',
    'angular-loading-bar',
    'angular-web-notification',
    'fsm',
    'infinite-scroll',
    'mentio',
    'ngFileUpload',
    'ngRaven',
    'ngStorage',
    'ngTagsInput',
    'ngTouch',
    'summernote',
    'ui.bootstrap',
    'ui.router'
  ]
);

application.config([
  '$compileProvider',
  '$httpProvider',
  '$locationProvider',
  '$stateProvider',
  '$urlRouterProvider',
  'cfpLoadingBarProvider',
  function (
    $compileProvider,
    $httpProvider,
    $locationProvider,
    $stateProvider,
    $urlRouterProvider,
    cfpLoadingBarProvider
  ) {
    $compileProvider.debugInfoEnabled(false);

    $httpProvider.interceptors.push([
      '$injector',
      '$location',
      '$q',
      function ($injector, $location, $q) {
        return {
          request: function (config) {
            if (config.local === true) {
              var $rootScope = $injector.get('$rootScope');
              var defer = $q.defer();
              config.timeout = defer.promise;
              $rootScope.$http.push({
                defer: defer,
                rootScopeFeedsV: $rootScope.feeds.v,
                stateCurrentName: $rootScope.$state.to
              });
            }
            bearer = $injector.get('$localStorage').bearer;
            if (bearer !== undefined) {
              config.headers.Authorization = 'Bearer' + ' ' + bearer;
            }
            return config || $q.when(config);
          },
          response: function (response) {
            var $rootScope = $injector.get('$rootScope');
            $rootScope.$http = $rootScope.$http
              .filter(
                function (item) {
                  return item.defer.promise.$$state.status === 0;
                }
              );
            return response;
          },
          responseError: function (response) {
            var $rootScope = $injector.get('$rootScope');
            if (response.status !== -1) {
              $injector.get('$raven').captureException(
                new Error('responseError'),
                {
                  extra: {
                    config: response.config,
                    status: response.status
                  }
                }
              );
            }
            if (response.status === 401) {
              $rootScope.signOut();
              $injector.get('$state').go('401');
              return $q.reject(response);
            }
            if (response.status === 403) {
              $rootScope.signOut();
              $injector.get('$state').go('403');
              return $q.reject(response);
            }
            if (response.status === 404) {
              $injector.get('$state').go('404');
              return $q.reject(response);
            }
            return $q.reject(response);
          }
        };
      }
    ]);

    $locationProvider.hashPrefix('!');
    $locationProvider.html5Mode(false);

    $stateProvider
      .state(
        'secondary',
        {
          controller: 'secondary',
          templateUrl: 'templates/controllers/secondary.html',
        }
      )
      .state(
        'welcome',
        {
          controller: 'welcome',
          parent: 'secondary',
          templateUrl: 'templates/controllers/welcome.html',
          url: '/welcome/'
        }
      )
      .state(
        'sign-in',
        {
          controller: 'signIn',
          parent: 'secondary',
          templateUrl: 'templates/controllers/sign-in.html',
          url: '/sign-in/'
        }
      )
      .state(
        'step-1',
        {
          controller: 'step1',
          parent: 'secondary',
          templateUrl: 'templates/controllers/step-1.html',
          url: '/step-1/'
        }
      )
      .state(
        'step-2',
        {
          controller: 'step2',
          parent: 'secondary',
          templateUrl: 'templates/controllers/step-2.html',
          url: '/step-2/'
        }
      )
      .state(
        'sign-out',
        {
          controller: 'signOut',
          parent: 'secondary',
          templateUrl: 'templates/controllers/sign-out.html',
          url: '/sign-out/'
        }
      )
      .state(
        '401',
        {
          controller: '401',
          parent: 'secondary',
          templateUrl: 'templates/controllers/401.html',
          url: '/401/'
        }
      )
      .state(
        '403',
        {
          controller: '403',
          parent: 'secondary',
          templateUrl: 'templates/controllers/403.html',
          url: '/403/'
        }
      )
      .state(
        '404',
        {
          controller: '404',
          parent: 'secondary',
          templateUrl: 'templates/controllers/404.html',
          url: '/404/'
        }
      )
      .state(
        'primary',
        {
          controller: 'primary',
          templateUrl: 'templates/controllers/primary.html',
        }
      )
      .state(
        'inbox',
        {
          controller: 'inbox',
          parent: 'primary',
          resolve: {
            feeds: [
              '$rootScope',
              '$state',
              'feeds',
              'utilities',
              function ($rootScope, $state, feeds, utilities) {
                $rootScope.feeds.q = utilities.getQ('');
                if ($rootScope.$state.from !== '') {
                  $rootScope.partialSync();
                }
                return feeds
                  .inbox()
                  .then(
                    function () {
                    },
                    function () {
                      $state.go('404');
                    }
                  );
              }
            ]
          },
          templateUrl: 'templates/controllers/inbox.html',
          url: '/inbox/'
        }
      )
      .state(
        'categories',
        {
          controller: 'categories',
          parent: 'primary',
          resolve: {
            feeds: [
              '$rootScope',
              '$state',
              '$stateParams',
              'feeds',
              'utilities',
              function ($rootScope, $state, $stateParams, feeds, utilities) {
                $rootScope.feeds.q = utilities.getQ(
                  'category:' + $stateParams.id
                );
                return feeds
                  .inbox()
                  .then(
                    function () {
                    },
                    function () {
                      $state.go('404');
                    }
                  );
              }
            ]
          },
          templateUrl: 'templates/controllers/categories.html',
          url: '/categories/{id}/'
        }
      )
      .state(
        'starred',
        {
          controller: 'starred',
          parent: 'primary',
          resolve: {
            feeds: [
              '$rootScope',
              '$state',
              'feeds',
              'utilities',
              function ($rootScope, $state, feeds, utilities) {
                $rootScope.feeds.q = utilities.getQ('is:starred');
                return feeds
                  .inbox()
                  .then(
                    function () {
                    },
                    function () {
                      $state.go('404');
                    }
                  );
              }
            ]
          },
          templateUrl: 'templates/controllers/starred.html',
          url: '/starred/'
        }
      )
      .state(
        'sent',
        {
          controller: 'sent',
          parent: 'primary',
          resolve: {
            feeds: [
              '$rootScope',
              '$state',
              'feeds',
              'utilities',
              function ($rootScope, $state, feeds, utilities) {
                $rootScope.feeds.q = utilities.getQ('in:sent');
                return feeds
                  .inbox()
                  .then(
                    function () {
                    },
                    function () {
                      $state.go('404');
                    }
                  );
              }
            ]
          },
          templateUrl: 'templates/controllers/sent.html',
          url: '/sent/'
        }
      )
      .state(
        'labels',
        {
          controller: 'labels',
          parent: 'primary',
          resolve: {
            feeds: [
              '$rootScope',
              '$state',
              '$stateParams',
              'feeds',
              'utilities',
              function ($rootScope, $state, $stateParams, feeds, utilities) {
                $rootScope.feeds.q = utilities.getQ(
                  'label:' + $stateParams.id
                );
                return feeds
                  .inbox()
                  .then(
                    function () {
                    },
                    function () {
                      $state.go('404');
                    }
                  );
              }
            ]
          },
          templateUrl: 'templates/controllers/labels.html',
          url: '/labels/{id}/'
        }
      )
      .state(
        'all',
        {
          controller: 'all',
          parent: 'primary',
          resolve: {
            feeds: [
              '$rootScope',
              '$state',
              'feeds',
              'utilities',
              function ($rootScope, $state, feeds, utilities) {
                $rootScope.feeds.q = utilities.getQ('in:all');
                return feeds
                  .inbox()
                  .then(
                    function () {
                    },
                    function () {
                      $state.go('404');
                    }
                  );
              }
            ]
          },
          templateUrl: 'templates/controllers/all.html',
          url: '/all/'
        }
      )
      .state(
        'spam',
        {
          controller: 'spam',
          parent: 'primary',
          resolve: {
            feeds: [
              '$rootScope',
              '$state',
              'feeds',
              'utilities',
              function ($rootScope, $state, feeds, utilities) {
                $rootScope.feeds.q = utilities.getQ('in:spam');
                return feeds
                  .inbox()
                  .then(
                    function () {
                    },
                    function () {
                      $state.go('404');
                    }
                  );
              }
            ]
          },
          templateUrl: 'templates/controllers/spam.html',
          url: '/spam/'
        }
      )
      .state(
        'trash',
        {
          controller: 'trash',
          parent: 'primary',
          resolve: {
            feeds: [
              '$rootScope',
              '$state',
              'feeds',
              'utilities',
              function ($rootScope, $state, feeds, utilities) {
                $rootScope.feeds.q = utilities.getQ('in:trash');
                return feeds
                  .inbox()
                  .then(
                    function () {
                    },
                    function () {
                      $state.go('404');
                    }
                  );
              }
            ]
          },
          templateUrl: 'templates/controllers/trash.html',
          url: '/trash/'
        }
      )
      .state(
        'search',
        {
          controller: 'search',
          parent: 'primary',
          resolve: {
            feeds: [
              '$rootScope',
              '$state',
              'feeds',
              function ($rootScope, $state, feeds) {
                $rootScope.isExpanded = false;
                $rootScope.feeds.p = 1;
                return feeds
                  .inbox()
                  .then(
                    function () {
                    },
                    function () {
                      $state.go('404');
                    }
                  );
              }
            ]
          },
          templateUrl: 'templates/controllers/search.html',
          url: '/search/'
        }
      )
      .state(
        'thread',
        {
          controller: 'thread',
          parent: 'primary',
          resolve: {
            feeds: [
              '$state',
              '$stateParams',
              'feeds',
              function ($state, $stateParams, feeds) {
                return feeds
                  .thread($stateParams.id)
                  .then(
                    function () {
                    },
                    function () {
                      $state.go('404');
                    }
                  );
              }
            ]
          },
          templateUrl: 'templates/controllers/thread.html',
          url: '/thread/{id}/'
        }
      );

    $urlRouterProvider.otherwise(function ($injector) {
      $injector.get('$state').go('welcome');
    });

    cfpLoadingBarProvider.includeSpinner = false;
  }
]);

application.constant('lodash', _);

application.constant('moment', moment);

application.constant('URI', URI);

application.run([
  '$http',
  '$localStorage',
  '$q',
  '$raven',
  '$rootScope',
  '$state',
  '$stateParams',
  '$timeout',
  '$uibModal',
  '$window',
  'lodash',
  'URI',
  'webNotification',
  'contacts',
  'emojis',
  'feeds',
  'labels',
  'threads',
  'users',
  'utilities',
  'webSockets',
  function (
    $http,
    $localStorage,
    $q,
    $raven,
    $rootScope,
    $state,
    $stateParams,
    $timeout,
    $uibModal,
    $window,
    lodash,
    URI,
    webNotification,
    contacts,
    emojis,
    feeds,
    labels,
    threads,
    users,
    utilities,
    webSockets
  ) {
    $rootScope.$http = [];
    $rootScope.$state = {
      from: '',
      to: ''
    };

    $rootScope.lodash = lodash;

    $rootScope.signUp = 0;
    $rootScope.step = 0;

    $rootScope.user = {};
    $rootScope.contacts = {};
    $rootScope.categories = [];
    $rootScope.labels = [];
    $rootScope.counts = {};
    $rootScope.timestamp = moment().utc().unix() * 1000;

    $rootScope.feeds = utilities.getFeeds();
    $rootScope.incoming = [];

    $rootScope.isExpanded = false;

    $rootScope.emojis = emojis.select();
    $rootScope.filenames = utilities.getFilenames();

    $rootScope.inject = function () {
      var thread;
      while ($rootScope.incoming.length) {
        thread = $rootScope.incoming.pop();
        $rootScope.feeds.threads.push(thread);
      }
    };

    $rootScope.compose = function () {
      $uibModal
        .open({
          animation: true,
          backdrop: 'static',
          controller: 'editor',
          resolve: {
            title: function () {
              return 'Compose';
            },
            thread: function () {
              return undefined;
            },
            message: function () {
              return undefined;
            },
            to: function () {
              return '';
            },
            cc: function () {
              return '';
            },
            bcc: function () {
              return '';
            },
            subject: function () {
              return '';
            },
            html: function () {
              return '';
            },
            attachments: function () {
              return [];
            },
            files: function () {
              return [];
            },
            isForwarded: function () {
              return false;
            },
            isNew: function () {
              return true;
            }
          },
          size: 'full editor',
          templateUrl: 'templates/controllers/editor.html',
          windowTemplateUrl: 'templates/controllers/modal.html'
        });
      $window.ga(
        'send',
        'event',
        'compose',
        'compose',
        $state.current.url + '#' + $rootScope.feeds.v
      );
    };

    $rootScope.expand = function (index, $inviewpart) {
      var thread = $rootScope.feeds.threads[index];
      if (thread === undefined) {
        return;
      }
      if (
        !$window.nearViewport(
          angular.element('#thread-' + thread.meta.threadId).get(0), 250
        )
      ) {
        return;
      }
      if (!thread.state.isUnread) {
        $rootScope.expand(index + 1, '');
        return;
      }
      thread.isExpanded = true;
      if (
        $rootScope
          .user
          .preferences['account:settings:markAsRead'] === 'true' &&
        $inviewpart === 'bottom'
      ) {
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
        threads.update(thread.meta.threadId, 'read');
      }
      $timeout(
          function () {
          jQuery($window).trigger('resize');
        }
      );
      $timeout(
        function () {
          $rootScope.expand(index + 1, '');
        }
      );
    };

    $rootScope.feedback = function () {
      $uibModal
        .open({
          animation: true,
          backdrop: 'static',
          controller: 'editor',
          resolve: {
            title: function () {
              return 'Feedback';
            },
            thread: function () {
              return undefined;
            },
            message: function () {
              return undefined;
            },
            to: function () {
              return 'feedback@nextmailapp.com';
            },
            cc: function () {
              return '';
            },
            bcc: function () {
              return '';
            },
            subject: function () {
              return 'Feedback';
            },
            html: function () {
              return '';
            },
            attachments: function () {
              return [];
            },
            files: function () {
              return [];
            },
            isForwarded: function () {
              return false;
            },
            isNew: function () {
              return false;
            }
          },
          size: 'full editor',
          templateUrl: 'templates/controllers/editor.html',
          windowTemplateUrl: 'templates/controllers/modal.html'
        });
    };

    $rootScope.hide = function () {
      switch ($rootScope.feeds.v) {
        case 't':
          $rootScope.feeds.threads.forEach(
            function (thread) {
              if (!thread.state.isUnread) {
                thread.isExpanded = false;
              }
            }
          );
          $timeout(
            function () {
              jQuery($window).trigger('resize');
            }
          );
          break;
        case 'u':
          for (
            var index = $rootScope.feeds.threads.length - 1;
            index >= 0;
            index--
          ) {
              if (!$rootScope.feeds.threads[index].state.isUnread) {
                  $rootScope.feeds.threads.splice(index, 1);
              }
          }
          $timeout(
            function () {
              jQuery($window).trigger('resize');
            }
          );
          break;
        case 'a':
          break;
        default:
          break;
      }
    };

    $rootScope.infiniteScroll = function () {
      feeds
        .inbox()
        .then(
          function () {
          },
          function () {
            $state.go('404');
          }
        );
    };

    $rootScope.initialize = function () {
      var timezone = function () {
        var timezone = $window.jstz().timezone_name;
        if ($localStorage.timezone === timezone) {
          var defer = $q.defer();
          defer.resolve();
          return defer.promise;
        }
        $localStorage.timezone = timezone;
        return users
          .set(
            {
              preferences: {
                'account:settings:timezone': $localStorage.timezone
              }
            },
            'preferences'
          );
      };

      var defer = $q.defer();
      timezone()
        .then(
          function () {
            users
              .get('detailed')
              .then(
                function (user) {
                  $rootScope.user = user;
                  $rootScope.categories = utilities.getCategories(
                    $rootScope.user
                  );
                  $rootScope.partialSync();
                  $rootScope.refreshContacts();
                  $rootScope.refreshLabels();
                  $rootScope.refreshCounts([
                    'INBOX',
                    'STARRED'
                  ]);
                  webSockets.initialize();
                  $rootScope.notifications();
                  $raven.setUserContext({
                    bearer: $localStorage.bearer,
                    email: $rootScope.user.email
                  });
                  $window.ga('set', 'userId', $rootScope.user.email);
                  $window.ga(
                    'send',
                    'pageview', {
                      'sessionControl': 'start'
                    }
                  );
                  defer.resolve();
                },
                function () {
                  defer.reject();
                }
              );
          },
          function () {
            defer.reject();
          }
        );
      return defer.promise;
    };

    $rootScope.inView = function (
      thread, $index, $inview, $inviewpart, $event
    ) {
      if (!$rootScope.isExpanded) {
        return;
      }
      if (!$inview) {
        return;
      }
      if (
        $inviewpart !== 'both' &&
        $inviewpart !== 'top' &&
        $inviewpart !== 'bottom'
      ) {
        return;
      }
      $timeout(
        function () {
          $rootScope.expand($index, $inviewpart);
        }
      );
    };

    $rootScope.logo = function () {
      $rootScope.feeds.v = 't';
      $state.go(
        'inbox',
        {},
        {
          reload: true
        }
      );
    };

    $rootScope.notifications = function () {
      if ($localStorage.notifications === true) {
        return;
      }
      if (webNotification.permissionGranted) {
        return;
      }
      $window
        .notify
        .requestPermission(
          function () {
            $rootScope
              .user
              .preferences[
                'account:settings:notifications:browser'
              ] = webNotification.permissionGranted? 'true': 'false';
            users.set($rootScope.user, 'preferences');
          }
        );
      $localStorage.notifications = true;
    };

    $rootScope.partialSync = function () {
      $http({
        ignoreLoadingBar: true,
        method: 'POST',
        data: {
          sync: 'partial'
        },
        url: URI($window.variables.url)
          .segment('inbox')
          .segment('me')
          .segment('sync')
          .href()
      });
    };

    $rootScope.readReceipts = function (threads) {
      feeds
        .readReceipts(threads.join(','))
        .then(
          function (items) {
            $rootScope.feeds.threads.forEach(
              function (thread) {
                thread.messages.forEach(
                  function (message) {
                    if (items[thread.meta.threadId] === undefined) {
                      return;
                    }
                    if (
                      items[thread.meta.threadId][message.meta.messageId] ===
                      undefined
                    ) {
                      return;
                    }
                    items[thread.meta.threadId][message.meta.messageId]
                      .forEach(
                        function (item) {
                          message.readReceipts[item.receiver] = {
                            firedOn : item.firedOn,
                            receiver : item.receiver,
                            receiverName : item.receiverName
                          };
                        }
                      );
                  }
                );
              }
            );
          },
          function () {
          }
        );
    };

    $rootScope.search = function () {
      $state.go(
        'search',
        {},
        {
          reload: true
        }
      );
    };

    $rootScope.settings = function () {
      $uibModal
        .open({
          animation: true,
          controller: 'settings',
          resolve: {
            user: function () {
              return $rootScope.user;
            }
          },
          size: 'lg',
          templateUrl: 'templates/controllers/settings.html',
          windowTemplateUrl: 'templates/controllers/modal.html'
        });
    };

    $rootScope.signIn = function (bearer) {
      $localStorage.bearer = bearer;
      return $rootScope.initialize();
    };

    $rootScope.signOut = function () {
      delete $localStorage.bearer;

      $rootScope.user = {};
      $rootScope.contacts = {};
      $rootScope.categories = [];
      $rootScope.labels = [];
      $rootScope.counts = {};

      $rootScope.feeds = utilities.getFeeds();

      $rootScope.isExpanded = false;

      $window.ga('set', 'userId', null);
      $window.ga(
        'send',
        'pageview',
        {
          'sessionControl': 'end'
        }
      );
    };

    $rootScope.synchronize = function (threads) {
      var notify = function (categories, thread) {
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
            .preferences['account:settings:alerts:newEmails'] === 'false'
        ) {
            return;
        }
        if (thread.category) {
          if (categories.indexOf(thread.category) !== -1) {
            return;
          }
        }
        if (thread.date < $rootScope.timestamp) {
          return;
        }
        if (!thread.state.isUnread) {
          return;
        }
        webNotification.showNotification(
          thread.messages[0].from_,
          {
            autoClose: 5000,
            body: thread.subject,
            icon: '/images/icon.ico',
            onClick: function () {
              $state.go(
                'thread',
                {
                  id: thread.meta.threadId
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

      var defer = $q.defer();
      feeds
        .threads(threads.join(','))
        .then(
          function (threads) {
            threads.forEach(
              function (thread) {
                var status = false;
                var categories = $rootScope
                  .categories
                  .map(
                    function (category) {
                      return category.id;
                    }
                  );
                var labels = lodash.uniq(
                  lodash.flattenDeep(
                    thread
                      .messages
                      .map(
                        function (message) {
                          return message.labels;
                        }
                      )
                  )
                );
                notify(categories, thread);
                switch ($state.current.name) {
                  case 'inbox':
                    if (thread.state.isInbox) {
                      if (thread.category) {
                        if (categories.indexOf(thread.category) === -1) {
                          status = true;
                        }
                      } else {
                        status = true;
                      }
                    } else {
                      status = false;
                    }
                    break;
                  case 'categories':
                    if (thread.state.isInbox) {
                      if (thread.category === $stateParams.id) {
                        status = true;
                      }
                    }
                    break;
                  case 'starred':
                    if (thread.state.isInbox) {
                      if (thread.state.isStarred) {
                        if (thread.category) {
                          if (categories.indexOf(thread.category) === -1) {
                            status = true;
                          }
                        } else {
                          status = true;
                        }
                      }
                    }
                    break;
                  case 'sent':
                    if (!thread.state.isInbox) {
                      status = true;
                    }
                    break;
                  case 'labels':
                    if (thread.state.isInbox) {
                      if (labels.indexOf($stateParams.id) !== -1) {
                        status = true;
                      }
                    }
                    break;
                  case 'thread':
                    if (thread.meta.threadId === $stateParams.id) {
                      status = true;
                    }
                    break;
                }
                var index = utilities.getThreadIndex(
                  $rootScope.feeds.threads, thread.meta.threadId
                );
                if (index !== -1) {
                  if (status) {
                    $rootScope.feeds.threads[index].messages.forEach(
                      function (m) {
                        thread.messages.forEach(
                          function (message) {
                            if (
                              message.meta.messageId !== m.meta.messageId
                            ) {
                              return;
                            }
                            message.status = m.status;
                          }
                        );
                      }
                    );
                    thread.isExpanded = $rootScope
                      .feeds
                      .threads[index]
                      .isExpanded;
                    $rootScope.feeds.threads[index] = thread;
                  } else {
                    $rootScope.feeds.threads.splice(index, 1);
                  }
                } else {
                  if ($rootScope.feeds.v === 'u') {
                    if (!thread.state.isUnread) {
                      status = false;
                    }
                  }
                  if (status) {
                    if ($rootScope.isExpanded) {
                      $rootScope.incoming.push(thread);
                    } else {
                      $rootScope.feeds.threads.push(thread);
                    }
                  }
                }
              }
            );
            $rootScope.readReceipts(
              threads.map(
                function (thread) {
                  return thread.meta.threadId;
                }
              )
            );
            defer.resolve();
          },
          function () {
            defer.reject();
          }
        );
      return defer.promise;
    };

    $rootScope.refreshContacts = function () {
      contacts
        .select(undefined, undefined)
        .then(
          function (response) {
            $rootScope.contacts = response;
          },
          function (response) {
            $rootScope.contacts = {};
          }
        );
    };

    $rootScope.refreshCounts = function (items) {
      if (!items.length) {
          items.push('INBOX');
          items.push('STARRED');
          $rootScope.categories.forEach(
            function (category) {
              items.push(category.alias);
            }
          );
          $rootScope.labels.forEach(
            function (label) {
              items.push(label.alias);
            }
          );
      }
      feeds
        .counts(items)
        .then(
          function (response) {
            for (var key in response) {
              $rootScope.counts[key] = response[key];
            }
          },
          function () {
          }
        );
    };

    $rootScope.refreshLabels = function () {
      labels
        .select()
        .then(
          function (response) {
            $rootScope.labels = response;
          },
          function () {
            $rootScope.labels = [];
          }
        );
    };

    $rootScope.getSummernote = function () {
      return {
        disableDragAndDrop: true,
        hint: {
          content: function (item) {
            var url = $rootScope.emojis[item];
            if (url) {
              return $('<img>').attr('src', url).css('width', 20)[0];
            }
            return '';
          },
          match: /:([\-+\w]+)$/,
          search: function (keyword, callback) {
            callback(
              $window.jQuery.grep(
                Object.keys($rootScope.emojis),
                function (item) {
                  return item.indexOf(keyword) !== -1;
                }
              )
            );
          },
          template: function (item) {
            return (
              '<img ' +
              'src="' + $rootScope.emojis[item] + '"' +
              ' ' +
              'width="20"' +
              '>' +
              ' ' +
              ':' + item + ':'
            );
          }
        },
        hintDirection: 'top',
        keyMap: {
          mac: {
            'CMD+B': 'bold',
            'CMD+BACKSLASH': 'removeFormat',
            'CMD+ENTER': undefined,
            'CMD+I': 'italic',
            'CMD+K': 'linkDialog.show',
            'CMD+LEFTBRACKET': 'outdent',
            'CMD+NUM0': 'formatPara',
            'CMD+NUM1': 'formatH1',
            'CMD+NUM2': 'formatH2',
            'CMD+NUM3': 'formatH3',
            'CMD+NUM4': 'formatH4',
            'CMD+NUM5': 'formatH5',
            'CMD+NUM6': 'formatH6',
            'CMD+RIGHTBRACKET': 'indent',
            'CMD+SHIFT+E': 'justifyCenter',
            'CMD+SHIFT+J': 'justifyFull',
            'CMD+SHIFT+L': 'justifyLeft',
            'CMD+SHIFT+NUM7': 'insertUnorderedList',
            'CMD+SHIFT+NUM8': 'insertOrderedList',
            'CMD+SHIFT+R': 'justifyRight',
            'CMD+SHIFT+S': 'strikethrough',
            'CMD+SHIFT+Z': 'redo',
            'CMD+U': 'underline',
            'CMD+Z': 'undo',
            'ENTER': 'insertParagraph',
            'SHIFT+TAB': 'untab',
            'TAB': 'tab'
          },
          pc: {
            'CTRL+B': 'bold',
            'CTRL+BACKSLASH': 'removeFormat',
            'CTRL+ENTER': undefined,
            'CTRL+I': 'italic',
            'CTRL+K': 'linkDialog.show',
            'CTRL+LEFTBRACKET': 'outdent',
            'CTRL+NUM0': 'formatPara',
            'CTRL+NUM1': 'formatH1',
            'CTRL+NUM2': 'formatH2',
            'CTRL+NUM3': 'formatH3',
            'CTRL+NUM4': 'formatH4',
            'CTRL+NUM5': 'formatH5',
            'CTRL+NUM6': 'formatH6',
            'CTRL+RIGHTBRACKET': 'indent',
            'CTRL+SHIFT+E': 'justifyCenter',
            'CTRL+SHIFT+J': 'justifyFull',
            'CTRL+SHIFT+L': 'justifyLeft',
            'CTRL+SHIFT+NUM7': 'insertUnorderedList',
            'CTRL+SHIFT+NUM8': 'insertOrderedList',
            'CTRL+SHIFT+R': 'justifyRight',
            'CTRL+SHIFT+S': 'strikethrough',
            'CTRL+U': 'underline',
            'CTRL+Y': 'redo',
            'CTRL+Z': 'undo',
            'ENTER': 'insertParagraph',
            'SHIFT+TAB': 'untab',
            'TAB': 'tab'
          }
        },
        tabSize: 0,
        toolbar: [
          ['style', ['bold', 'italic', 'underline']],
          ['fontclr', ['color']],
          ['alignment', ['ul', 'ol']],
          ['insert', ['link']]
        ]
      };
    };

    $rootScope.hasCategory = function (id) {
      return $rootScope
        .categories
        .filter(
          function (category) {
            return category.id === id;
          }
        )
        .length;
    };

    $rootScope.hasReadEmails = function (isExpanded) {
      return $rootScope
        .feeds
        .threads
        .filter(
          function (thread) {
            return (
              !thread.state.isUnread &&
              (isExpanded === null || thread.isExpanded == isExpanded)
            );
          }
        )
        .length;
    };

    $rootScope.isSignedIn = function () {
      return $localStorage.bearer !== undefined;
    };

    $rootScope.$on(
      '$stateChangeStart',
      function (event, toState, toParams, fromState, fromParams) {
        var states = [
          'welcome',
          'sign-in'
        ];

        $rootScope.$state.to = toState.name;
        $rootScope.$state.from = fromState.name;

        angular.forEach(
          $rootScope.$http,
          function (value) {
            if (
              value.rootScopeFeedsV !== $rootScope.feeds.v ||
              value.stateCurrentName !== toState.name
            ) {
              if (value.defer) {
                value.defer.resolve();
              }
            }
          }
        );

        $rootScope.feeds.c = '';
        $rootScope.feeds.threads = [];
        $rootScope.feeds.hasStopped = false;
        $rootScope.feeds.isScrolling = false;

        $rootScope.incoming = [];

        $window.ga('set', 'page', toState.url + '#' + $rootScope.feeds.v);
        $window.ga('send', 'pageview');

        if ($rootScope.isSignedIn()) {
          if (states.indexOf(toState.name) !== -1) {
            event.preventDefault();
            $state.go('inbox');
            return;
          }
        } else {
          if (states.indexOf(toState.name) === -1) {
            event.preventDefault();
            $state.go('welcome');
            return;
          }
        }
        return;
      }
    );

    $rootScope.$watch(
      function () {
        return $rootScope.feeds.v;
      },
      function (newValue, oldValue) {
        if (newValue === undefined) {
          return;
        }
        if (newValue === oldValue) {
          return;
        }
        if (newValue === 'u') {
          if (!$rootScope.isExpanded) {
            $rootScope.isExpanded = true;
          }
        }
        if (newValue === 'a') {
          var q = [];
          if ($rootScope.feeds.q.length) {
            q.push($rootScope.feeds.q);
          }
          if ($rootScope.feeds.q.indexOf('has:attachment') === -1) {
            q.push('has:attachment');
          }
          $rootScope.feeds.q = q.join(' ');
        }
        $rootScope.feeds.filename = '';
        $state.go(
          $state.current,
          $stateParams,
          {
            reload: true
          }
        );
      }
    );

    $rootScope.$watch(
      function () {
        return $rootScope.feeds.filename;
      },
      function (newValue, oldValue) {
        if (newValue === undefined) {
          return;
        }
        if (newValue === oldValue) {
          return;
        }
        $state.go(
          $state.current,
          $stateParams,
          {
            reload: true
          }
        );
      }
    );

    $rootScope.$watch(
      'categories',
      function (newValue, oldValue) {
        if (!newValue.length) {
          return;
        }
        if (newValue === oldValue) {
          return;
        }
        $rootScope.refreshCounts(
          $rootScope.categories.map(
            function (category) {
              return category.alias;
            }
          )
        );
      }
    );

    $rootScope.$watch(
      'labels',
      function (newValue, oldValue) {
        if (!newValue.length) {
          return;
        }
        if (newValue === oldValue) {
          return;
        }
        $rootScope.refreshCounts(
          $rootScope.labels.map(
            function (label) {
              return label.alias;
            }
          )
        );
      }
    );

    $rootScope.$watch(
      'isExpanded',
      function (newValue, oldValue) {
        if (newValue === oldValue) {
          return;
        }
        if (newValue) {
          $rootScope.expand(0, '');
        } else {
          $rootScope.feeds.threads.forEach(
            function (thread) {
              thread.isExpanded = false;
              thread.messages.forEach(
                function (message) {
                  if (message.meta.messageId !== thread.meta.messageId) {
                    message.status = 0;
                  }
                }
              );
            }
          );
          $timeout(
              function () {
              jQuery($window).trigger('resize');
            }
          );
        }
      }
    );

    if ($rootScope.isSignedIn()) {
      $rootScope.initialize();
    }
  }
]);

document.registerElement(
  'j-frame',
  {
    prototype: jFrame,
  }
);

jQuery(
  function () {
    jQuery(document)
      .on(
        'keydown',
        '#to',
        function (event) {
          if (
            event.keyCode == 9 &&
            (event.shiftKey !== undefined && event.shiftKey === true)
          ) {
            event.preventDefault();
            event.stopPropagation();
            jQuery(this)
              .closest('.panel')
              .find('.note-editable')
              .trigger('focus');
            return;
          }
        }
      );
    jQuery(document)
      .on(
        'keydown',
        '#subject',
        function (event) {
          if (
            event.keyCode == 9 &&
            (event.shiftKey === undefined || event.shiftKey === false)
          ) {
            event.preventDefault();
            event.stopPropagation();
            jQuery(this)
              .closest('.panel')
              .find('.note-editable')
              .trigger('focus');
            return;
          }
        }
      );
    jQuery(document)
      .on(
        'resize',
        function () {
          resize();
        }
      );

    Raven.config(variables.sentry).addPlugin(Raven.Plugins.Angular).install();
  }
);
