import axios from 'axios'
import { API_BASE_URL } from '../config/apiConfig'
import { getAuthSession } from '../utils/token'

/*
 * Project: Fundoo Notes Frontend
 * Module: API Client
 * Author: Hemang
 * Date: 24-11-2026
 * Description: Configures centralized Axios communication with the backend.
 */

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

let unauthorizedHandler = null

const publicAuthPaths = [
  '/users/register',
  '/auth/login',
  '/auth/forgot-password',
  '/auth/reset-password',
]

function isPublicAuthRequest(url) {
  return publicAuthPaths.some((path) => url?.startsWith(path))
}

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler
}

apiClient.interceptors.request.use((config) => {
  if (!isPublicAuthRequest(config.url)) {
    const session = getAuthSession()
    if (session?.token) {
      config.headers.Authorization = `Bearer ${session.token}`
    }
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401
      && error.config
      && !error.config.__authHandled
      && !isPublicAuthRequest(error.config.url)
    ) {
      error.config.__authHandled = true
      unauthorizedHandler?.()
    }

    return Promise.reject(error)
  }
)

export default apiClient