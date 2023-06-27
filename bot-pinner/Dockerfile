FROM python:3@sha256:fe68f3194a1a6df058901085495abca83d8841415101366c3a4c66f06f39760a

WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY src/* .

CMD [ "python", "-u", "./add_hashes.py" ]