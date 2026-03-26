import api from "./api";

// Dohvati recenzije za igraonicu
export const getReviews = async (playroomId, page = 1) => {
  try {
    const response = await api.get(`/reviews/${playroomId}?page=${page}`);
    return {
      success: true,
      data: response.data.data,
      total: response.data.total,
    };
  } catch (error) {
    console.error("Greška:", error);
    return { success: false, error: error.response?.data?.message };
  }
};

// Dodaj recenziju
export const addReview = async (playroomId, rating, comment) => {
  try {
    const response = await api.post(`/reviews/${playroomId}`, {
      rating,
      comment,
    });
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error("Greška:", error);
    return { success: false, error: error.response?.data?.message };
  }
};

// Obriši recenziju
export const deleteReview = async (id) => {
  try {
    const response = await api.delete(`/reviews/${id}`);
    return { success: true, message: response.data.message };
  } catch (error) {
    console.error("Greška:", error);
    return { success: false, error: error.response?.data?.message };
  }
};
