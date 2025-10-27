import { toast } from 'sonner';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function requestNotificationPermission() {
  if (typeof window === 'undefined') return false;

  if (!('Notification' in window)) {
    toast.error('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      toast.success('Notifications enabled successfully');
      return true;
    } else {
      toast.error('Notification permission denied');
      return false;
    }
  }

  toast.error('Notifications are blocked. Please enable in browser settings.');
  return false;
}

export async function registerServiceWorker() {
  if (typeof window === 'undefined') return null;

  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      return registration;
    } catch (error) {
      toast.error('Service Worker registration failed');
      return null;
    }
  }
  return null;
}

export async function getDeviceToken() {
  if (typeof window === 'undefined') return null;

  const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  try {
    const registration = await registerServiceWorker();
    if (!registration) return null;

    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) return null;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });

    return JSON.stringify(subscription);
  } catch (error) {
    toast.error('Failed to get device token');
    return null;
  }
}

export async function saveDeviceToken(deviceToken) {
  if (typeof window === 'undefined') return false;

  try {
    const response = await fetch('/api/user/device-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ deviceToken }),
    });

    if (response.ok) {
      return true;
    } else {
      toast.error('Failed to save device token');
      return false;
    }
  } catch (error) {
    toast.error('Error saving device token');
    return false;
  }
}

export async function setupPushNotifications() {
  if (typeof window === 'undefined') return null;

  try {
    const deviceToken = await getDeviceToken();
    if (deviceToken) {
      const saved = await saveDeviceToken(deviceToken);
      if (saved) {
        toast.success('Push notifications enabled');
      }
      return deviceToken;
    }
  } catch (error) {
    toast.error('Error setting up push notifications');
  }
  return null;
}