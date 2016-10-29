application.controller(
  'all',
  [
    '$scope',
    function ($scope) {
      $scope.actions = [
        'read',
        'unread',
        'archive',
        'spam',
        'trash'
      ];
    }
  ]
);
