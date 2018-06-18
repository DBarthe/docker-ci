const app = {};

$(function(){

  app.trigger = function(release, publish, latest) {
    window.location = '/trigger/' + release + '?publish=' + !!publish + '&latest=' + !! latest;
  };

  app.triggerClick = function() {
    app.trigger($("#version-select").val(), $("#publish-checkbox").is(':checked'), $("#latest-checkbox").is(':checked'));
  };

  app.submit = function(release, publish, latest) {
    $.ajax({
      type: 'POST',
      url: '/api/trigger/' + release,
      dataType: 'json',
      data: { release: release, publish: publish, latest: latest }
    }).done(function(res) {

      const url = res.progressUrl;
      subscribe(url);
    }).fail(console.error);
  };

  function subscribe(url) {
    const source = new EventSource(url);
    source.onmessage = function(event) {
      const data = JSON.parse(event.data);
      console.log(data);

      if (data === "welcome") return ;

      if (data.complete && data.succeed) {
        $("#status-text").text("Job Succeed")
      }
      else if (data.complete) {
        $("#status-text").text("Job Failed")
      }
      else {
        $("#status-text").text("Job Running")
      }

      $('#output-list').append(data.output.map(formatLine))
    }
  }

  function formatLine(line) {
    return "<li>" + line + "</li>";
  }
});