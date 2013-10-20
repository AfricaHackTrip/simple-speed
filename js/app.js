//
// HELPER FUNCTIONS
//

Array.prototype.avg = function() {
  var av = 0;
  var cnt = 0;
  var len = this.length;
  for (var i = 0; i < len; i++) {
    var e = +this[i];
    if (!e && this[i] !== 0 && this[i] !== '0') { e--; }
    if (this[i] === e) { av += e; cnt++; }
  }
  return av/cnt;
};

var doTimer = function(length, resolution, oninstance, oncomplete) {
  var steps = (length / 100) * (resolution / 10),
      speed = length / steps,
      count = 0,
      start = new Date().getTime();

  function instance() {
    if (count++ === steps) {
      oncomplete(steps, count);
    } else {
      oninstance(steps, count);

      var diff = (new Date().getTime() - start) - (count * speed);
      window.setTimeout(instance, (speed - diff));
    }
  }
  window.setTimeout(instance, speed);
};

//
// APPLICATION
//

var App = {

  averageDown: 0,
  averageUp: 0,
  measurements: {
    down: [],
    up: []
  },
  sampleTime: 10000, // in milliseconds

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
      var speed = chunkSizeInBits / timeInSeconds / 1024;

      App.measurements.down.push(speed);

      App.setAverageDown(speed);
    }

    App.download.lastBytesLoaded = bytesLoaded;
    App.download.lastTimestamp = timestamp;
  },

  clearResults: function() {
    App.measurements.down = [];
    App.measurements.up = [];
    App.averageDown = 0;
    App.averageUp = 0;
    App.download.lastBytesLoaded = 0;
    App.download.lastTimestamp = null;
  },

  startSpeedtest: function() {
    App.clearResults();
    App.ui.hideStartButton();
    App.ui.startProgressBar();

    $.ajax({
      type: 'GET',
      url: 'http://storage.5stage.com/galfert/public/shares/131017-0027-parov%20stelar%20-%20jimmys%20gang.mp3',
      timeout: App.sampleTime,
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
      $('#down .kbps').html( value.toString() );
    },

    hideStartButton: function() {
      $('button#start').hide();
    },

    showStartButton: function() {
      $('button#start').show();
    },

    startProgressBar: function() {
      var width = 0;

      doTimer(10000, 20,
        function(steps) {
          width = width + (100 / steps);
          $('#progress').css('width', width.toString()+'%');
        },
        function() {
          $('#progress').css('width', '0');
        }
      );
    }
  }

};

$('button#start').on('click', App.startSpeedtest);
