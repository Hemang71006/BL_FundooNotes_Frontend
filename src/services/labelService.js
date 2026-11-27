import apiClient from './apiClient'

/*
 * Project: Fundoo Notes Frontend
 * Module: Labels Service
 * Author: Hemang
 * Date: 27-11-2026
 * Description: Provides authenticated label CRUD and note-label association requests.
 */

export function getLabels() {
  return apiClient.get('/labels')
}

export function createLabel(labelData) {
  return apiClient.post('/labels', labelData)
}

export function updateLabel(labelId, labelData) {
  return apiClient.put(`/labels/${labelId}`, labelData)
}

export function deleteLabel(labelId) {
  return apiClient.delete(`/labels/${labelId}`)
}

export function assignLabelToNote(noteId, labelId) {
  return apiClient.post(`/notes/${noteId}/labels/${labelId}`)
}

export function removeLabelFromNote(noteId, labelId) {
  return apiClient.delete(`/notes/${noteId}/labels/${labelId}`)
}
