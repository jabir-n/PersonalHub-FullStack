import logging
import os

import requests


logger = logging.getLogger(__name__)

BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"


def send_resend_email(subject, recipient, message):


    api_key = os.getenv("BREVO_API_KEY")

    sender_email = os.getenv(
        "DEFAULT_FROM_EMAIL",
        "personalhub.notifications@gmail.com",
    )

    if not api_key:
        raise RuntimeError(
            "BREVO_API_KEY is not configured."
        )

    payload = {
        "sender": {
            "name": "PersonalHub",
            "email": sender_email,
        },
        "to": [
            {
                "email": recipient,
            }
        ],
        "subject": subject,
        "textContent": message,
    }

    headers = {
        "accept": "application/json",
        "api-key": api_key,
        "content-type": "application/json",
    }

    try:
        response = requests.post(
            BREVO_API_URL,
            json=payload,
            headers=headers,
            timeout=20,
        )

        if not response.ok:
            logger.error(
                "Brevo email failed. Status: %s, Response: %s",
                response.status_code,
                response.text,
            )

            response.raise_for_status()

        logger.info(
            "Email successfully submitted to Brevo for %s",
            recipient,
        )

        return response.json()

    except requests.RequestException:
        logger.exception(
            "Failed to send email through Brevo."
        )
        raise