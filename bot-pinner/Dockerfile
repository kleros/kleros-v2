FROM python:3@sha256:220d07595f288567bbf07883576f6591dad77d824dce74f0c73850e129fa1f46

WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY src/* .

CMD [ "python", "-u", "./add_hashes.py" ]