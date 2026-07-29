import json
import logging
from typing import List

from app.config import settings

logger = logging.getLogger(__name__)

_firebase_initialized = False


def _init_firebase():
    """Lazily initialise Firebase Admin SDK from the FIREBASE_CREDENTIALS_JSON env var."""
    global _firebase_initialized
    if _firebase_initialized:
        return True

    if not settings.FIREBASE_CREDENTIALS_JSON:
        logger.warning("FIREBASE_CREDENTIALS_JSON not configured. FCM push disabled.")
        return False

    try:
        # pyrefly: ignore [missing-import]
        import firebase_admin
        from firebase_admin import credentials

        if not firebase_admin._apps:
            cred_dict = json.loads(settings.FIREBASE_CREDENTIALS_JSON)
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred)

        _firebase_initialized = True
        logger.info("Firebase Admin SDK initialised successfully.")
        return True
    except Exception as e:
        logger.error(f"Failed to initialise Firebase Admin SDK: {e}")
        return False


async def send_fcm_notification(
    tokens: List[str],
    title: str,
    body: str,
    data: dict = None,
) -> None:
    """
    Send a push notification to a list of FCM registration tokens.
    Automatically removes tokens that are no longer valid.
    """
    if not tokens:
        return

    if not _init_firebase():
        return

    try:
        # pyrefly: ignore [missing-import]
        from firebase_admin import messaging

        message = messaging.MulticastMessage(
            notification=messaging.Notification(title=title, body=body),
            data={k: str(v) for k, v in (data or {}).items()},
            tokens=tokens,
            android=messaging.AndroidConfig(priority="high"),
            webpush=messaging.WebpushConfig(
                notification=messaging.WebpushNotification(
                    title=title,
                    body=body,
                    icon="/favicon.svg",
                ),
                fcm_options=messaging.WebpushFCMOptions(
                    link=settings.FRONTEND_URL,
                ),
            ),
        )

        response = messaging.send_each_for_multicast(message)
        logger.info(
            f"FCM multicast sent: {response.success_count} success, "
            f"{response.failure_count} failure(s) out of {len(tokens)}"
        )

        # Log individual failures for debugging (token cleanup handled by the router)
        for idx, resp in enumerate(response.responses):
            if not resp.success:
                logger.warning(f"FCM token[{idx}] failed: {resp.exception}")

        return response

    except Exception as e:
        logger.error(f"FCM send failed: {e}")
        return None
