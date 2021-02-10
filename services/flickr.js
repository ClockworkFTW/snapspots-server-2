const axios = require("axios");

const base = "https://www.flickr.com/services/rest";
const API_KEY = process.env.FLICKR_API_KEY;

const getPhotos = async (name, { lat, lng }) => {
  try {
    const method = "flickr.photos.search&format=json&nojsoncallback=1";
    const text = encodeURI(name);
    const sort = "relevance";
    const per_page = "20";

    const url = `${base}?method=${method}&api_key=${API_KEY}&text=${text}&lat=${lat}&lon=${lng}&sort=${sort}&per_page=${per_page}`;

    const result = await axios.get(url);

    if (result.data.stat !== "ok") return [];

    return result.data.photos.photo.map(
      (photo) =>
        `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_b.jpg`
    );
  } catch (error) {
    console.log(error);
  }
};

const getIdAndSecret = (photo) => {
  const arr = photo.split("/")[4].split("_");
  return { photo_id: arr[0], secret: arr[1] };
};

const getInfo = async (photo) => {
  try {
    const method = "flickr.photos.getInfo&format=json&nojsoncallback=1";
    const { photo_id, secret } = getIdAndSecret(photo);
    const url = `${base}?method=${method}&api_key=${API_KEY}&photo_id=${photo_id}&secret=${secret}`;
    const result = await axios.get(url);
    return result.data.photo;
  } catch (error) {
    console.log(error);
  }
};

const getExif = async (photo) => {
  try {
    const method = "flickr.photos.getExif&format=json&nojsoncallback=1";
    const { photo_id, secret } = getIdAndSecret(photo);
    const url = `${base}?method=${method}&api_key=${API_KEY}&photo_id=${photo_id}&secret=${secret}`;
    const result = await axios.get(url);
    return result.data.photo.exif;
  } catch (error) {
    console.log(error);
  }
};

module.exports = { getPhotos, getInfo, getExif };
