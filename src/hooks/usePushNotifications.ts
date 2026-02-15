import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications(sessionId: string | null, playerName: string | null) {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [vapidPublicKey, setVapidPublicKey] = useState<string | null>(null);
  const notificationSoundRef = useRef<HTMLAudioElement | null>(null);

  // Init sound
  useEffect(() => {
    notificationSoundRef.current = new Audio('/notification-sound.mp3');
    notificationSoundRef.current.volume = 0.5;
  }, []);

  // Fetch VAPID public key from edge function
  useEffect(() => {
    supabase.functions.invoke('send-push-notification', { method: 'GET' })
      .then(({ data }) => {
        if (data?.publicKey) setVapidPublicKey(data.publicKey);
      })
      .catch(console.error);
  }, []);

  // Check support
  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsSupported(supported);
    if (supported) {
      setPermission(Notification.permission);
    }
  }, []);

  // Register SW and subscribe
  const subscribe = useCallback(async () => {
    if (!isSupported || !sessionId || !playerName || !vapidPublicKey) return false;

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== 'granted') return false;

      const subscription = await (registration as any).pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      const subJson = subscription.toJSON();

      // Upsert subscription in DB
      const { error } = await supabase
        .from('push_subscriptions' as any)
        .upsert(
          {
            session_id: sessionId,
            player_name: playerName,
            subscription: subJson,
          },
          { onConflict: 'session_id,player_name' }
        );

      if (error) {
        console.error('Failed to save push subscription:', error);
        return false;
      }

      setIsSubscribed(true);
      return true;
    } catch (err) {
      console.error('Push subscription failed:', err);
      return false;
    }
  }, [isSupported, sessionId, playerName, vapidPublicKey]);

  // Send push to partner via edge function
  const sendPushToPartner = useCallback(async (title: string, body: string) => {
    if (!sessionId || !playerName) return;

    try {
      await supabase.functions.invoke('send-push-notification', {
        body: { session_id: sessionId, player_name: playerName, title, body },
      });
    } catch (err) {
      console.error('Failed to send push notification:', err);
    }
  }, [sessionId, playerName]);

  // Notify partner: push if background, toast+sound if foreground
  const notifyPartner = useCallback(async (title: string, body: string) => {
    if (document.visibilityState === 'visible') {
      // In-app: toast + sound
      toast(title, { description: body, duration: 4000 });
      try {
        notificationSoundRef.current?.play();
      } catch {}
    }
    // Always attempt push (will show if tab is in background)
    await sendPushToPartner(title, body);
  }, [sendPushToPartner]);

  // Play in-app notification (toast + sound) without push
  const notifyInApp = useCallback((title: string, body: string) => {
    toast(title, { description: body, duration: 4000 });
    try {
      notificationSoundRef.current?.play();
    } catch {}
  }, []);

  return {
    isSupported,
    isSubscribed,
    permission,
    subscribe,
    sendPushToPartner,
    notifyPartner,
    notifyInApp,
  };
}
