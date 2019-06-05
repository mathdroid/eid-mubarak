
const START = '__START'
const END = '__END'
  
function sanitize(text) {
  let words = text
    .replace(/\&amp\;/gi, "&")
    .split(" ")
    .filter(word => !word.startsWith("@"))
    .filter(
      word =>
        !word.match(
          /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi
        )
    )
    .join(" ")
    .replace(/([\.,:;!\+&]+)/gi, " $1 ")
    .replace(/\s+/gi, " ")
    .split(" ")
    .filter(word => !!word);
  return `${START} ${words.join(" ").replace(/ ([\.,:;!\+&]+)/gi, "$1")} ${END}`;
}

function sanitizeGenerated (text) {
  return text.slice(START.length + 1, -(END.length + 1))
}

function isTextEndAtSentinel(text) {
  return text.endsWith(END)
}

function isUnder280Char (text) {
  return sanitizeGenerated(text).length < 280
}

module.exports = {
  sanitize,
  sanitizeGenerated,
  isTextEndAtSentinel,
  isUnder280Char
}