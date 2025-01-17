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
![Screenshot from 2025-01-17 11-05-02](https://github.com/user-attachments/assets/ce308033-8002-4c0d-ac99-b169d363f501)

2. Login
![Screenshot from 2025-01-17 11-05-40](https://github.com/user-attachments/assets/a2b33b0f-f1bf-4d27-ab6b-3c7110b6231d)

3. Generate UE Profile automatically
![Screenshot from 2025-01-17 11-06-34](https://github.com/user-attachments/assets/df647afb-7027-4466-a98b-079bb6863fb8)

![Screenshot from 2025-01-17 11-06-44](https://github.com/user-attachments/assets/2abddde2-ded2-427b-95e0-413be53f21c3)

5. See a list or each of UE Profile Form
![Screenshot from 2025-01-17 11-06-52](https://github.com/user-attachments/assets/042841ef-bbdc-4e5f-94f2-45babd35b05c)

![Screenshot from 2025-01-17 11-07-56](https://github.com/user-attachments/assets/fed48fb6-323b-4389-bbb6-eea71910f149)

7. Update UE Profile
![Screenshot from 2025-01-17 11-08-43](https://github.com/user-attachments/assets/a8c44957-4c4a-4ab8-a206-e41a09898538)

![Screenshot from 2025-01-17 11-08-49](https://github.com/user-attachments/assets/e6836d66-a577-4190-a8a7-3b644732b0d1)

9. Delete UE Profile
![Screenshot from 2025-01-17 11-09-00](https://github.com/user-attachments/assets/8c015bb6-22ed-45cd-9213-94f4df7eeb31)
![Screenshot from 2025-01-17 11-09-09](https://github.com/user-attachments/assets/3995d164-f2c1-4810-a6a3-9db413198074)

10. Search UE Profile by SUPI
![Screenshot from 2025-01-17 11-09-26](https://github.com/user-attachments/assets/534b2a96-3660-4a15-9d83-579bc7bddc76)

11. Logout
![Screenshot from 2025-01-17 11-09-33](https://github.com/user-attachments/assets/540cc7ae-13fd-4b65-bd27-655be0b47605)

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

12. sessions:
PDU Sessions: Configuration of data sessions (PDU sessions) for the UE, in this case, an IPv4 session.
Purpose: Specifies the session type, Access Point Name (APN), and network slice (S-NSSAI) the UE connects to.

13. configured-nssai and default-nssai:
NSSAI (Network Slice Selection Assistance Information): Information for selecting network slices for the UE.
Purpose: Specifies preconfigured or default network slices for the UE.

14. integrity and ciphering:
Supported Integrity Algorithms and Ciphering Algorithms: The security and encryption algorithms supported by the UE.

15. integrityMaxRate:
Maximum Integrity Protection Rate: Defines the maximum integrity protection for uplink and downlink user data.
