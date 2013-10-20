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

  sampleString: function() {
    var x = "1234567890";
    var iterations = 12;
    for (var i = 0; i < iterations; i++) {
      x += x.concat(x);
    }
    return x;
  },

  download: {
    lastBytesLoaded: 0,
    lastTimestamp: null
  },

  upload: {
    lastBytesLoaded: 0,
    lastTimestamp: null
  },

  clearResults: function() {
    App.measurements.down = [];
    App.measurements.up = [];
    App.averageDown = 0;
    App.averageUp = 0;
    App.download.lastBytesLoaded = 0;
    App.download.lastTimestamp = null;
    App.upload.lastBytesLoaded = 0;
    App.upload.lastTimestamp = null;
  },

  startSpeedtest: function() {
    App.clearResults();
    App.ui.hideStartButton();
    App.startDownload();
  },

  startDownload: function() {
    App.ui.startProgressBar();
    $.ajax({
      type: 'GET',
      url: 'https://simplespeed.herokuapp.com/download',
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
        App.startUpload();
      }
    });
  },

  downloadProgress: function(ev) {
    var bytesLoaded = ev.loaded;
    var timestamp = ev.timeStamp;
    var timeInSeconds;

    if (App.download.lastTimestamp !== null) {
      var chunkSizeInBits = (bytesLoaded - App.download.lastBytesLoaded) * 8;
      var timestampDifference = timestamp - App.download.lastTimestamp;

      // Some browsers use timestamps with a higher resolution
      if (timestamp.toString().length === 16) {
        timeInSeconds = Math.round(timestampDifference/1000)/1000;
      } else {
        timeInSeconds = Math.round(timestampDifference)/1000;
      }

      var speed = chunkSizeInBits / timeInSeconds / 1024;

      App.measurements.down.push(speed);
      App.setAverageDown();
    }

    App.download.lastBytesLoaded = bytesLoaded;
    App.download.lastTimestamp = timestamp;
  },

  startUpload: function() {
    App.ui.startProgressBar();
    $.ajax({
      type: 'POST',
      url: 'https://simplespeed.herokuapp.com/upload',
      timeout: App.sampleTime,
      cache: false,
      data: App.sampleString(),
      beforeSend: function(xhr, settings) {
        xhr.upload.addEventListener('progress', App.uploadProgress, false);
      },
      success: function(data, status, xhr){
        console.log('testfile uploaded completely');
        console.log(status);
        console.log(data);
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

  uploadProgress: function(ev) {
    var bytesLoaded = ev.loaded;
    var timestamp = ev.timeStamp;

    if (App.upload.lastTimestamp !== null) {
      var chunkSizeInBits = (bytesLoaded - App.upload.lastBytesLoaded) * 8;
      var timestampDifference = timestamp - App.upload.lastTimestamp;

      // Some browsers use timestamps with a higher resolution
      if (timestamp.toString().length === 16) {
        timeInSeconds = Math.round(timestampDifference/1000)/1000;
      } else {
        timeInSeconds = Math.round(timestampDifference)/1000;
      }
      // Don't use unrealistic measurements
      if (timestampDifference < 100 || timeInSeconds < 0.1 ) { return; }

      var speed = chunkSizeInBits / timeInSeconds / 1024;
      console.log([chunkSizeInBits, timestampDifference, timeInSeconds]);

      App.measurements.up.push(speed);
      App.setAverageUp();
    }

    App.upload.lastBytesLoaded = bytesLoaded;
    App.upload.lastTimestamp = timestamp;
  },

  setAverageDown: function() {
    App.averageDown = parseInt(App.measurements.down.avg());
    App.ui.updateAverageDown(App.averageDown);
  },

  setAverageUp: function() {
    App.averageUp = parseInt(App.measurements.up.avg());
    App.ui.updateAverageUp(App.averageUp);
  },

  // UI

  ui: {
    updateAverageDown: function(value) {
      $('#down .kbps .value').html( value.toString() );
    },

    updateAverageUp: function(value) {
      $('#up .kbps .value').html( value.toString() );
    },

    hideStartButton: function() {
      $('button#start').hide();
    },

    showStartButton: function() {
      $('button#start').show();
    },

    startProgressBar: function() {
      var width = 0;

      doTimer(App.sampleTime, 20,
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
