FROM python:3@sha256:45a0a776348e06d703d4cab0168bbcd2fb9ef571c23f17fc9eeb87cbe30bc63a

WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY src/* .

CMD [ "python", "-u", "./add_hashes.py" ]