var Webflow = Webflow || [];
Webflow.push(function () {
  const iframe = document.getElementById('vimeo-player');
  if (!iframe) return;

  const player = new Vimeo.Player(iframe);
  let unmuteClicked = false;
  let pauseClicked = false;

  function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  }

  function requestFullScreen(element) {
    if (element.requestFullscreen) element.requestFullscreen();
    else if (element.webkitRequestFullscreen) element.webkitRequestFullscreen();
    else if (element.mozRequestFullScreen) element.mozRequestFullScreen();
    else if (element.msRequestFullscreen) element.msRequestFullscreen();
  }

  function onExitFullscreen() {
    if (
      !document.fullscreenElement &&
      !document.webkitFullscreenElement &&
      $(iframe).is(':visible')
    ) {
      $('[vimeo="exit-button"]').click();
      if (!isIOS()) player.setVolume(0);
    }
  }

  const backgroundIframe = document.getElementById('vimeo-background');
  const backgroundPlayer = backgroundIframe ? new Vimeo.Player(backgroundIframe) : null;

  function checkPlayback() {
    if (!backgroundPlayer) return;

    backgroundPlayer
      .getPaused()
      .then(function (paused) {
        console.log('Video paused:', paused);
        if (paused) {
          $('[vimeo-fallback="true"]').css('display', 'block');
        } else {
          $('[vimeo-fallback="true"]').css('display', 'none');
        }
      })
      .catch(function (error) {
        console.error('Error checking playback status:', error);
      });
  }

  if (isIOS()) {
    setInterval(function () {
      onExitFullscreen();
      checkPlayback();
    }, 1000);
  } else {
    document.addEventListener('fullscreenchange', onExitFullscreen);
    document.addEventListener('webkitfullscreenchange', onExitFullscreen);
    setInterval(checkPlayback, 1000);
  }

  $('[vimeo="player-button"]').on('click touchstart', function () {
    var interval = setInterval(function () {
      const vimeoPlayerElement = $('[vimeo="player"]');
      if (vimeoPlayerElement.is(':visible')) {
        clearInterval(interval);
        requestFullScreen(iframe);

        if (backgroundPlayer) {
          backgroundPlayer.getCurrentTime().then(function (timecode) {
            player.setCurrentTime(timecode);
          });
        }

        let promise = Promise.resolve();

        if (unmuteClicked) {
          promise = promise.then(function () {
            return new Promise(function (resolve) {
              $('[vimeo="mute-button"]').click();
              setTimeout(resolve, 500);
            });
          });
        }

        if (pauseClicked) {
          promise = promise.then(function () {
            return new Promise(function (resolve) {
              $('[vimeo="play-button"]').click();
              setTimeout(resolve, 500);
            });
          });
        }

        promise.then(function () {
          player.play().then(function () {
            player.setVolume(1);
          });
        });
      }
    }, 100);
  });

  const effectsIframe = document.getElementById('vimeo-effects');
  const effectsPlayer = effectsIframe ? new Vimeo.Player(effectsIframe) : null;

  $('[vimeo="play-button"]').on('click touchstart', function () {
    if (backgroundPlayer) backgroundPlayer.play();
    if (effectsPlayer) effectsPlayer.play();
  });

  $('[vimeo="pause-button"]').on('click touchstart', function () {
    if (backgroundPlayer) backgroundPlayer.pause();
    if (effectsPlayer) effectsPlayer.pause();
    pauseClicked = true;
  });

  $('[vimeo="exit-button"]').on('click touchstart', function () {
    if (backgroundPlayer) backgroundPlayer.play();
  });

  $('[vimeo="unmute-button"]').on('click touchstart', function () {
    if (backgroundPlayer) backgroundPlayer.setVolume(1);
    unmuteClicked = true;
  });

  $('[vimeo="mute-button"]').on('click touchstart', function () {
    if (backgroundPlayer) backgroundPlayer.setVolume(0);
  });

  $('[vimeo="player"]').on('click touchstart', function () {
    let promise = Promise.resolve();

    if (unmuteClicked) {
      promise = promise.then(function () {
        return new Promise(function (resolve) {
          $('[vimeo="mute-button"]').click();
          setTimeout(resolve, 500);
        });
      });
    }

    if (pauseClicked) {
      promise = promise.then(function () {
        return new Promise(function (resolve) {
          $('[vimeo="play-button"]').click();
          setTimeout(resolve, 500);
        });
      });
    }

    promise.then(function () {
      player.play().then(function () {
        player.setVolume(1);
      });
    });
  });

  setTimeout(function () {
    if (backgroundPlayer) backgroundPlayer.play();
    if (effectsPlayer) effectsPlayer.play();
  }, 1000); // 1000 milliseconds = 1 second
});
