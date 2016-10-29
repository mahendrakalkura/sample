application.controller(
  'inbox',
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
