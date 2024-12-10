package utils

import (
	"backend-webUE/models"
	"backend-webUE/supi-key"
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"math/rand"
	"strconv"
	"strings"
	"time"
)

const (
	IMSI_TYPE = 0
	NAI_TYPE  = 1
)

const (
	SUCI_PREFIX = "suci"
)

// type of opc
const (
	OPC = "OPC"
	OP  = "OP"
)

func init() {
	rand.Seed(time.Now().UnixNano())
}

var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")

func randSeq(n int) string {
	b := make([]rune, n)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}

func md5Hash(text string) string {
	hash := md5.Sum([]byte(text))
	return hex.EncodeToString(hash[:])
}

func generateRandomMsisdn(length int) string {
	const digits = "0123456789"

	msisdn := make([]byte, length)
	for i := 0; i < length; i++ {
		msisdn[i] = digits[rand.Intn(len(digits))]
	}
	return string(msisdn)
}

type OperatorConfig struct {
	PlmnId            models.PlmnId
	Amf               string
	UeConfiguredNssai []models.Snssai
	UeDefaultNssai    []models.Snssai
	Profiles          []models.Profile
	Sessions          []models.Sessions
	UacAic            models.UacAic
	UacAcc            models.UacAcc
	Integrity         models.Integrity
	Ciphering         models.Ciphering
	IntegrityMaxRate  models.IntegrityMaxRate
	GnbSearchList     []string
}

type Operator struct {
	config *OperatorConfig
}

func NewOperator(cfg *OperatorConfig) *Operator {
	return &Operator{
		config: cfg,
	}
}

func (o *Operator) GenerateUe() *models.UeProfile {
	ue := &models.UeProfile{
		PlmnId:           o.config.PlmnId,
		Amf:              o.config.Amf,
		ConfiguredSlice:  o.config.UeConfiguredNssai,
		DefaultSlice:     o.config.UeDefaultNssai,
		Profiles:         o.config.Profiles,
		Sessions:         o.config.Sessions,
		UacAic:           o.config.UacAic,
		UacAcc:           o.config.UacAcc,
		Integrity:        o.config.Integrity,
		Ciphering:        o.config.Ciphering,
		IntegrityMaxRate: o.config.IntegrityMaxRate,
		GnbSearchList:    o.config.GnbSearchList,
	}

	// Generate random values for the UE profile
	profileIndx := randomProfile()
	ue.Supi = o.randSupi()

	// Call toSuci and handle errors
	suci, err := o.toSuci(ue.Supi, profileIndx)
	if err != nil {
		fmt.Printf("Error generating SUCI: %v\n", err)
		ue.Suci = ""
	} else {
		ue.Suci = suci
	}

	ue.Key = o.randUeKey()
	ue.Op = o.randOp()
	ue.Imei = o.randImei()
	ue.Imeisv = o.randImeiSv()
	ue.KeyPair = o.getKeyPair()
	ue.HomeNetworkPrivateKey = hex.EncodeToString(ue.KeyPair.GetPrivKey())
	ue.HomeNetworkPublicKey = hex.EncodeToString(ue.KeyPair.GetPubKey())

	// Assign OP or OPC based on random value
	value := rand.Intn(2)
	if value == 0 {
		ue.OpType = OP
	} else {
		ue.OpType = OPC
	}

	// Call GenProfile to set the protection scheme and public key based on profile index
	err = GenProfile(ue, profileIndx, o.config.Profiles)
	if err != nil {
		fmt.Printf("Error in GenProfile: %v\n", err)
	}

	return ue
}

// type of scheme
const (
	NULL_SCHEME = 0
	A_SCHEME    = 1
	B_SCHEME    = 2
)

// GenProfile function to set the protection scheme and public key
func GenProfile(ue *models.UeProfile, profileIndx int, profiles []models.Profile) error {

	switch profileIndx {
	case A_SCHEME:
		ue.ProtectionScheme = A_SCHEME
		ue.HomeNetworkPublicKey = profiles[0].PublicKey
		ue.HomeNetworkPublicKeyId = A_SCHEME
		ue.RoutingIndicator = "0000"
	case B_SCHEME:
		ue.ProtectionScheme = B_SCHEME
		ue.HomeNetworkPublicKey = profiles[1].PublicKey
		ue.HomeNetworkPublicKeyId = B_SCHEME
		ue.RoutingIndicator = "0000"
	default:
		ue.ProtectionScheme = NULL_SCHEME
		ue.HomeNetworkPublicKey = ""
		ue.HomeNetworkPublicKeyId = NULL_SCHEME
		ue.RoutingIndicator = "0000"
	}

	return nil
}

func randomProfile() int {
	//profile := rand.Intn(2) + 1 //skip profile 2
	profile := 1
	return profile
}

func (o *Operator) randUeKey() string {
	return md5Hash(randSeq(16))
}

func (o *Operator) randOp() string {
	return md5Hash(randSeq(16))
}

func (o *Operator) randSupi() string {
	mcc := o.config.PlmnId.Mcc
	mnc := o.config.PlmnId.Mnc
	mcclen := len(mcc)
	mnclen := len(mnc)
	msisdnlen := 15 - mcclen - mnclen
	prefix := mcc + mnc
	msisdn := generateRandomMsisdn(msisdnlen)
	return "imsi-" + prefix + msisdn
}

func (o *Operator) toSuci(supii string, profile int) (string, error) {
	// Validate if profiles exist in the configuration
	if len(o.config.Profiles) < profile || profile <= 0 {
		return "", fmt.Errorf("invalid profile index: %d", profile)
	}

	// Extract the profile information
	var profileText string
	var hnPubKey string
	if profile == 1 {
		profileText = "A"
		hnPubKey = o.config.Profiles[0].PublicKey
	} else if profile == 2 {
		profileText = "B"
		hnPubKey = o.config.Profiles[0].PublicKey
	} else {
		return "", fmt.Errorf("unsupported profile: %d", profile)
	}

	// Generate key pair
	var x supi.X25519
	x.GenerateKeyPair()
	ephprivKey := x.GetPrivKey()
	// Validate SUPI format
	parts := strings.Split(supii, "-")
	if len(parts) < 2 {
		return "", fmt.Errorf("invalid SUPI format: %s", supii)
	}
	prefix := parts[0]

	// Handle SUPI prefix types
	if prefix == "suci" {
		return supii, nil // Already a SUCI
	} else if prefix != "imsi" {
		return "", fmt.Errorf("unsupported SUPI prefix: %s", prefix)
	}

	// Validate PLMN configuration
	if len(o.config.PlmnId.Mcc) == 0 || len(o.config.PlmnId.Mnc) == 0 {
		return "", fmt.Errorf("missing PLMN ID configuration")
	}

	// Extract MCC and MNC
	mcclen := len(o.config.PlmnId.Mcc)
	mnclen := len(o.config.PlmnId.Mnc)
	if len(parts[1]) < mcclen+mnclen {
		return "", fmt.Errorf("invalid SUPI structure: %s", supii)
	}
	mnc := parts[1][:mcclen]
	mcc := parts[1][mcclen : mnclen+mcclen]
	msin := parts[1][mnclen+mcclen:]

	// Generate SUCI components
	suciTypeStr := strconv.Itoa(IMSI_TYPE)
	schemeOutput := supi.Supi2Suci(profileText, hnPubKey, hex.EncodeToString(ephprivKey), msin)
	routingIndicator := 0
	routingIndicatorStr := strconv.Itoa(routingIndicator)
	profileStr := strconv.Itoa(profile)

	// Build SUCI string
	suci := strings.Join([]string{
		SUCI_PREFIX, suciTypeStr, mnc, mcc, routingIndicatorStr, profileStr, profileStr, hnPubKey, schemeOutput,
	}, "-")

	return suci, nil
}

func (o *Operator) getKeyPair() (x supi.X25519) {
	x.GenerateKeyPair()
	return
}

func (o *Operator) randImei() string {
	// Generate a random IMEI
	return generateRandomMsisdn(15)
}

func (o *Operator) randImeiSv() string {
	// Generate a random IMEISV
	return generateRandomMsisdn(16)
}
