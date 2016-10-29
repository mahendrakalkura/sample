application.controller(
  'trash',
  [
    '$scope',
    function ($scope) {
      $scope.actions = [
        'read',
        'unread',
        'spam'
      ];
    }
  ]
);
