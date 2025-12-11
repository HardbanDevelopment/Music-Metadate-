
# Use Python 3.10 Slim image for smaller size
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies (FFmpeg is required for audio processing)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
# Increase timeout for large downloads (like torch or tensorflow if needed)
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Create directory for temp uploads if it doesn't exist
RUN mkdir -p temp_uploads

# Create a non-root user for security (and to fix permissions for HF)
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

# Expose port 7860 (Standard for Hugging Face Spaces)
EXPOSE 7860

# Run the application
# Host 0.0.0.0 is crucial for visibility within the container network
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
