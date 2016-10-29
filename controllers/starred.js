application.controller(
  'starred',
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
