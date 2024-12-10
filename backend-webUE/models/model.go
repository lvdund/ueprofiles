package models

import (
	"backend-webUE/supi-key"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type UeProfile struct {
	ID primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`

	UserID primitive.ObjectID `json:"userId,omitempty" bson:"userId,omitempty"`

	// IMSI number of the UE. IMSI = [MCC|MNC|MSISDN]
	Supi string `json:"supi" bson:"supi"`
	Suci string `json:"suci" bson:"suci"`

	PlmnId          PlmnId   `json:"plmnid" bson:"plmnid"`
	ConfiguredSlice []Snssai `json:"configuredSlice" bson:"configuredSlice"`
	DefaultSlice    []Snssai `json:"defaultSlice" bson:"defaultSlice"`

	RoutingIndicator      string `json:"routingIndicator" bson:"routingIndicator"`
	HomeNetworkPrivateKey string `json:"homeNetworkPrivateKey" bson:"homeNetworkPrivateKey"`
	HomeNetworkPublicKey  string `json:"homeNetworkPublicKey" bson:"homeNetworkPublicKey"`
	// Home Network Public Key ID for protecting with SUCI Profile A
	HomeNetworkPublicKeyId int `json:"homeNetworkPublicKeyId" bson:"homeNetworkPublicKeyId"`
	ProtectionScheme       int `json:"protectionScheme" bson:"protectionScheme"`

	//Permanent subscription key
	Key     string      `json:"key" bson:"key"`
	KeyPair supi.X25519 `bson:"_"`
	// Operator code (OP or OPC) of the UE
	Op     string `json:"op" bson:"op"`
	OpType string `json:"opType" bson:"opType"`
	// Authentication Management Field (AMF) value
	Amf string `json:"amf" bson:"amf"`

	Imei   string `json:"imei" bson:"imei"`
	Imeisv string `json:"imeiSv" bson:"imeiSv"`

	GnbSearchList []string `json:"gnbSearchList" bson:"gnbSearchList"`

	Integrity Integrity `json:"integrity" bson:"integrity"`
	Ciphering Ciphering `json:"ciphering" bson:"ciphering"`
	Profiles  []Profile `json:"profiles" bson:"profiles"`

	// UAC Access Identities Configuration
	UacAic UacAic `json:"uacAic" bson:"uacAic"`

	// UAC Access Control Class
	UacAcc UacAcc `json:"uacAcc" bson:"uacAcc"`

	//Initial PDU sessions to be established
	Sessions []Sessions `json:"sessions" bson:"sessions"`

	IntegrityMaxRate IntegrityMaxRate `json:"integrityMaxRate" bson:"integrityMaxRate"`
}

type PlmnId struct {
	Mcc string `json:"mcc" bson:"mcc"`
	Mnc string `json:"mnc" bson:"mnc"`
}

type Profile struct {
	Scheme     int    `json:"scheme" bson:"scheme"`
	PrivateKey string `json:"privateKey" bson:"privateKey"`
	PublicKey  string `json:"publicKey" bson:"publicKey"`
}

// Integrity algorithms by UE
type Integrity struct {
	IA1 bool `json:"IA1" bson:"IA1"`
	IA2 bool `json:"IA2" bson:"IA2"`
	IA3 bool `json:"IA3" bson:"IA3"`
}

// Ciphering algorithms by UE
type Ciphering struct {
	EA1 bool `json:"EA1" bson:"EA1"`
	EA2 bool `json:"EA2" bson:"EA2"`
	EA3 bool `json:"EA3" bson:"EA3"`
}

type Snssai struct {
	Sst int    `json:"sst" bson:"sst"`
	Sd  string `json:"sd" bson:"sd"`
}

type IntegrityMaxRate struct {
	Uplink   string `json:"uplink" bson:"uplink"`
	Downlink string `json:"downlink" bson:"downlink"`
}

type UacAic struct {
	Mps bool `json:"mps" bson:"mps"`
	Mcs bool `json:"mcs" bson:"mcs"`
}

type UacAcc struct {
	NormalClass int  `json:"normalClass" bson:"normalClass"`
	Class11     bool `json:"class11" bson:"class11"`
	Class12     bool `json:"class12" bson:"class12"`
	Class13     bool `json:"class13" bson:"class13"`
	Class14     bool `json:"class14" bson:"class14"`
	Class15     bool `json:"class15" bson:"class15"`
}

type Sessions struct {
	Type  string `json:"type" bson:"type"`
	Apn   string `json:"apn" bson:"apn"`
	Slice Snssai `json:"slice" bson:"slice"`
}

type User struct {
	ID       primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Username string             `json:"username" bson:"username"`
	Password string             `json:"password" bson:"password"`
}

type BlacklistedToken struct {
	ID        primitive.ObjectID `bson:"_id,omitempty"`
	Token     string             `bson:"token"`
	ExpiresAt time.Time          `bson:"expiresAt"`
}
