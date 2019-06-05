
const TYPES = Object.freeze({
  tweet: "tweet",
  retweet: "retweet",
  quote: "quote",
  reply: "reply"
});

const AUTOMATED_SOURCES = ["TweetDeck", "SocialPilot.co"];

const isRetweet = tweet => !!tweet.retweeted_status;

const isQuoteTweet = tweet => !!tweet.is_quote_status;

const isReplyTweet = tweet => !!tweet.in_reply_to_screen_name;

const isNormalTweet = tweet =>
  !isRetweet(tweet) && !isQuoteTweet(tweet) && !isReplyTweet(tweet);

const createPermalink = (screen_name, id_str) =>
  `https://twitter.com/${screen_name}/status/${id_str}`;

const getSource = tweet => tweet.source.split(">")[1].split("<")[0];

const isAutomatedSource = tweet => AUTOMATED_SOURCES.includes(getSource(tweet));

const getSummary = tweet => {
  let type = TYPES.tweet;
  let coActor = undefined;
  const actor = tweet.user.screen_name;
  const permalinks = [createPermalink(actor, tweet.id_str)];
  if (isRetweet(tweet)) {
    type = TYPES.retweet;
    coActor = tweet.retweeted_status.user.screen_name;
    permalinks.push(
      createPermalink(
        tweet.retweeted_status.user.screen_name,
        tweet.retweeted_status.id_str
      )
    );
  } else if (isQuoteTweet(tweet)) {
    type = TYPES.quote;
    coActor = tweet.quoted_status.user.screen_name;
    permalinks.push(tweet.quoted_status_permalink.expanded);
  } else if (isReplyTweet(tweet)) {
    type = TYPES.reply;
    coActor = tweet.in_reply_to_screen_name;
    permalinks.push(
      createPermalink(
        tweet.in_reply_to_screen_name,
        tweet.in_reply_to_status_id_str
      )
    );
  }
  return {
    type,
    actor,
    coActor,
    permalinks
  };
};

const getTweetText = tweet => {
  if (isRetweet(tweet)) {
    return getTweetText(tweet.retweeted_status)
  } else {
    return !!tweet.truncated
    ? tweet.extended_tweet.full_text
    : tweet.text || tweet.full_text;
  }
  
};


module.exports = {
  TYPES,
  isRetweet,
  isQuoteTweet,
  isReplyTweet,
  isNormalTweet,
  createPermalink,
  getSource,
  getSummary,
  isAutomatedSource,
  getTweetText
};
