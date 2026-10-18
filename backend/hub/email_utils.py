import os
import resend


def send_resend_email(subject, recipient, message):
    api_key = os.getenv("RESEND_API_KEY")

    if not api_key:
        raise RuntimeError("RESEND_API_KEY is not configured.")

    sender = os.getenv(
        "RESEND_FROM_EMAIL",
        "onboarding@resend.dev",
    )

    resend.api_key = api_key

    return resend.Emails.send({
        "from": sender,
        "to": [recipient],
        "subject": subject,
        "text": message,
    })