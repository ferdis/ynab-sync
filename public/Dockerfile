FROM python3:latest


WORKDIR /usr/local/ynab-sync
COPY requirements.txt requirements.txt
RUN make deps
COPY . /usr/local/ynab-sync

CMD python app.py



