import apiClient from './apiClient'

/*
 * Project: Fundoo Notes Frontend
 * Module: Authentication API Service
 * Author: Hemang
 * Date: 24-11-2026
 * Description: Provides centralized API methods for backend authentication workflows.
 */

export function registerUser(request) {
  return apiClient.post('/users/register', request)
}

export function loginUser(request) {
  return apiClient.post('/auth/login', request)
}

export function requestPasswordReset(request) {
  return apiClient.post('/auth/forgot-password', request)
}

export function resetPassword(request) {
  return apiClient.post('/auth/reset-password', request)
}

export function logoutUser(token) {
  return apiClient.post('/auth/logout', null, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}
