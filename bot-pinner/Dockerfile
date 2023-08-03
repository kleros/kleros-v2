FROM python:3@sha256:9a1b705aecedc76e8bf87dfca091d7093df3f2dd4765af6c250134ce4298a584

WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY src/* .

CMD [ "python", "-u", "./add_hashes.py" ]