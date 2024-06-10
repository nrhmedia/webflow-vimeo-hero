'use strict';
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed');
  var Webflow = Webflow || [];
  Webflow.push(function () {
    const iframe = document.getElementById('vimeo-player');
    if (!iframe) {
      console.log('Vimeo player iframe not found');
      return;
    }

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

    $('[vimeo="player-button"]').on('click touchstart', function () {
      console.log('Player button clicked');
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

    function onExitFullscreen() {
      if (
        !document.fullscreenElement &&
        !document.webkitFullscreenElement &&
        $(iframe).is(':visible')
      ) {
        console.log('Exiting fullscreen');
        $('[vimeo="exit-button"]').click();
        if (!isIOS()) player.setVolume(0);
      }
    }

    if (isIOS()) {
      setInterval(function () {
        onExitFullscreen();
      }, 1000);
    } else {
      document.addEventListener('fullscreenchange', onExitFullscreen);
      document.addEventListener('webkitfullscreenchange', onExitFullscreen);
    }

    const backgroundIframe = document.getElementById('vimeo-background');
    const effectsIframe = document.getElementById('vimeo-effects');
    const fallbackElement = document.querySelector('[vimeo-fallback=true]');

    var backgroundPlayer = backgroundIframe ? new Vimeo.Player(backgroundIframe) : null;
    const effectsPlayer = effectsIframe ? new Vimeo.Player(effectsIframe) : null;

    $('[vimeo="play-button"]').on('click touchstart', function () {
      console.log('Play button clicked');
      if (backgroundPlayer) backgroundPlayer.play();
      if (effectsPlayer) effectsPlayer.play();
    });

    $('[vimeo="pause-button"]').on('click touchstart', function () {
      console.log('Pause button clicked');
      if (backgroundPlayer) backgroundPlayer.pause();
      if (effectsPlayer) effectsPlayer.pause();
      pauseClicked = true;
    });

    $('[vimeo="exit-button"]').on('click touchstart', function () {
      console.log('Exit button clicked');
      if (backgroundPlayer) backgroundPlayer.play();
    });

    $('[vimeo="unmute-button"]').on('click touchstart', function () {
      console.log('Unmute button clicked');
      if (backgroundPlayer) backgroundPlayer.setVolume(1);
      unmuteClicked = true;
    });

    $('[vimeo="mute-button"]').on('click touchstart', function () {
      console.log('Mute button clicked');
      if (backgroundPlayer) backgroundPlayer.setVolume(0);
    });

    $('[vimeo="player"]').on('click touchstart', function () {
      console.log('Player clicked');
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

    // Send extra play command after 1 second
    setTimeout(function () {
      if (backgroundPlayer) backgroundPlayer.play();
      if (effectsPlayer) effectsPlayer.play();
    }, 1000); // 1000 milliseconds = 1 second

    // Function to check if the video is playing
    function checkVideoPlaying() {
      if (backgroundPlayer && fallbackElement) {
        backgroundPlayer
          .getPaused()
          .then(function (paused) {
            if (!paused) {
              // Video is playing
              fallbackElement.style.display = 'none';
            } else {
              // Video is not playing
              fallbackElement.style.display = 'block';
            }
          })
          .catch(function (error) {
            console.error('Error checking video status:', error);
            // Fallback in case of error
            fallbackElement.style.display = 'block';
          });
      }
    }

    // Initial check after a delay to account for video load time
    setTimeout(checkVideoPlaying, 1000);

    // Set an interval to periodically check the video status
    setInterval(checkVideoPlaying, 5000); // Check every 5 seconds
  });
});
