application.factory(
  'utilities',
  [
    '$rootScope',
    '$sce',
    '$window',
    'lodash',
    function ($rootScope, $sce, $window, lodash) {
      return {
        notify: function (image, text) {
          $window.jQuery.notify(
            {
              image: image,
              text: text
            },
            {
              autoHide: true,
              autoHideDelay: 5000,
              className: 'black',
              clickToHide: true,
              globalPosition: 'top center',
              hideDuration: 50,
              showAnimation: 'show',
              showDuration: 0,
              style: 'metro'
            }
          );
        },
        getAlias: function (name) {
          return name.toLowerCase().replace(/ /g,'-').replace(/[^\w-]+/g,'');
        },
        getBytes: function (bytes) {
          if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) {
            return 'N/A';
          }
          if (bytes === 0) {
            return '0 B';
          }
          var units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
          var number = Math.floor(Math.log(bytes) / Math.log(1024));
          return (
            (bytes / Math.pow(1024, Math.floor(number))).toFixed(2) +
            ' ' +
            units[number]
          );
        },
        getCategories: function (user) {
          var categories = [];
          if (user.preferences !== undefined) {
            if (user.preferences['inbox:categories:forums'] === 'true') {
              categories.push({
                alias: 'CATEGORY_FORUMS',
                id: 'forums',
                name: 'Forums'
              });
            }
            if (user.preferences['inbox:categories:promotions'] === 'true') {
              categories.push({
                alias: 'CATEGORY_PROMOTIONS',
                id: 'promotions',
                name: 'Promotions'
              });
            }
            if (user.preferences['inbox:categories:social'] === 'true') {
              categories.push({
                alias: 'CATEGORY_SOCIAL',
                id: 'social',
                name: 'Social'
              });
            }
            if (user.preferences['inbox:categories:updates'] === 'true') {
              categories.push({
                alias: 'CATEGORY_UPDATES',
                id: 'updates',
                name: 'Updates'
              });
            }
          }
          return categories;
        },
        getFeeds: function () {
          feeds = {};
          feeds.v = 't';
          feeds.filename = '';
          feeds.q = '';
          feeds.c = '';
          feeds.threads = [];
          feeds.hasStopped = false;
          feeds.isScrolling = false;
          return feeds;
        },
        getFilenames: function () {
          return [
            {
              key: '',
              value: 'All file types'
            },
            {
              key: 'filename:gif filename:jpg filename:jpeg filename:png',
              value: 'Images'
            },
            {
              key: 'filename:pdf',
              value: 'PDF'
            },
            {
              key: 'filename:doc filename:docx',
              value: 'Word'
            },
            {
              key: 'filename:xls filename:xlsx',
              value: 'Excel'
            },
            {
              key: 'filename:ppt filename:pptx',
              value: 'Powerpoint'
            }
          ];
        },
        getFrom: function (thread) {
          return $sce.trustAsHtml(
            thread
              .summary
              .from
              .map(
                function (item) {
                  if (item.isUnread) {
                    return '<strong>' + item.name + '</strong>';
                  }
                  return item.name;
                }
              )
              .join(', ')
          );
        },
        getIcon: function (name) {
          var extension = lodash.last(name.split('.')).toLowerCase();
          switch (extension) {
            case '7z':
            case 'bz2':
            case 'gz':
            case 'rar':
            case 'tar':
            case 'tgz':
            case 'zip':
              return 'fa-file-archive-o text-warning';
            case 'ai':
            case 'eps':
            case 'gif':
            case 'jpg':
            case 'png':
            case 'ps':
            case 'psd':
            case 'svg':
            case 'tif':
              return 'fa-file-image-o text-pink';
            case 'avi':
            case 'flv':
            case 'mov':
            case 'mp4':
            case 'mpg':
            case 'swf':
              return 'fa-file-video-o text-primary';
            case 'css':
            case 'html':
            case 'js':
            case 'xml':
              return 'fa-file-code-o text-custom';
            case 'csv':
            case 'xls':
            case 'xlsx':
              return 'fa-file-excel-o text-success';
            case 'doc':
            case 'docx':
            case 'odc':
            case 'odf':
            case 'odg':
            case 'odi':
            case 'odp':
            case 'ods':
            case 'odt':
            case 'rtf':
              return 'fa-file-word-o text-success';
            case 'mp3':
            case 'ogg':
            case 'wav':
            case 'wma':
              return 'fa-file-audio-o text-primary';
            case 'pdf':
              return 'fa-file-pdf-o text-danger';
            case 'ppt':
              return 'fa-file-powerpoint-o text-success';
            case 'txt':
              return 'fa-file-text-o text-custom';
          }
          return 'fa-file';
        },
        getImageUrl: function (email) {
          var contact = $rootScope.contacts[email];
          if (contact) {
            return contact.imageUrl;
          }
          return '';
        },
        getLabel: function (item) {
          return item.replace(/[^0-9a-z]/gi, '').charAt(0).toLowerCase();
        },
        getMessageIndex: function (messages, messageId) {
          return lodash.findIndex(
            messages,
            function (message) {
              return message.meta.messageId === messageId;
            }
          );
        },
        getQ: function (prefix) {
          var q = [];
          if (prefix) {
            q.push(prefix);
          }
          if ($rootScope.feeds.v === 'a') {
            q.push('has:attachment');
          }
          if ($rootScope.feeds.v === 't') {
          }
          if ($rootScope.feeds.v === 'u') {
            q.push('is:unread');
          }
          q = lodash.uniq(q);
          return q.join(' ');
        },
        getThreadIndex: function (threads, threadId) {
          return lodash.findIndex(
            threads,
            function (thread) {
              return thread.meta.threadId === threadId;
            }
          );
        }
      };
    }
  ]
);
