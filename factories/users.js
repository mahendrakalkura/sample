application.factory(
  'users',
  [
    '$http',
    '$q',
    '$window',
    'URI',
    'utilities',
    function ($http, $q, $window, URI, utilities) {
      return {
        get: function (mode) {
          var defer = $q.defer();
          $http({
            method: 'GET',
            url: URI($window.variables.url)
              .segment('profile')
              .segment('me')
              .search({
                  mode: mode
              })
              .href()
          })
            .then(
              function (response) {
                var user = response.data;
                user.name = user.name.trim();
                user.label = utilities.getLabel(user.name || user.email);
                if (
                  user.preferences[
                    'account:settings:alerts:newEmails'
                  ] === undefined
                ) {
                  user.preferences[
                    'account:settings:alerts:newEmails'
                  ] = 'false';
                }
                if (
                  user.preferences[
                    'account:settings:alerts:readReceipts'
                  ] === undefined
                ) {
                  user.preferences[
                    'account:settings:alerts:readReceipts'
                  ] = 'false';
                }
                if (
                  user.preferences[
                    'account:settings:markAsRead'
                  ] === undefined
                ) {
                  user.preferences[
                    'account:settings:markAsRead'
                  ] = 'true';
                }
                if (
                  user.preferences[
                    'account:settings:name'
                  ] === undefined
                ) {
                  user.preferences[
                    'account:settings:name'
                  ] = '';
                }
                if (
                  user.preferences[
                    'account:settings:nickname'
                  ] === undefined
                ) {
                  user.preferences[
                    'account:settings:nickname'
                  ] = '';
                }
                if (
                  user.preferences[
                    'account:settings:notifications:browser'
                  ] === undefined
                ) {
                  user.preferences[
                    'account:settings:notifications:browser'
                  ] = 'false';
                }
                defer.resolve(user);
              },
              function () {
                defer.reject();
              }
            );
          return defer.promise;
        },
        set: function (user, section) {
          var defer = $q.defer();
          var data = {};
          data[section] = user[section];
          $http({
            ignoreLoadingBar: true,
            data: data,
            method: 'POST',
            url: URI($window.variables.url)
              .segment('profile')
              .segment('me')
              .segment(section)
              .href()
          })
            .then(
              function (response) {
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
