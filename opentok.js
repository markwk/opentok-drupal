(function ($) {
  if(!Drupal.openTok){
    Drupal.openTok = { };
  }

  Drupal.behaviors.openTok = function(context) {
    $('.opentok-container', context).each(function(){
      var settings = Drupal.settings;
      if(settings.openTok[this.id]){
        var options = settings.openTok[this.id];
        options.publisherWrapper = Drupal.openTok.getPublisherWrapper;
        options.streamWrapper = Drupal.openTok.getSubscriberWrapper;
        options.logLevel = $.openTok.logLevel.debug;
        $(this).openTok(options)
          .bind($.openTok.event.sessionConnected, Drupal.openTok.registerConnection)
          .bind($.openTok.event.streamAdded, Drupal.openTok.attachToStream)
          .bind($.openTok.event.streamRemoved, Drupal.openTok.streamRemoved)
          .bind($.openTok.event.publish, Drupal.openTok.attachToPublisher)
          .bind($.openTok.event.unpublish, Drupal.openTok.unpublish)
          .openTokLayout();          
      }
    });
  };
  
  Drupal.openTok.registerConnection = function(e){
    $.ajax({
      type: 'POST',
      url: Drupal.settings.basePath + 'opentok/save/connection',
      data: ({opentok_connection: JSON.stringify(e.openTok.eventData.target.connection)})
    });
    $('.opentok-snapshot-publisher', e.openTok.element).hide();
  };
  
  Drupal.openTok.attachToStream = function (e){
    var stream = e.openTok.element.openTok('getStream', e.openTok.eventData.streamId);
    $('.opentok-snapshot-stream', stream.jq).bind('click.openTok', function(e){
      var imgData = stream.subscriber.getImgData();
      var img = document.createElement("img");
      img.setAttribute("src", "data:image/png;base64," + imgData);
      var imgWin = window.open("about:blank", "Screenshot");
      imgWin.document.write("<body></body>");
      imgWin.document.body.appendChild(img);
      $(this).blur();
      return false;
    });
    stream.jq.bind('mouseover.openTok', function(e){
      $('.opentok-stream-controls', stream.jq).show();
    });
    stream.jq.bind('mouseout.openTok', function(e){
      $('.opentok-stream-controls', stream.jq).hide();
    });
    $('.opentok-stream-controls', stream.jq).hide();
    
    //Drupal.openTok.tileLayout(e.openTok.element);
  };

  Drupal.openTok.attachToPublisher = function (e){
    var publisher = e.openTok.eventData.publisher;
    $('.opentok-snapshot-publisher', e.openTok.element).bind('click.openTok', function(e){
      var imgData = publisher.getImgData();
      var img = document.createElement("img");
      img.setAttribute("src", "data:image/png;base64," + imgData);
      var imgWin = window.open("about:blank", "Screenshot");
      imgWin.document.write("<body></body>");
      imgWin.document.body.appendChild(img);
      $(this).blur();
      return false;
    }).show();
    var publisherElement = $('.opentok-publisher-wrapper', e.openTok.element);
    publisherElement
      .bind('mouseover.openTok', function(e){
        $('.opentok-publisher-controls', publisherElement).show();
      })
      .bind('mouseout.openTok', function(e){
        $('.opentok-publisher-controls', publisherElement).hide();
      });
    $('.opentok-publisher-controls', publisherElement).hide();
  };
 
  Drupal.openTok.streamRemoved = function(e){

  };
  
  Drupal.openTok.unpublish = function (e){
    $('.opentok-snapshot-publisher', e.openTok.element).hide();
  };
  
  Drupal.openTok.getPublisherWrapper = function(session){

  };

  Drupal.openTok.getSubscriberWrapper = function(session, stream){
  return $.ajax({
      type: 'POST',
      url: Drupal.settings.basePath + 'opentok/get/streamwrapper',
      data: ({opentok_stream: JSON.stringify(stream), opentok_session: JSON.stringify(session)}),
      async: false,
      dataType: 'html'
    }).responseText;
  };
})(jQuery);
