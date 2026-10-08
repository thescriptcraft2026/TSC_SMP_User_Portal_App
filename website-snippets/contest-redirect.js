// Add to the contest page (/contests/:id). Desktop is unchanged.
// Serve /.well-known/* with Content-Type: application/json, no redirects.
(function () {
  var PACKAGE = 'com.rnscriptcarft';
  var APP_STORE_URL = 'https://apps.apple.com/app/idREPLACE_APP_ID';
  var ua = navigator.userAgent || '';
  var isAndroid = /Android/i.test(ua);
  var isIOS = /iPhone|iPad|iPod/i.test(ua);
  if (!isAndroid && !isIOS) return;

  var params = new URLSearchParams(location.search);
  var influencer = params.get('influencer');
  var contestId = (location.pathname.match(/\/contests\/([^/?#]+)/) || [])[1];

  // Call this from your "Get the app" button (don't auto-redirect: App Links
  // open the installed app before the page ever loads).
  window.getTheApp = function () {
    if (isAndroid) {
      var ref = [];
      if (influencer) ref.push('influencer=' + encodeURIComponent(influencer));
      if (contestId) ref.push('contestId=' + encodeURIComponent(contestId));
      // referrer value must itself be URL-encoded once more
      location.href =
        'https://play.google.com/store/apps/details?id=' + PACKAGE +
        '&referrer=' + encodeURIComponent(ref.join('&'));
    } else {
      location.href = APP_STORE_URL; // iOS cannot carry the referral through install
    }
  };
})();
