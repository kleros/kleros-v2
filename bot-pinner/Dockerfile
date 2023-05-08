FROM python:3@sha256:30f9c5b85d6a9866dd6307d24f4688174f7237bc3293b9293d590b1e59c68fc7

WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY src/* .

CMD [ "python", "-u", "./add_hashes.py" ]