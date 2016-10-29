application.controller(
  'sent',
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
