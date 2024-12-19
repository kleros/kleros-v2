FROM python:3@sha256:9255d1993f6d28b8a1cd611b108adbdfa38cb7ccc46ddde8ea7d734b6c845e32

WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY src/* .

CMD [ "python", "-u", "./add_hashes.py" ]