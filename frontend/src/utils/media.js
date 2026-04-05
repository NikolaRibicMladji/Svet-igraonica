export const normalizeImageItem = (item) => {
  if (!item) return null;

  if (typeof item === "string") {
    return { url: item };
  }

  return {
    ...item,
    url: item.url || item.secure_url || item.path || "",
  };
};

export const normalizeVideoItem = (item) => {
  if (!item) return null;

  return {
    ...item,
    url: item.url || item.secure_url || item.path || "",
    publicId: item.publicId || item.public_id || "",
    thumbnail: item.thumbnail || "",
    naziv: item.naziv || "",
    trajanje: Number(item.trajanje || item.duration || 0),
  };
};
