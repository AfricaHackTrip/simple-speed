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

  averageSpeedDown: function() {
    //TODO move to progress
    var averageDownInSeconds = this.averageDown / 1000;

    var kbps = this.testfileSize / averageDownInSeconds / 1024;
    return kbps;
  },

  download: {
    lastBytesLoaded: 0,
    lastTimestamp: null
  },

  downloadProgress: function(ev) {
    console.log(ev.loaded);
    console.log(ev.timestamp);

    var bytesLoaded = ev.loaded;
    var timestamp = ev.timestamp;

    if (App.download.lastTimestamp !== null) {
      var size = bytesLoaded - App.download.lastBytesLoaded;
      var time = timestamp - App.download.lastTimestamp;

      console.log('size: ' + size + ' - time: ' + time);
      // App.measurements.down.push(kbps);
    }

    App.download.lastBytesLoaded = bytesLoaded;
    App.download.lastTimestamp = timestamp;

    // App.ui.updateMeasurements();

    // App.setAverageDown();
  },

  startSpeedtest: function() {
    App.ui.hideStartButton();

    $.ajax({
      type: 'GET',
      url: '/testfile.txt',
      timeout: 100000,
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
    App.averageDown = App.measurements.down.avg();
    App.ui.updateAverageDown( App.averageDown + ' Kb/s' );
  },

  // UI

  ui: {
    updateAverageDown: function(value) {
      $('#down').html( value.toString() );
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
