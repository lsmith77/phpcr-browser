(function(app) {
  'use strict';

  app.directive('mbTree', function() {
    return {
      restrict: 'E',
      scope: {
        currentNode: '=mbCurrentNode'
      },
      templateUrl: '/assets/js/browser/directives/templates/tree.html',
      controller: ['$scope', '$log', 'mbObjectMapper', 'mbTreeView',
        function($scope, $log, ObjectMapper, TreeView) {
          $scope.container = TreeView.getTreeContainer();

          $scope.$on('drop.delete', function(e, element) {
            if (element.hasClass('node')) {
              ObjectMapper.find(
                '/' +
                $scope.container.repository.getName() + '/' +
                $scope.container.workspace.getName() +
                element.data('path'))
              .then(function(node) {
                node.delete().then(function() {
                  $scope.$emit('node.deleted', node.getPath());
                  $log.log('Node deleted.');
                }, function(err) {
                  if (err.status === 423) { return $log.warn('You can not delete this node. It is locked.'); }
                  $log.error(err);
                });
              }, function(err) {
                $log.error(err);
              });
            }
          });

          $scope.moveNode = function(elementDropped, element) {
            var name = elementDropped.data('path').split('/').pop();
            if (elementDropped.data('path') === element.data('path') ||
              element.data('path') + '/' + name === elementDropped.data('path')) { return; }
            ObjectMapper.find('/' + $scope.container.repository.getName() +
              '/' + $scope.container.workspace.getName() +
              elementDropped.data('path')).then(function(nodeDropped) {
                nodeDropped.move(element.data('path')).then(function() {
                  $log.log('Node moved.');
                  $scope.$emit('node.moved', { from: elementDropped.data('path'), to: element.data('path')});
                }, function(err) {
                  $log.error(err);
                });
              }, function(err) {
                $log.error(err);
              });
          };
        }]
    };
  });
})(angular.module('browserApp'));