const app = {};

$(function(){

  app.trigger = function(release, publish, latest) {
    window.location = '/trigger/' + release + '?publish=' + !!publish + '&latest=' + !! latest;
  };

  app.triggerClick = function() {
    app.trigger($("#version-select").val(), $("#publish-checkbox").val(), $("#latest-checkbox").val());
  };
});