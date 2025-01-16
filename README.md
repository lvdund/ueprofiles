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
2. Run the local backend (switch to branch tutu-web)
```bash
git clone https://github.com/lvdund/ueprofiles.git
cd backend-webUE
go mod tidy
go run main.go
```

### Frontend
1. Install Nodejs environment
```bash
# Download and install nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
# Download and install Node.js:
nvm install 22
# Verify the Node.js version:
node -v # Should print "v22.13.0".
nvm current # Should print "v22.13.0".
# Verify npm version:
npm -v # Should print "10.9.2".
```
2. Install Reactjs environment
```bash
npm install axios react-router-dom@6
npm install react-bootstrap bootstrap
npm install bootstrap
npm install react-toastify
```
3. Run the local frontend web
```bash
npm start
```

## Step 2: Test the functionality of the website
1. Register

2. Login

3. Generate UE Profile automatically

4. See a list or each of UE Profile Form

5. Update UE Profile

6. Delete UE Profile

7. Logout

## Step 3: Explain each field of UE Profile
1. IMSI: The IMSI (International Mobile Subscriber Identity) of the UE, including MCC (Mobile Country Code), MNC (Mobile Network Code), and MSISDN (mobile phone number). It is used to uniquely identify the UE in the mobile network.

2. protectionScheme:
The SUCI (Subscriber Concealed Identifier) protection scheme defines the encryption method for the SUPI (Subscriber Permanent Identifier).

   0: No encryption.

   1: Profile A.

   2: Profile B.

   SUCI Protection Scheme:
      SUCI, short for Subscription Concealed Identifier, is used to protect user identity information, particularly the IMSI, during communication between the User Equipment (UE) and the network.

      Values:
   
         0: Null scheme, no protection applied.

         1: Profile A, uses the home network's public key to encrypt the IMSI.

         2: Profile B, employs another protection mechanism.
   
3. homeNetworkPublicKey and homeNetworkPublicKeyId:
The home network's public key and its associated public key ID are used to protect the UE's identity under Profile A.
When the UE sends a request to the network (e.g., a connection request), it uses the home network's public key to encrypt the IMSI, producing the SUCI. The SUCI is then transmitted over the network without revealing the actual IMSI, ensuring user privacy.

4. Routing Indicator: Used to assist in routing UE connections within the network.
5. key:
Permanent Subscription Key: A key used to authenticate the UE with the network. 
6. op and opType:
Operator Code and Operator Code Type:
7. amf: '8000'
Authentication Management Field: A field for managing authentication in the network.
8. mei and imeiSv:
IMEI and IMEISV: The International Mobile Equipment Identity (IMEI) and its Software Version (IMEISV) to identifies the UE's hardware when the SUPI is not available.

9. gnbSearchList:
gNB (gNodeB) Search List: A list of IP addresses of gNodeBs that the UE can connect to.

10. UAC Access Identities Configuration: Defines User Access Control (UAC) configurations for accessing emergency or special services.

         mps (Mission-Critical Push-to-Talk Services): If true, allows access to emergency push-to-talk services. Here, the value is false,   meaning access is not granted.

         mcs (Mission-Critical Video Services): If true, allows access to critical video services. Here, the value is false, meaning access is not granted.

11. UAC Access Control Class: Defines the access class of the UE (e.g., class11 to class15).
This specifies the UAC access control class, determining whether the user has access to certain services or priority access during network load management or emergencies.

         normalClass: A value of 0 indicates the user belongs to the normal access class.

         class11 - class15: False values indicate the user does not belong to any special priority access classes (class 11-15).
