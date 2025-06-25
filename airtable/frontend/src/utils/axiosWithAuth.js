import axios from "axios"

const axiosWithAuth = () => {
  const token = localStorage.getItem("token")
  return axios.create({
    baseURL: "http://localhost:5000",
    headers: { Authorization: `Bearer ${token}` }
  })
}

export default axiosWithAuth
