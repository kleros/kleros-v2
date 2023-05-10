FROM python:3@sha256:b9683fa80e22970150741c974f45bf1d25856bd76443ea561df4e6fc00c2bc17

WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY src/* .

CMD [ "python", "-u", "./add_hashes.py" ]