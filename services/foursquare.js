const axios = require("axios");
const moment = require("moment");

const base = "https://api.foursquare.com/v2";
const CLIENT_ID = process.env.FOURSQUARE_CLIENT_ID;
const CLIENT_SECRET = process.env.FOURSQUARE_CLIENT_SECRET;
const v = moment().format("YYYYMMDD");

const getVenues = async (areaQuery) => {
  const endpoint = "venues/explore";
  const limit = 50;
  const categories =
    "4bf58dd8d48988d165941735,4deefb944765f83613cdba6e,52e81612bcbc57f1066b7a21";

  try {
    const result = await axios.get(
      `${base}/${endpoint}?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&v=${v}&${areaQuery}&categoryId=${categories}&limit=${limit}&sortByPopularity=1&locale=en`
    );

    return result.data.response.groups[0].items.map(({ venue }) => ({
      fsId: venue.id,
      name: venue.name.split(" (")[0],
      lat: venue.location.lat,
      lng: venue.location.lng,
      city: venue.location.city,
      state: venue.location.state,
      country: venue.location.country,
      categories: venue.categories.map((c) => ({
        name: c.name,
        icon: `${c.icon.prefix}64${c.icon.suffix}`,
      })),
    }));
  } catch (error) {
    const type = error.response ? error.response.data.meta.errorType : null;

    console.log(type);

    switch (type) {
      case "geocode_too_big":
        throw "search area too big";
      default:
        throw "something went wrong";
    }
  }
};

const getCategories = async () => {
  const endpoint = "venues/categories";
  try {
    const result = await axios.get(
      `${base}/${endpoint}?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&v=${v}`
    );

    const data = [];

    const recurse = (categories) => {
      categories.forEach((category) => {
        data.push({
          name: category.name,
          icon: `${category.icon.prefix}64${category.icon.suffix}`,
        });
        if (category.categories.length) recurse(category.categories);
      });
    };

    recurse(result.data.response.categories);

    return data;
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = { getVenues, getCategories };
