application.directive(
  'jFrame',
  [
    '$window',
    function ($window) {
      return {
        link: function (scope, element, attributes) {
          var shadowRoot = angular.element(element)[0].shadowRoot;
          shadowRoot.innerHTML = attributes.contents;
          $window.jQuery(shadowRoot).find('a').attr('target', '_blank');
          var blockquote = $window
            .jQuery(shadowRoot)
            .find(
              scope.$index === 0?
              '.gmail_signature':
              'blockquote, .gmail_extra, .gmail_quote, .gmail_signature'
            )
            .eq(0)
            .css('display', 'none')
            .before(
              $window
                .jQuery(
                  '<span>',
                  {
                    class: 'ellipsis',
                    onClick: 'toggle(this)',
                    text: '...',
                    title: 'Show trimmed content'
                  }
                )
                .css({
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #eeeeee',
                  cursor: 'pointer',
                  display: 'inline-block',
                  height: '10px',
                  lineHeight: '4px',
                  marginBottom: '10px',
                  verticalAlign: 'top',
                  width: '10px'
                })
            );
        },
        restrict: 'E'
      };
    }
  ]
);
