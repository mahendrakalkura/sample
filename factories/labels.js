application.factory(
  'labels',
  [
    '$http',
    '$q',
    '$window',
    'lodash',
    'URI',
    function ($http, $q, $window, lodash, URI) {
      return {
        select: function () {
          var defer = $q.defer();
          $http({
            ignoreLoadingBar: true,
            method: 'GET',
            url: URI($window.variables.url)
              .segment('inbox')
              .segment('me')
              .segment('labels')
              .href()
          })
            .then(
              function (response) {
                defer.resolve(
                  lodash.sortBy(
                    response.data.labels.map(
                      function (label) {
                        return {
                          alias: label.id,
                          id: label.id,
                          name: label.name
                        };
                      }
                    ),
                    function (label) {
                      return label.name;
                    }
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
