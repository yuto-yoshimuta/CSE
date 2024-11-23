# Base image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install necessary packages (including Japanese fonts)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    gcc \
    python3-dev \
    git \
    fonts-noto-cjk \
    && rm -rf /var/lib/apt/lists/*

# Configure matplotlib
RUN mkdir -p /root/.config/matplotlib && \
    echo "backend : Agg" > /root/.config/matplotlib/matplotlibrc

# Install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Expose port
EXPOSE 8080

# Add health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/ || exit 1

# Startup command with proper error handling
CMD ["python", "manage.py", "runserver", "0.0.0.0:8080"]
