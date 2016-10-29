application.controller(
  'labels',
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
