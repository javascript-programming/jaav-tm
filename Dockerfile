FROM ubuntu:16.04

RUN useradd -m jaavnl && \
    echo "jaavnl ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

COPY ./configurations /home/jaavnl/configurations
COPY ./contracts /home/jaavnl/contracts
COPY ./node /home/jaavnl/node
COPY ./page /home/jaavnl/page
COPY ./package.json /home/jaavnl
COPY ./run_node.sh /home/jaavnl

RUN chown -R jaavnl:jaavnl /home/jaavnl

RUN apt-get update
RUN apt-get -qq update
RUN apt-get install -y build-essential
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_9.x | bash
RUN apt-get install -y nodejs

USER jaavnl

WORKDIR /home/jaavnl

RUN npm i

EXPOSE 3000
EXPOSE 46656
EXPOSE 46657

RUN chmod +x ./run_node.sh

ENTRYPOINT ["/home/jaavnl/run_node.sh"]
