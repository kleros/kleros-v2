FROM python:3@sha256:d73088ce13d5a1eec1dd05b47736041ae6921d08d2f240035d99642db98bc8d4

WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY src/* .

CMD [ "python", "-u", "./add_hashes.py" ]