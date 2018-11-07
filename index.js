let getEpisodeNumber = function(episode) {
  let pattern = /^#([0-9]+) .*$/;
  try {
    return episode.title.match(pattern)[1];
  } catch (e) {
    return null;
  }
};

let app = new Vue({
  el: '#app',
  data: {
    feedUrl: "http://feeds.gimletmedia.com/hearreplyall?format=xml",
    episodes: [],
    start: 0,
    episodesPerPage: 10
  },
  created: function() {
    // Note: some RSS feeds can't be loaded in the browser due to CORS security.
    // To get around this, you can use a proxy.
    const CORS_PROXY = "https://cors-anywhere.herokuapp.com/"

    let component = this;
    let parser = new RSSParser();
    parser.parseURL(CORS_PROXY+this.feedUrl, function(err, feed) {
      feed.items.sort((a, b) => a.pubDate < b.pubDate);
      let allEpisodes = {};
      feed.items.forEach(function(episode) {
        let episodeNumber = getEpisodeNumber(episode);
        allEpisodes[episodeNumber] = episode;
      })
      component.episodes = breakmasterCylinderSegments.map(function(segment) {
        let episode = allEpisodes[segment.episode];
        episode.breakmasterCylinderSegmentDuration = segment.duration;
        return episode;
      })
    })
  }
})
