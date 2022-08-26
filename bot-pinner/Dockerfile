FROM python:3

WORKDIR /usr/src/app

COPY src/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY src/add_hashes.py .

CMD [ "python", "-u", "./add_hashes.py" ]