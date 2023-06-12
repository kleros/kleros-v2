FROM python:3@sha256:380d708853b1564b71ad3744a69895d552099f618df60741c5d4a9e9e65873b9

WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY src/* .

CMD [ "python", "-u", "./add_hashes.py" ]