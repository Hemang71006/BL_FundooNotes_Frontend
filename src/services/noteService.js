import apiClient from './apiClient'

/*
 * Project: Fundoo Notes Frontend
 * Module: Notes Service
 * Author: Hemang
 * Date: 24-11-2026
 * Description: Provides API operations for authenticated note retrieval.
 */

export function getAllNotes() {
  return apiClient.get('/notes')
}
