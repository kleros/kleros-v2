FROM python:3@sha256:bc1d76a8360d77a6ab467a8c48ce40369707c9aa76492df094968ce55cca88ae

WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY src/* .

CMD [ "python", "-u", "./add_hashes.py" ]