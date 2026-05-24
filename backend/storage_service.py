"""Cloudflare R2 (S3-compatible) image upload service."""
import os
import uuid
import logging
import asyncio
import boto3
from botocore.client import Config
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)

ALLOWED_MIME = {"image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"}
EXT_FROM_MIME = {
    "image/jpeg": "jpg", "image/jpg": "jpg",
    "image/png": "png", "image/webp": "webp", "image/gif": "gif",
}
MAX_BYTES = 10 * 1024 * 1024  # 10 MB


def _r2_config():
    return {
        "account_id": os.environ.get("R2_ACCOUNT_ID", ""),
        "access_key_id": os.environ.get("R2_ACCESS_KEY_ID", ""),
        "secret_access_key": os.environ.get("R2_SECRET_ACCESS_KEY", ""),
        "bucket": os.environ.get("R2_BUCKET", ""),
        "public_url_base": os.environ.get("R2_PUBLIC_URL_BASE", "").rstrip("/"),
    }


def _is_configured() -> bool:
    cfg = _r2_config()
    return all([cfg["account_id"], cfg["access_key_id"], cfg["secret_access_key"], cfg["bucket"]]) \
        and not cfg["access_key_id"].startswith("dummy")


def _get_client():
    cfg = _r2_config()
    return boto3.client(
        "s3",
        endpoint_url=f"https://{cfg['account_id']}.r2.cloudflarestorage.com",
        aws_access_key_id=cfg["access_key_id"],
        aws_secret_access_key=cfg["secret_access_key"],
        config=Config(signature_version="s3v4"),
        region_name="auto",
    )


async def upload_image(data: bytes, content_type: str, original_filename: str = "") -> dict:
    """Upload an image to R2. Returns {url, key, size}. Raises ValueError on validation failure."""
    if content_type not in ALLOWED_MIME:
        raise ValueError(f"Unsupported image type: {content_type}")
    if len(data) > MAX_BYTES:
        raise ValueError(f"Image too large ({len(data)} bytes). Max 10MB.")

    ext = EXT_FROM_MIME.get(content_type, "jpg")
    key = f"gallery/{uuid.uuid4()}.{ext}"

    if not _is_configured():
        # Storage not configured (dummy credentials) — return a clear error
        raise RuntimeError(
            "Cloudflare R2 is not configured. Please set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, "
            "R2_SECRET_ACCESS_KEY, R2_BUCKET and R2_PUBLIC_URL_BASE in /app/backend/.env."
        )

    cfg = _r2_config()

    def _do_upload():
        client = _get_client()
        client.put_object(
            Bucket=cfg["bucket"],
            Key=key,
            Body=data,
            ContentType=content_type,
            CacheControl="public, max-age=31536000, immutable",
        )

    try:
        await asyncio.to_thread(_do_upload)
    except ClientError as e:
        logger.error(f"R2 upload failed: {e}")
        raise RuntimeError(f"Upload failed: {e}")

    url = f"{cfg['public_url_base']}/{key}" if cfg["public_url_base"] else key
    return {"url": url, "key": key, "size": len(data), "content_type": content_type, "original_filename": original_filename}


def is_configured() -> bool:
    """Public helper so endpoints can advertise availability."""
    return _is_configured()
