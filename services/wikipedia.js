const axios = require("axios");

const base = "https://en.wikipedia.org/api/rest_v1";

const getExtract = async (name) => {
  const endpoint = "page/summary";
  const title = encodeURI(name);

  try {
    const result = await axios.get(`${base}/${endpoint}/${title}`);

    return result.data.type === "standard" ? result.data.extract : null;
  } catch (error) {
    console.log("WIKIPEDIA 'get extract' ERROR:", error.message);
    return null;
  }
};

module.exports = { getExtract };
