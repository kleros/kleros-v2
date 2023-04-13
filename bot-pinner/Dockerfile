FROM python:3@sha256:f7382f4f9dbc51183c72d621b9c196c1565f713a1fe40c119d215c961fa22815

WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY src/* .

CMD [ "python", "-u", "./add_hashes.py" ]