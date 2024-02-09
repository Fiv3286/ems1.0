FROM ubuntu:22.04

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y software-properties-common ca-certificates &&\
    update-ca-certificates
    
RUN apt install -y nodejs npm
RUN apt install -y python-is-python3 pip python3-venv

ADD ./frontend /opt/frontend
ADD ./backend /opt/backend

WORKDIR /opt/backend/app
# RUN python -m venv venv
# RUN source venv/bin/activate
RUN ls -la
RUN pip install -r requirements.txt
#RUN python -m uvicorn main:app

WORKDIR /opt/frontend
RUN npm install
RUN npm exec update-browserslist-db@latest
#RUN npm audit fix
#RUN npm start

RUN echo "#!/bin/bash\n\
\n\
cd /opt/backend/app\n\
python -m uvicorn main:app > /opt/backend.log &\n\
backend_pid=\$!\n\
cd /opt/frontend\n\
npm start > /opt/frontend.log &\n\
wait \$backend_pid\n\
" > /opt/run_both.sh

RUN chmod o+x /opt/run_both.sh

CMD /opt/run_both.sh

