application.factory(
  'contacts',
  [
    '$http',
    '$q',
    '$rootScope',
    '$window',
    'URI',
    function ($http, $q, $rootScope, $window, URI) {
      return {
        select: function (prefix, limit) {
          var defer = $q.defer();
          var search = {};
          if (prefix && limit) {
            search = {
              prefix: prefix,
              limit: limit
            };
          }
          $http({
            ignoreLoadingBar: true,
            method: 'GET',
            url: URI($window.variables.url)
              .segment('contacts')
              .segment('me')
              .search(search)
              .href()
          })
            .then(
              function (response) {
                defer.resolve(
                  response
                    .data
                    .contacts
                    .map(
                      function (contact) {
                        if (contact.email === undefined) {
                          contact.email = '';
                        }
                        if (contact.name === undefined) {
                          contact.name = '';
                        }
                        if (contact.firstName === undefined) {
                          contact.firstName = '';
                        }
                        if (contact.lastName === undefined) {
                          contact.lastName = '';
                        }
                        if (contact.imageUrl === undefined) {
                          contact.imageUrl = '';
                        }
                        return contact;
                      }
                    )
                    .reduce(
                      function (contact, item) {
                        contact[item.email] = item;
                        return contact;
                      },
                      {}
                    )
                );
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
