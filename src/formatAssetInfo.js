const formatAssetInfo = (obj, indent = 0) => {
  let formattedString = "";
  const indentSpaces = " ".repeat(indent);
  for (const key in obj) {
    if (typeof obj[key] === "object" && obj[key] !== null) {
      formattedString +=
        `\n${indentSpaces}**${
          key.charAt(0).toUpperCase() + key.slice(1)
        }:**\n` + formatAssetInfo(obj[key], indent + 2);
    } else {
      formattedString += `${indentSpaces}**${
        key.charAt(0).toUpperCase() + key.slice(1)
      }:** ${obj[key]}\n`;
    }
  }
  return formattedString;
};

module.exports = formatAssetInfo;
