Array.prototype.avg = function() {
  var av = 0;
  var cnt = 0;
  var len = this.length;
  for (var i = 0; i < len; i++) {
    var e = +this[i];
    if(!e && this[i] !== 0 && this[i] !== '0') e--;
    if (this[i] == e) {av += e; cnt++;}
  }
  return av/cnt;
};

var App = {

  averageDown: 0,
  averageUp: 0,
  measurements: {
    down: [],
    up: []
  },

  download: {
    lastBytesLoaded: 0,
    lastTimestamp: null
  },

  downloadProgress: function(ev) {
    var bytesLoaded = ev.loaded;
    var timestamp = ev.timeStamp;

    if (App.download.lastTimestamp !== null) {
      var chunkSizeInBits = (bytesLoaded - App.download.lastBytesLoaded) * 8;
      var timestampDifference = timestamp - App.download.lastTimestamp;
      var timeInSeconds = Math.round(timestampDifference/1000)/1000;
      var kbps = chunkSizeInBits / timeInSeconds / 1024;
      var speed = parseInt(kbps);

      App.measurements.down.push(speed);

      App.setAverageDown(speed);
    }

    App.download.lastBytesLoaded = bytesLoaded;
    App.download.lastTimestamp = timestamp;
  },

  startSpeedtest: function() {
    App.ui.hideStartButton();

    $.ajax({
      type: 'GET',
      url: 'http://storage.5stage.com/galfert/public/shares/131017-0027-parov%20stelar%20-%20jimmys%20gang.mp3',
      timeout: 5000,
      cache: false,
      beforeSend: function(xhr, settings) {
        xhr.addEventListener('progress', App.downloadProgress, false);
      },
      success: function(data, status, xhr){
        console.log('testfile downloaded completely');
      },
      error: function(xhr, errorType, error) {
        console.log('ERROR');
        console.log(errorType);
        console.log(error);
        // show error
      },
      complete: function() {
        App.ui.showStartButton();
      }
    });
  },

  setAverageDown: function(milliseconds) {
    App.averageDown = parseInt(App.measurements.down.avg());
    App.ui.updateAverageDown( App.averageDown + ' Kb/s' );
  },

  // UI

  ui: {
    updateAverageDown: function(value) {
      $('#left #top').html( value.toString() );
    },

    hideStartButton: function() {
      $('button#start').hide();
    },

    showStartButton: function() {
      $('button#start').show();
    },

    updateMeasurements: function() {
      $('#measurements').html( App.measurements.down.toString() );
    }
  }

};

$('button#start').on('click', App.startSpeedtest);
