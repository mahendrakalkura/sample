application.controller(
  'editor',
  [
    '$localStorage',
    '$q',
    '$rootScope',
    '$scope',
    '$uibModalInstance',
    '$window',
    'lodash',
    'Upload',
    'contacts',
    'messages',
    'utilities',
    'title',
    'thread',
    'message',
    'to',
    'cc',
    'bcc',
    'subject',
    'html',
    'attachments',
    'files',
    'isForwarded',
    'isNew',
    function (
      $localStorage,
      $q,
      $rootScope,
      $scope,
      $uibModalInstance,
      $window,
      lodash,
      Upload,
      contacts,
      messages,
      utilities,
      title,
      thread,
      message,
      to,
      cc,
      bcc,
      subject,
      html,
      attachments,
      files,
      isForwarded,
      isNew
    ) {
      var dragEnter = function (editor, dropzone) {
        editor.addClass('dragover');
        dropzone.show();
        dropzone.css('height', editor.height());
        dropzone.css('width', editor.width());
        dropzone.find('.note-dropzone-message').html('Drop here...');
      };

      var dragLeave = function (editor, dropzone) {
        editor.removeClass('dragover');
        dropzone.hide();
      };

      var getEmails = function (string) {
        if (!string.length) {
          return [];
        }
        return lodash
          .uniq(string.split(','))
          .map(
            function (item) {
              return {
                email: item
              };
            }
          );
      };

      $scope.title = title;

      $scope.thread = thread;
      $scope.message = message;
      $scope.to = getEmails(to);
      $scope.cc = getEmails(cc);
      $scope.bcc = getEmails(bcc);
      $scope.subject = subject;
      $scope.html = html;
      $scope.attachments = attachments;
      $scope.isForwarded = isForwarded;
      $scope.isNew = isNew;

      $scope.popover_1 = false;
      $scope.popover_2 = false;

      $scope.limit = 10;

      $scope.cc_bcc = $scope.cc.length + $scope.bcc.length;

      $scope.summernote = $rootScope.getSummernote();
      $scope.summernote.focus = !$scope.isNew;
      $scope.summernote.height = 350;

      $scope.spinner = false;
      $scope.success = true;
      $scope.failure = false;

      $scope.init = function (evt) {
        document.addEventListener(
          'animationstart', $window.paragraph, false
        );
        document.addEventListener(
          'MSAnimationStart', $window.paragraph, false
        );
        document.addEventListener(
          'webkitAnimationStart', $window.paragraph, false
        );
        $window.jQuery('.note-btn-group').addClass('dropup');
        var editor = $window.jQuery(evt.editor);
        var dropzone = editor.find('.note-dropzone');
        $window
          .jQuery(evt.editable)
          .on(
            'dragover',
            function (evt) {
              dragEnter(editor, dropzone);
            }
          );
        dropzone.on(
          'dragenter',
          function (evt) {
            dragEnter(editor, dropzone);
          }
        );
        dropzone.on(
          'dragleave',
          function (evt) {
            dragLeave(editor, dropzone);
          }
        );
        dropzone.on(
          'dragover',
          function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
          }
        );
        dropzone.on(
          'drop',
          function (evt) {
            dragLeave(editor, dropzone);
            for (
              var index = 0;
              index < evt.originalEvent.dataTransfer.files.length;
              index++
            ) {
              $scope.attachments.push(
                evt.originalEvent.dataTransfer.files[index]
              );
            }
            $scope.add($scope.attachments);
          }
        );
      };

      $scope.keydown = function (evt) {
        if (evt.keyCode == 9) {
          evt.preventDefault();
          evt.preventDefault();
          evt.stopPropagation();
          if (evt.shiftKey !== undefined && evt.shiftKey === true) {
            jQuery('#subject').focus();
          } else {
            jQuery('#to input').focus();
          }
          return;
        }
      };

      $scope.keyup = function (evt) {
        if (
          evt.ctrlKey !== undefined &&
          evt.ctrlKey === true &&
          evt.keyCode == 13
        ) {
          evt.preventDefault();
          if ($scope.canSend()) {
            $scope.send();
          }
          return;
        }
      };

      $scope.source = function (prefix, limit) {
        var defer = $q.defer();
        contacts
          .select(prefix, limit)
          .then(
            function (response) {
              defer.resolve(
                lodash
                  .values(response)
                  .map(
                    function (item) {
                      item.label = item.email;
                      if (item.name !== undefined) {
                        item.label = item.name + ' ' + '<' + item.email + '>';
                      }
                      return item;
                    }
                  )
              );
            },
            function (response) {
              defer.resolve([]);
            }
          );
        return defer.promise;
      };

      $scope.send = function () {
        $scope.spinner = true;
        $scope.success = false;
        $scope.failure = false;
        $uibModalInstance.close();
        messages
          .insert(
            $scope.thread,
            $scope.message,
            $scope
              .to
              .map(
                function (item) {
                  return {
                    e: item.email
                  };
                }
              ),
            $scope
              .cc
              .map(
                function (item) {
                  return {
                    e: item.email
                  };
                }
              ),
            $scope
              .bcc
              .map(
                function (item) {
                  return {
                    e: item.email
                  };
                }
              ),
            $scope.subject,
            $scope.html,
            $scope.attachments,
            $scope.isForwarded
          )
          .then(
            function () {
              $scope.spinner = false;
              $scope.success = true;
              $scope.failure = false;
            },
            function () {
              $scope.spinner = false;
              $scope.success = true;
              $scope.failure = true;
            }
          );
      };

      $scope.add = function (attachments) {
        var progress = attachments.length;
        $scope.success = progress === 0;
        attachments.forEach(
          function (value, key) {
            if (value.id === undefined) {
              Upload
                .upload({
                  data: {
                    file: value
                  },
                  headers: {
                    Authorization: 'Bearer' + ' ' + $localStorage.bearer
                  },
                  url: URI($window.variables.url)
                    .segment('inbox')
                    .segment('attachments')
                    .href()
                })
                .then(
                  function (response) {
                    value.bytes = utilities.getBytes(value.size);
                    value.fileName = value.name;
                    value.icon = utilities.getIcon(value.fileName);
                    value.key = response.data.key;
                    progress -= 1;
                    $scope.success = progress === 0;
                  },
                  function (response) {
                    attachments.splice(key, 1);
                    utilities.notify(
                      '<i class="fa fa-times-circle"></i>',
                      'The file was not uploaded successfully.'
                    );
                    progress -= 1;
                    $scope.success = progress === 0;
                  },
                  function (event) {
                    value.progress = parseInt(
                      (event.loaded * 100.0) / event.total
                    );
                  }
                );
            } else {
              progress -= 1;
              $scope.success = progress === 0;
            }
          }
        );
      };

      $scope.remove = function (index) {
        $scope.attachments.splice(index, 1);
      };

      $scope.yes = function () {
        $scope.popover_1 = false;
        $scope.popover_2 = false;
        $uibModalInstance.dismiss('close');
      };

      $scope.no = function () {
        $scope.popover_1 = false;
        $scope.popover_2 = false;
      };

      $scope.canSend = function () {
        if (
          ($scope.to.length || $scope.cc.length || $scope.bcc.length) &&
          $scope.success
        ) {
          return true;
        }
        return false;
      };

      $scope.$on(
        '$destroy',
        function () {
          document.removeEventListener(
            'animationstart', $window.paragraph
          );
          document.removeEventListener(
            'MSAnimationStart', $window.paragraph
          );
          document.removeEventListener(
            'webkitAnimationStart', $window.paragraph
          );
        }
      );

      for (var index = 0; index < files.length; index++) {
        $scope.attachments.push(files[index]);
      }
      $scope.add($scope.attachments);
    }
  ]
);
