"""Resend email service for transactional notifications."""
import os
import asyncio
import logging
import resend

logger = logging.getLogger(__name__)

resend.api_key = os.environ.get("RESEND_API_KEY", "")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")
QUOTE_NOTIFICATION_EMAIL = os.environ.get("QUOTE_NOTIFICATION_EMAIL", "")


def _build_quote_html(quote: dict) -> str:
    items_rows = "".join([
        f"<tr><td style='padding:6px 0;color:#64748b;'>{k}</td><td style='padding:6px 0;font-weight:600;color:#0f172a;'>{v}</td></tr>"
        for k, v in [
            ("Name", quote.get("parent_name", "—")),
            ("Email", quote.get("email", "—")),
            ("Phone", quote.get("phone", "—")),
            ("Event date", quote.get("event_date") or "—"),
            ("Age group", quote.get("age_group_name") or "—"),
            ("Guest count", quote.get("guest_count", 0)),
            ("Package", quote.get("package_name") or "—"),
            ("Snack box", quote.get("snack_box_name") or "—"),
            ("Extra snack boxes", quote.get("add_on_snack_count", 0)),
            ("Estimated total", f"${quote.get('estimated_total', 0)}"),
        ]
    ])
    notes = quote.get("notes") or ""
    notes_block = (
        f"<tr><td colspan='2' style='padding-top:14px;color:#64748b;'>Notes</td></tr>"
        f"<tr><td colspan='2' style='padding:6px 0;color:#0f172a;'>{notes}</td></tr>"
    ) if notes else ""

    return f"""
    <table width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif;background:#f8fafc;padding:24px 0;">
      <tr><td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;padding:32px;max-width:600px;">
          <tr><td>
            <h1 style="margin:0 0 8px 0;color:#0f172a;font-size:24px;">🎉 New Quote Request</h1>
            <p style="margin:0 0 18px 0;color:#475569;font-size:14px;">A new party is in the queue. Details below.</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e2e8f0;font-size:14px;">
              {items_rows}
              {notes_block}
            </table>
            <p style="margin-top:24px;color:#64748b;font-size:12px;">Sent from Kids Feast website</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
    """


async def send_quote_notification(quote: dict) -> dict:
    """Send a quote notification email. Non-blocking. Returns {status, message}."""
    api_key = os.environ.get("RESEND_API_KEY", "")
    if not api_key or api_key.startswith("re_dummy"):
        logger.warning("RESEND_API_KEY is missing or dummy — skipping email send.")
        return {"status": "skipped", "reason": "missing_api_key"}
    if not QUOTE_NOTIFICATION_EMAIL:
        return {"status": "skipped", "reason": "missing_recipient"}

    params = {
        "from": SENDER_EMAIL,
        "to": [QUOTE_NOTIFICATION_EMAIL],
        "subject": f"New party quote from {quote.get('parent_name', 'a parent')} (${quote.get('estimated_total', 0)})",
        "html": _build_quote_html(quote),
    }
    try:
        resend.api_key = api_key  # refresh in case .env changed
        result = await asyncio.to_thread(resend.Emails.send, params)
        return {"status": "sent", "email_id": result.get("id")}
    except Exception as e:
        logger.error(f"Failed to send quote notification email: {e}")
        return {"status": "error", "error": str(e)}
