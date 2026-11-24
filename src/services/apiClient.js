import axios from 'axios'
import { API_BASE_URL } from '../config/apiConfig'

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

export default apiClient