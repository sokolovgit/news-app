/**
 * Notification composable
 * Manages app-wide notifications/toasts
 */

import type { Notification, NotificationType } from '~/types'

const notifications = ref<Notification[]>([])

export const useNotification = () => {
  const show = (
    type: NotificationType,
    title: string,
    message?: string,
    duration = 5000,
  ) => {
    const id = `notification-${Date.now()}-${Math.random()}`
    
    const notification: Notification = {
      id,
      type,
      title,
      message,
      duration,
      dismissible: true,
    }
    
    notifications.value.push(notification)
    
    if (duration > 0) {
      setTimeout(() => {
        dismiss(id)
      }, duration)
    }
    
    return id
  }

  const dismiss = (id: string) => {
    const index = notifications.value.findIndex((n) => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const success = (title: string, message?: string, duration?: number) => {
    return show('success', title, message, duration)
  }

  const error = (title: string, message?: string, duration?: number) => {
    return show('error', title, message, duration)
  }

  const warning = (title: string, message?: string, duration?: number) => {
    return show('warning', title, message, duration)
  }

  const info = (title: string, message?: string, duration?: number) => {
    return show('info', title, message, duration)
  }

  const clear = () => {
    notifications.value = []
  }

  return {
    notifications: readonly(notifications),
    show,
    dismiss,
    success,
    error,
    warning,
    info,
    clear,
  }
}

