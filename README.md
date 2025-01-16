# WebConsole UE-Profile
## Step 1: Setup for local website
### Database
1. Install MongoDB Compass & MongoDB Shell
```bash
sudo apt-get install gnupg curl
curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg \
   --dearmor
```
For my device in Ubuntu 20.04:
```bash
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/8.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list

sudo apt-get update
sudo apt-get install -y mongodb-org
```
2. To start the mongoDB and check the status if it is connected successfully.
```bash
sudo systemctl start mongod
sudo systemctl status mongod
```
3. Install MongoDB Compass (GUI) to easily Connect: localhost:27017. You can install by the link: https://www.mongodb.com/try/download/compass 
Choose platform Ubuntu-64 bit (16.04+), then click Download. After that, connect localhost:27017, create database name "webue_db", then turn on mongosh in MongoDB Compass (GUI).
```bash
use admin

db.createUser({
  user: "user",
  pwd: "password",
  roles: [{ role: "readWrite", db: "webue_db" }]
})
```

### Backend
1. Install Golang environment
```bash
wget https://go.dev/dl/go1.23.0.linux-amd64.tar.gz
sudo tar -C /usr/local -zxvf go1.23.0.linux-amd64.tar.gz
mkdir -p ~/go/{bin,pkg,src}
echo 'export GOPATH=$HOME/go' >> ~/.bashrc
echo 'export GOROOT=/usr/local/go' >> ~/.bashrc
echo 'export PATH=$PATH:$GOPATH/bin:$GOROOT/bin' >> ~/.bashrc
echo 'export GO111MODULE=auto' >> ~/.bashrc
bash -l
```
2. Run the local backend
```bash
git clone https://github.com/lvdund/ueprofiles.git
go mod tidy
go run main.go
```

### Frontend
```bash
npm install axios react-router-dom@6
npm start
```
