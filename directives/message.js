application.directive(
  'message',
  [
    '$compile',
    '$rootScope',
    '$timeout',
    '$uibModal',
    '$window',
    'lodash',
    'moment',
    'messages',
    'utilities',
    function (
      $compile,
      $rootScope,
      $timeout,
      $uibModal,
      $window,
      lodash,
      moment,
      messages,
      utilities
    ) {
      return {
        link: function (scope, element, attributes) {
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

          var getDate = function (message) {
            return moment
              .unix(message.date)
              .format('ddd, MMM D, YYYY [at] h:mm A');
          };

          var getEmails = function (items) {
            return lodash
              .map(
                items,
                function (item) {
                  if (item.n !== undefined) {
                    return item.n + ' ' + '&lt;' + item.e + '&gt;';
                  }
                  return item.e;
                }
              )
              .join(', ');
          };

          scope.variables = {
            html: '',
            popover: false
          };

          scope.summernote = $rootScope.getSummernote();

          scope.spinner = false;

          scope.isClicked = false;

          scope.hidden = false;

          scope.plain_text = function () {
            scope.isClicked = false;
            var textarea = angular.element(element).find('.textarea');
            textarea.html(angular.element(element).find('.plain-text').text());
            $compile(textarea.contents())(scope);
          };

          scope.html = function () {
            scope.isClicked = true;
            var textarea = angular.element(element).find('.textarea');
            textarea.html(angular.element(element).find('.html').text());
            $compile(textarea.contents())(scope);
          };

          scope.init = function (evt) {
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
                var files = [];
                dragLeave(editor, dropzone);
                scope.expand(
                  scope.thread,
                  scope.message,
                  evt.originalEvent.dataTransfer.files
                );
              }
            );
            $timeout(
              function () {
                angular
                  .element(element)
                  .find('.note-editable')
                  .trigger('focus');
              }
            );
          };

          scope.keyup = function (evt) {
            if (evt.keyCode == 9) {
              evt.preventDefault();
              angular.element(element).find('[data-button="send"]').focus();
              return;
            }
            if (
              evt.ctrlKey !== undefined &&
              evt.ctrlKey === true &&
              evt.keyCode == 13
            ) {
              evt.preventDefault();
              if (scope.canSend()) {
                angular.element(element).find('[data-button="send"]').click();
              }
            }
          };

          scope.send = function (thread, message) {
            var to = [];
            var cc = [];
            if (message.from.e === $rootScope.user.email) {
              to = lodash.uniqBy(
                message.to.filter(
                  function (item) {
                    return item.e !== $rootScope.user.email;
                  }
                ),
                function (item) {
                  return item.e;
                }
              );
              cc = lodash.uniqBy(
                message.cc.filter(
                  function (item) {
                    return item.e !== $rootScope.user.email;
                  }
                ),
                function (item) {
                  return item.e;
                }
              );
            } else {
              to = [message.replyTo || message.from];
              cc = lodash.uniqBy(
                [].concat(
                  message.to.filter(
                    function (item) {
                      return item.e !== $rootScope.user.email;
                    }
                  ),
                  message.cc.filter(
                    function (item) {
                      return item.e !== $rootScope.user.email;
                    }
                  )
                ),
                function (item) {
                  return item.e;
                }
              );
            }
            var html = [];
            if (scope.variables.html.length) {
              html.push(scope.variables.html);
            }
            html.push('<br>');
            html.push('<br>');
            if ($rootScope.user.signature) {
              html.push($rootScope.user.signature);
              html.push('<br>');
              html.push('<br>');
            }
            html.push('<div class="gmail_quote">');
            html.push(
              'On ' +
              getDate(message) +
              ', ' +
              getEmails([message.from]) +
              ' wrote:'
            );
            html.push('');
            html.push('<blockquote>' + message.content + '</blockquote>');
            html.push('</div>');
            html = html.join('');
            scope.spinner = true;
            messages
              .insert(
                thread,
                message,
                to,
                cc,
                [],
                thread.subject,
                html,
                [],
                false
              )
              .then(
                function (response) {
                  scope.variables.html = '';
                  scope.spinner = false;
                },
                function () {
                  scope.variables.html = '';
                  scope.spinner = false;
                }
              );
          };

          scope.expand = function (thread, message, files) {
            $uibModal
              .open({
                animation: true,
                backdrop: 'static',
                controller: 'editor',
                resolve: {
                  title: function () {
                    return 'Reply';
                  },
                  thread: function () {
                    return thread;
                  },
                  message: function () {
                    return message;
                  },
                  to: function () {
                    if (message.from.e !== $rootScope.user.email) {
                      if (message.replyTo) {
                        return message.replyTo.e;
                      }
                      return message.from.e;
                    }
                    return message
                      .to
                      .filter(
                        function (item) {
                          return item.e !== $rootScope.user.email;
                        }
                      )
                      .map(
                        function (item) {
                          return item.e;
                        }
                      )
                      .join(',');
                  },
                  cc: function () {
                    return '';
                  },
                  bcc: function () {
                    return '';
                  },
                  subject: function () {
                    return thread.subject;
                  },
                  html: function () {
                    var html = [];
                    if (scope.variables.html.length) {
                      html.push(scope.variables.html);
                    }
                    html.push('<br>');
                    html.push('<br>');
                    if ($rootScope.user.signature) {
                      html.push($rootScope.user.signature);
                      html.push('<br>');
                      html.push('<br>');
                    }
                    html.push(
                      'On ' +
                      getDate(message) +
                      ', ' +
                      getEmails([message.from]) +
                      ' wrote:'
                    );
                    html.push('<br>');
                    html.push(
                      '<blockquote>' + message.content + '</blockquote>'
                    );
                    return html.join('');
                  },
                  attachments: function () {
                    return [];
                  },
                  files: function () {
                    return files;
                  },
                  isForwarded: function () {
                    return false;
                  },
                  isNew: function () {
                    return false;
                  }
                },
                size: 'full editor',
                templateUrl: 'templates/controllers/editor.html',
                windowTemplateUrl: 'templates/controllers/modal.html'
              })
              .result
              .then(
                function () {
                },
                function () {
                }
              );
          };

          scope.reply = function (thread, message) {
            $uibModal
              .open({
                animation: true,
                backdrop: 'static',
                controller: 'editor',
                resolve: {
                  title: function () {
                    return 'Reply';
                  },
                  thread: function () {
                    return thread;
                  },
                  message: function () {
                    return message;
                  },
                  to: function () {
                    if (message.from.e !== $rootScope.user.email) {
                      if (message.replyTo) {
                        return message.replyTo.e;
                      }
                      return message.from.e;
                    }
                    return message
                      .to
                      .filter(
                        function (item) {
                          return item.e !== $rootScope.user.email;
                        }
                      )
                      .map(
                        function (item) {
                          return item.e;
                        }
                      )
                      .join(',');
                  },
                  cc: function () {
                    return '';
                  },
                  bcc: function () {
                    return '';
                  },
                  subject: function () {
                    return thread.subject;
                  },
                  html: function () {
                    var html = [];
                    if (scope.variables.html.length) {
                      html.push(scope.variables.html);
                    }
                    html.push('<br>');
                    html.push('<br>');
                    if ($rootScope.user.signature) {
                      html.push($rootScope.user.signature);
                      html.push('<br>');
                      html.push('<br>');
                    }
                    html.push(
                      'On ' +
                      getDate(message) +
                      ', ' +
                      getEmails([message.from]) +
                      ' wrote:'
                    );
                    html.push('<br>');
                    html.push(
                      '<blockquote>' + message.content + '</blockquote>'
                    );
                    return html.join('');
                  },
                  attachments: function () {
                    return [];
                  },
                  files: function () {
                    return [];
                  },
                  isForwarded: function () {
                    return false;
                  },
                  isNew: function () {
                    return false;
                  }
                },
                size: 'full editor',
                templateUrl: 'templates/controllers/editor.html',
                windowTemplateUrl: 'templates/controllers/modal.html'
              })
              .result
              .then(
                function () {
                },
                function () {
                }
              );
          };

          scope.replyAll = function (thread, message) {
            $uibModal
              .open({
                animation: true,
                backdrop: 'static',
                controller: 'editor',
                resolve: {
                  title: function () {
                    return 'Reply';
                  },
                  thread: function () {
                    return thread;
                  },
                  message: function () {
                    return message;
                  },
                  to: function () {
                    if (message.from.e !== $rootScope.user.email) {
                      if (message.replyTo) {
                        return message.replyTo.e;
                      }
                      return message.from.e;
                    }
                    return message
                      .to
                      .filter(
                        function (item) {
                          return item.e !== $rootScope.user.email;
                        }
                      )
                      .map(
                        function (item) {
                          return item.e;
                        }
                      )
                      .join(',');
                  },
                  cc: function () {
                    if (message.from.e === $rootScope.user.email) {
                      return message
                        .cc
                        .filter(
                          function (item) {
                            return item.e !== $rootScope.user.email;
                          }
                        )
                        .map(
                          function (item) {
                            return item.e;
                          }
                        )
                        .join(',');
                    }
                    return lodash
                      .uniqBy(
                        [].concat(message.to, message.cc),
                        function (item) {
                          return item.e;
                        }
                      )
                      .filter(
                        function (item) {
                          return item.e !== $rootScope.user.email;
                        }
                      )
                      .map(
                        function (item) {
                          return item.e;
                        }
                      )
                      .join(',');
                  },
                  bcc: function () {
                    return '';
                  },
                  subject: function () {
                    return thread.subject;
                  },
                  html: function () {
                    var html = [];
                    if (scope.variables.html.length) {
                      html.push(scope.variables.html);
                    }
                    html.push('<br>');
                    html.push('<br>');
                    if ($rootScope.user.signature) {
                      html.push($rootScope.user.signature);
                      html.push('<br>');
                      html.push('<br>');
                    }
                    html.push(
                      'On ' +
                      getDate(message) +
                      ', ' +
                      getEmails([message.from]) +
                      ' wrote:'
                    );
                    html.push('<br>');
                    html.push(
                      '<blockquote>' + message.content + '</blockquote>'
                    );
                    return html.join('');
                  },
                  attachments: function () {
                    return [];
                  },
                  files: function () {
                    return [];
                  },
                  isForwarded: function () {
                    return false;
                  },
                  isNew: function () {
                    return false;
                  }
                },
                size: 'full editor',
                templateUrl: 'templates/controllers/editor.html',
                windowTemplateUrl: 'templates/controllers/modal.html'
              })
              .result
              .then(
                function () {
                },
                function () {
                }
              );
          };

          scope.forward = function (thread, message) {
            $uibModal
              .open({
                animation: true,
                backdrop: 'static',
                controller: 'editor',
                resolve: {
                  title: function () {
                    return 'Forward';
                  },
                  thread: function () {
                    return thread;
                  },
                  message: function () {
                    return message;
                  },
                  to: function () {
                    return '';
                  },
                  cc: function () {
                    return '';
                  },
                  bcc: function () {
                    return '';
                  },
                  subject: function () {
                    return 'Fwd: ' + thread.subject;
                  },
                  html: function () {
                    var html = [];
                    if (scope.variables.html.length) {
                      html.push(scope.variables.html);
                    }
                    html.push('<br>');
                    html.push('<br>');
                    if ($rootScope.user.signature) {
                      html.push($rootScope.user.signature);
                      html.push('<br>');
                      html.push('<br>');
                    }
                    html.push('---------- Forwarded message ----------');
                    html.push('<br>');
                    html.push('From: ' + getEmails([message.from]));
                    html.push('<br>');
                    html.push('Date: ' + getDate(message));
                    html.push('<br>');
                    html.push('Subject: ' + thread.subject);
                    html.push('<br>');
                    html.push('To: ' + getEmails(message.to));
                    html.push('<br>');
                    html.push('Cc: ' + getEmails(message.cc));
                    html.push('<br>');
                    html.push('<br>');
                    html.push(
                      '<blockquote>' + message.content + '</blockquote>'
                    );
                    return html.join('');
                  },
                  attachments: function () {
                    return message.attachments.map(
                      function (attachment) {
                        attachment.key = 'msg://' + attachment.id;
                        return attachment;
                      }
                    );
                  },
                  files: function () {
                    return [];
                  },
                  isForwarded: function () {
                    return true;
                  },
                  isNew: function () {
                    return true;
                  }
                },
                size: 'full editor',
                templateUrl: 'templates/controllers/editor.html',
                windowTemplateUrl: 'templates/controllers/modal.html'
              })
              .result
              .then(
                function () {
                },
                function () {
                }
              );
          };

          scope.trash = function (thread, message) {
            messages
              .delete(thread, message)
              .then(
                function () {
                  utilities.notify(
                    '<i class="fa fa-check-circle"></i>',
                    'The message was trashed successfully.'
                  );
                },
                function () {
                }
              );
          };

          scope.status = function (thread, message, status) {
            if (message.meta.messageId === thread.meta.messageId) {
              return;
            }
            message.status = status;
          };

          scope.yes = function () {
            scope.plain_text();
            scope.variables.popover = false;
          };

          scope.no = function () {
            scope.variables.popover = false;
          };

          scope.canSend = function () {
            if (scope.variables.html.length) {
              return true;
            }
            return false;
          };

          scope.$on(
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

          $timeout(
            function () {
              scope.plain_text();
            }
          );

          scope.initList = function () {
            $timeout(
              function () {
                var to = $window.jQuery(element).find('.to.oneliner');
                var rest = $window.jQuery(element).find('.media-meta').outerWidth() +
                  $window.jQuery(element).find('strong').outerWidth();
                var wrapper = $window.jQuery(element).find('h4').outerWidth();
                var available = wrapper - rest;
                $window.jQuery(to).width(available);
                var recipients = window.jQuery(to).find('.recipient');
                var required = window.jQuery(to).find('span').eq(0).outerWidth();
                for (var i = 0; i < recipients.length; i++) {
                  required+= window.jQuery(recipients[i]).width();
                  if (required > available){
                    scope.message.to_cc[i].show = false;
                    scope.hidden++;
                  } else {
                    scope.message.to_cc[i].show = true;
                  }
                }
              }
            );
          };

        },
        restrict: 'A',
        templateUrl: 'templates/directives/message.html'
      };
    }
  ]
);
