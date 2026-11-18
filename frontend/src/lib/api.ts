import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL;

export const likeBlog = async (blogId: string, token: string) => {
  const response = await axios.patch(
    `${API_URL}/api/v1/blogs/${blogId}/like`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const unlikeBlog = async (blogId: string, token: string) => {
  const response = await axios.patch(
    `${API_URL}/api/v1/blogs/${blogId}/unlike`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const addComment = async (blogId: string, text: string, token: string) => {
  const response = await axios.post(
    `${API_URL}/api/v1/blogs/${blogId}/comments`,
    { text },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const getBlogComments = async (blogId: string) => {
  const response = await axios.get(`${API_URL}/api/v1/blogs/${blogId}/comments`);
  return response.data.comments;
};

export const deleteComment = async (blogId: string, commentId: string, token: string) => {
  const response = await axios.delete(
    `${API_URL}/api/v1/blogs/${blogId}/comments/${commentId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const deleteBlog = async (blogId: string, token: string) => {
  const response = await axios.delete(`${API_URL}/api/v1/blogs/${blogId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
