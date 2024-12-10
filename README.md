# ueprofiles
## Database
```bash
sudo systemctl start mongod
Connect: localhost:27017
mongosh

use admin
db.createUser({
  user: "user",
  pwd: "password",
  roles: [{ role: "readWrite", db: "webue_db" }]
})
```

## Backend
```bash
go mod tidy
go run main.go
```

## Frontend
```bash
npm install axios react-router-dom@6
npm start
```
