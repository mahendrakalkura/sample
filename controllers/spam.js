application.controller(
  'spam',
  [
    '$scope',
    function ($scope) {
      $scope.actions = [
        'read',
        'unread',
        'unspam',
        'trash'
      ];
    }
  ]
);
