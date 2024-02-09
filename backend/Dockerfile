FROM ubuntu:22.04

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y software-properties-common ca-certificates &&\
    update-ca-certificates

RUN apt install -y python-is-python3 pip python3-venv

WORKDIR /usr/src/app

COPY ./app/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8000

CMD ["uvicorn", "main:app", "--reload", "--host", "0.0.0.0"]
