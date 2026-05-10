FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
WORKDIR /app

# ===== System dependencies =====
RUN apt-get update && apt-get install -y \
    build-essential \
    poppler-utils \
    tesseract-ocr \
    tesseract-ocr-vie \
    libreoffice \
    imagemagick \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*


# ===== Tesseract environment =====
ENV TESSDATA_PREFIX=/usr/share/tesseract-ocr/5/
RUN cp /usr/share/tesseract-ocr/5/tessdata/vie.traineddata /usr/share/tesseract-ocr/5/


# ===== Python dependencies =====
COPY requirements.txt .

# Cài PyTorch GPU nếu có, fallback CPU
RUN pip install --upgrade pip && \
    pip install --no-cache-dir torch==2.2.2+cu121 torchvision==0.17.2+cu121 torchaudio==2.2.2+cu121 --index-url https://download.pytorch.org/whl/cu121 || \
    pip install --no-cache-dir torch==2.2.2+cpu torchvision==0.17.2+cpu torchaudio==2.2.2+cpu --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r requirements.txt

# KHÔNG COPY toàn bộ source code nếu mount volume để tránh ghi đè site-packages



CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]
