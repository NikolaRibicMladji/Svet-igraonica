import api from "./api";

export const getReviews = async (playroomId, page = 1) => {
  try {
    const response = await api.get(`/reviews/${playroomId}?page=${page}`);

    return {
      success: true,
      data: Array.isArray(response.data?.data) ? response.data.data : [],
      total: response.data?.total || 0,
      page: response.data?.page || page,
      pages: response.data?.pages || 1,
    };
  } catch (error) {
    console.error("Greška pri dohvatanju recenzija:", error);

    return {
      success: false,
      error:
        error.response?.data?.message || "Greška pri učitavanju recenzija.",
    };
  }
};

export const addReview = async (playroomId, rating, comment) => {
  try {
    const response = await api.post(`/reviews/${playroomId}`, {
      rating,
      comment,
    });

    return {
      success: true,
      data: response.data?.data || null,
      message: response.data?.message || "Recenzija je uspešno dodata.",
    };
  } catch (error) {
    console.error("Greška pri dodavanju recenzije:", error);

    return {
      success: false,
      error: error.response?.data?.message || "Greška pri dodavanju recenzije.",
    };
  }
};

export const deleteReview = async (id) => {
  try {
    const response = await api.delete(`/reviews/${id}`);

    return {
      success: true,
      message: response.data?.message || "Recenzija je uspešno obrisana.",
    };
  } catch (error) {
    console.error("Greška pri brisanju recenzije:", error);

    return {
      success: false,
      error: error.response?.data?.message || "Greška pri brisanju recenzije.",
    };
  }
};
