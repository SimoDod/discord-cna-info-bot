const formatAssetInfo = (obj, ignoredKeys = [], indent = 0) => {
  let formattedString = "";
  const indentSpaces = " ".repeat(indent);

  for (const key in obj) {
    if (ignoredKeys.includes(key)) {
      continue;
    }

    if (typeof obj[key] === "object" && obj[key] !== null) {
      formattedString +=
        `\n${indentSpaces}**${
          key.charAt(0).toUpperCase() + key.slice(1)
        }:**\n` + formatAssetInfo(obj[key], ignoredKeys, indent + 2);
    } else {
      formattedString += `${indentSpaces}**${
        key.charAt(0).toUpperCase() + key.slice(1)
      }:** ${obj[key]}\n`;
    }
  }
  return formattedString;
};

module.exports = formatAssetInfo;
