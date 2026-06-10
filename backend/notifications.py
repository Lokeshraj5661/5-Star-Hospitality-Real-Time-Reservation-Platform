"""Optional notifications — Twilio SMS + Gmail SMTP.
Both functions are NO-OPS until the corresponding env vars are set.
"""
from __future__ import annotations
import os
import smtplib
import ssl
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger(__name__)

NOTIFY_EMAIL_TO = os.environ.get("NOTIFY_EMAIL_TO", "rajlokesh973@gmail.com")


def _twilio_configured() -> bool:
    return all(
        os.environ.get(k)
        for k in ("TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_FROM_NUMBER")
    )


def _gmail_configured() -> bool:
    return bool(os.environ.get("GMAIL_USER") and os.environ.get("GMAIL_APP_PASSWORD"))


def send_sms(to_phone: str, body: str) -> bool:
    if not _twilio_configured():
        logger.info("Twilio not configured — skipping SMS to %s", to_phone)
        return False
    try:
        from twilio.rest import Client  # type: ignore
        client = Client(os.environ["TWILIO_ACCOUNT_SID"], os.environ["TWILIO_AUTH_TOKEN"])
        client.messages.create(
            body=body,
            from_=os.environ["TWILIO_FROM_NUMBER"],
            to=to_phone,
        )
        logger.info("SMS sent to %s", to_phone)
        return True
    except Exception as exc:
        logger.error("Twilio send failed: %s", exc)
        return False


def send_email(subject: str, html_body: str, to: str | None = None) -> bool:
    if not _gmail_configured():
        logger.info("Gmail SMTP not configured — skipping email")
        return False
    to_addr = to or NOTIFY_EMAIL_TO
    user = os.environ["GMAIL_USER"]
    pwd = os.environ["GMAIL_APP_PASSWORD"]
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = user
        msg["To"] = to_addr
        msg.attach(MIMEText(html_body, "html"))
        ctx = ssl.create_default_context()
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=ctx, timeout=15) as srv:
            srv.login(user, pwd)
            srv.sendmail(user, [to_addr], msg.as_string())
        logger.info("Email sent to %s", to_addr)
        return True
    except Exception as exc:
        logger.error("Gmail send failed: %s", exc)
        return False


def render_event_email(title: str, rows: list[tuple[str, str]]) -> str:
    rows_html = "".join(
        f"<tr><td style='padding:8px 12px;color:#888;border-bottom:1px solid #2a2620'>{k}</td>"
        f"<td style='padding:8px 12px;color:#F9F5F0;border-bottom:1px solid #2a2620'>{v}</td></tr>"
        for k, v in rows
    )
    return f"""<!doctype html>
<html><body style='margin:0;padding:0;background:#0E0B08;font-family:Georgia,serif;color:#F9F5F0'>
  <div style='max-width:560px;margin:0 auto;padding:40px 24px;'>
    <div style='border:1px solid #D4AF37;padding:32px;background:#1A1A1A'>
      <div style='font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#D4AF37'>Lakshmi Venkateswara · Concierge</div>
      <h1 style='font-family:Georgia,serif;font-weight:500;font-size:28px;line-height:1.1;color:#F5F5DC;margin:18px 0 24px'>{title}</h1>
      <table style='width:100%;border-collapse:collapse;font-family:Helvetica,sans-serif;font-size:13px;'>
        {rows_html}
      </table>
      <div style='margin-top:32px;padding-top:16px;border-top:1px solid #2a2620;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#888'>
        Pulivendula · RTC Bus Stand · +91 99662 11944
      </div>
    </div>
  </div>
</body></html>"""


def sms_reservation_confirmed(name: str, date: str, time: str, guests: int, short_id: str) -> str:
    return (
        f"LAKSHMI VENKATESWARA — Reservation #{short_id} CONFIRMED for {name}, "
        f"{date} {time}, party of {guests}. See you at the door. — Concierge"
    )


def sms_reservation_cancelled(name: str, date: str, short_id: str) -> str:
    return (
        f"LAKSHMI VENKATESWARA — Reservation #{short_id} for {name} on {date} has been cancelled. "
        f"The table is released. Please write back any time. — Concierge"
    )


def sms_order_confirmed(name: str, short_id: str) -> str:
    return (
        f"LAKSHMI VENKATESWARA — Order #{short_id} CONFIRMED. The kitchen has begun. "
        f"Ready in ~25 min. — Kitchen"
    )


def sms_order_cancelled(name: str, short_id: str) -> str:
    return (
        f"LAKSHMI VENKATESWARA — Order #{short_id} cancelled. No charges. "
        f"We hope to serve you again soon. — Kitchen"
    )
